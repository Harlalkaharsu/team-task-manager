import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const STATUS_BADGE = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-in-progress',
  DONE: 'badge-done',
};

const PRIORITY_BADGE = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
};

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card flex flex-col items-center text-center gap-2 py-5">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon className={color} size={22} />
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    {
      label: 'Projects',
      value: stats.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks ?? 0,
      icon: ListTodo,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks ?? 0,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: stats.doneTasks ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'To Do',
      value: stats.todoTasks ?? 0,
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const completionPct =
    stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good day, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening across your projects.</p>
        </div>
        <Link to="/projects" className="btn-primary flex items-center gap-2">
          View Projects <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Progress summary */}
      {stats.totalTasks > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-sm font-bold text-gray-700">
              {stats.doneTasks} / {stats.totalTasks} tasks done ({completionPct}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline font-medium">
            All projects →
          </Link>
        </div>

        {!data?.recentTasks?.length ? (
          <div className="text-center py-12 text-gray-400">
            <ListTodo size={44} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Create a project and start adding tasks to see them here.</p>
            <Link to="/projects" className="btn-primary mt-4 inline-flex items-center gap-2">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentTasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== 'DONE';
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Link
                        to={`/projects/${task.project.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {task.project.name}
                      </Link>
                      {task.assignee && ` · Assigned to ${task.assignee.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
                    <span className={STATUS_BADGE[task.status]}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {isOverdue && <span className="badge-overdue">Overdue</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
