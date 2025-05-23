import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any, type: "folder" | "subfolder" | "note" | "task" | "schedule") => void;
  type: "folder" | "subfolder" | "note" | "task" | "schedule";
  parentFolderId: string | null;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSubmit, type, parentFolderId }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    content: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    startTime: "",
    endTime: "",
    location: "",
    tags: "",
    attendees: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    let item;
    if (type === "folder") {
      item = {
        id,
        name: formData.name,
        createdAt: now,
        updatedAt: now,
        parentFolderId: null,
        subfolders: [],
        tasks: [],
        notes: [],
        calendarSchedules: [],
      };
    } else if (type === "subfolder") {
      item = {
        id,
        name: formData.name,
        createdAt: now,
        parentFolderId,
      };
    } else if (type === "note") {
      item = {
        id,
        title: formData.title,
        content: formData.content,
        createdAt: now,
        updatedAt: now,
        folderId: parentFolderId,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      };
    } else if (type === "task") {
      item = {
        id,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        createdAt: now,
        folderId: parentFolderId,
        assignee: "",
      };
    } else {
      item = {
        id,
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        createdAt: now,
        folderId: parentFolderId,
        attendees: formData.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean),
      };
    }

    onSubmit(item, type);
    setFormData({
      name: "",
      title: "",
      description: "",
      content: "",
      status: "pending",
      priority: "medium",
      dueDate: "",
      startTime: "",
      endTime: "",
      location: "",
      tags: "",
      attendees: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-zinc-800 p-6 rounded-lg max-w-md w-full"
          >
            <h2 className="text-white text-lg mb-4">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {(type === "folder" || type === "subfolder") && (
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-700 text-white p-2 rounded"
                  required
                />
              )}
              {(type === "note" || type === "task" || type === "schedule") && (
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-700 text-white p-2 rounded"
                  required
                />
              )}
              {(type === "task" || type === "schedule") && (
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-700 text-white p-2 rounded"
                />
              )}
              {type === "note" && (
                <textarea
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-zinc-700 text-white p-2 rounded"
                />
              )}
              {type === "task" && (
                <>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  />
                </>
              )}
              {type === "schedule" && (
                <>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  />
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Attendees (comma-separated)"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    className="bg-zinc-700 text-white p-2 rounded"
                  />
                </>
              )}
              {type === "note" && (
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-zinc-700 text-white p-2 rounded"
                />
              )}
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                  Add
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddItemModal;