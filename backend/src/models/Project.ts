import { Schema, model, Document } from 'mongoose';

export interface ProjectDocument extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  prompts: string[];  // Array of prompt strings
  openaiFiles?: string[];  // Array of OpenAI file IDs
  createdAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true  // For fast user queries
    },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    prompts: [{
      type: String,
      maxlength: 4000  // OpenAI prompt limit friendly
    }],
    openaiFiles: [{
      type: String,  // Store OpenAI file IDs associated with the project
      default: []
    }]
  },
  { timestamps: true }
);

export const Project = model<ProjectDocument>('Project', ProjectSchema);