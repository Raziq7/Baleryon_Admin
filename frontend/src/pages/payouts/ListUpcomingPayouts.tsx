// pages/investment/ListUpcomingPayouts.tsx
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useEffect } from "react";
import { useInvestmentStore } from "../../store/investmentStore";
import UpcomingPayoutsTable from "../../components/payouts/UpcomingPayoutsTable";

export default function ListUpcomingPayouts() {
  // Get upcoming payouts and fetchUpcomingPayouts function from the store
  const { upcomingPayouts, fetchUpcomingPayouts, loading, error } = useInvestmentStore();

  // Fetch upcoming payouts when the component is mounted
  useEffect(() => {
    fetchUpcomingPayouts();  // Fetch upcoming payouts for the current user
  }, [fetchUpcomingPayouts]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <PageMeta title="Upcoming Payouts" description="Upcoming payouts overview" />
      <PageBreadcrumb pageTitle="Upcoming Payouts" />
      <div className="space-y-6">
        <ComponentCard
          title="Upcoming Payouts Table"
          buttonTitle="Add Payout"
          handleButtonClick={() => {
            // Logic to open modal for adding payout (optional)
          }}
        >
          {/* Render the UpcomingPayoutsTable with the data */}
          <UpcomingPayoutsTable upcomingPayouts={upcomingPayouts} />
        </ComponentCard>
      </div>
    </>
  );
}
