import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

/**
 * GET INVENTORY LIST
 */
export const getInventoryController = asyncHandler(async (req, res) => {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
    },
    orderBy: {
      stock: "asc",
    },
  });

  res.json(variants);
});

/**
 * ADJUST INVENTORY
 */
export const adjustInventoryController = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity, type, note } = req.body;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    return res.status(404).json({ message: "Variant not found" });
  }

  let newStock = variant.stock;

  switch (type) {
    case "PURCHASE":
    case "RETURN":
      newStock += quantity;
      break;

    case "SALE":
    case "DAMAGE":
      newStock -= quantity;
      break;

    case "ADJUSTMENT":
      newStock = quantity;
      break;

    default:
      return res.status(400).json({ message: "Invalid type" });
  }

  if (newStock < 0) newStock = 0;

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });

  await prisma.inventoryLog.create({
    data: {
      variantId,
      quantity,
      type,
      note,
    },
  });

  res.json({
    message: "Inventory updated",
    data: updated,
  });
});

/**
 * INVENTORY LOGS
 */
export const getInventoryLogsController = asyncHandler(async (req, res) => {
  const logs = await prisma.inventoryLog.findMany({
    include: {
      variant: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  res.json(logs);
});