import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useCatalogStore } from "../../store/catalogStore";
import CategoryTable from "./CategoryTable";
import AddCategoryForm from "./AddCategoryForm";
import EditCategoryForm from "./EditCategoryForm";

export default function ListCategory() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [categoryId, setCategoryId] = useState<string>();

  const { categories, fetchCategories } = useCatalogStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length >= 0) {
      setOpen(false);
      setOpenEdit(false);
    }
  }, [categories]);

  return (
    <>
      <PageMeta
        title="Category Management"
        description="Manage product categories"
      />
      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <ComponentCard
          title="Categories"
          buttonTitle="Add Category"
          handleButtonClick={() => setOpen(true)}
        >
          <CategoryTable
            openModal={(id) => {
              setCategoryId(id);
              setOpenEdit(true);
            }}
          />
        </ComponentCard>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-[600px] m-4">
        <AddCategoryForm />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[600px] m-4"
      >
        {categoryId && <EditCategoryForm categoryId={categoryId} />}
      </Modal>
    </>
  );
}
