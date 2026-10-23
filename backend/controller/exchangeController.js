// controller/exchangeController.js
//
// Admin-side management of customer exchange (replacement) requests: list,
// approve (reserves the replacement variant's stock and triggers a
// Delhivery reverse pickup + a free replacement shipment), reject (with a
// mandatory reason the customer sees in-app), complete (once the original
// item is confirmed back, returns its stock), and retry-shipment (in case
// the Delhivery calls at approval time failed).
//
// Delhivery is intentionally best-effort here: a courier failure is
// surfaced to the admin but never blocks or corrupts the exchange record
// itself, mirroring the defensive pattern already used for order shipments
// in controller/shipment.controller.js.

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";
import {
  createReversePickupShipment,
  createReplacementShipment,
} from "../services/delhivery.service.js";

async function loadExchangeRequest(id) {
  return prisma.orderReturn.findUnique({
    where: { id },
    include: {
      orderItem: {
        include: {
          order: { include: { user: true, address: true } },
          product: true,
          variant: true,
        },
      },
    },
  });
}

async function attachDesiredVariants(requests) {
  const variantIds = requests.map((r) => r.desiredVariantId).filter(Boolean);
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
    : [];
  const variantById = new Map(variants.map((v) => [v.id, v]));

  return requests.map((r) => ({
    ...r,
    desiredVariant: r.desiredVariantId
      ? {
          id: r.desiredVariantId,
          color: variantById.get(r.desiredVariantId)?.color ?? null,
          size: variantById.get(r.desiredVariantId)?.size ?? null,
          stock: variantById.get(r.desiredVariantId)?.stock ?? null,
        }
      : null,
  }));
}

// @route GET /api/admin/exchange?status=&page=&limit=
export const getExchangeRequestsController = asyncHandler(async (req, res) => {
  const { status, orderId } = req.query;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: String(status).toUpperCase() } : {}),
    ...(orderId ? { orderItem: { orderId: String(orderId) } } : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.orderReturn.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        orderItem: {
          include: {
            order: { include: { user: { select: { id: true, fullName: true, email: true } } } },
            product: { select: { id: true, title: true } },
            variant: true,
          },
        },
      },
    }),
    prisma.orderReturn.count({ where }),
  ]);

  const withVariants = await attachDesiredVariants(requests);

  res.json({
    exchangeRequests: withVariants,
    pageNo: page,
    totalPages: Math.ceil(total / limit) || 1,
    total,
  });
});

// @route GET /api/admin/exchange/:id
export const getExchangeRequestDetailsController = asyncHandler(async (req, res) => {
  const request = await loadExchangeRequest(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Exchange request not found" });
  }

  const [withVariant] = await attachDesiredVariants([request]);

  res.json(withVariant);
});

// @route POST /api/admin/exchange/:id/approve
export const approveExchangeController = asyncHandler(async (req, res) => {
  const request = await loadExchangeRequest(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Exchange request not found" });
  }

  if (request.status !== "REQUESTED") {
    return res.status(400).json({
      message: `Only a REQUESTED exchange can be approved (this one is ${request.status})`,
    });
  }

  if (!request.desiredVariantId) {
    return res.status(400).json({ message: "This request has no desired variant on file" });
  }

  const desiredVariant = await prisma.productVariant.findUnique({
    where: { id: request.desiredVariantId },
  });

  if (!desiredVariant || desiredVariant.stock <= 0) {
    return res.status(409).json({
      message: "The requested size/color is now out of stock -- cannot approve",
    });
  }

  const [, updated] = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: desiredVariant.id },
      data: { stock: { decrement: 1 } },
    }),
    prisma.orderReturn.update({
      where: { id: request.id },
      data: { status: "APPROVED", respondedAt: new Date() },
    }),
    prisma.inventoryLog.create({
      data: {
        variantId: desiredVariant.id,
        quantity: 1,
        type: "SALE",
        note: `Reserved for exchange on order ${request.orderItem.order.orderNumber}`,
      },
    }),
  ]);

  // Delhivery: best-effort, independent of each other and of the DB write
  // above (which has already succeeded regardless of what happens here).
  const address = request.orderItem.order.address;
  const orderRef = { orderNumber: request.orderItem.order.orderNumber };
  const shipmentErrors = {};

  if (!address) {
    shipmentErrors.pickup = "Order has no shipping address on file";
    shipmentErrors.replacement = "Order has no shipping address on file";
  } else {
    try {
      const pickupResponse = await createReversePickupShipment(orderRef, address);
      const awb = pickupResponse?.packages?.[0]?.waybill;
      if (awb) {
        const shipment = await prisma.shipment.create({
          data: {
            orderId: request.orderItem.orderId,
            courierName: "Delhivery",
            awbNumber: awb,
            shipmentId: pickupResponse?.packages?.[0]?.refnum,
            rawResponse: pickupResponse,
            status: "CREATED",
          },
        });
        await prisma.orderReturn.update({
          where: { id: request.id },
          data: { pickupShipmentId: shipment.id },
        });
      } else {
        shipmentErrors.pickup = pickupResponse?.rmk || "Delhivery did not return a waybill";
      }
    } catch (error) {
      shipmentErrors.pickup = error.response?.data?.rmk || error.message || "Unknown error";
    }

    try {
      const replacementResponse = await createReplacementShipment(orderRef, address);
      const awb = replacementResponse?.packages?.[0]?.waybill;
      if (awb) {
        const shipment = await prisma.shipment.create({
          data: {
            orderId: request.orderItem.orderId,
            courierName: "Delhivery",
            awbNumber: awb,
            shipmentId: replacementResponse?.packages?.[0]?.refnum,
            rawResponse: replacementResponse,
            status: "CREATED",
          },
        });
        await prisma.orderReturn.update({
          where: { id: request.id },
          data: { replacementShipmentId: shipment.id },
        });
      } else {
        shipmentErrors.replacement = replacementResponse?.rmk || "Delhivery did not return a waybill";
      }
    } catch (error) {
      shipmentErrors.replacement = error.response?.data?.rmk || error.message || "Unknown error";
    }
  }

  const [finalRequest] = await attachDesiredVariants([await loadExchangeRequest(request.id)]);

  res.json({
    message:
      Object.keys(shipmentErrors).length > 0
        ? "Exchange approved, but Delhivery shipment creation needs attention -- use Retry Shipment"
        : "Exchange approved and Delhivery shipments created",
    exchangeRequest: finalRequest,
    shipmentErrors: Object.keys(shipmentErrors).length > 0 ? shipmentErrors : undefined,
  });
});

