// ─── Package CRUD (marketing/display content ONLY) ───────────────────────────
// These rows populate the public pricing page and the landing page's pricing
// section — nothing more. Actual order pricing is always computed
// server-side by lib/pricing.js's calculatePrice(), from its own fixed
// PACKAGE_INCLUSIONS/BASE_PRICES config, and never reads this table.
// Editing a Package here changes what's advertised, not what an order costs.
// If that ever needs to change, calculatePrice must be updated to read from
// this table (with caching) instead — don't let the two drift into silently
// disagreeing with each other.

const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { parseOptionalNumber } = require('../lib/numberParsing');

exports.getPackages = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    res.json({ success: true, packages: fmt(packages) });
  } catch (err) {
    next(err);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, features, pages, revisions, deliveryDays, popular } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'name and slug are required.' });
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: 'price must be a non-negative number.' });
    }
    const numericPages        = parseOptionalNumber(pages);
    const numericRevisions    = parseOptionalNumber(revisions);
    const numericDeliveryDays = parseOptionalNumber(deliveryDays);
    if (numericPages === undefined || numericRevisions === undefined || numericDeliveryDays === undefined) {
      return res.status(400).json({ success: false, message: 'pages, revisions, and deliveryDays must be numbers.' });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        slug,
        price: numericPrice,
        description,
        features: features || [],
        pages: numericPages,
        revisions: numericRevisions,
        deliveryDays: numericDeliveryDays,
        popular: Boolean(popular),
      },
    });
    res.status(201).json({ success: true, package: fmt(pkg) });
  } catch (err) {
    next(err);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, features, pages, revisions, deliveryDays, popular } = req.body;

    let numericPrice;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ success: false, message: 'price must be a non-negative number.' });
      }
    }
    const numericPages        = pages        !== undefined ? parseOptionalNumber(pages)        : null;
    const numericRevisions    = revisions    !== undefined ? parseOptionalNumber(revisions)    : null;
    const numericDeliveryDays = deliveryDays !== undefined ? parseOptionalNumber(deliveryDays) : null;
    if (numericPages === undefined || numericRevisions === undefined || numericDeliveryDays === undefined) {
      return res.status(400).json({ success: false, message: 'pages, revisions, and deliveryDays must be numbers.' });
    }

    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(price !== undefined && { price: numericPrice }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(pages !== undefined && { pages: numericPages }),
        ...(revisions !== undefined && { revisions: numericRevisions }),
        ...(deliveryDays !== undefined && { deliveryDays: numericDeliveryDays }),
        ...(popular !== undefined && { popular: Boolean(popular) }),
      },
    });
    res.json({ success: true, package: fmt(pkg) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Package not found' });
    next(err);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    await prisma.package.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Package deactivated' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Package not found' });
    next(err);
  }
};
