import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import PaginationControls from "../ui/pagination/PaginationControls";
// import Button from "../ui/button/Button";
import {
  FiEye,
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import {
  getUserDisplayName,
  useAdminUserManagementStore,
  type UserStatusFilter,
} from "../../store/adminUserManagementStore";
import { useNavigate } from "react-router-dom";

interface UserTableProps {
  status: UserStatusFilter;
  emptyMessage: string;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function UserTable({ status, emptyMessage }: UserTableProps) {
  const {
    users,
    pageNo,
    totalPages,
    loading,
    error,
    statusFilter,
    fetchUsers,
    toggleBlockUser,
    toggleVerifyUser,
  } = useAdminUserManagementStore();

  const navigate = useNavigate();

  const isCurrentTab = statusFilter === status;
  const displayUsers = isCurrentTab ? users : [];

  const handleBlockToggle = async (id: string, isBlocked: boolean) => {
    const action = isBlocked ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await toggleBlockUser(id, isBlocked);
    } catch {
      // error handled in store
    }
  };

  const handleVerifyToggle = async (id: string, isVerified: boolean) => {
    try {
      await toggleVerifyUser(id, isVerified);
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {loading && isCurrentTab && (
        <p className="px-5 py-4 text-sm text-gray-500">Loading users...</p>
      )}
      {error && (
        <p className="px-5 py-4 text-sm text-error-500">{error}</p>
      )}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Name",
                "Email",
                "Phone",
                "Role",
                "Verified",
                "Orders",
                "Status",
                "Joined",
                "Actions",
              ].map((label) => (
                <TableCell
                  key={label}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {!loading && displayUsers.length === 0 && isCurrentTab && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="px-4 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {displayUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-white/90">
                  {getUserDisplayName(user)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.phone || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                  {user.role}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm">
                  <span
                    className={
                      user.isVerified
                        ? "text-success-600 dark:text-success-400"
                        : "text-gray-400"
                    }
                  >
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.orderCount ?? 0}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm">
                  <span
                    className={
                      user.isBlocked
                        ? "text-error-500"
                        : "text-success-600 dark:text-success-400"
                    }
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  {/* <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleBlockToggle(user.id, !user.isBlocked)
                      }
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleVerifyToggle(user.id, !user.isVerified)
                      }
                    >
                      {user.isVerified ? "Unverify" : "Verify"}
                    </Button>
                  </div> */}

                  <div className="flex items-center gap-3">
                    {/* View Details */}
                    {/* <button
                      type="button"
                      title="View Details"
                      className="text-blue-500 transition hover:text-blue-700"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <FiEye size={18} />
                    </button> */}

                    <button
                      type="button"
                      title="View Details"
                      onClick={() =>
                        navigate(`/admin/users/${user.id}`)
                      }
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiEye size={18} />
                    </button>

                    {/* Block / Unblock */}
                    <button
                      type="button"
                      title={user.isBlocked ? "Unblock User" : "Block User"}
                      className={`transition ${user.isBlocked
                        ? "text-green-500 hover:text-green-700"
                        : "text-red-500 hover:text-red-700"
                        }`}
                      onClick={() =>
                        handleBlockToggle(user.id, !user.isBlocked)
                      }
                    >
                      {user.isBlocked ? (
                        <FiUnlock size={18} />
                      ) : (
                        <FiLock size={18} />
                      )}
                    </button>

                    {/* Verify / Unverify */}
                    <button
                      type="button"
                      title={user.isVerified ? "Unverify User" : "Verify User"}
                      className={`transition ${user.isVerified
                        ? "text-yellow-500 hover:text-yellow-700"
                        : "text-green-500 hover:text-green-700"
                        }`}
                      onClick={() =>
                        handleVerifyToggle(user.id, !user.isVerified)
                      }
                    >
                      {user.isVerified ? (
                        <FiXCircle size={18} />
                      ) : (
                        <FiCheckCircle size={18} />
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={(page) => fetchUsers(status, page)}
      />
    </div>
  );
}
