import { useEffect, useState, type JSX } from "react";
import DataTable from "../common/DataTable";
import { useCatalogStore, type Brand } from "../../store/catalogStore";
import Button from "../ui/button/Button";

type BrandRow = Omit<Brand, "logo"> & {
  logo: JSX.Element;
  action?: JSX.Element;
};

interface BrandTableProps {
  openModal: (id: string) => void;
}

export default function BrandTable({ openModal }: BrandTableProps) {
  const { brands, fetchBrands, deleteBrand, error } = useCatalogStore();
  const [tableData, setTableData] = useState<BrandRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteBrand(id);
    } catch {
      // error in store
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const formatted: BrandRow[] = brands.map((item) => ({
      ...item,
      productCount: item.productCount ?? 0,
      logo: item.logo ? (
        <img
          src={item.logo}
          alt={item.name}
          className="h-10 w-10 rounded-lg object-cover"
        />
      ) : (
        <span className="text-gray-400">—</span>
      ),
      action: (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openModal(item.id)}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Edit
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={deletingId === item.id}
            onClick={() => handleDelete(item.id, item.name)}
          >
            {deletingId === item.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    }));
    setTableData(formatted);
  }, [brands, openModal, deletingId]);

  const columns: { key: keyof BrandRow; label: string; isAction?: boolean }[] =
    [
      { key: "logo", label: "Logo" },
      { key: "name", label: "Brand Name" },
      { key: "slug", label: "Slug" },
      { key: "productCount", label: "Products" },
      { key: "action", label: "Action", isAction: true },
    ];

  return (
    <>
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}
      <DataTable<BrandRow>
        columns={columns}
        rows={tableData}
        renderActions={(row) => row.action ?? <></>}
      />
    </>
  );
}
