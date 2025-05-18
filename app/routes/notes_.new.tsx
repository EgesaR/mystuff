import { Form, redirect, useNavigate, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import Badge from "~/components/Badge";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { createNote } from "~/data/notes";
import type { Note, Owner } from "~/types/notes";

interface Item {
  id: string;
  value: string;
}

interface ActionData {
  error?: string;
}

interface TagsProps {
  tags: Item[];
  handleRemoveTag: (id: string) => void;
  isTagOpen: boolean;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: (value: string) => void;
  handleTagClick: () => void;
}

interface OwnersProps {
  owners: Item[];
  handleRemoveOwner: (id: string) => void;
  isOwnerOpen: boolean;
  ownerInput: string;
  setOwnerInput: (value: string) => void;
  handleAddOwner: (value: string) => void;
  handleOwnerClick: () => void;
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const tags = JSON.parse(formData.get("tags") as string) as Item[];
  const owners = JSON.parse(formData.get("owners") as string) as Item[];

  if (!title) {
    return json<ActionData>({ error: "Title is required" }, { status: 400 });
  }

  const note: Note = {
    id: uuid(),
    title,
    body: [
      {
        type: "paragraph",
        content: "Begin from here",
      },
    ],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    owners: owners.map((owner) => ({
      id: uuid(),
      name: owner.value,
      avatar: "https://placecats.com/200/200",
    })),
    tags: tags.map((tag) => tag.value),
  };

  await createNote(note);
  return redirect("/notes");
};

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

  const handleTagClick = (): void => {
    if (isTagOpen && tagInput.trim()) {
      setTags([...tags, { id: uuid(), value: tagInput.trim() }]);
      setTagInput("");
      setIsTagOpen(false);
    } else {
      setIsTagOpen((prev) => !prev);
      setTagInput("");
    }
  };

  const handleAddTag = (value: string): void => {
    if (value.trim()) {
      setTags([...tags, { id: uuid(), value: value.trim() }]);
      setTagInput("");
      setIsTagOpen(false);
    }
  };

  const handleRemoveTag = (id: string): void => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleOwnerClick = (): void => {
    if (isOwnerOpen && ownerInput.trim()) {
      setOwners([...owners, { id: uuid(), value: ownerInput.trim() }]);
      setOwnerInput("");
      setIsOwnerOpen(false);
    } else {
      setIsOwnerOpen((prev) => !prev);
      setOwnerInput("");
    }
  };

  const handleAddOwner = (value: string): void => {
    if (value.trim()) {
      setOwners([...owners, { id: uuid(), value: value.trim() }]);
      setOwnerInput("");
      setIsOwnerOpen(false);
    }
  };

  const handleRemoveOwner = (id: string): void => {
    setOwners(owners.filter((owner) => owner.id !== id));
  };

  return (
    <div className="w-full min-h-screen px-8 md:px-10 pt-14 pb-28 bg-zinc-900 font-light">
      <h1 className="text-4xl font-semibold text-zinc-50">Add a new note</h1>
      <Form method="post" className="mt-6 flex flex-col gap-6">
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
          />
          <AnimatePresence>
            {actionData?.error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.125, ease: "easeInOut" }}
                className="text-red-400 text-sm mt-2"
              >
                {actionData.error}
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
        />
        <Owners
          owners={owners}
          handleRemoveOwner={handleRemoveOwner}
          isOwnerOpen={isOwnerOpen}
          ownerInput={ownerInput}
          setOwnerInput={setOwnerInput}
          handleAddOwner={handleAddOwner}
          handleOwnerClick={handleOwnerClick}
        />
        <div className="flex gap-4 mt-8">
          <Button type="submit" className="px-8">
            Add
          </Button>
          <Button type="button" className="px-8" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

const Tags: React.FC<TagsProps> = ({
  tags,
  handleRemoveTag,
  isTagOpen,
  tagInput,
  setTagInput,
  handleAddTag,
  handleTagClick,
}) => (
  <div className="flex flex-col gap-5">
    <motion.div>
      <AnimatePresence>
        {tags.length > 0 ? (
          <motion.div className="flex gap-3 flex-wrap">
            <AnimatePresence>
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.125, ease: "easeInOut" }}
                >
                  <Badge
                    label={tag.value}
                    onRemove={() => handleRemoveTag(tag.id)}
                    index={index}
                    isAnimate={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.p
            key="no-tags"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.125, ease: "easeInOut" }}
            className="text-zinc-500"
          >
            No tags added
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
    <AnimatePresence>
      {isTagOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            label="Tag Name"
            className="w-full sm:max-w-[14rem]"
            value={tagInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleAddTag(tagInput);
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
    <div>
      <Button btn_type="ghost" onClick={handleTagClick}>
        {isTagOpen ? (tagInput.trim() ? "Add Tag" : "Cancel") : "+ Add Tag"}
      </Button>
    </div>
  </div>
);

const Owners: React.FC<OwnersProps> = ({
  owners,
  handleRemoveOwner,
  isOwnerOpen,
  ownerInput,
  setOwnerInput,
  handleAddOwner,
  handleOwnerClick,
}) => (
  <div className="flex flex-col gap-5">
    <motion.div>
      <AnimatePresence>
        {owners.length > 0 ? (
          <motion.div className="flex gap-3 flex-wrap">
            <AnimatePresence>
              {owners.map((owner, index) => (
                <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.125, ease: "easeInOut" }}
                >
                  <Badge
                    label={owner.value}
                    onRemove={() => handleRemoveOwner(owner.id)}
                    index={index}
                    isAnimate={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.p
            key="no-owners"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.125, ease: "easeInOut" }}
            className="text-zinc-500"
          >
            No owners added
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
    <AnimatePresence>
      {isOwnerOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            label="Owner Name"
            className="w-full sm:max-w-[14rem]"
            value={ownerInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOwnerInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleAddOwner(ownerInput);
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
    <div>
      <Button btn_type="ghost" onClick={handleOwnerClick}>
        {isOwnerOpen ? (ownerInput.trim() ? "Add Owner" : "Cancel") : "+ Add Owner"}
      </Button>
    </div>
  </div>
);