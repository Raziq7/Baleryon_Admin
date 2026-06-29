import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { toLegacyUser, toFullName } from "../utils/userMapper.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const userInclude = {
  role: true,
  _count: { select: { orders: true } },
};

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// function buildStatusFilter(status) {
//   switch (status) {
//     case "active":
//       return { isBlocked: false };

//     case "blocked":
//       return { isBlocked: true };

//     case "verified":
//       return { isVerified: true };

//     case "unverified":
//       return { isVerified: false };

//     default:
//       return {};
//   }
// }

function buildStatusFilter(status) {
  switch (status) {
    case "active":
      return { isBlocked: false };

    case "blocked":
      return { isBlocked: true };

    case "verified":
      return { isVerified: true };

    case "unverified":
      return { isVerified: false };

    case "purchased":
      return {
        orders: {
          some: {},
        },
      };

    default:
      return {};
  }
}

function sanitizeUser(user) {
  const { passwordHash, providerId, ...safeUser } = user;
  return toLegacyUser(safeUser, { orderCount: user._count?.orders ?? 0 });
}

async function getRoleByName(name) {
  const roleName = name || "customer";
  return prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  });
}

function assertNotSelf(req, res, targetUserId) {
  if (req.userRecord?.id === targetUserId) {
    res.status(400).json({
      message: "You cannot modify your own account from this panel",
    });
    return false;
  }
  return true;
}

// @desc    Create a new user
// @route   POST /api/admin/userManagment/create
export const createUserController = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, isActive, phone } =
    req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "Please provide first name, last name, email, and password",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    return res.status(409).json({
      message: "User already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const roleRecord = await getRoleByName(role === "user" ? "customer" : role);

  const user = await prisma.user.create({
    data: {
      fullName: toFullName(firstName, lastName),
      email: normalizedEmail,
      phone: phone || null,
      passwordHash: hashedPassword,
      roleId: roleRecord.id,
      isBlocked: isActive === false,
    },
    include: userInclude,
  });

  res.status(201).json({
    message: "User created successfully",
    user: sanitizeUser(user),
  });
});

// @desc    Get users with pagination and filtering
// @route   GET /api/admin/userManagment/
export const getUsersController = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const status = req.query.status || "all";
  const search = String(req.query.search || "").trim();

  // 🔥 get all admin users
  const adminUserIds = await prisma.admin.findMany({
    select: { userId: true },
  });

  const adminIdsSet = adminUserIds.map((a) => a.userId);

  const where = {
    ...buildStatusFilter(status),

    // ❌ exclude admins
    id: {
      notIn: adminIdsSet,
    },
  };

  if (search) {
    where.OR = [
      {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: userInclude,
    }),
    prisma.user.count({ where }),
  ]);

  const sanitizedUsers = users.map(sanitizeUser);

  return res.status(200).json({
    success: true,
    users: sanitizedUsers,
    pageNo: page,
    totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
    totalUsers,
  });
});

