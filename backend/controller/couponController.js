import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

/**
 * GET ALL COUPONS (ADMIN)
 */
export const getCouponsController = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(coupons);
});

/**
 * CREATE COUPON
 */
export const createCouponController = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    minimumOrder,
    usageLimit,
    startsAt,
    expiresAt,
    isActive,
  } = req.body;

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value,
      minimumOrder,
      usageLimit,
      startsAt,
      expiresAt,
      isActive: isActive ?? true,
    },
  });

  res.json({ message: "Coupon created", data: coupon });
});

/**
 * UPDATE COUPON
 */
export const updateCouponController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await prisma.coupon.update({
    where: { id },
    data: req.body,
  });

  res.json({ message: "Coupon updated", data: updated });
});

/**
 * DELETE COUPON
 */
export const deleteCouponController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.coupon.delete({ where: { id } });

  res.json({ message: "Coupon deleted" });
});

/**
 * VALIDATE COUPON (CHECKOUT LOGIC)
 * This is the MOST IMPORTANT part (industry logic)
 */
export const validateCouponController = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return res.status(404).json({ message: "Invalid coupon" });
  }

  if (!coupon.isActive) {
    return res.status(400).json({ message: "Coupon inactive" });
  }

  const now = new Date();

  if (coupon.startsAt && now < coupon.startsAt) {
    return res.status(400).json({ message: "Coupon not started yet" });
  }

  if (coupon.expiresAt && now > coupon.expiresAt) {
    return res.status(400).json({ message: "Coupon expired" });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ message: "Coupon usage limit reached" });
  }

  if (coupon.minimumOrder && orderAmount < coupon.minimumOrder) {
    return res.status(400).json({
      message: `Minimum order should be ${coupon.minimumOrder}`,
    });
  }

  // calculate discount
  let discount = 0;

  if (coupon.type === "PERCENTAGE") {
    discount = (orderAmount * Number(coupon.value)) / 100;
  } else {
    discount = Number(coupon.value);
  }

  if (discount > orderAmount) discount = orderAmount;

  res.json({
    valid: true,
    discount,
    finalAmount: orderAmount - discount,
    couponId: coupon.id,
  });
});