import prisma from "../lib/prisma.js";

export async function getDashboardReport(start, end) {
  const orders = await prisma.order.findMany({
    where: {
      placedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      payments: true,
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  const lowStockVariants =
    await prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        stock: "asc",
      },
      take: 20,
    });

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  const totalItemsSold = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum + item.quantity,
        0
      ),
    0
  );

  const avgOrderValue =
    totalOrders > 0
      ? totalRevenue / totalOrders
      : 0;

  // ---------------------------------
  // Payment Summary
  // ---------------------------------

  const paymentMap = {};

  orders.forEach((order) => {
    const method =
      order.paymentMethod || "UNKNOWN";

    if (!paymentMap[method]) {
      paymentMap[method] = {
        method,
        count: 0,
        amount: 0,
      };
    }

    paymentMap[method].count += 1;

    paymentMap[method].amount += Number(
      order.totalAmount || 0
    );
  });

  const paymentSummary =
    Object.values(paymentMap);

  // ---------------------------------
  // Top Products
  // ---------------------------------

  const productMap = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key =
        item.product?.title ||
        item.productName ||
        "Unknown Product";

      if (!productMap[key]) {
        productMap[key] = {
          productName: key,
          soldQty: 0,
          revenue: 0,
        };
      }

      productMap[key].soldQty += item.quantity;

      productMap[key].revenue +=
        Number(item.unitPrice || 0) *
        item.quantity;
    });
  });

  const topProducts = Object.values(
    productMap
  )
    .sort(
      (a, b) => b.soldQty - a.soldQty
    )
    .slice(0, 10);

  // ---------------------------------
  // Low Stock Products
  // ---------------------------------

  const lowStockProducts =
    lowStockVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      productName:
        variant.product.title,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    }));

  // ---------------------------------
  // Recent Orders
  // ---------------------------------

  const recentOrders = orders
    .slice(0, 10)
    .map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName:
        order.user?.fullName ||
        "Guest",
      totalAmount: Number(
        order.totalAmount || 0
      ),
      status: order.orderStatus,
      paymentStatus:
        order.paymentStatus,
      paymentMethod:
        order.paymentMethod,
      placedAt: order.placedAt,
    }));

  return {
    start,
    end,

    summary: {
      totalOrders,
      totalRevenue,
      totalItemsSold,
      avgOrderValue,
    },

    paymentSummary,
    topProducts,
    lowStockProducts,
    recentOrders,
  };
}