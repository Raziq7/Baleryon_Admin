import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Modal } from "../../ui/modal";
import { useCmsStore } from "../../../store/cmsStore";
import BannerTable from "./BannerTable";
import AddBannerForm from "./AddBannerForm";
import EditBannerForm from "./EditBannerForm";

export default function ListBanner() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [bannerId, setBannerId] = useState<string>();

  const { banners, fetchBanners } = useCmsStore();

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    setOpen(false);
    setOpenEdit(false);
  }, [banners]);

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Banners"
        buttonTitle="Add Banner"
        handleButtonClick={() => setOpen(true)}
      >
        <BannerTable
          openModal={(id) => {
            setBannerId(id);
            setOpenEdit(true);
          }}
        />
      </ComponentCard>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[700px] m-4">
        <AddBannerForm onClose={() => setOpen(false)} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[700px] m-4"
      >
        {bannerId && (
          <EditBannerForm bannerId={bannerId} onClose={() => setOpenEdit(false)} />
        )}
      </Modal>
    </div>
  );
}
