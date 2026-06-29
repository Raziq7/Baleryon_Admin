import { Tabs } from "../../ui/tab/Tabs";

export default function UserDetailsTabs({
  overview,
  orders,
  products,
  tracking,
  addresses,
  payments,
  activity,
}: any) {
  return (
    <Tabs
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: overview,
        },
        {
          id: "orders",
          label: "Orders",
          content: orders,
        },
        {
          id: "products",
          label: "Products",
          content: products,
        },
        {
          id: "tracking",
          label: "Tracking",
          content: tracking,
        },
        {
          id: "addresses",
          label: "Addresses",
          content: addresses,
        },
        {
          id: "payments",
          label: "Payments",
          content: payments,
        },
        {
          id: "activity",
          label: "Activity",
          content: activity,
        },
      ]}
    />
  );
}