import { useState } from 'react';
import { projectsAPI } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

const CreateProject = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await projectsAPI.create({
        name: name.trim(),
        description: description.trim() || undefined,
        prompts: ['You are a helpful assistant.']  // Default prompt
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Create project failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl text-sm font-medium shadow-lg shadow-sky-600/30 transition-all"
      >
        + New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950/95 border border-slate-800 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">New Project</h3>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My AI Agent"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Description (optional)</label>
                <textarea
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What does this project do?"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={loading || !name.trim()}
                  className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl font-medium shadow-lg disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProject;