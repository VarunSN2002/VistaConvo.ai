import { Router } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { generateResponse } from "../services/openai.js";
import { Chat } from '../models/Chat.js';
import type { Message } from "../models/Chat.js";
import { Project } from "../models/Project.js";

const router = Router();

// POST /api/chat/:projectId - Send message + stream response + save history
router.post('/:projectId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID required' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message required' });
    }

    // 1. Verify project ownership
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(req.user!.userId)
    } as any);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 2. Streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 3. Save user message + get/create chat
    const chat = await Chat.findOneAndUpdate(
      { projectId: new Types.ObjectId(projectId) } as any,
      { 
        $push: { 
          messages: { 
            role: 'user' as const, 
            content: message,
            timestamp: new Date()
          }
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );

    // 4. Generate AI response using project prompts
    const user = req.user!;
    const stream = await generateResponse({
      projectId,
      message,
      userId: user.userId
    });

    let fullResponse = '';

    // 5. Stream response chunks
    for await (const chunk of stream) {
      fullResponse += chunk;
      res.write(chunk);
    }

    // 6. Save assistant response
    await Chat.findByIdAndUpdate((chat as any)?._id, {
      $push: {
        messages: {
          role: 'assistant' as const,
          content: fullResponse,
          timestamp: new Date()
        } as Message
      }
    });

    res.end();
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ message: err.message || 'Chat service error' });
  }
});

// GET /api/chat/:projectId/history - Get conversation history
router.get('/:projectId/history', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project access
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(req.user!.userId)
    } as any);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const chats = await Chat.find({ projectId: new Types.ObjectId(projectId) } as any)
      .sort({ updatedAt: -1 })
      .limit(10);  // Recent chats

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;