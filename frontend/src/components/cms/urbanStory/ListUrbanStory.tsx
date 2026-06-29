import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Modal } from "../../ui/modal";
import { useCmsStore } from "../../../store/cmsStore";
import UrbanStoryTable from "./UrbanStoryTable";
import AddUrbanStoryForm from "./AddUrbanStoryForm";
import EditUrbanStoryForm from "./EditUrbanStoryForm";

export default function ListUrbanStory() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [itemId, setItemId] = useState<string>();
  const { urbanStories, fetchUrbanStories } = useCmsStore();

  useEffect(() => {
    fetchUrbanStories();
  }, [fetchUrbanStories]);

  useEffect(() => {
    setOpen(false);
    setOpenEdit(false);
  }, [urbanStories]);

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Urban Stories"
        buttonTitle="Add Urban Story"
        handleButtonClick={() => setOpen(true)}
      >
        <UrbanStoryTable
          openModal={(id) => {
            setItemId(id);
            setOpenEdit(true);
          }}
        />
      </ComponentCard>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[600px] m-4">
        <AddUrbanStoryForm onClose={() => setOpen(false)} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[600px] m-4"
      >
        {itemId && (
          <EditUrbanStoryForm itemId={itemId} onClose={() => setOpenEdit(false)} />
        )}
      </Modal>
    </div>
  );
}
