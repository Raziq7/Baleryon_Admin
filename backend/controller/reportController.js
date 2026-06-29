import asyncHandler from "express-async-handler";
import ExcelJS from "exceljs";
import { getDashboardReport } from "../services/report.service.js";

function getDateRange(range) {
  const start = new Date();
  const end = new Date();

  switch (range) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      break;

    case "weekly":
      start.setDate(
        start.getDate() - start.getDay()
      );
      start.setHours(0, 0, 0, 0);
      break;

    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;

    default:
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export const getReportDashboardController =
  asyncHandler(async (req, res) => {
    const range =
      req.query.range || "daily";

    const { start, end } =
      getDateRange(range);

    const report =
      await getDashboardReport(
        start,
        end
      );

    res.status(200).json(report);
  });

export const downloadReportController =
  asyncHandler(async (req, res) => {
    const range =
      req.query.range || "daily";

    const { start, end } =
      getDateRange(range);

    const report =
      await getDashboardReport(
        start,
        end
      );

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      {
        header: "Order Number",
        key: "orderNumber",
        width: 25,
      },
      {
        header: "Customer",
        key: "customerName",
        width: 30,
      },
      {
        header: "Amount",
        key: "totalAmount",
        width: 15,
      },
      {
        header: "Status",
        key: "status",
        width: 20,
      },
    ];

    report.recentOrders.forEach(
      (order) => {
        worksheet.addRow(order);
      }
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${range}.xlsx`
    );

    await workbook.xlsx.write(res);

    res.end();
  });