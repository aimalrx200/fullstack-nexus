// apps/nexus-commerce/backend/src/controllers/products/product.controller.js

import { randomBytes } from "node:crypto";
import { Product, Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { uploadImage } from "#services/imageService.js";
import { getLiveExchangeRates } from "#services/currencyService.js";

/**
 * Public Product Catalog Directory with Text Search & Attached Variants
 * GET /api/v1/products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    isFeatured, // 👈 Added
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const matchStage = { isArchived: false };

  if (category && category !== "All") {
    matchStage.category = category;
  }

  // 👈 Matches featured hero products
  if (isFeatured === "true" || isFeatured === true) {
    matchStage.isFeatured = true;
  }

  if (search && search.trim()) {
    matchStage.$text = { $search: search.trim() };
  }

  if (minPrice || maxPrice) {
    matchStage.basePriceUSD = {};
    if (minPrice) matchStage.basePriceUSD.$gte = Number(minPrice);
    if (maxPrice) matchStage.basePriceUSD.$lte = Number(maxPrice);
  }

  let sortStage = { createdAt: -1 };
  if (sort === "price-low") sortStage = { basePriceUSD: 1 };
  if (sort === "price-high") sortStage = { basePriceUSD: -1 };
  if (sort === "rating") sortStage = { rating: -1 };

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(50, Math.max(1, Number(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  const [result, totalCount, categories] = await Promise.all([
    Product.aggregate([
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "productId",
          as: "variants",
        },
      },
    ]),
    Product.countDocuments(matchStage),
    Product.distinct("category", { isArchived: false }),
  ]);

  return res.status(200).json({
    success: true,
    products: result,
    categories,
    pagination: {
      total: totalCount,
      page: parsedPage,
      pages: Math.ceil(totalCount / parsedLimit),
      hasMore: parsedPage * parsedLimit < totalCount,
    },
  });
});

/**
 * Public Product Detail by Slug (with Variants)
 * GET /api/v1/products/:slug
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isArchived: false });

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  }

  const variants = await Variant.find({ productId: product._id }).sort({
    priceOverrideUSD: 1,
  });

  return res.status(200).json({
    success: true,
    product,
    variants,
  });
});

/**
 * Public Product Detail by ID
 * GET /api/v1/products/id/:productId
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  }

  const variants = await Variant.find({ productId: product._id });
  return res.status(200).json({ success: true, product, variants });
});

/**
 * Create a new product catalog item
 * POST /api/v1/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    tags,
    basePriceUSD,
    basePricePKR,
    isFeatured,
    video,
  } = req.body;

  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slugBase = cleanTitle || "item";
  const uniqueSuffix = `${Date.now().toString().slice(-6)}-${randomBytes(2).toString("hex")}`;
  const slug = `${slugBase}-${uniqueSuffix}`;

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map(async (file, index) => {
        const uploaded = await uploadImage(file.buffer, "products/images");
        return {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: `${title} image ${index + 1}`,
          isPrimary: index === 0,
        };
      }),
    );
  }

  const product = await Product.create({
    title: title.trim(),
    slug,
    description: description.trim(),
    category,
    tags: tags || [],
    basePriceUSD,
    basePricePKR,
    isFeatured: Boolean(isFeatured),
    images,
    video: video?.url ? video : null,
  });

  return res.status(201).json({
    success: true,
    message: `Product "${product.title}" created successfully.`,
    product,
  });
});

/**
 * Update an existing product
 * PATCH /api/v1/products/:productId
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: req.body },
    { new: true },
  );
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  }
  return res.status(200).json({ success: true, product });
});

/**
 * Soft Archive Product
 * DELETE /api/v1/products/:productId
 */
export const archiveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { isArchived: true } },
    { new: true },
  );
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  }
  return res
    .status(200)
    .json({ success: true, message: "Product archived successfully." });
});

/**
 * Public Exchange Rates Endpoint for Storefront Currency Switcher
 * GET /api/v1/products/rates
 */
export const getExchangeRates = asyncHandler(async (req, res) => {
  const ratesData = await getLiveExchangeRates();
  return res.status(200).json({
    success: true,
    ...ratesData,
  });
});
