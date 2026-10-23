import prisma from "../lib/prisma.js";
import {
  createShipment,
  createWarehouse,
  cancelShipment,
  trackShipment,
} from "../services/delhivery.service.js";

// Non-terminal shipment states that are still safe to cancel with the courier.
const CANCELLABLE_SHIPMENT_STATUSES = ["CREATED", "PENDING", "MANIFESTED"];

export const generateShipmentController = async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const response = await createShipment(order, order.address);

  console.log("SHIPMENT RESPONSE", JSON.stringify(response, null, 2));

  console.log("DELHIVERY RESPONSE STATUS:", response?.success);

  // FIX: Explicitly catch Delhivery internal API rejections safely
  if (!response || response.success === false || !response.packages?.length) {
    return res.status(422).json({
      message: "Delhivery third-party manifestation failed.",
      error: response?.rmk || "Unknown upstream API error",
      rawResponse: response,
    });
  }

  const awb = response?.packages?.[0]?.waybill;
  const shipmentId = response?.packages?.[0]?.refnum;

  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      awbNumber: awb,
      shipmentId,
      rawResponse: response,
      status: "CREATED",
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: "SHIPPED" },
  });

  res.json({
    message: "Shipment created",
    shipment,
  });
};

// @desc    Cancel a shipment with Delhivery and reflect it on the order
// @route   POST /api/admin/shipment/cancel/:orderId
export const cancelShipmentController = async (req, res) => {
  const { orderId } = req.params;

  const shipment = await prisma.shipment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (!shipment || !shipment.awbNumber) {
    return res
      .status(404)
      .json({ message: "No shipment found for this order" });
  }

  if (shipment.status === "CANCELLED") {
    return res.status(400).json({ message: "Shipment is already cancelled" });
  }

  if (!CANCELLABLE_SHIPMENT_STATUSES.includes(shipment.status)) {
    return res.status(400).json({
      message: `Shipment cannot be cancelled once it is ${shipment.status}`,
    });
  }

  let response;
  try {
    response = await cancelShipment(shipment.awbNumber);
  } catch (error) {
    return res.status(502).json({
      message: "Failed to reach Delhivery to cancel the shipment",
      error: error.response?.data || error.message,
    });
  }

  console.log("CANCEL SHIPMENT RESPONSE", JSON.stringify(response, null, 2));

  // Delhivery's /api/p/edit replies with `status` as either the boolean
  // `true`/`false` or the strings "Success"/"Failure" depending on account
  // setup, so both shapes have to be treated as success — anything else
  // (including the string "Failure") is a rejection.
  const cancelSucceeded =
    response?.status === true ||
    String(response?.status).toLowerCase() === "success";

  if (!response || !cancelSucceeded) {
    return res.status(422).json({
      message: "Delhivery rejected the cancellation request",
      error:
        response?.error ||
        response?.remark ||
        response?.rmk ||
        "Unknown upstream API error",
      rawResponse: response,
    });
  }

  const [updatedShipment, updatedOrder] = await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: "CANCELLED", rawResponse: response },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" },
    }),
  ]);

  res.json({
    message: "Shipment cancelled",
    shipment: updatedShipment,
    order: updatedOrder,
  });
};

// @desc    Live tracking pulled straight from Delhivery for an order's shipment
// @route   GET /api/admin/shipment/track/:orderId
export const trackShipmentController = async (req, res) => {
  const { orderId } = req.params;

  const shipment = await prisma.shipment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (!shipment || !shipment.awbNumber) {
    return res
      .status(404)
      .json({ message: "No shipment found for this order" });
  }

  let response;
  try {
    response = await trackShipment(shipment.awbNumber);
  } catch (error) {
    return res.status(502).json({
      message: "Failed to reach Delhivery for live tracking",
      error: error.response?.data || error.message,
    });
  }

  const shipmentData = response?.ShipmentData?.[0]?.Shipment;

  if (!shipmentData) {
    return res.status(404).json({
      message: "No tracking data available yet for this shipment",
      awbNumber: shipment.awbNumber,
      rawResponse: response,
    });
  }

  const scans = (shipmentData.Scans || [])
    .map((entry) => ({
      status: entry.ScanDetail?.Scan || null,
      instructions: entry.ScanDetail?.Instructions || null,
      location: entry.ScanDetail?.ScannedLocation || null,
      dateTime:
        entry.ScanDetail?.StatusDateTime ||
        entry.ScanDetail?.ScanDateTime ||
        null,
    }))
    .sort(
      (a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0),
    );

  res.json({
    awbNumber: shipment.awbNumber,
    currentStatus: shipmentData.Status?.Status || null,
    statusType: shipmentData.Status?.StatusType || null,
    statusDateTime: shipmentData.Status?.StatusDateTime || null,
    statusLocation: shipmentData.Status?.StatusLocation || null,
    destination: shipmentData.Destination || null,
    scans,
  });
};

export const createWarehouseController = async (req, res) => {
  try {
    const warehouseData = req.body;

    const response = await createWarehouse({
      phone: "7204474711",
      city: "Delhi",
      name: "SHREENIKA",
      pin: "110001",
      address: "Test Warehouse Address",
      country: "India",
      email: "raziqsur@gmail.com",
      registered_name: "SHREENIKA",
      return_address: "Test Warehouse Address",
      return_pin: "110001",
      return_city: "Delhi",
      return_state: "Delhi",
      return_country: "India",
    });
    // const response = await createWarehouse(warehouseData);

    console.log("WAREHOUSE RESPONSE", JSON.stringify(response, null, 2));

    if (!response || response.success === false) {
      return res.status(422).json({
        message: "Warehouse creation failed",
        error: response?.rmk || "Unknown Delhivery error",
        rawResponse: response,
      });
    }

    return res.status(201).json({
      message: "Warehouse created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Warehouse Controller Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.response?.data || error.message,
    });
  }
};
