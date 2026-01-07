// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey: process.env.OPENAI_API_KEY,
// });

import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export default gemini;
