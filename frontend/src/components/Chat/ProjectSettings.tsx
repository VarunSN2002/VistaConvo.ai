import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../services/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  prompts: string[];
  createdAt: string;
}

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
}

const ProjectSettings = ({ project, onClose }: ProjectSettingsProps) => {
  const [prompts, setPrompts] = useState(project.prompts.join('\n'));
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (promptsArray: string[]) => projectsAPI.update(project._id, { prompts: promptsArray }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      onClose();
    },
  });

  const handleSave = () => {
    const promptsArray = prompts.split('\n').filter((p: string) => p.trim());
    updateMutation.mutate(promptsArray);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950/95 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Project Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">System Prompts</label>
            <textarea
              value={prompts}
              onChange={e => setPrompts(e.target.value)}
              className="w-full rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-vertical h-40 font-mono"
              placeholder="Enter system prompts, one per line..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Prompts define your AI's personality and behavior. Each line = one prompt.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Files</label>
            <div className="flex gap-3 p-4 border border-dashed border-slate-700/60 rounded-2xl bg-slate-900/50">
              <input type="file" id="file-upload" className="hidden" />
              <label htmlFor="file-upload" className="flex-1 p-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-sky-500 hover:bg-sky-500/5 cursor-pointer transition-all">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-xs text-slate-400">Click to upload files (PDF, TXT, up to 512MB)</div>
              </label>
              <div className="w-32 bg-slate-900/50 rounded-xl flex items-center justify-center text-xs text-slate-500">
                No files
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Files enhance your AI with custom knowledge.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-2xl font-medium shadow-lg disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;