import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  prompts: string[];
  createdAt: string;
}

const ProjectsList = () => {
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsAPI.list,
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-900/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-2">Failed to load projects</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-800 text-sm rounded-xl border border-slate-700 hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.data?.map((project: Project) => (
        <Link
          key={project._id}
          to={`/app/projects/${project._id}`}
          className="group rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/70 p-6 transition-all shadow-xl hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] hover:-translate-y-1"
        >
          <h3 className="font-semibold text-lg mb-2 group-hover:text-sky-400">
            {project.name}
          </h3>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            {project.description || 'No description'}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{project.prompts.length} prompt{project.prompts.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProjectsList;