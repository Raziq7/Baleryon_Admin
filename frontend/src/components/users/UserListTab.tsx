import { useEffect, useState } from "react";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import Input from "../input/InputField";
import {
  useAdminUserManagementStore,
  type UserStatusFilter,
} from "../../store/adminUserManagementStore";
import UserTable from "./UserTable";

interface UserListTabProps {
  status: UserStatusFilter;
  title: string;
  description: string;
  emptyMessage: string;
}

export default function UserListTab({
  status,
  title,
  description,
  emptyMessage,
}: UserListTabProps) {

  const { fetchUsers, setSearch, search, statusFilter } =
    useAdminUserManagementStore();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchUsers(status, 1);
  }, [fetchUsers, status]);

  useEffect(() => {
    if (statusFilter === status) {
      setSearchInput(search);
    }
  }, [search, statusFilter, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    fetchUsers(status, 1, searchInput.trim());
  };

  return (
    <>
      <PageMeta title={title} description={description} />
      <PageBreadcrumb pageTitle={title} />
      <div className="space-y-6">
        <ComponentCard title={`${title} Table`}>
          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Search
            </button>
          </form>
          <UserTable status={status} emptyMessage={emptyMessage} />
        </ComponentCard>
      </div>
    </>
  );
}
