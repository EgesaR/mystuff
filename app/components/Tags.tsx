import { AnimatePresence, motion } from "framer-motion";
import Badge from "~/components/Badge";
import Button from "~/components/Button";
import Input from "~/components/Input";
import type { Item } from "~/types/notes";

interface TagsProps {
  tags: Item[];
  handleRemoveTag: (id: string) => void;
  isTagOpen: boolean;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: (value: string) => void;
  handleTagClick: () => void;
  disabled?: boolean;
}

const Tags: React.FC<TagsProps> = ({
  tags,
  handleRemoveTag,
  isTagOpen,
  tagInput,
  setTagInput,
  handleAddTag,
  handleTagClick,
  disabled,
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
                    disabled={disabled}
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
            disabled={disabled}
          />
        </motion.div>
      )}
    </AnimatePresence>
    <div>
      <Button btn_type="ghost" onClick={handleTagClick} disabled={disabled}>
        {isTagOpen ? (tagInput.trim() ? "Add Tag" : "Cancel") : "+ Add Tag"}
      </Button>
    </div>
  </div>
);

export default Tags;