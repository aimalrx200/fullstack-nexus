import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "User profile not found." });
  return res.status(200).json({ success: true, addresses: user.addresses });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  if (user.addresses.length >= 10) {
    return res.status(400).json({
      success: false,
      message: "Address limit reached (Maximum 10 saved addresses).",
    });
  }

  const isFirstAddress = user.addresses.length === 0;
  const isDefault = Boolean(req.body.isDefault || isFirstAddress);

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({ ...req.body, isDefault });
  await user.save();

  return res.status(201).json({ success: true, addresses: user.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);

  const address = user.addresses.id(addressId);
  if (!address) {
    return res
      .status(404)
      .json({ success: false, message: "Address not found." });
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  return res.status(200).json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId,
  );
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }
  await user.save();

  return res.status(200).json({ success: true, addresses: user.addresses });
});
