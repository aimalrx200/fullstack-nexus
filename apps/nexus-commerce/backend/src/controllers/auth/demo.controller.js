// apps/nexus-commerce/backend/src/controllers/auth/demo.controller.js
import crypto from "crypto";
import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { initializeUserSession } from "./jwt.controller.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import { formatUserResponse } from "#utils/userSerializer.js";

const DEMO_PERSONAS = {
  customer: {
    email: "customer.demo@nexuscommerce.io",
    name: "VIP Shopper (Demo)",
    role: "customer",
  },
  agent: {
    email: "agent.demo@nexuscommerce.io",
    name: "Support Specialist (Demo)",
    role: "support_agent",
  },
  admin: {
    email: "admin.demo@nexuscommerce.io",
    name: "Operations Lead (Demo)",
    role: "merchant_admin",
  },
};

export const demoLogin = asyncHandler(async (req, res) => {
  const requestedRole = req.body.role || "customer";
  const config = DEMO_PERSONAS[requestedRole] || DEMO_PERSONAS.customer;

  let user = await User.findOne({ email: config.email });
  if (!user) {
    user = await User.create({
      ...config,
      isEmailVerified: true,
      isDemoAccount: true,
      password: `DemoPass_${crypto.randomBytes(6).toString("hex")}!1`,
      addresses: [
        {
          label: "Primary Residence",
          recipientName: config.name,
          phone: "+92 300 1234567",
          street: "Block H, Gulberg III",
          city: "Lahore",
          state: "Punjab",
          postalCode: "54000",
          country: "Pakistan",
          countryCode: "PK",
          isDefault: true,
          coordinates: { lat: 31.5204, lng: 74.3587 },
        },
      ],
    });
  } else if (user.role !== config.role) {
    user.role = config.role;
    await user.save();
  }

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: `Logged in with 1-Click ${config.name} pass.`,
    user: formatUserResponse(user),
  });
});
