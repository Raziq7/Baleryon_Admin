import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useInvestmentStore } from "../../../store/investmentStore";

type InvestmentOpportunity = {
  id: string;
  name: string;
  brandName: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  roiPercent: number;
  lockInMonths: number;
  exitOptions: string;
  payoutMode: string;
  isActive: boolean;
  investmentType: {
    id: string;
    name: string;
    description: string;
  };
  businessCategory: {
    id: string;
    name: string;
    description: string;
  };
};

type Payout = {
  id: string;
  amountDue: number;
  amountPaid: number | null;
  dueDate: string;
  paidDate: string | null;
  paymentMode: string;
  receiptRef: string;
  notes: string | null;
  status: string;
};

type Investment = {
  id: string;
  amount: number;
  date: string;
  roiPercent: number;
  payoutMode: string;
  contractStart: string;
  contractEnd: string;
  paymentMethod: string;
  agreementSigned: boolean;
  status: string;
  opportunity: InvestmentOpportunity | null;
  payouts: Payout[];
};

export default function InvestmentDetailsTable() {
  const [tableData, setTableData] = useState<Investment[]>([]);

  const findInvestmentDetails = useInvestmentStore(
    (state) => state.investments
  );
  const fetchInvestmentDetails = useInvestmentStore(
    (state) => state.fetchInvestmentDetails
  );

  useEffect(() => {
    fetchInvestmentDetails();
  }, [fetchInvestmentDetails]);

  useEffect(() => {
    if (findInvestmentDetails) {
      setTableData(findInvestmentDetails); // Assign data to tableData
    }
  }, [findInvestmentDetails]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Investment Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Invested Brand Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Invested Amount
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Investment Type
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Invested Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Contract Start Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Contract End Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                ROI
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.opportunity?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.opportunity?.brandName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.amount}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.opportunity?.investmentType?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.opportunity?.businessCategory?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.contractStart
                    ? investment.contractStart.split("T")[0]
                    : ""}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.contractEnd
                    ? investment.contractEnd.split("T")[0]
                    : ""}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.roiPercent}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {investment.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
