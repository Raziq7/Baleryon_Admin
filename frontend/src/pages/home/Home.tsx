import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// // import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
// import { useAuth } from "../../utils/useAuth";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// import { useDashboardStore } from "../../store/dashboardStore";
// import UpcomingEvents from "../../components/ecommerce/UpcomingEvents";
// import { useEffect } from "react";
// import { useDashboardStore } from "../../store/dashboardStore";

export default function Home() {
  // const { data, loading, error, fetchInvestments, fetchPayouts } =
  //   useDashboardStore();

  // useEffect(() => {
  //   fetchInvestments();
  //   fetchPayouts();
  // }, [fetchInvestments, fetchPayouts]);

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  return (
    <>
      <PageMeta
        title="Baleryon-Admin"
        description="Baleryon Dashboard For Admin"
      />
      <div className="grid grid-cols-4 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <EcommerceMetrics
            data={{
              totalEmployees: 0,
              totalDepartments: 0,
              totalEarned: 0,
              totalDueAmount: 0,
              totalSales: 0,
              lastSalesAmount: 0,
              lastSalesDate: "N/A",
              todaySalesAmount: 0,
              changes: {
                employeeChange: 10,
                departmentChange: -5,
                attendanceChange: 15,
              },
            }}
          />

          {/* <MonthlySalesChart /> */}
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div> */}

        {/* <div className="col-span-12">
          <StatisticsChart />
        </div> */}

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard data={[]} />
        </div> */}

        {/* <div className="col-span-12 xl:col-span-7">
          <UpcomingEvents data={[]} />
        </div> */}
      </div>
    </>
  );
}
