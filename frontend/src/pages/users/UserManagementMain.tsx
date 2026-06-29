import { Tabs } from "../../components/ui/tab/Tabs";
import UserListTab from "../../components/users/UserListTab";

export default function UserManagementMain() {
  return (
    <Tabs
      tabs={[
        {
          id: "all-users",
          label: "All Users",
          content: (
            <UserListTab
              status="all"
              title="All Users"
              description="View all registered users"
              emptyMessage="No users found."
            />
          ),
        },
        {
          id: "blocked-users",
          label: "Blocked",
          content: (
            <UserListTab
              status="blocked"
              title="Blocked Users"
              description="Users who are blocked from the platform"
              emptyMessage="No blocked users."
            />
          ),
        },
        {
          id: "purchased-users",
          label: "Purchased",
          content: (
            <UserListTab
              status="purchased"
              title="Purchased Customers"
              description="Users who have placed at least one order"
              emptyMessage="No customers with purchases yet."
            />
          ),
        },
      ]}
    />
  );
}
