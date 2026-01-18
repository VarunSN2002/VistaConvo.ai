import { Router } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { uploadParser, uploadFileToOpenAI } from "../services/fileUpload.js";

const router = Router();

// GET /api/projects - List user's projects
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const projects = await Project.find({ userId: new Types.ObjectId(req.user!.userId) } as any)
      .sort({ createdAt: -1 })
      .select('-__v');  // Hide mongoose version
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Create project
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, description, prompts } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const project = await Project.create({
      userId: new Types.ObjectId(req.user!.userId),
      name,
      description,
      prompts: prompts || []
    } as any);

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: new Types.ObjectId(req.user!.userId)
    } as any);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id - Update prompts
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { prompts } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: new Types.ObjectId(req.user!.userId) } as any,
      { prompts },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/files - Upload file to OpenAI
router.post('/:id/files', requireAuth, uploadParser.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify project ownership first
    const project = await Project.findOne({
      _id: new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId)
    } as any);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fileData = await uploadFileToOpenAI(req.file);
    
    // Optionally save file ID to project
    await Project.findByIdAndUpdate(req.params.id, {
      $push: { openaiFiles: fileData.id }
    });

    res.json(fileData);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

export default router;
