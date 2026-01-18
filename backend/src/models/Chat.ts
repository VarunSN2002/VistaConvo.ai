import { Schema, model, Document } from 'mongoose';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatDocument extends Document {
  projectId: Schema.Types.ObjectId;
  messages: Message[];
  title?: string;  // Auto-generated from first message
}

const ChatSchema = new Schema<ChatDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    messages: [{
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    title: String
  },
  { timestamps: true }
);

// Keep last 50 messages per chat (cost control)
ChatSchema.pre('save', function() {
  if ((this as any).messages.length > 50) {
    (this as any).messages = (this as any).messages.slice(-50);
  }
});

export const Chat = model<ChatDocument>('Chat', ChatSchema);