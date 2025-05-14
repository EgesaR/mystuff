import { Form, redirect, useNavigate } from "@remix-run/react";
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

export const action = async ({ request }: ActionFunctionArgs) => {
 const formData = await request.formData();
 const title = formData.get("title") as string;
 const tags = JSON.parse(formData.get("tags") as string) as Item[];
 const owners = JSON.parse(formData.get("owners") as string) as Item[];

 if (!title) {
  return json({ error: "Title is required" }, { status: 400 });
 }

 const note: Note = {
  id: uuid(),
  title,
  body: [
   {
    type: "paragraph",
    content: "Begin from here"
   }
  ],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  owners: owners.map(owner => ({
   id: uuid(),
   name: owner.value,
   avatar: "https://placecats.com/200/200"
  })),
  tags: tags.map(tag => tag.value)
 };

 await createNote(note);
 return redirect("/notes");
};

export default function NewNote() {
 const [tags, setTags] = useState<Item[]>([]);
 const [title, setTitle] = useState("");
 const [tagInput, setTagInput] = useState("");
 const [isTagOpen, setIsTagOpen] = useState(false);
 const [owners, setOwners] = useState<Item[]>([]);
 const [ownerInput, setOwnerInput] = useState("");
 const [isOwnerOpen, setIsOwnerOpen] = useState(false);
 const navigate = useNavigate();

 const handleTagClick = () => {
  if (isTagOpen && tagInput.trim()) {
   setTags([...tags, { id: uuid(), value: tagInput.trim() }]);
   setTagInput("");
   setIsTagOpen(false);
  } else {
   setIsTagOpen(prev => !prev);
   setTagInput("");
  }
 };

 const handleAddTag = (value: string) => {
  if (value.trim()) {
   setTags([...tags, { id: uuid(), value: value.trim() }]);
   setTagInput("");
   setIsTagOpen(false);
  }
 };

 const handleRemoveTag = (id: string) => {
  setTags(tags.filter(tag => tag.id !== id));
 };

 const handleOwnerClick = () => {
  if (isOwnerOpen && ownerInput.trim()) {
   setOwners([...owners, { id: uuid(), value: ownerInput.trim() }]);
   setOwnerInput("");
   setIsOwnerOpen(false);
  } else {
   setIsOwnerOpen(prev => !prev);
   setOwnerInput("");
  }
 };

 const handleAddOwner = (value: string) => {
  if (value.trim()) {
   setOwners([...owners, { id: uuid(), value: value.trim() }]);
   setOwnerInput("");
   setIsOwnerOpen(false);
  }
 };

 const handleRemoveOwner = (id: string) => {
  setOwners(owners.filter(owner => owner.id !== id));
 };

 return (
  <div className="w-full h-full px-8 md:px-10 pt-14">
   <h1 className="text-4xl font-semibold">Add a new note</h1>
   <Form method="post" className="mt-6 relative h-[75%]">
    <input type="hidden" name="tags" value={JSON.stringify(tags)} />
    <input type="hidden" name="owners" value={JSON.stringify(owners)} />
    <Input
     name="title"
     value={title}
     onChange={e => setTitle(e.target.value)}
     placeholder="Enter your note title"
     label="Note Title"
    />
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
    <div className="absolute bottom-12 sm:bottom-6 right-0 flex gap-4">
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

const Tags = ({
 tags,
 handleRemoveTag,
 isTagOpen,
 tagInput,
 setTagInput,
 handleAddTag,
 handleTagClick
}) => (
 <div className="mt-10 flex flex-col gap-5">
  <motion.div>
   <AnimatePresence>
    {tags.length > 0 ? (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.125, ease: "easeInOut" }}
      className="flex gap-3 overflow-x-hidden flex-wrap"
     >
      <AnimatePresence>
       {tags.map((tag, index) => (
        <Badge
         key={tag.id}
         label={tag.value}
         onRemove={() => handleRemoveTag(tag.id)}
         index={index}
         isAnimate={true}
        />
       ))}
      </AnimatePresence>
     </motion.div>
    ) : (
     <AnimatePresence>
      <motion.p
       initial={{ opacity: 0, y: 24, x: 0 }}
       animate={{ opacity: 1, y: 0, x: 0 }}
       exit={{ opacity: 0, x: -24, y: 0 }}
       transition={{ duration: 0.125, ease: "easeInOut" }}
       className="text-gray-500"
      >
       No tags added
      </motion.p>
     </AnimatePresence>
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
      onChange={e => setTagInput(e.target.value)}
      onKeyDown={e => {
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

const Owners = ({
 owners,
 handleRemoveOwner,
 isOwnerOpen,
 ownerInput,
 setOwnerInput,
 handleAddOwner,
 handleOwnerClick
}) => (
 <div className="mt-10 flex flex-col gap-5">
  <motion.div>
   <AnimatePresence>
    {owners.length > 0 ? (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.125, ease: "easeInOut" }}
      className="flex gap-3 overflow-x-hidden flex-wrap"
     >
      <AnimatePresence>
       {owners.map((owner, index) => (
        <Badge
         key={owner.id}
         label={owner.value}
         onRemove={() => handleRemoveOwner(owner.id)}
         index={index}
         isAnimate={true}
        />
       ))}
      </AnimatePresence>
     </motion.div>
    ) : (
     <AnimatePresence>
      <motion.p
       initial={{ opacity: 0, y: 24, x: 0 }}
       animate={{ opacity: 1, y: 0, x: 0 }}
       exit={{ opacity: 0, x: -24, y: 0 }}
       transition={{ duration: 0.125, ease: "easeInOut" }}
       className="text-gray-500"
      >
       No owners added
      </motion.p>
     </AnimatePresence>
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
      onChange={e => setOwnerInput(e.target.value)}
      onKeyDown={e => {
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
    {isOwnerOpen ? (ownerInput.trim() ? "Add Owner" : "Cancel") : "+ Owner Tag"}
   </Button>
  </div>
 </div>
);
