import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import OrderTable from "../../components/order/OrderTable";

export default function OrderManagement() {
  return (
    <>
      <PageMeta
        title="Order Management"
        description="Manage all orders"
      />

      <PageBreadcrumb pageTitle="Order Management" />

      <div className="space-y-6">
        <ComponentCard title="Orders">
          <OrderTable />
        </ComponentCard>
      </div>
    </>
  );
}