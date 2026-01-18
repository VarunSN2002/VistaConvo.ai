import OpenAI from "openai";
import dotenv from "dotenv";
import { Types } from "mongoose";
const { Project } = await import("../models/Project.js");

dotenv.config();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',  
  apiKey: process.env.OPENROUTER_API_KEY,
});

interface ChatRequest {
    projectId: string;
    message: string;
    userId: string;
}

export const generateResponse = async ({
    projectId,
    message,
    userId,
}: ChatRequest): Promise<AsyncIterable<string>> => {
    const project = await Project.findOne({ _id: new Types.ObjectId(projectId), userId: new Types.ObjectId(userId) } as any);
    if (!project) {
        throw new Error("Project not found");
    }
    const systemPrompt = project.prompts.join('\n') || 'You are a helpful assistant.';
    const stream = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        stream: true,
        temperature: 0.7,
    });
    return (async function* () {
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                yield content;
            }
        }
    })();
};