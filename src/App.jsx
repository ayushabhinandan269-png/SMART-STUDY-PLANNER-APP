import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Calendar,
  BookOpen,
  Moon,
  Sun,
  ListFilter,
  Edit2,
  Save
} from 'lucide-react';

function App() {
  // State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('study-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState({
    title: '',
    subject: 'Math',
    deadline: '',
    priority: 'Medium'
  });

  const [filter, setFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('study-theme');
    return saved === 'dark';
  });

  const [editingId, setEditingId] = useState(null);

  // Effects
  useEffect(() => {
    localStorage.setItem('study-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study-theme', darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Helpers
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    if (editingId) {
      // Update existing task
      setTasks(tasks.map(t =>
        t.id === editingId ? { ...t, ...newTask } : t
      ));
      setEditingId(null);
    } else {
      // Add new task
      const task = {
        id: Date.now(),
        ...newTask,
        completed: false
      };
      setTasks([task, ...tasks]);
    }

    setNewTask({ title: '', subject: 'Math', deadline: '', priority: 'Medium' });
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setNewTask({
      title: task.title,
      subject: task.subject,
      deadline: task.deadline,
      priority: task.priority
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewTask({ title: '', subject: 'Math', deadline: '', priority: 'Medium' });
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (editingId === id) cancelEditing();
  };

  // Derived State
  const subjects = ['Math', 'Science', 'History', 'Language', 'Coding', 'Other'];
  const filteredTasks = filter === 'All'
    ? tasks
    : tasks.filter(t => t.subject === filter);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'badge-high text-red-600 bg-red-100';
      case 'Medium': return 'badge-medium text-yellow-600 bg-yellow-100';
      case 'Low': return 'badge-low text-green-600 bg-green-100';
      default: return 'badge-low';
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date().setHours(0, 0, 0, 0);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="card">
        <div className="header">
          <div>
            <h1>Smart Study</h1>
            <p className="text-muted">Stay organized, stay ahead.</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-icon"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-success">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-warning">{tasks.length - completedCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-primary">{progress}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </header>

      {/* Add/Edit Task Form */}
      <form onSubmit={addTask} className="card" style={{ border: editingId ? '2px solid var(--primary)' : '' }}>
        <div className="flex justify-between items-center mb-4">
          <h2>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
          {editingId && (
            <button type="button" onClick={cancelEditing} className="text-muted hover:text-danger">
              Cancel
            </button>
          )}
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <select
            value={newTask.subject}
            onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group">
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-full">
          {editingId ? <><Save size={20} /> Update Task</> : <><Plus size={20} /> Add Task</>}
        </button>
      </form>

      {/* Filter & List */}
      <div className="task-section">
        <div className="flex justify-between items-center mb-4">
          <h2>Your Tasks</h2>
          <div className="flex items-center gap-2">
            <ListFilter size={18} className="text-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
              style={{ width: 'auto' }}
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} className="mb-4 text-muted mx-auto" />
              <p>No tasks found. Time to relax or add a new one!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''} ${!task.completed && isOverdue(task.deadline) ? 'overdue' : ''}`}
              >
                <div className="flex items-start gap-3 task-info">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 text-primary hover:text-primary-hover transition-colors"
                  >
                    {task.completed ?
                      <CheckCircle2 size={24} color="var(--success)" /> :
                      <Circle size={24} color="var(--border-color)" />
                    }
                  </button>

                  <div className="flex-1">
                    <div className="task-title text-lg">{task.title}</div>
                    <div className="task-meta flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {task.subject}
                      </span>
                      {task.deadline && (
                        <span className={`flex items-center gap-1 ${!task.completed && isOverdue(task.deadline) ? 'text-danger font-bold' : ''}`}>
                          <Calendar size={14} />
                          {new Date(task.deadline).toLocaleDateString()}
                          {!task.completed && isOverdue(task.deadline) && ' (Overdue)'}
                        </span>
                      )}
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => startEditing(task)}
                    className="btn btn-icon text-muted hover:text-primary"
                    aria-label="Edit Task"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-danger"
                    aria-label="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
