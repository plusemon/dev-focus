import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Task, TaskStatus, Tag, INITIAL_TAGS, Subtask, Priority } from '../types';
import { useTaskContext } from '../context/TaskContext';
import {
  X,
  Save,
  Trash2,
  Tag as TagIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Eraser,
  RemoveFormatting,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ConfirmationModal } from './ConfirmationModal';
import { DatePicker } from './DatePicker';
import { PrioritySelect } from './PrioritySelect';
import { SubtaskList } from './SubtaskList';

// Module-level constants for HTML escaping - avoid recreating regex on every render
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_LIKE_REGEX = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value: string): string =>
  value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char]);

const toEditorHtml = (value: string): string => {
  if (!value.trim()) return '';
  if (HTML_LIKE_REGEX.test(value)) return value;
  return escapeHtml(value).replace(/\n/g, '<br />');
};

// Consolidated form state interface
interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  selectedTags: Tag[];
  projectId: string;
  dueDate: number | null;
  priority: Priority;
  subtasks: Subtask[];
}

const INITIAL_FORM_STATE: FormState = {
  title: '',
  description: '',
  status: TaskStatus.BACKLOG,
  selectedTags: [],
  projectId: '',
  dueDate: null,
  priority: null,
  subtasks: [],
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  initialStatus?: TaskStatus;
}

// Memoized Status Button component to prevent unnecessary re-renders
interface StatusButtonProps {
  currentStatus: TaskStatus;
  selectedStatus: TaskStatus;
  onSelect: (status: TaskStatus) => void;
}

const StatusButton = React.memo<StatusButtonProps>(function StatusButton({
  currentStatus,
  selectedStatus,
  onSelect,
}) {
  const isSelected = selectedStatus === currentStatus;

  return (
    <button
      type="button"
      onClick={() => onSelect(currentStatus)}
      className={cn(
        'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all',
        isSelected
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/40'
      )}
    >
      {currentStatus.replace('_', ' ')}
    </button>
  );
});

// Memoized Tag Button component
interface TagButtonProps {
  tag: Tag;
  isSelected: boolean;
  onToggle: (tag: Tag) => void;
}

const TagButton = React.memo<TagButtonProps>(function TagButton({ tag, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(tag)}
      className={cn(
        'text-[11px] px-2 py-1 rounded-full border transition-all',
        isSelected
          ? tag.color
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
      )}
    >
      {tag.name}
    </button>
  );
});