// @route POST /api/admin/exchange/:id/retry-shipment
export const retryExchangeShipmentController = asyncHandler(async (req, res) => {
  const request = await loadExchangeRequest(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Exchange request not found" });
  }

  if (request.status !== "APPROVED") {
    return res.status(400).json({ message: "Only an APPROVED exchange has shipments to retry" });
  }

  const address = request.orderItem.order.address;
  if (!address) {
    return res.status(422).json({ message: "Order has no shipping address on file" });
  }

  const orderRef = { orderNumber: request.orderItem.order.orderNumber };
  const shipmentErrors = {};

  if (!request.pickupShipmentId) {
    try {
      const pickupResponse = await createReversePickupShipment(orderRef, address);
      const awb = pickupResponse?.packages?.[0]?.waybill;
      if (awb) {
        const shipment = await prisma.shipment.create({
          data: {
            orderId: request.orderItem.orderId,
            courierName: "Delhivery",
            awbNumber: awb,
            shipmentId: pickupResponse?.packages?.[0]?.refnum,
            rawResponse: pickupResponse,
            status: "CREATED",
          },
        });
        await prisma.orderReturn.update({
          where: { id: request.id },
          data: { pickupShipmentId: shipment.id },
        });
      } else {
        shipmentErrors.pickup = pickupResponse?.rmk || "Delhivery did not return a waybill";
      }
    } catch (error) {
      shipmentErrors.pickup = error.response?.data?.rmk || error.message || "Unknown error";
    }
  }

  if (!request.replacementShipmentId) {
    try {
      const replacementResponse = await createReplacementShipment(orderRef, address);
      const awb = replacementResponse?.packages?.[0]?.waybill;
      if (awb) {
        const shipment = await prisma.shipment.create({
          data: {
            orderId: request.orderItem.orderId,
            courierName: "Delhivery",
            awbNumber: awb,
            shipmentId: replacementResponse?.packages?.[0]?.refnum,
            rawResponse: replacementResponse,
            status: "CREATED",
          },
        });
        await prisma.orderReturn.update({
          where: { id: request.id },
          data: { replacementShipmentId: shipment.id },
        });
      } else {
        shipmentErrors.replacement = replacementResponse?.rmk || "Delhivery did not return a waybill";
      }
    } catch (error) {
      shipmentErrors.replacement = error.response?.data?.rmk || error.message || "Unknown error";
    }
  }

  const [finalRequest] = await attachDesiredVariants([await loadExchangeRequest(request.id)]);

  res.json({
    message: Object.keys(shipmentErrors).length > 0 ? "Some shipments still failed" : "Shipments created",
    exchangeRequest: finalRequest,
    shipmentErrors: Object.keys(shipmentErrors).length > 0 ? shipmentErrors : undefined,
  });
});

// @route POST /api/admin/exchange/:id/reject
export const rejectExchangeController = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const note = typeof adminNote === "string" ? adminNote.trim() : "";

  if (!note) {
    return res.status(400).json({
      message: "A reason is required so the customer can see why the exchange was cancelled",
    });
  }

  const request = await loadExchangeRequest(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Exchange request not found" });
  }

  if (request.status !== "REQUESTED") {
    return res.status(400).json({
      message: `Only a REQUESTED exchange can be cancelled (this one is ${request.status})`,
    });
  }

  const updated = await prisma.orderReturn.update({
    where: { id: request.id },
    data: { status: "REJECTED", adminNote: note.slice(0, 500), respondedAt: new Date() },
  });

  res.json({ message: "Exchange request cancelled", exchangeRequest: updated });
});

// @route POST /api/admin/exchange/:id/complete
export const completeExchangeController = asyncHandler(async (req, res) => {
  const request = await loadExchangeRequest(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Exchange request not found" });
  }

  if (request.status !== "APPROVED") {
    return res.status(400).json({
      message: `Only an APPROVED exchange can be marked complete (this one is ${request.status})`,
    });
  }

  const originalVariantId = request.orderItem.variantId;

  const ops = [
    prisma.orderReturn.update({
      where: { id: request.id },
      data: { status: "COMPLETED" },
    }),
  ];

  if (originalVariantId) {
    ops.push(
      prisma.productVariant.update({
        where: { id: originalVariantId },
        data: { stock: { increment: 1 } },
      }),
      prisma.inventoryLog.create({
        data: {
          variantId: originalVariantId,
          quantity: 1,
          type: "RETURN",
          note: `Original item received back for exchange on order ${request.orderItem.order.orderNumber}`,
        },
      }),
    );
  }

  const [updated] = await prisma.$transaction(ops);

  res.json({ message: "Exchange marked complete", exchangeRequest: updated });
});
