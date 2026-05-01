import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Users,
  Trash2,
  ArrowLeft,
  UserPlus,
  Crown,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const PRIORITY_BADGE = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

// ── Create Task Modal ──────────────────────────────────────────────────────────
function CreateTaskModal({ projectId, members, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/tasks/project/${projectId}`, {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      toast.success('Task created!');
      onCreate(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">New Task</h2>
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
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              rows={2}
              placeholder="Describe the task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
            <select
              className="input"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add Member Modal ───────────────────────────────────────────────────────────
function AddMemberModal({ projectId, onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
      toast.success('Member added!');
      onAdd(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
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
              Member Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              The user must have a TaskFlow account already.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Role
            </label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MEMBER">Member — Can create and update tasks</option>
              <option value="ADMIN">Admin — Can also manage members</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────────────────────────
function TaskCard({ task, onUpdate, onDelete }) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { status });
      onUpdate(data);
    } catch {
      toast.error('Failed to update task status');
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border p-3.5 shadow-sm hover:shadow-md transition-all ${
        isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
      }`}
    >
      {/* Title + delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-0.5 rounded hover:bg-red-50"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
        {isOverdue && (
          <span className="badge bg-red-100 text-red-600 flex items-center gap-1">
            <AlertTriangle size={10} /> Overdue
          </span>
        )}
      </div>

      {/* Due date */}
      {task.dueDate && (
        <p
          className={`text-xs flex items-center gap-1 mb-2.5 ${
            isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'
          }`}
        >
          <Calendar size={11} />
          {new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-700">
            {task.assignee.name[0].toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}

      {/* Status selector */}
      <select
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const isProjectAdmin =
    project?.ownerId === user?.id ||
    project?.members?.some((m) => m.userId === user?.id && m.role === 'ADMIN');

  const handleTaskCreate = (task) =>
    setProject((p) => ({ ...p, tasks: [task, ...(p.tasks || [])] }));

  const handleTaskUpdate = (updated) =>
    setProject((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setProject((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleMemberAdd = (member) =>
    setProject((p) => ({ ...p, members: [...(p.members || []), member] }));

  const handleMemberRemove = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject((p) => ({
        ...p,
        members: p.members.filter((m) => m.userId !== userId),
      }));
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks || [];
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const completion = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const columns = [
    {
      id: 'TODO',
      label: 'To Do',
      tasks: todoTasks,
      color: 'text-gray-600 bg-gray-100',
      dot: 'bg-gray-400',
      headerBg: 'bg-gray-50',
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      tasks: inProgressTasks,
      color: 'text-blue-700 bg-blue-100',
      dot: 'bg-blue-500',
      headerBg: 'bg-blue-50',
    },
    {
      id: 'DONE',
      label: 'Done',
      tasks: doneTasks,
      color: 'text-green-700 bg-green-100',
      dot: 'bg-green-500',
      headerBg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Projects
      </Link>

      {/* Project Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-1">{project.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Created by <span className="font-medium">{project.owner?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 w-12 text-right">
            {completion}%
          </span>
          <span className="text-sm text-gray-400">
            {doneTasks.length}/{tasks.length} done
          </span>
        </div>
      </div>

      {/* Members Panel */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={17} />
            Team Members
            <span className="text-gray-400 font-normal text-sm">
              ({project.members?.length ?? 0})
            </span>
          </h2>
          {isProjectAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1.5"
            >
              <UserPlus size={15} /> Add Member
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full pl-1 pr-3 py-1 group hover:bg-gray-100 transition-colors"
            >
              <div className="bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                {m.user.name[0].toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800">{m.user.name}</span>
              </div>
              {(m.role === 'ADMIN' || m.userId === project.ownerId) && (
                <Crown size={12} className="text-amber-400" title="Admin" />
              )}
              {isProjectAdmin && m.userId !== project.ownerId && m.userId !== user?.id && (
                <button
                  onClick={() => handleMemberRemove(m.userId)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                  title="Remove member"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tasks{' '}
          <span className="text-gray-400 font-normal text-base">({tasks.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => (
            <div key={col.id} className={`rounded-xl p-4 ${col.headerBg} border border-gray-100`}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${col.dot}`} />
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-gray-400 text-sm ml-auto font-medium">
                  {col.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[80px]">
                {col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))}
                {col.tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-sm select-none">
                    No tasks
                  </div>
                )}
              </div>

              {/* Quick add button */}
              <button
                onClick={() => setShowCreateTask(true)}
                className="mt-3 w-full text-gray-400 hover:text-blue-600 hover:bg-white text-sm py-2 rounded-lg border border-dashed border-gray-200 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Add task
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          members={project.members || []}
          onClose={() => setShowCreateTask(false)}
          onCreate={handleTaskCreate}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdd={handleMemberAdd}
        />
      )}
    </div>
  );
}
