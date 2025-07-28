// pages/investment/ListPayoutHistory.tsx
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useEffect } from "react";
import { useInvestmentStore } from "../../store/investmentStore";
import PayoutHistoryTable from "../../components/payouts/PayoutHistoryTable"; // The table that shows the payouts

export default function ListPayoutHistory() {
  // Get payouts and fetchPayouts function from the store
  const { payouts, fetchPayouts } = useInvestmentStore();

  // Fetch payouts when the component is mounted
  useEffect(() => {
    fetchPayouts();  // Fetch payouts for the current user
  }, [fetchPayouts]);

  useEffect(() => {
    if (payouts) {
      // Perform any necessary updates or actions after payouts are fetched
    }
  }, [payouts]);

  return (
    <>
      <PageMeta title="Payout History" description="History of all payouts" />
      <PageBreadcrumb pageTitle="Payout History" />
      <div className="space-y-6">
        <ComponentCard
          title="Payout History Table"
          // buttonTitle="Add Payout"  // Adjust button if required
          // handleButtonClick={() => {
          //   // Logic to open modal for adding payout (optional)
          // }}
        >
          {/* Render the PayoutHistoryTable */}
          <PayoutHistoryTable payouts={payouts} />
        </ComponentCard>
      </div>
    </>
  );
}
