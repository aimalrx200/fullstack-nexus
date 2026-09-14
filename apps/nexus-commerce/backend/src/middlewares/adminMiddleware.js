export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "merchant_admin") {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Merchant Administrator privilege required.",
    });
  }
  next();
};
