import { useEffect, useState, type JSX } from "react";
import DataTable from "../../common/DataTable";
import Button from "../../ui/button/Button";
import { useCmsStore, type UrbanStory } from "../../../store/cmsStore";

type Row = UrbanStory & {
  image: JSX.Element;
  status: JSX.Element;
  action?: JSX.Element;
};

interface Props {
  openModal: (id: string) => void;
}

export default function UrbanStoryTable({ openModal }: Props) {
  const {
    urbanStories,
    fetchUrbanStories,
    deleteUrbanStory,
    toggleUrbanStoryActive,
    error,
  } = useCmsStore();
  const [tableData, setTableData] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchUrbanStories();
  }, [fetchUrbanStories]);

  useEffect(() => {
    setTableData(
      urbanStories.map((item) => ({
        ...item,
        image: item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.category}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-gray-400">—</span>
        ),
        status: (
          <span className={item.isActive ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        ),
        action: (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openModal(item.id)}
              className="rounded-full border px-3 py-1.5 text-sm dark:border-gray-700"
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
                  await toggleUrbanStoryActive(item.id);
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
                if (!window.confirm("Delete this urban story?")) return;
                setBusyId(item.id);
                try {
                  await deleteUrbanStory(item.id);
                } finally {
                  setBusyId(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }))
    );
  }, [urbanStories, openModal, busyId, deleteUrbanStory, toggleUrbanStoryActive]);

  const columns: { key: keyof Row; label: string; isAction?: boolean }[] = [
    { key: "image", label: "Image" },
    { key: "category", label: "Category" },
    { key: "ctaLink", label: "CTA Link" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action", isAction: true },
  ];

  return (
    <>
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}
      <DataTable<Row> columns={columns} rows={tableData} renderActions={(r) => r.action ?? <></>} />
    </>
  );
}
