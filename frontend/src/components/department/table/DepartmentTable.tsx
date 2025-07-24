import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useDepartmentStore } from "../../../store/departmentStore";
import { useEffect, useState, type JSX } from "react";

interface Department {
  id: number;
  name: string;
  head?: {
    headId: number;
    name: string;
    image?: string;
    role?: string;
  };

  status?: "Active" | "Pending" | "Cancel";
  action: JSX.Element;
}

// ✅ Define props interface
interface DepartmentTableProps {
  openModal: (id: number) => void;
}

export default function DepartmentTable({ openModal }: DepartmentTableProps) {
  const [tableData, setTableData] = useState([{}]);

  const findDepartments = useDepartmentStore((state) => state.findDepartments);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );

  const departments = useDepartmentStore((state) => state.departments);

  console.log(tableData, "tableDatatableDatatableData")

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, departments]);

  useEffect(() => {
    if (findDepartments) {
      // const formatted: Department[] = findDepartments
      //   ? findDepartments?.map((department) => ({
      //     id: department.id,
      //     name: department.name,
      //     head:
      //       department.headId != 0
      //         ? {
      //           headId: department.headId,
      //           name: department.name, // use actual head name if available
      //           image: "/images/user/default.jpg", // placeholder image
      //           role: "Department Head", // placeholder role
      //         }
      //         : undefined,
      //     // status: "Active",
      //     action: (
      //       <button
      //         onClick={() => openModal(department?.id)}
      //         className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
      //       >
      //         <svg
      //           className="fill-current"
      //           width="18"
      //           height="18"
      //           viewBox="0 0 18 18"
      //           fill="none"
      //           xmlns="http://www.w3.org/2000/svg"
      //         >
      //           <path
      //             fillRule="evenodd"
      //             clipRule="evenodd"
      //             d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
      //             fill=""
      //           />
      //         </svg>
      //         Edit
      //       </button>
      //     ),
      //   }))
      //   : [];
      setTableData(findDepartments);
    }
  }, [findDepartments]);

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
            {tableData.map((dept: any) => (
              <TableRow key={dept?.id}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  
                  {dept?.opportunity?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept?.opportunity?.brandName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept.amount}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept?.opportunity?.investmentType?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept?.opportunity?.businessCategory?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept?.contractStart ? dept.contractStart.split('T')[0] : ''}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {dept?.contractEnd ? dept.contractEnd.split('T')[0] : ''}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept.roiPercent}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {dept.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
