const httpStatus = require('http-status');
const { Inventory, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { inventoryMessage } = require('../messages');

/**
 * Thêm sản phẩm vào kho (nhập kho)
 * @param {Object} inventoryData
 * @returns {Promise<Object>}
 */
const addToInventory = async (inventoryData) => {
  const { productId, quantity, reason, note, userId } = inventoryData;

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity + quantity;

  // Tạo bản ghi lịch sử nhập kho
  const inventoryRecord = await Inventory.create({
    productId,
    type: 'import',
    quantity,
    reason,
    note: note || '',
    userId,
    previousQuantity,
    newQuantity,
  });

  // Cập nhật số lượng sản phẩm
  await Product.findByIdAndUpdate(productId, {
    quantity: newQuantity,
    inStock: newQuantity > 0,
  });

  // Populate thông tin sản phẩm và user
  const populatedRecord = await Inventory.findById(inventoryRecord._id)
    .populate('productId', 'name code')
    .populate('userId', 'name email');

  return populatedRecord;
};

/**
 * Xuất kho (khi có đơn hàng)
 * @param {Object} exportData
 * @returns {Promise<Object>}
 */
const exportFromInventory = async (exportData) => {
  const { productId, quantity, reason, userId, orderId } = exportData;

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  // Kiểm tra số lượng tồn kho
  if (product.quantity < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Số lượng tồn kho không đủ');
  }

  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity - quantity;

  // Tạo bản ghi lịch sử xuất kho
  const inventoryRecord = await Inventory.create({
    productId,
    type: 'export',
    quantity,
    reason,
    userId,
    orderId: orderId || null,
    previousQuantity,
    newQuantity,
  });

  // Cập nhật số lượng sản phẩm
  await Product.findByIdAndUpdate(productId, {
    quantity: newQuantity,
    inStock: newQuantity > 0,
  });

  return inventoryRecord;
};

/**
 * Lấy danh sách tồn kho
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getInventoryStock = async (query) => {
  const { page = 1, limit = 10, search, categoryId, manufacturerId, lowStock } = query;

  let productQuery = {};

  // Tìm kiếm theo tên hoặc mã sản phẩm
  if (search) {
    productQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  // Lọc theo danh mục
  if (categoryId) {
    productQuery.categoryId = categoryId;
  }

  // Lọc theo nhà sản xuất
  if (manufacturerId) {
    productQuery.manufacturerId = manufacturerId;
  }

  // Lọc sản phẩm sắp hết hàng (quantity <= 10)
  if (lowStock === 'true') {
    productQuery.quantity = { $lte: 10 };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(productQuery)
    .select('name code quantity inStock price costPrice')
    .populate('categoryId', 'name')
    .populate('manufacturerId', 'name')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ quantity: 1, name: 1 });

  const total = await Product.countDocuments(productQuery);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy lịch sử nhập/xuất kho
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getInventoryHistory = async (query) => {
  const { page = 1, limit = 10, productId, type, startDate, endDate } = query;

  let inventoryQuery = {};

  // Lọc theo sản phẩm
  if (productId) {
    inventoryQuery.productId = productId;
  }

  // Lọc theo loại (import/export)
  if (type) {
    inventoryQuery.type = type;
  }

  // Lọc theo khoảng thời gian
  if (startDate || endDate) {
    inventoryQuery.createdAt = {};
    if (startDate) {
      inventoryQuery.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      inventoryQuery.createdAt.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const inventoryRecords = await Inventory.find(inventoryQuery)
    .populate('productId', 'name code')
    .populate('userId', 'name email')
    .populate('orderId', 'status')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Inventory.countDocuments(inventoryQuery);

  return {
    records: inventoryRecords,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy thống kê tồn kho
 * @returns {Promise<Object>}
 */
const getInventoryStatistics = async () => {
  // Tổng số sản phẩm
  const totalProducts = await Product.countDocuments();

  // Sản phẩm còn hàng
  const inStockProducts = await Product.countDocuments({ inStock: true });

  // Sản phẩm hết hàng
  const outOfStockProducts = await Product.countDocuments({ inStock: false });

  // Sản phẩm sắp hết hàng (quantity <= 10)
  const lowStockProducts = await Product.countDocuments({ quantity: { $lte: 10, $gt: 0 } });

  // Tổng giá trị tồn kho
  const totalStockValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
      },
    },
  ]);

  return {
    totalProducts,
    inStockProducts,
    outOfStockProducts,
    lowStockProducts,
    totalStockValue: totalStockValue[0]?.totalValue || 0,
  };
};

module.exports = {
  addToInventory,
  exportFromInventory,
  getInventoryStock,
  getInventoryHistory,
  getInventoryStatistics,
};
