import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta"; // Updated for InvestmentTable
// import { useEffect, useState } from "react";
// import { Modal } from "../../components/ui/modal"; // Updated for Investment Form
// import { useInvestmentStore } from "../../store/investmentStore";// Updated for Edit Investment Form
import InvestmentDetailsTable from "../../components/department/table/InvestmentDetailsTable";

export default function ListInvestmentDetails() {
  // const [open, setOpen] = useState<boolean>(false);
  // const [openEdit, setOpenEdit] = useState<boolean>(false);
  // const [investmentId, setInvestmentId] = useState<string>(); // Changed to string for investment ID

  return (
    <>
      <PageMeta
        title="Investment Details"
        description="This is Investment details page for DMS"
      />
      <PageBreadcrumb pageTitle="Investment Details" />
      <div className="space-y-6">
        <ComponentCard
          title="Investment Details Table"
          buttonTitle="Add Investment"
          // handleButtonClick={() => setOpen(true)} // Open Add Investment Form Modal
        >
          <InvestmentDetailsTable
          // openModal={(id) => {
          //   setOpenEdit(true);
          //   setInvestmentId(id); // Set the ID for editing
          // }}
          />
        </ComponentCard>
      </div>

      {/* <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        className="max-w-[700px] m-4"
      >
        <AddInvestmentForm /> {/* Add Investment Form Modal */}
      {/* </Modal> */}

      {/* <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        className="max-w-[700px] m-4"
      >
        {investmentId !== undefined && (
          <EditInvestmentForm investmentId={investmentId} />
        )}
      </Modal> */}
    </>
  );
}
