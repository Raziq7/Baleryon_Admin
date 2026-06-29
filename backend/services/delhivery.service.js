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

        payment_mode: "Prepaid",

        total_amount: Number(order.totalAmount),
        cod_amount: 0,

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
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
}