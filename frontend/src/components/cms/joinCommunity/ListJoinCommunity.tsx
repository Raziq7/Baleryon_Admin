import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Modal } from "../../ui/modal";
import { useCmsStore } from "../../../store/cmsStore";
import JoinCommunityTable from "./JoinCommunityTable.tsx";
import AddJoinCommunityForm from "./AddJoinCommunityForm.tsx";

export default function ListJoinCommunity() {
  const [open, setOpen] = useState(false);
  const { joinCommunity, fetchJoinCommunity } = useCmsStore();

  useEffect(() => {
    fetchJoinCommunity();
  }, [fetchJoinCommunity]);

  useEffect(() => {
    setOpen(false);
  }, [joinCommunity]);

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Join Community Emails"
        buttonTitle="Add Email"
        handleButtonClick={() => setOpen(true)}
      >
        <JoinCommunityTable />
      </ComponentCard>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[500px] m-4">
        <AddJoinCommunityForm onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
