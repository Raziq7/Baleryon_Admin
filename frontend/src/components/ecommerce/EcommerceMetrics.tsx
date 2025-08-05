import Badge from "../ui/badge/Badge";

type Overview = {
  totalEmployees: number;
  totalDepartments: number;
  totalEarned: number;
  totalDueAmount: number;
  totalSales: number;
  lastSalesDate: string; // Add lastSalesDate
  lastSalesAmount: number; // Add lastSalesAmount
  todaySalesAmount:number;
  changes?: {
    employeeChange: number;
    departmentChange: number;
    attendanceChange: number;
  };
};

type Props = {
  data: Overview;
};

const getBadgeColor = (
  value: number
): "success" | "error" | "warning" | "info" | undefined =>
  value > 0 ? "success" : value < 0 ? "error" : "warning";

export default function EcommerceMetrics({ data }: Props) {
  // Function to format the last sales date
  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: 'short', 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Round the last sales amount to 2 decimal places
  const formatAmount = (amount: number): string => {
    return amount ? amount.toFixed(2).toLocaleString() : "0.00"; // Ensure a value is always shown
  };



  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Investment */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M4 20C4 16.6863 7.13401 14 11 14H13C16.866 14 20 16.6863 20 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Investment
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.totalEmployees.toLocaleString()}
            </h4>
          </div>
          {/* <Badge color={getBadgeColor(data.changes?.employeeChange ?? 0)}>
            {Math.abs(data.changes?.employeeChange ?? 0).toFixed(2)}%
          </Badge> */}
        </div>
      </div>

      {/* Total Sales */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L4 6V20L12 18L20 20V6L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Sales
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
             {data.totalSales.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>


      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L4 6V20L12 18L20 20V6L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Today's Sales</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.todaySalesAmount.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>


      {/* Last Sales */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12L9 18L21 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last Payout Date
            </span>
            <p className="mt-2 text-gray-600 text-md dark:text-white/50">
              {formatDate(data.lastSalesDate)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last Payout Amount
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatAmount(data.lastSalesAmount)}
            </h4>
          </div>
        </div>
      </div>

      {/* Total Earned */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12L9 18L21 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Earned
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.totalEarned.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
