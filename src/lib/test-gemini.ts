// Test file to verify Gemini API configuration
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function testGeminiConnection() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Hello, can you respond with "API connection successful"?');
    const response = await result.response;
    console.log('Gemini API Test:', response.text());
    return true;
  } catch (error) {
    console.error('Gemini API Test Failed:', error);
    return false;
  }
}
