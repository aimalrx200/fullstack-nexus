import { Product, Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { uploadImage } from "#services/imageService.js";
import { getLiveExchangeRates } from "#services/currencyService.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isArchived: false };
  let projection = {};
  let sortOption = { createdAt: -1 };

  if (category && category !== "All") {
    query.category = category;
  }

  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
    projection = { score: { $meta: "textScore" } };
    sortOption = { score: { $meta: "textScore" }, createdAt: -1 };
  }

  if (minPrice || maxPrice) {
    query.basePriceUSD = {};
    if (minPrice) query.basePriceUSD.$gte = Number(minPrice);
    if (maxPrice) query.basePriceUSD.$lte = Number(maxPrice);
  }

  if (sort === "price-low") sortOption = { basePriceUSD: 1 };
  if (sort === "price-high") sortOption = { basePriceUSD: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(50, Math.max(1, Number(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  const [products, totalCount, categories] = await Promise.all([
    Product.find(query, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Product.countDocuments(query),
    Product.distinct("category", { isArchived: false }),
  ]);

  return res.status(200).json({
    success: true,
    products,
    categories,
    pagination: {
      total: totalCount,
      page: parsedPage,
      pages: Math.ceil(totalCount / parsedLimit),
      hasMore: parsedPage * parsedLimit < totalCount,
    },
  });
});

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

export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });

  const variants = await Variant.find({ productId: product._id });
  return res.status(200).json({ success: true, product, variants });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    tags,
    basePriceUSD,
    basePricePKR,
    isFeatured,
  } = req.body;

  const slugBase = title
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");

  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await uploadImage(file.buffer);
      images.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        isPrimary: images.length === 0,
      });
    }
  }

  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim())
      : [];

  const product = await Product.create({
    title,
    slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
    description,
    category,
    tags: parsedTags,
    basePriceUSD: Number(basePriceUSD),
    basePricePKR: Number(basePricePKR),
    isFeatured: Boolean(isFeatured === true || isFeatured === "true"),
    images,
  });

  return res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: req.body },
    { new: true },
  );
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  return res.status(200).json({ success: true, product });
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { isArchived: true } },
    { new: true },
  );
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
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
