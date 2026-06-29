import prisma from "../lib/prisma.js";
import {
  createShipment,
  createWarehouse,
} from "../services/delhivery.service.js";

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

export const createWarehouseController = async (req, res) => {
  try {
    const warehouseData = req.body;

    //   const response await createWarehouse({
    //   name: "SHREENIKA",
    //   registered_name: "SHREENIKA",
    //   phone: "7204474711",
    //   email: "raziqsur@gmail.com",
    //   address: "1st Floor, Apt 102, Near Harmony Enclave",
    //   city: "Cochin",
    //   state: "Kerala",
    //   pin: "682028",
    //   country: "India",
    //   return_address: "1st Floor, Apt 102, Near Harmony Enclave",
    //   return_city: "Cochin",
    //   return_state: "Kerala",
    //   return_country: "India",
    //   return_pin: "682028",
    // });
    const response = await createWarehouse(warehouseData);

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
