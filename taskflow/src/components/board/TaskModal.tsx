"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Task, User } from "@/lib/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/utils";

interface TaskFormValues {
  title: string;
  description: string;
  priority: Task["priority"];
  assigneeId: string | null;
  status?: Task["status"];
}

const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABEL) as Task["priority"][]).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as Task["status"][]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

const selectClass =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-ink transition-shadow duration-150 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-soft";

export function TaskModal({
  mode,
  task,
  members,
  isSaving,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: "create" | "edit";
  task?: Task;
  members: User[];
  isSaving: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(task?.priority ?? "medium");
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? "");
  const [status, setStatus] = useState<Task["status"]>(task?.status ?? "todo");

  const instanceKey = task?.id ?? "new";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description,
      priority,
      assigneeId: assigneeId || null,
      ...(mode === "edit" ? { status } : {}),
    });
  }

  return (
    <Modal title={mode === "create" ? "New task" : "Edit task"} onClose={onClose}>
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            required
          />
        </div>

        <div>
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more detail (optional)"
          />
        </div>

        <div>
          <Label htmlFor="task-priority">Priority</Label>
          <SegmentedControl
            layoutId={`priority-${instanceKey}`}
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        </div>

        {mode === "edit" && (
          <div>
            <Label htmlFor="task-status">Status</Label>
            <SegmentedControl
              layoutId={`status-${instanceKey}`}
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </div>
        )}

        <div>
          <Label htmlFor="task-assignee">Assignee</Label>
          <select
            id="task-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className={selectClass}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        {mode === "edit" && onDelete ? (
          <Button variant="ghost" size="sm" onClick={onDelete} isLoading={isDeleting} className="text-danger hover:bg-danger-soft hover:text-danger">
            <Trash2 className="size-3.5" /> Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button form="task-form" type="submit" size="sm" isLoading={isSaving}>
            {mode === "create" ? "Create task" : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}