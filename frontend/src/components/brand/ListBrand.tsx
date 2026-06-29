import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useCatalogStore } from "../../store/catalogStore";
import BrandTable from "./BrandTable";
import AddBrandForm from "./AddBrandForm";
import EditBrandForm from "./EditBrandForm";

export default function ListBrand() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [brandId, setBrandId] = useState<string>();

  const { brands, fetchBrands } = useCatalogStore();

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (brands.length >= 0) {
      setOpen(false);
      setOpenEdit(false);
    }
  }, [brands]);

  return (
    <>
      <PageMeta title="Brand Management" description="Manage product brands" />
      <PageBreadcrumb pageTitle="Brands" />
      <div className="space-y-6">
        <ComponentCard
          title="Brands"
          buttonTitle="Add Brand"
          handleButtonClick={() => setOpen(true)}
        >
          <BrandTable
            openModal={(id) => {
              setBrandId(id);
              setOpenEdit(true);
            }}
          />
        </ComponentCard>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[600px] m-4">
        <AddBrandForm />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[600px] m-4"
      >
        {brandId && <EditBrandForm brandId={brandId} />}
      </Modal>
    </>
  );
}
