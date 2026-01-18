import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Memory storage (don't use in prod - use cloud storage)
const storage = multer.memoryStorage();
const parser = multer({ storage, limits: { fileSize: 512 * 1024 * 1024 } }); // 512MB

export const uploadFileToOpenAI = async (file: Express.Multer.File) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const buffer = file.buffer;
  
  const fileResponse = await openai.files.create({
    file: new Blob([buffer.buffer as ArrayBuffer]),
    purpose: 'assistants'  // For future assistants integration
  });

  return {
    id: fileResponse.id,
    filename: file.originalname,
    bytes: fileResponse.bytes,
    createdAt: fileResponse.created_at,
    url: (fileResponse as any).links?.openai
  };
};

// Export multer for route usage
export { parser as uploadParser };