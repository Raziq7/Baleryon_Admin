import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";

import UserOverviewTab from "../../components/users/userDetails/UserOverviewTab";
import UserOrdersTab from "../../components/users/userDetails/UserOrdersTab";
import UserProductsTab from "../../components/users/userDetails/UserProductsTab";
import UserTrackingTab from "../../components/users/userDetails/UserTrackingTab";
import UserAddressesTab from "../../components/users/userDetails/UserAddressesTab";
import UserPaymentsTab from "../../components/users/userDetails/UserPaymentsTab";
import UserActivityTab from "../../components/users/userDetails/UserActivityTab";

import { useAdminUserDetailsStore } from "../../store/adminUserDetailsStore";
import UserProfileCard from "../../components/users/userDetails/UserProfileCard";
import UserStatsCards from "../../components/users/userDetails/UserStatsCards";
import UserDetailsTabs from "../../components/users/userDetails/UserDetailsTabs";
import type { UserDetails } from "../../components/users/userDetails/types";

export default function AdminUserDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    user,
    stats,
    orders,
    products,
    tracking,
    addresses,
    payments,
    activities,
    loading,
    error,
    fetchUserDetails,
  } = useAdminUserDetailsStore();

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`User Details - ${user.fullName}`}
        description="Admin user details page"
      />

      <PageBreadcrumb pageTitle="User Details" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/users")}
          >
            ← Back to Users
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline">
              {user.isBlocked ? "Unblock User" : "Block User"}
            </Button>

            <Button type="button" variant="outline">
              {user.isVerified ? "Unverify User" : "Verify User"}
            </Button>
          </div>
        </div>

        {/* Profile */}
        {/* {user && <UserProfileCard user={user as any} />} */}
        <UserProfileCard user={user as UserDetails} />

        {/* Statistics */}
        {stats && <UserStatsCards stats={stats} />}

        {/* Tabs */}
        <UserDetailsTabs
          overview={<UserOverviewTab user={user} />}
          orders={<UserOrdersTab orders={orders} />}
          products={<UserProductsTab products={products} />}
          tracking={<UserTrackingTab tracking={tracking} />}
          addresses={<UserAddressesTab addresses={addresses} />}
          payments={<UserPaymentsTab payments={payments} />}
          activity={<UserActivityTab activities={activities} />}
        />
      </div>
    </>
  );
}
