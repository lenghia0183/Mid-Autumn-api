const inventoryMessage = () => {
  return {
    ADD_SUCCESS: 'Thêm sản phẩm vào kho thành công',
    ADD_FAILED: 'Thêm sản phẩm vào kho thất bại',
    EXPORT_SUCCESS: 'Xuất kho thành công',
    EXPORT_FAILED: 'Xuất kho thất bại',
    GET_STOCK_SUCCESS: 'Lấy danh sách tồn kho thành công',
    GET_STOCK_FAILED: 'Lấy danh sách tồn kho thất bại',
    GET_HISTORY_SUCCESS: 'Lấy lịch sử nhập/xuất kho thành công',
    GET_HISTORY_FAILED: 'Lấy lịch sử nhập/xuất kho thất bại',
    GET_STATISTICS_SUCCESS: 'Lấy thống kê tồn kho thành công',
    GET_STATISTICS_FAILED: 'Lấy thống kê tồn kho thất bại',
    PRODUCT_NOT_FOUND: 'Sản phẩm không tồn tại',
    INSUFFICIENT_STOCK: 'Số lượng tồn kho không đủ',
    INVALID_QUANTITY: 'Số lượng không hợp lệ',
  };
};

module.exports = inventoryMessage;
