import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

export const getOrdersController = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: {
        placedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  res.status(200).json({
    orders,
    pageNo: page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
  });
});

// export const getOrderDetailsController = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const order = await prisma.order.findUnique({
//     where: {
//       id,
//     },
//     include: {
//       user: true,
//       address: true,
//       payments: true,
//       shipments: true,
//       items: {
//         include: {
//           product: {
//             include: {
//               images: true,
//             },
//           },
//           variant: true,
//         },
//       },
//     },
//   });

//   if (!order) {
//     return res.status(404).json({
//       message: "Order not found",
//     });
//   }

//   res.status(200).json(order);
// });

export const getOrderDetailsController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      payments: true,
      shipments: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const formattedItems = order.items.map((item) => {
    const product = item.product;

    return {
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),

      product: product
        ? {
            id: product.id,
            name: product.productName ?? product.name,
            description: product.description,
            price: Number(product.price),
            discount: product.discount ?? 0,

            category: product.category
              ? {
                  id: product.category.id,
                  name: product.category.name ?? product.category.categoryName,
                }
              : null,

            images:
              product.images?.map((img) => ({
                url: img.imageUrl,
              })) || [],
          }
        : null,

      variant: item.variant
        ? {
            id: item.variant.id,
            size: item.variant.size,
            color: item.variant.color,
          }
        : null,
    };
  });

  return res.status(200).json({
    ...order,

    subtotal: Number(order.subtotal),
    totalAmount: Number(order.totalAmount),
    shippingAmount: order.shippingAmount ? Number(order.shippingAmount) : 0,

    items: formattedItems,
  });
});


export const updateOrderStatusController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // Stamp deliveredAt the first time an order is marked DELIVERED. This
    // is the source of truth the exchange/replacement eligibility window
    // (server/controller/exchangeController.js) counts down from, so it
    // must only ever be set once -- a later status change (e.g. re-opening
    // to CANCELLED and back) must not reset the customer's exchange clock.
    let deliveredAtUpdate = {};
    if (orderStatus === "DELIVERED") {
      const existing = await prisma.order.findUnique({
        where: { id },
        select: { deliveredAt: true },
      });
      if (existing && !existing.deliveredAt) {
        deliveredAtUpdate = { deliveredAt: new Date() };
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus,
        ...deliveredAtUpdate,
      },
    });

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  }
);
