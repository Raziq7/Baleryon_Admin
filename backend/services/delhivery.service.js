import axios from "axios";
import qs from "qs";

// const BASE_URL = process.env.DELHIVERY_BASE_URL;
// const TOKEN = process.env.DELHIVERY_API_TOKEN;
const BASE_URL = process.env.DELHIVERY_BASE_URL; // production endpoint
const TOKEN = process.env.DELHIVERY_API_TOKEN;

export const checkServiceability = async (pincode) => {
  const res = await axios.get(
    `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
    {
      headers: {
        Authorization: `Token ${TOKEN}`,
      },
    },
  );

  return res.data;
};

export async function createShipment(order, address) {
  // Order.paymentMethod is normalized to "cod" or "razorpay" by
  // orderController.js. Delhivery needs to know which one it is so it
  // collects cash on delivery instead of treating every shipment as
  // prepaid.
  const isCod = String(order.paymentMethod ?? "").toLowerCase() === "cod";

  const manifest = {
    shipments: [
      // {
      //   name: "John Doe",
      //   add: "Flat 402, Sunshine Apartments, Sector 45",
      //   pin: "122003",
      //   phone: "9999999999",
      //   order: "ORD-2026-10243",
      //   payment_mode: "Prepaid",
      //   total_amount: 1500.0,
      //   weight: "500",
      //   products_desc: "Running Shoes",
      //   hsn_code: "64041190",
      //   cod_amount: "0",
      //   sales_tax: 0,
      //   quantity: "1",
      // },

      // {
      //   name: address.fullName,
      //   add: address.addressLine1,
      //   pin: address.postalCode,
      //   city: address.city,
      //   state: address.state,
      //   country: "India",

      //   phone: address.phone,

      //   order: order.orderNumber,

      //   payment_mode: order.paymentStatus === "SUCCESS" ? "Prepaid" : "COD",

      //   return_name: "SHREENIKA",

      //   return_add:
      //     "Shreenika, 1st Floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO",

      //   return_city: "Cochin",

      //   return_state: "Kerala",

      //   return_country: "India",

      //   return_phone: "7204474711",

      //   return_pin: "682028",

      //   seller_name: "SHREENIKA",

      //   seller_add:
      //     "Shreenika, 1st Floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO",

      //   seller_inv: order.orderNumber,

      //   products_desc: "Fashion Product",

      //   quantity: String(order.items.length),

      //   total_amount: String(order.totalAmount),

      //   cod_amount:
      //     order.paymentStatus === "SUCCESS" ? "0" : String(order.totalAmount),

      //   weight: "500",

      //   shipment_width: "10",
      //   shipment_height: "10",
      //   shipment_length: "10",

      //   shipping_mode: "Surface",

      //   address_type: "home",

      //   hsn_code: "",
      //   ...(waybill && { waybill }),
      // },

      {
        name: address.fullName,
        add: address.addressLine1,
        pin: address.postalCode,
        city: address.city,
        state: address.state,
        country: "India",

        phone: address.phone,

        order: order.orderNumber,
        order_date: new Date().toISOString().split("T")[0],

        payment_mode: isCod ? "COD" : "Prepaid",

        total_amount: Number(order.totalAmount),
        cod_amount: isCod ? Number(order.totalAmount) : 0,

        weight: 500,

        products_desc: "Fashion Product",
        quantity: order.items.length,

        hsn_code: "61091000",

        shipment_width: 10,
        shipment_height: 10,
        shipment_length: 10,

        shipping_mode: "Surface",

        seller_name: "SHREENIKA",
        seller_inv: order.orderNumber,

        return_name: "SHREENIKA",
        return_address: "Shreenika, 1st Floor, Apt 102, Near Harmony Enclave",

        return_city: "Cochin",
        return_state: "Kerala",
        return_country: "India",
        return_phone: "7204474711",
        return_pin: "682028",
      },
    ],

    pickup_location: {
      name: "SHREENIKA",
      add: "1st floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO, Cochin",
      pin: "682028",
      phone: "7204474711",
    },
  };

  const body = qs.stringify({
    format: "json",
    data: JSON.stringify(manifest),
  });

  console.log(body, "bodybodybodybodybodybodybodybodybodybody");

  try {
    const body = qs.stringify({
      format: "json",
      data: JSON.stringify(manifest),
    });

    const response = await axios.post(`${BASE_URL}/api/cmu/create.json`, body, {
      headers: {
        Authorization: `Token ${TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Call Failed:", error.response?.data || error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------
// Exchange / replacement shipments
//
// These manifest through the SAME endpoint (/api/cmu/create.json) as
// createShipment() above -- the one already proven to work against this
// Delhivery account -- via a small shared helper, manifestShipment(). Only
// the address roles (and, for the reverse pickup, the `shipment_type`
// flag) differ from a normal forward shipment.
//
// IMPORTANT: `shipment_type: "Return"` is Delhivery's documented way to
// flag a reverse-pickup manifestation on this endpoint, but it has not
// been exercised against this specific account before -- verify it on the
// Delhivery merchant dashboard (or with their support) before relying on
// it in production. Both functions below are defensive on purpose: a
// failure here is caught by the caller (controller/exchangeController.js)
// and surfaced to the admin so they can retry or create the shipment
// manually -- it never corrupts the underlying exchange request record.
// -----------------------------------------------------------------------

async function manifestShipment(manifest) {
  const body = qs.stringify({
    format: "json",
    data: JSON.stringify(manifest),
  });

  try {
    const response = await axios.post(`${BASE_URL}/api/cmu/create.json`, body, {
      headers: {
        Authorization: `Token ${TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Delhivery exchange manifest failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

function buildExchangeShipmentPayload(order, address, referenceSuffix, extra) {
  return {
    shipments: [
      {
        name: address.fullName,
        add: address.addressLine1,
        pin: address.postalCode,
        city: address.city,
        state: address.state,
        country: "India",

        phone: address.phone,

        order: `${order.orderNumber}-${referenceSuffix}`,
        order_date: new Date().toISOString().split("T")[0],

        total_amount: 0,
        cod_amount: 0,

        weight: 500,
        quantity: 1,

        hsn_code: "61091000",

        shipment_width: 10,
        shipment_height: 10,
        shipment_length: 10,

        shipping_mode: "Surface",

        seller_name: "SHREENIKA",
        seller_inv: `${order.orderNumber}-${referenceSuffix}`,

        return_name: "SHREENIKA",
        return_address: "Shreenika, 1st Floor, Apt 102, Near Harmony Enclave",
        return_city: "Cochin",
        return_state: "Kerala",
        return_country: "India",
        return_phone: "7204474711",
        return_pin: "682028",

        ...extra,
      },
    ],

    pickup_location: {
      name: "SHREENIKA",
      add: "1st floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO, Cochin",
      pin: "682028",
      phone: "7204474711",
    },
  };
}

// Collects the original item back from the customer and returns it to the
// seller warehouse. `order` only needs { orderNumber }, `address` is the
// customer's delivery address (the pickup point for this reverse leg).
export async function createReversePickupShipment(order, address) {
  const manifest = buildExchangeShipmentPayload(order, address, "RVP", {
    payment_mode: "Pickup",
    shipment_type: "Return",
    products_desc: "Exchange pickup - original item",
  });

  return manifestShipment(manifest);
}

// Ships the replacement (new size/color) to the customer, free of charge.
export async function createReplacementShipment(order, address) {
  const manifest = buildExchangeShipmentPayload(order, address, "EXC", {
    payment_mode: "Prepaid",
    products_desc: "Exchange replacement item",
  });

  return manifestShipment(manifest);
}

export const trackShipment = async (awb) => {
  const res = await axios.get(
    `${BASE_URL}/api/v1/packages/json/?waybill=${awb}`,
    {
      headers: {
        Authorization: `Token ${TOKEN}`,
      },
    },
  );

  return res.data;
};

export const cancelShipment = async (waybill) => {
  // NOTE: unlike /api/cmu/create.json (manifestation), the /api/p/edit
  // endpoint does NOT accept the `format=json&data=<json>` form-encoded
  // wrapper — it expects the payload as a plain JSON body. Sending the
  // wrapped form here made Delhivery unable to find `waybill`/`order_id`
  // at all, which is why it replied with "Enter Waybill/OrderID, please
  // try again" even though a valid waybill was being sent.
  try {
    const response = await axios.post(
      `${BASE_URL}/api/p/edit`,
      {
        waybill,
        cancellation: "true",
      },
      {
        headers: {
          Authorization: `Token ${TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delhivery Cancel Error:",
      JSON.stringify(error.response?.data, null, 2),
    );
    throw error;
  }
};

export const requestPickup = async (shipmentId) => {
  const res = await axios.post(
    `${BASE_URL}/fm/request/new/`,
    {
      shipment_id: shipmentId,
    },
    {
      headers: {
        Authorization: `Token ${TOKEN}`,
      },
    },
  );

  return res.data;
};

// export async function createWarehouse() {
//   const payload = {
//     name: "SHREENIKA",
//     registered_name: "SHREENIKA",

//     phone: "7204474711",
//     email: "raziqsur@gmail.com",

//     address: "1st Floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO",

//     city: "Cochin",
//     state: "Kerala",
//     country: "India",
//     pin: "682028",

//     return_address:
//       "1st Floor, Apt 102, Near Harmony Enclave, Link India, Vennala PO",

//     return_city: "Cochin",
//     return_state: "Kerala",
//     return_country: "India",
//     return_pin: "682028",
//   };

//   try {
//     const response = await axios.post(
//       `${BASE_URL}/api/backend/clientwarehouse/create/`,
//       payload,
//       {
//         headers: {
//           Authorization: `Token ${TOKEN}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       },
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Warehouse creation failed:",
//       error.response?.data || error.message,
//     );
//     throw error;
//   }
// }


export async function createWarehouse(warehouseData) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/backend/clientwarehouse/create/`,
      warehouseData,
      {
        headers: {
          Authorization: `Token ${TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (error) {
    console.log(
      "Delhivery Error:",
      JSON.stringify(error.response?.data, null, 2)
    );

    throw error;
  }
}