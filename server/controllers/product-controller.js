import ProductModel from "../models/product-model.js";
import MarketplaceProductModel from "../models/marketplace-product-model.js";

export async function getProducts(req, res) {
  try {
    const { q, category, sort = "newest", page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const filters = {};
    if (category && category.toLowerCase() !== "all") {
      filters.category = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (q) {
      const search = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filters.$or = [{ name: search }, { category: search }, { brand: search }, { tags: search }];
    }

    const sortQuery = {};
    if (sort === "price_asc") sortQuery.price = 1;
    else if (sort === "price_desc") sortQuery.price = -1;
    else if (sort === "trending") sortQuery.trending = -1;
    else sortQuery.createdAt = -1;

    const [total, items] = await Promise.all([
      ProductModel.countDocuments(filters),
      ProductModel.find(filters).sort(sortQuery).skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch products." });
  }
}

export async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;
    let product = await ProductModel.findOne({ slug }).lean();
    if (!product) {
      product = await MarketplaceProductModel.findOne({ slug }).lean();
    }
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch product details." });
  }
}

export async function getMarketplaceProducts(req, res) {
  try {
    const { source, category, sort = "newest", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filters = { isActive: true };
    if (source && source !== "all") filters.source = source;
    if (category && category !== "all") filters.category = category;

    const [total, items] = await Promise.all([
      MarketplaceProductModel.countDocuments(filters),
      MarketplaceProductModel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      success: true,
      products: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch marketplace products." });
  }
}