// Memoized Project Button component
interface ProjectButtonProps {
  project: { id: string; name: string; color: string };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ProjectButton = React.memo<ProjectButtonProps>(function ProjectButton({
  project,
  isSelected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      className={cn(
        'text-[11px] px-2 py-1 rounded-full border font-medium transition-colors',
        isSelected
          ? `bg-slate-100 dark:bg-slate-800 ${project.color} border-slate-300 dark:border-slate-600`
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      )}
    >
      {project.name}
    </button>
  );
});

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  initialStatus,
}) => {
  const { addTask, updateTask, deleteTask, projects, selectedProjectId } = useTaskContext();
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Consolidated form state using single useState with object
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Memoized derived values
  const isEditing = useMemo(() => !!taskToEdit, [taskToEdit]);
  const titleLength = useMemo(() => formState.title.trim().length, [formState.title]);
  const isTitleValid = useMemo(() => titleLength > 0 && titleLength <= 120, [titleLength]);

  // Memoized tag lookup for O(1) selection checks
  const selectedTagIds = useMemo(
    () => new Set(formState.selectedTags.map((t) => t.id)),
    [formState.selectedTags]
  );

  // Reset form to initial state - memoized
  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  // Initialize form when modal opens or task changes
  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setFormState({
        title: taskToEdit.title,
        description: toEditorHtml(taskToEdit.description),
        status: taskToEdit.status,
        selectedTags: taskToEdit.tags,
        projectId: taskToEdit.projectId || '',
        dueDate: taskToEdit.dueDate ?? null,
        priority: taskToEdit.priority ?? null,
        subtasks: taskToEdit.subtasks ?? [],
      });
      // Sync editor content after state update
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = toEditorHtml(taskToEdit.description);
        }
      });
    } else {
      resetForm();
      setFormState((prev) => ({
        ...prev,
        status: initialStatus ?? TaskStatus.BACKLOG,
        projectId: selectedProjectId ?? '',
      }));
    }
  }, [isOpen, taskToEdit, initialStatus, selectedProjectId, resetForm]);

  // Cleanup editor ref when modal closes
  useEffect(() => {
    if (!isOpen && editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, [isOpen]);

  // Memoized state updaters
  const setTitle = useCallback((title: string) => {
    setFormState((prev) => ({ ...prev, title }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setFormState((prev) => ({ ...prev, description }));
  }, []);

  const setStatus = useCallback((status: TaskStatus) => {
    setFormState((prev) => ({ ...prev, status }));
  }, []);

  const setProjectId = useCallback((projectId: string) => {
    setFormState((prev) => ({ ...prev, projectId }));
  }, []);

  const setDueDate = useCallback((dueDate: number | null) => {
    setFormState((prev) => ({ ...prev, dueDate }));
  }, []);

  const setPriority = useCallback((priority: Priority) => {
    setFormState((prev) => ({ ...prev, priority }));
  }, []);

  const setSubtasks = useCallback((subtasks: Subtask[]) => {
    setFormState((prev) => ({ ...prev, subtasks }));
  }, []);

  // Optimized tag toggle with minimal array allocations
  const toggleTag = useCallback((tag: Tag) => {
    setFormState((prev) => {
      const isSelected = prev.selectedTags.some((t) => t.id === tag.id);
      if (isSelected) {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter((t) => t.id !== tag.id),
        };
      }
      return {
        ...prev,
        selectedTags: [...prev.selectedTags, tag],
      };
    });
  }, []);

  // Memoized editor format handlers
  const applyFormat = useCallback(
    (command: string, commandValue?: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand(command, false, commandValue);
      setFormState((prev) => ({
        ...prev,
        description: editorRef.current?.innerHTML ?? '',
      }));
    },
    []
  );

  const handleRemoveFormat = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('removeFormat');
    setFormState((prev) => ({
      ...prev,
      description: editorRef.current?.innerHTML ?? '',
    }));
  }, []);

  const handleClearDescription = useCallback(() => {
    setFormState((prev) => ({ ...prev, description: '' }));
    if (editorRef.current) editorRef.current.innerHTML = '';
  }, []);

  const handleInsertLink = useCallback(() => {
    const url = window.prompt('Enter URL');
    if (url) applyFormat('createLink', url);
  }, [applyFormat]);

  // Memoized submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isTitleValid) return;

      const taskData = {
        title: formState.title,
        description: formState.description,
        status: formState.status,
        tags: formState.selectedTags,
        projectId: formState.projectId || undefined,
        dueDate: formState.dueDate ?? undefined,
        priority: formState.priority ?? undefined,
        subtasks: formState.subtasks.length > 0 ? formState.subtasks : undefined,
      };

      if (taskToEdit) {
        updateTask(taskToEdit.id, taskData);
      } else {
        addTask(taskData);
      }
      onClose();
    },
    [formState, isTitleValid, taskToEdit, updateTask, addTask, onClose]
  );

  // Memoized delete handlers
  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (taskToEdit) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  }, [taskToEdit, deleteTask, onClose]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Memoized input handler
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, [setTitle]);

  const handleEditorInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      setDescription((e.target as HTMLDivElement).innerHTML);
    },
    [setDescription]
  );

  // Memoized status values array
  const statusValues = useMemo(() => Object.values(TaskStatus), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.25),transparent_35%)]" />
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 shadow-[0_32px_120px_-36px_rgba(15,23,42,0.65)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-slate-500 dark:text-slate-400">
                {isEditing ? 'Task Workspace' : 'Create Flow'}
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture context, priority, and next actions in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form id="task-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {/* Title Section */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3 sm:p-4">
              <input
                type="text"
                value={formState.title}
                onChange={handleTitleChange}
                placeholder="What needs to get done?"
                className="w-full bg-transparent text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
              />
              <div
                className={cn(
                  'mt-2 text-xs',
                  titleLength > 120 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {titleLength}/120
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)] gap-3">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Status Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-3">
                    Status
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {statusValues.map((currentStatus) => (
                      <StatusButton
                        key={currentStatus}
                        currentStatus={currentStatus}
                        selectedStatus={formState.status}
                        onSelect={setStatus}
                      />
                    ))}
                  </div>
                </div>

                {/* Description Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Description
                  </p>
                  <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      aria-label="Bold"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Bold"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      aria-label="Italic"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Italic"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('underline')}
                      aria-label="Underline"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Underline"
                    >
                      <Underline size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('insertUnorderedList')}
                      aria-label="Bullet list"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Bullet list"
                    >
                      <List size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('insertOrderedList')}
                      aria-label="Numbered list"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Numbered list"
                    >
                      <ListOrdered size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertLink}
                      aria-label="Insert link"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Insert link"
                    >
                      <Link2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFormat}
                      aria-label="Remove selected formatting"
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Remove selected formatting"
                    >
                      <RemoveFormatting size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDescription}
                      aria-label="Clear"
                      className="ml-auto p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20"
                      title="Clear"
                    >
                      <Eraser size={14} />
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    data-placeholder="Add details, code snippets, or checklists..."
                    className="min-h-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-slate-400 dark:[&:empty:before]:text-slate-500"
                  />
                </div>

                {/* Subtasks Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3">
                  <SubtaskList subtasks={formState.subtasks} onChange={setSubtasks} />
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <aside className="space-y-3">
                {/* Scheduling Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Scheduling
                  </p>
                  <DatePicker value={formState.dueDate} onChange={setDueDate} />
                  <PrioritySelect value={formState.priority} onChange={setPriority} />
                </div>

                {/* Project Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-3">
                    Project
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setProjectId('')}
                      className={cn(
                        'text-[11px] px-2 py-1 rounded-full border font-medium transition-colors',
                        !formState.projectId
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      )}
                    >
                      No project
                    </button>
                    {projects.map((project) => (
                      <ProjectButton
                        key={project.id}
                        project={project}
                        isSelected={formState.projectId === project.id}
                        onSelect={setProjectId}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <TagIcon size={12} /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INITIAL_TAGS.map((tag) => (
                      <TagButton
                        key={tag.id}
                        tag={tag}
                        isSelected={selectedTagIds.has(tag.id)}
                        onToggle={toggleTag}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing ? 'Update task details' : 'Create task and start execution'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={!isTitleValid}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1.5"
            >
              <Save size={15} /> Save Task
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally rendered ConfirmationModal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToEdit?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </div>
  );
};
