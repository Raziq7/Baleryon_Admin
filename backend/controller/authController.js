import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";

// @desc Login user (admin portal)
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // console.log(req.user, "req.user");

  // if (!req.user.admin || !req.user.admin.isActive) {
  //   return res.status(403).json({ message: "Admin access required" });
  // }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      admin: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ message: "Password login not enabled" });
  }
  if (!user.admin) {
    return res.status(403).json({ message: "Not an admin account" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "User is blocked" });
  }

  const token = generateToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role?.name,
      profileImage: user.profileImage,
    },
  });
});

// @desc Get current user
export const meController = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});

/**
 * @desc Create Admin User
 * @route POST /api/admin/create-admin
 * @access SUPER_ADMIN only
 */
export const createAdminController = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "fullName, email, password are required",
    });
  }

  // check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: hashedPassword,
      isVerified: true,
    },
  });

  // create admin record
  const admin = await prisma.admin.create({
    data: {
      userId: user.id,
      role: role || "MANAGER",
      isActive: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Admin created successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
    admin,
  });
});

export const getAdminsController = asyncHandler(async (req, res) => {
  const admins = await prisma.admin.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    admins,
  });
});
