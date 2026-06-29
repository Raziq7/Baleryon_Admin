import { useEffect, useState, type JSX } from "react";
import DataTable from "../../common/DataTable";
import Button from "../../ui/button/Button";
import {
  useCmsStore,
  type JoinCommunityEntry,
  type JoinCommunityStatus,
} from "../../../store/cmsStore";

const STATUSES: JoinCommunityStatus[] = [
  "ADDED",
  "PENDING",
  "INVALID",
  "VALID",
];

type Row = JoinCommunityEntry & {
  statusSelect: JSX.Element;
  action?: JSX.Element;
};

export default function JoinCommunityTable() {
  const {
    joinCommunity,
    fetchJoinCommunity,
    updateJoinCommunityStatus,
    deleteJoinCommunity,
    error,
  } = useCmsStore();
  const [tableData, setTableData] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchJoinCommunity();
  }, [fetchJoinCommunity]);

  useEffect(() => {
    setTableData(
      joinCommunity.map((item) => ({
        ...item,
        statusSelect: (
          <select
            value={item.status}
            disabled={busyId === item.id}
            onChange={async (e) => {
              setBusyId(item.id);
              try {
                await updateJoinCommunityStatus(
                  item.id,
                  e.target.value as JoinCommunityStatus
                );
              } finally {
                setBusyId(null);
              }
            }}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ),
        action: (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busyId === item.id}
            onClick={async () => {
              if (!window.confirm(`Remove ${item.email}?`)) return;
              setBusyId(item.id);
              try {
                await deleteJoinCommunity(item.id);
              } finally {
                setBusyId(null);
              }
            }}
          >
            Delete
          </Button>
        ),
      }))
    );
  }, [joinCommunity, busyId, updateJoinCommunityStatus, deleteJoinCommunity]);

  const columns: { key: keyof Row; label: string; isAction?: boolean }[] = [
    { key: "email", label: "Email" },
    { key: "statusSelect", label: "Status" },
    { key: "createdAt", label: "Added At" },
    { key: "action", label: "Action", isAction: true },
  ];

  return (
    <>
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}
      <DataTable<Row>
        columns={columns}
        rows={tableData.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toLocaleString(),
        }))}
        renderActions={(row) => row.action ?? <></>}
      />
    </>
  );
}
