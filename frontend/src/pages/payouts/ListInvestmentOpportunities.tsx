import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useEffect } from "react";
import { useInvestmentStore } from "../../store/investmentStore";
import InvestmentOpportunitiesTable from "../../components/payouts/InvestmentOpportunitiesTable";

export default function ListInvestmentOpportunities() {
  // Fetching non-invested opportunities and the corresponding fetch function from the store
  const { nonInvestedOpportunities, fetchNonInvestedOpportunities, loading } = useInvestmentStore();

  useEffect(() => {
    // Fetching the non-invested opportunities when the component mounts
    fetchNonInvestedOpportunities();
  }, [fetchNonInvestedOpportunities]);

  useEffect(() => {
    if (nonInvestedOpportunities) {
      // Handle any side effects here if necessary
    }
  }, [nonInvestedOpportunities]);

  if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

  return (
    <>
      <PageMeta title="Investment Opportunities" description="Explore available investment opportunities" />
      <PageBreadcrumb pageTitle="Investment Opportunities" />
      <div className="space-y-6">
        <ComponentCard
          title="Investment Opportunities Table"
        >
          <InvestmentOpportunitiesTable investmentOpportunities={nonInvestedOpportunities} />
        </ComponentCard>
      </div>
    </>
  );
}
