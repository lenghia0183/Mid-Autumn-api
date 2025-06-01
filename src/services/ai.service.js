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
    const response = await result.response;

    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('AI generation error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, aiMessage().GENERATION_FAILURE);
  }
};

const translateProductInfo = async (name, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    const fullPrompt = `Bạn là một chuyên gia dịch thuật cho các sản phẩm thương mại điện tử.
    Hãy dịch tên sản phẩm và mô tả sản phẩm sau đây sang tiếng Anh, tiếng Trung, và tiếng Nhật.
    
    Tên sản phẩm: ${name}
    Mô tả sản phẩm: ${description}
    
    Yêu cầu:
    - Dịch chính xác, tự nhiên, phù hợp với văn hóa của từng ngôn ngữ
    - Giữ nguyên các thông số kỹ thuật, số liệu
    - Đảm bảo ngữ pháp và cách diễn đạt phù hợp với từng ngôn ngữ
    
    Trả về kết quả theo định dạng JSON như sau:
    {
      "english": {
        "name": "Tên sản phẩm bằng tiếng Anh",
        "description": "Mô tả sản phẩm bằng tiếng Anh"
      },
      "chinese": {
        "name": "Tên sản phẩm bằng tiếng Trung",
        "description": "Mô tả sản phẩm bằng tiếng Trung không cần phiên âm"
      },
      "japanese": {
        "name": "Tên sản phẩm bằng tiếng Nhật",
        "description": "Mô tả sản phẩm bằng tiếng Nhật không cần phên âm"
      }
    }`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    const text = response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    let translationData;

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0];
      translationData = JSON.parse(jsonString);
    } else {
      throw new Error('Invalid response format from AI model');
    }

    return translationData;
  } catch (error) {
    console.error('AI translation error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, aiMessage().TRANSLATION_FAILURE);
  }
};

module.exports = {
  generateProductDescription,
  translateProductInfo,
};
