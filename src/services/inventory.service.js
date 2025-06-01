const httpStatus = require('http-status');
const { Inventory, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { inventoryMessage } = require('../messages');
const { productService } = require('.');

const addToInventory = async (inventoryData) => {
  const { productId, quantity, reason, note, userId } = inventoryData;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity + quantity;

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

  await Product.findByIdAndUpdate(productId, {
    quantity: newQuantity,
    inStock: newQuantity > 0,
  });

  const populatedRecord = await Inventory.findById(inventoryRecord._id)
    .populate('productId', 'name code')
    .populate('userId', 'name email');

  return populatedRecord;
};

const exportFromInventory = async (exportData) => {
  const { productId, quantity, reason, userId, orderId } = exportData;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  if (product.quantity < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Số lượng tồn kho không đủ');
  }

  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity - quantity;

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

  await Product.findByIdAndUpdate(productId, {
    quantity: newQuantity,
    inStock: newQuantity > 0,
  });

  return inventoryRecord;
};

const getInventoryStock = async (query) => {
  const { page = 1, limit = 10, search, categoryId, manufacturerId, lowStock } = query;

  let productQuery = {};

  if (search) {
    productQuery.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
  }

  if (categoryId) {
    productQuery.categoryId = categoryId;
  }

  if (manufacturerId) {
    productQuery.manufacturerId = manufacturerId;
  }

  if (lowStock === 'true') {
    productQuery.quantity = { $lte: 10, $gt: 0 };
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

  // Get counts for different stock statuses
  const outOfStockCount = await Product.countDocuments({ ...productQuery, quantity: 0 });
  const lowStockCount = await Product.countDocuments({ ...productQuery, quantity: { $gt: 0, $lte: 10 } });
  const inStockCount = await Product.countDocuments({ ...productQuery, quantity: { $gt: 10 } });

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    stockSummary: {
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      inStock: inStockCount,
      total: outOfStockCount + lowStockCount + inStockCount,
    },
  };
};

const getInventoryHistory = async (query) => {
  const { page = 1, limit = 10, productId, type } = query;

  let inventoryQuery = {};

  if (productId) {
    inventoryQuery.productId = productId;
  }

  if (type) {
    inventoryQuery.type = type;
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

const getInventoryById = async (inventoryId) => {
  const inventory = await Inventory.findById(inventoryId)
    .populate('productId', 'name code images')
    .populate('userId', 'name email')
    .populate('orderId', 'status');

  if (!inventory) {
    throw new ApiError(httpStatus.NOT_FOUND, inventoryMessage().NOT_FOUND);
  }

  return inventory;
};

const updateInventoryById = async (inventoryId, updateBody) => {
  const inventory = await getInventoryById(inventoryId);
  const originalProductId = inventory.productId._id.toString();
  const originalQuantity = inventory.quantity;

  // Update basic fields
  if (updateBody.note !== undefined) {
    inventory.note = updateBody.note;
  }

  if (updateBody.reason !== undefined) {
    inventory.reason = updateBody.reason;
  }

  // Handle product and quantity changes
  if (updateBody.productId || updateBody.quantity !== undefined) {
    // Get original product
    const originalProduct = await productService.getProductById(originalProductId);

    // Revert the original inventory operation
    if (inventory.type === 'import') {
      // For import, decrease the original product's quantity
      await productService.updateProductById(originalProductId, {
        quantity: originalProduct.quantity - originalQuantity,
        inStock: originalProduct.quantity - originalQuantity > 0,
      });
    } else if (inventory.type === 'export') {
      // For export, increase the original product's quantity
      await productService.updateProductById(originalProductId, {
        quantity: originalProduct.quantity + originalQuantity,
        inStock: true, // If we're adding back, it will always be in stock
      });
    }

    // Handle product change
    const targetProductId = updateBody.productId || originalProductId;
    const targetQuantity = updateBody.quantity !== undefined ? updateBody.quantity : originalQuantity;

    // Get target product (could be the same as original or a new one)
    const targetProduct = await productService.getProductById(targetProductId);

    // Apply the new inventory operation
    if (inventory.type === 'import') {
      // For import, increase the target product's quantity
      await productService.updateProductById(targetProductId, {
        quantity: targetProduct.quantity + targetQuantity,
        inStock: true, // If we're adding, it will always be in stock
      });

      // Update inventory record
      inventory.previousQuantity = targetProduct.quantity;
      inventory.newQuantity = targetProduct.quantity + targetQuantity;
    } else if (inventory.type === 'export') {
      // For export, check if there's enough stock
      if (targetProduct.quantity < targetQuantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Số lượng tồn kho không đủ');
      }

      // Decrease the target product's quantity
      await productService.updateProductById(targetProductId, {
        quantity: targetProduct.quantity - targetQuantity,
        inStock: targetProduct.quantity - targetQuantity > 0,
      });

      // Update inventory record
      inventory.previousQuantity = targetProduct.quantity;
      inventory.newQuantity = targetProduct.quantity - targetQuantity;
    }

    // Update product and quantity in inventory record
    if (updateBody.productId) {
      inventory.productId = targetProductId;
    }

    if (updateBody.quantity !== undefined) {
      inventory.quantity = targetQuantity;
    }
  }

  await inventory.save();

  // Return fully populated inventory record
  return await Inventory.findById(inventoryId)
    .populate('productId', 'name code')
    .populate('userId', 'name email')
    .populate('orderId', 'status');
};

module.exports = {
  addToInventory,
  exportFromInventory,
  getInventoryStock,
  getInventoryHistory,
  getInventoryById,
  updateInventoryById,
};
