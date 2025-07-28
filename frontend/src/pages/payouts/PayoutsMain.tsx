import { Tabs } from "../../components/ui/tab/Tabs";
import ListInvestmentOpportunities from "./ListInvestmentOpportunities";
import ListPayoutHistory from "./ListPayoutHistory";
import ListUpcomingPayouts from "./ListUpcomingPayouts";

export default function Payout() {
  return (
    <>
      <Tabs
        tabs={[
          {
            id: "tab1",
            label: "Payout History",
            content: <ListPayoutHistory />,
          },
          {
            id: "tab2",
            label: "Upcoming Payouts",
            content: <ListUpcomingPayouts />,
          },
          {
            id: "tab3",
            label: "Investment Opportunities",
            content: <ListInvestmentOpportunities />,
          },
        ]}
      />
    </>
  );
}
