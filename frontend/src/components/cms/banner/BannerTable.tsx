import { useEffect, useState, type JSX } from "react";
import DataTable from "../../common/DataTable";
import Button from "../../ui/button/Button";
import { useCmsStore, type Banner } from "../../../store/cmsStore";

type BannerRow = Banner & {
  image: JSX.Element;
  status: JSX.Element;
  preview: string;
  action?: JSX.Element;
};

interface Props {
  openModal: (id: string) => void;
}

export default function BannerTable({ openModal }: Props) {
  const {
    banners,
    fetchBanners,
    deleteBanner,
    toggleBannerActive,
    error,
  } = useCmsStore();
  const [tableData, setTableData] = useState<BannerRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    const formatted: BannerRow[] = banners.map((item) => ({
      ...item,
      preview: [item.topContent, item.mainContent].filter(Boolean).join(" · ").slice(0, 80),
      image: item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt="Banner"
          className="h-10 w-16 rounded object-cover"
        />
      ) : (
        <span className="text-gray-400">—</span>
      ),
      status: (
        <span
          className={
            item.isActive
              ? "text-green-600 text-sm"
              : "text-gray-400 text-sm"
          }
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
      action: (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openModal(item.id)}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700"
          >
            Edit
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busyId === item.id}
            onClick={async () => {
              setBusyId(item.id);
              try {
                await toggleBannerActive(item.id);
              } finally {
                setBusyId(null);
              }
            }}
          >
            {item.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busyId === item.id}
            onClick={async () => {
              if (!window.confirm("Delete this banner?")) return;
              setBusyId(item.id);
              try {
                await deleteBanner(item.id);
              } finally {
                setBusyId(null);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    }));
    setTableData(formatted);
  }, [banners, openModal, busyId, deleteBanner, toggleBannerActive]);

  const columns: { key: keyof BannerRow; label: string; isAction?: boolean }[] =
    [
      { key: "image", label: "Image" },
      { key: "preview", label: "Content" },
      { key: "shopNowLink", label: "Shop Now Link" },
      { key: "status", label: "Status" },
      { key: "action", label: "Action", isAction: true },
    ];

  return (
    <>
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}
      <DataTable<BannerRow>
        columns={columns}
        rows={tableData}
        renderActions={(row) => row.action ?? <></>}
      />
    </>
  );
}
