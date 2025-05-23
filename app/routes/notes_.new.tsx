import { Form, useNavigate, useActionData } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import Badge from "~/components/Badge";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Tags from "~/components/Tags";
import Owners from "~/components/Owners";
import type { Item, ActionData, Note } from "~/types/notes";

export default function NewNote() {
  const [tags, setTags] = useState<Item[]>([]);
  const [title, setTitle] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [isTagOpen, setIsTagOpen] = useState<boolean>(false);
  const [owners, setOwners] = useState<Item[]>([]);
  const [ownerInput, setOwnerInput] = useState<string>("");
  const [isOwnerOpen, setIsOwnerOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/action/notes/new", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note");
      }
      return response.json();
    },
    onMutate: async (formData) => {
      const tempId = uuid();
      const title = formData.get("title") as string;
      const tags = JSON.parse(formData.get("tags") as string) as Item[];
      const owners = JSON.parse(formData.get("owners") as string) as Item[];

      const optimisticNote: Note = {
        id: tempId,
        title,
        body: [{ type: "paragraph", content: "Begin from here" }],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        owners: owners.map((owner) => ({
          id: uuid(),
          name: owner.value,
          avatar: "https://placecats.com/200/200",
        })),
        tags: tags.map((tag) => tag.value),
      };

      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
      queryClient.setQueryData(["notes"], [...previousNotes, optimisticNote]);

      return { optimisticNote, previousNotes };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["notes"], context?.previousNotes);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notes"], (old: Note[] | undefined) => {
        const withoutOptimistic = (old || []).filter(
          (note) => note.id !== data.note.id
        );
        return [...withoutOptimistic, data.note];
      });
      // Invalidate to ensure all clients refetch
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate("/notes", { replace: true });
    },
  });

  const handleTagClick = useCallback((): void => {
    if (isTagOpen && tagInput.trim()) {
      setTags([...tags, { id: uuid(), value: tagInput.trim() }]);
      setTagInput("");
      setIsTagOpen(false);
    } else {
      setIsTagOpen((prev) => !prev);
      setTagInput("");
    }
  }, [isTagOpen, tagInput, tags]);

  const handleAddTag = useCallback((value: string): void => {
    if (value.trim()) {
      setTags([...tags, { id: uuid(), value: value.trim() }]);
      setTagInput("");
      setIsTagOpen(false);
    }
  }, [tags]);

  const handleRemoveTag = useCallback((id: string): void => {
    setTags(tags.filter((tag) => tag.id !== id));
  }, [tags]);

  const handleOwnerClick = useCallback((): void => {
    if (isOwnerOpen && ownerInput.trim()) {
      setOwners([...owners, { id: uuid(), value: ownerInput.trim() }]);
      setOwnerInput("");
      setIsOwnerOpen(false);
    } else {
      setIsOwnerOpen((prev) => !prev);
      setOwnerInput("");
    }
  }, [isOwnerOpen, ownerInput, owners]);

  const handleAddOwner = useCallback((value: string): void => {
    if (value.trim()) {
      setOwners([...owners, { id: uuid(), value: value.trim() }]);
      setOwnerInput("");
      setIsOwnerOpen(false);
    }
  }, [owners]);

  const handleRemoveOwner = useCallback((id: string): void => {
    setOwners(owners.filter((owner) => owner.id !== id));
  }, [owners]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate(formData);
  };

  return (
    <div className="w-full min-h-screen px-8 md:px-10 pt-14 pb-28 bg-zinc-900 font-light">
      <h1 className="text-4xl font-semibold text-zinc-50">Add a new note</h1>
      <Form
        method="post"
        className="mt-6 flex flex-col gap-6"
        onSubmit={handleSubmit}
        aria-busy={mutation.isPending}
      >
        <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        <input type="hidden" name="owners" value={JSON.stringify(owners)} />
        <div>
          <Input
            name="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter your note title"
            label="Note Title"
            className="w-full sm:max-w-[24rem]"
            disabled={mutation.isPending}
            aria-invalid={!!(actionData?.error || mutation.error)}
            aria-describedby="title-error"
          />
          <AnimatePresence>
            {(actionData?.error || mutation.error) && (
              <motion.p
                id="title-error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.125, ease: "easeInOut" }}
                className="text-red-400 text-sm mt-2"
              >
                {actionData?.error || mutation.error?.message || "An error occurred"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <Tags
          tags={tags}
          handleRemoveTag={handleRemoveTag}
          isTagOpen={isTagOpen}
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleTagClick={handleTagClick}
          disabled={mutation.isPending}
        />
        <Owners
          owners={owners}
          handleRemoveOwner={handleRemoveOwner}
          isOwnerOpen={isOwnerOpen}
          ownerInput={ownerInput}
          setOwnerInput={setOwnerInput}
          handleAddOwner={handleAddOwner}
          handleOwnerClick={handleOwnerClick}
          disabled={mutation.isPending}
        />
        <div className="flex gap-4 mt-8">
          <Button
            type="submit"
            className="px-8"
            disabled={mutation.isPending}
            aria-label="Add new note"
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </Button>
          <Button
            type="button"
            className="px-8"
            onClick={() => navigate(-1)}
            disabled={mutation.isPending}
            aria-label="Cancel and go back"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
