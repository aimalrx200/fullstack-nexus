import crypto from "crypto";
import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { initializeUserSession } from "./jwt.controller.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import { formatUserResponse } from "#utils/userSerializer.js";

const DEMO_ACCOUNTS = {
  customer: {
    email: "customer@nexuscommerce.io",
    name: "Aimal (VIP Shopper)",
    role: "customer",
  },
  admin: {
    email: "admin@nexuscommerce.io",
    name: "Lead Commerce Merchant",
    role: "merchant_admin",
  },
};

export const demoLogin = asyncHandler(async (req, res) => {
  const roleType = req.body.role === "admin" ? "admin" : "customer";
  const config = DEMO_ACCOUNTS[roleType];

  let user = await User.findOne({ email: config.email });
  if (!user) {
    user = await User.create({
      ...config,
      password: `Demo_${crypto.randomBytes(8).toString("hex")}!`,
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
  }

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: `Logged in with 1-Click ${roleType.toUpperCase()} Evaluator Pass.`,
    user: formatUserResponse(user),
  });
});
