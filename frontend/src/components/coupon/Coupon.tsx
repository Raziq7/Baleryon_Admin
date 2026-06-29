import { useEffect, useState } from "react";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import { Modal } from "../ui/modal";
import { useCouponStore } from "../../store/couponStore";
import AddCouponForm from "./AddCouponForm";
import CouponTable from "./CouponTable";

export default function Coupon() {
  const [open, setOpen] = useState(false);

  const { fetchCoupons } = useCouponStore();

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <>
      <PageMeta title="Coupon Management" description="Manage discount coupons" />
      <PageBreadcrumb pageTitle="Coupons" />

      <div className="space-y-6">
        <ComponentCard
          title="Coupons"
          buttonTitle="Add Coupon"
          handleButtonClick={() => setOpen(true)}
        >
          <CouponTable />
        </ComponentCard>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        className="max-w-[600px] m-4"
      >
        <AddCouponForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}