// @desc    Get a single user's details by ID
// @route   GET /api/admin/userManagment/userDetails
export const getUserByIdController = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!isValidUuid(id)) {
    return res.status(400).json({ message: "Valid user id is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user: sanitizeUser(user) });
});

// @desc    Get a single user's details by ID
// @route   GET /api/admin/users/:id/details
export const getUserDetailsController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      addresses: true,
      orders: {
        orderBy: {
          placedAt: "desc",
        },
        include: {
          payments: true,
          items: {
            include: {
              product: {
                include: {
                  images: true, // ← needed for ProductsTab
                  category: true, // ← needed for ProductsTab
                  brand: true, // ← needed for ProductsTab
                },
              },
              variant: true, // ← color, size, sku info
            },
          },
        },
      },
      analyticsEvents: {
        orderBy: { createdAt: "desc" },
        take: 50, // cap so it doesn't explode
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // ── Stats ──────────────────────────────────────────────────
  const totalSpent = user.orders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount || 0),
    0,
  );

  const pendingOrders = user.orders.filter(
    (order) => order.orderStatus === "PENDING",
  ).length;

  // ── Payments (flattened from orders) ──────────────────────
  const payments = user.orders.flatMap((order) =>
    order.payments.map((payment) => ({
      ...payment,
      orderNumber: order.orderNumber,
    })),
  );

  // ── Products (unique products ordered by this user) ────────
  const productMap = new Map();

  user.orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.product && !productMap.has(item.product.id)) {
        productMap.set(item.product.id, {
          ...item.product,
          // attach variant info the user actually ordered
          orderedVariant: item.variant
            ? {
                color: item.variant.color,
                size: item.variant.size,
                sku: item.variant.sku,
              }
            : null,
        });
      }
    });
  });

  const products = Array.from(productMap.values());

  // ── Activities ─────────────────────────────────────────────
  const activities = user.analyticsEvents;

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
    stats: {
      totalOrders: user._count.orders,
      totalSpent,
      pendingOrders,
    },
    orders: user.orders,
    addresses: user.addresses,
    payments,
    products, // ← now populated
    activities, // ← now populated
  });
});

// @desc    Update user profile / status
// @route   PUT /api/admin/userManagment/:id
export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(400).json({ message: "Valid user id is required" });
  }

  if (!assertNotSelf(req, res, id)) return;

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "User not found" });
  }

  const data = {};
  const { firstName, lastName, phone, role, isBlocked, isVerified } = req.body;

  if (firstName !== undefined || lastName !== undefined) {
    const nextFirst = firstName ?? existing.fullName.split(/\s+/)[0] ?? "";
    const nextLast =
      lastName ?? existing.fullName.split(/\s+/).slice(1).join(" ") ?? "";
    data.fullName = toFullName(nextFirst, nextLast);
  }

  if (phone !== undefined) data.phone = phone || null;
  if (typeof isBlocked === "boolean") data.isBlocked = isBlocked;
  if (typeof isVerified === "boolean") data.isVerified = isVerified;

  if (role) {
    const roleRecord = await getRoleByName(role === "user" ? "customer" : role);
    data.roleId = roleRecord.id;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: userInclude,
  });

  res.status(200).json({
    message: "User updated successfully",
    user: sanitizeUser(user),
  });
});

// @desc    Block or unblock a user
// @route   PATCH /api/admin/userManagment/:id/block
export const toggleBlockUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  if (!isValidUuid(id)) {
    return res.status(400).json({ message: "Valid user id is required" });
  }

  if (typeof isBlocked !== "boolean") {
    return res.status(400).json({ message: "isBlocked must be a boolean" });
  }

  if (!assertNotSelf(req, res, id)) return;

  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked },
    include: userInclude,
  });

  res.status(200).json({
    message: isBlocked ? "User blocked" : "User unblocked",
    user: sanitizeUser(user),
  });
});

// export const getUserDetailsController = asyncHandler(
//   async (req, res) => {
//     const { id } = req.params;

//     const user = await prisma.user.findUnique({
//       where: { id },

//       include: {
//         role: true,

//         addresses: true,

//         orders: {
//           include: {
//             items: {
//               include: {
//                 product: true,
//               },
//             },

//             tracking: true,
//           },

//           orderBy: {
//             createdAt: "desc",
//           },
//         },

//         _count: {
//           select: {
//             orders: true,
//           },
//         },
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     const totalSpent = user.orders.reduce(
//       (sum, order) => sum + order.totalAmount,
//       0
//     );

//     const pendingOrders = user.orders.filter(
//       order => order.status === "pending"
//     ).length;

//     res.status(200).json({
//       success: true,

//       user: sanitizeUser(user),

//       stats: {
//         totalOrders: user._count.orders,
//         totalSpent,
//         pendingOrders,
//       },

//       orders: user.orders,

//       addresses: user.addresses,
//     });
//   }
// );
