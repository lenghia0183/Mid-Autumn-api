const { GoogleGenerativeAI } = require('@google/generative-ai');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { env } = require('../config');
const { aiMessage } = require('../messages');

const genAI = new GoogleGenerativeAI(env.gemini.apiKey);

const generateProductDescription = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    const fullPrompt = `Bạn là một chuyên gia viết mô tả sản phẩm cho các trang thương mại điện tử. 
    Hãy viết một đoạn mô tả sản phẩm hấp dẫn, tối ưu SEO, nhấn mạnh các tính năng và lợi ích chính.
    
    Thông tin sản phẩm: ${prompt}
    
    Yêu cầu:
    - Viết khoảng 150-200 từ
    - Sử dụng ngôn ngữ hấp dẫn, thuyết phục
    - Nhấn mạnh lợi ích cho người dùng
    - Đảm bảo dễ đọc với các đoạn ngắn
   - Viết thành một đoạn văn liền mạch, không xuống dòng, không có ký tự "\\n", không dùng dấu gạch đầu dòng hoặc tiêu đề
   - Không chèn các thẻ HTML hoặc ký tự đặc biệt, chỉ cần nội dung mô tả đơn thuần 
    `;

    const result = await model.generateContent(fullPrompt);
    console.log('result', result.response);
    const response = await result.response;

    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('AI generation error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, aiMessage().GENERATION_FAILURE);
  }
};

module.exports = {
  generateProductDescription,
};
