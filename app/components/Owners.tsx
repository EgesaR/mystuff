import { AnimatePresence, motion } from "framer-motion";
import Badge from "~/components/Badge";
import Button from "~/components/Button";
import Input from "~/components/Input";
import type { Item } from "~/types/notes";

interface OwnersProps {
  owners: Item[];
  handleRemoveOwner: (id: string) => void;
  isOwnerOpen: boolean;
  ownerInput: string;
  setOwnerInput: (value: string) => void;
  handleAddOwner: (value: string) => void;
  handleOwnerClick: () => void;
  disabled?: boolean;
}

const Owners: React.FC<OwnersProps> = ({
  owners,
  handleRemoveOwner,
  isOwnerOpen,
  ownerInput,
  setOwnerInput,
  handleAddOwner,
  handleOwnerClick,
  disabled,
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
                    disabled={disabled}
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
            disabled={disabled}
          />
        </motion.div>
      )}
    </AnimatePresence>
    <div>
      <Button btn_type="ghost" onClick={handleOwnerClick} disabled={disabled}>
        {isOwnerOpen ? (ownerInput.trim() ? "Add Owner" : "Cancel") : "+ Add Owner"}
      </Button>
    </div>
  </div>
);

export default Owners;