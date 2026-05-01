import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Users, CheckSquare, Trash2, X, ArrowRight } from 'lucide-react';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project created!');
      onCreate(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api
      .get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this project? All tasks will be removed. This cannot be undone.'))
      return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} you have access to
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-20">
          <FolderKanban size={52} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first project to start collaborating with your team.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary mx-auto inline-flex items-center gap-2"
          >
            <Plus size={18} /> Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:shadow-md transition-all group block border-gray-200 hover:border-blue-200"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                {project.ownerId === user?.id && (
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={13} />
                  {project._count?.tasks ?? 0} task{project._count?.tasks !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {project._count?.members ?? 0} member
                  {project._count?.members !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-blue-700">
                    {project.owner?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-400">{project.owner?.name}</span>
                </div>
                <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={(p) => setProjects((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}
