import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Modal } from "../../ui/modal";
import { useCmsStore } from "../../../store/cmsStore";
import LimitedSeasonTable from "./LimitedSeasonTable";
import AddLimitedSeasonForm from "./AddLimitedSeasonForm";
import EditLimitedSeasonForm from "./EditLimitedSeasonForm";

export default function ListLimitedSeason() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [itemId, setItemId] = useState<string>();
  const { limitedSeasons, fetchLimitedSeasons } = useCmsStore();

  useEffect(() => {
    fetchLimitedSeasons();
  }, [fetchLimitedSeasons]);

  useEffect(() => {
    setOpen(false);
    setOpenEdit(false);
  }, [limitedSeasons]);

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Limited Season"
        buttonTitle="Add Limited Season"
        handleButtonClick={() => setOpen(true)}
      >
        <LimitedSeasonTable
          openModal={(id) => {
            setItemId(id);
            setOpenEdit(true);
          }}
        />
      </ComponentCard>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[700px] m-4">
        <AddLimitedSeasonForm onClose={() => setOpen(false)} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[700px] m-4"
      >
        {itemId && (
          <EditLimitedSeasonForm itemId={itemId} onClose={() => setOpenEdit(false)} />
        )}
      </Modal>
    </div>
  );
}
