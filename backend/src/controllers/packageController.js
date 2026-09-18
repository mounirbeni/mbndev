// Public package prices must match the authoritative server-side pricing
// engine. Admin-editable Package rows are descriptive marketing content only.
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { parseOptionalNumber } = require('../lib/numberParsing');
const { PACKAGE_INCLUSIONS } = require('../lib/pricing');

function canonicalPrice(slug) {
  return Object.prototype.hasOwnProperty.call(PACKAGE_INCLUSIONS, slug)
    ? PACKAGE_INCLUSIONS[slug].price
    : null;
}

function priceConflict(slug, price) {
  const authoritative = canonicalPrice(slug);
  return authoritative !== null && Number(price) !== authoritative;
}

exports.getPackages = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
    const listed = packages.map((pkg) => {
      const authoritative = canonicalPrice(pkg.slug);
      return fmt(authoritative === null ? pkg : { ...pkg, price: authoritative });
    });
    listed.sort((a, b) => Number(a.price) - Number(b.price));
    return res.json({ success: true, packages: listed });
  } catch (error) { next(error); }
};

exports.createPackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, features, pages, revisions, deliveryDays, popular } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug are required.' });
    const numericPrice = Number(price);
    if (price === undefined || !Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: 'price must be a non-negative number.' });
    }
    if (priceConflict(slug, numericPrice)) {
      return res.status(400).json({ success: false, message: 'This standard package has a fixed checkout price. Update the pricing engine in a reviewed code change before editing its advertised price.' });
    }
    const parsedPages = parseOptionalNumber(pages);
    const parsedRevisions = parseOptionalNumber(revisions);
    const parsedDelivery = parseOptionalNumber(deliveryDays);
    if ([parsedPages, parsedRevisions, parsedDelivery].some((value) => value === undefined)) {
      return res.status(400).json({ success: false, message: 'pages, revisions, and deliveryDays must be numbers.' });
    }
    const pkg = await prisma.package.create({ data: {
      name, slug, price: numericPrice, description, features: features || [],
      pages: parsedPages, revisions: parsedRevisions, deliveryDays: parsedDelivery,
      popular: Boolean(popular),
    } });
    return res.status(201).json({ success: true, package: fmt(pkg) });
  } catch (error) { next(error); }
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
    if (price !== undefined || slug !== undefined) {
      const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ success: false, message: 'Package not found' });
      const updatedSlug = slug ?? existing.slug;
      const updatedPrice = numericPrice ?? existing.price;
      if (priceConflict(updatedSlug, updatedPrice)) {
        return res.status(400).json({ success: false, message: 'This standard package has a fixed checkout price. Update the pricing engine in a reviewed code change before editing its advertised price.' });
      }
    }
    const parsedPages = pages !== undefined ? parseOptionalNumber(pages) : null;
    const parsedRevisions = revisions !== undefined ? parseOptionalNumber(revisions) : null;
    const parsedDelivery = deliveryDays !== undefined ? parseOptionalNumber(deliveryDays) : null;
    if ([parsedPages, parsedRevisions, parsedDelivery].some((value) => value === undefined)) {
      return res.status(400).json({ success: false, message: 'pages, revisions, and deliveryDays must be numbers.' });
    }
    const pkg = await prisma.package.update({ where: { id: req.params.id }, data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(price !== undefined && { price: numericPrice }),
      ...(description !== undefined && { description }),
      ...(features !== undefined && { features }),
      ...(pages !== undefined && { pages: parsedPages }),
      ...(revisions !== undefined && { revisions: parsedRevisions }),
      ...(deliveryDays !== undefined && { deliveryDays: parsedDelivery }),
      ...(popular !== undefined && { popular: Boolean(popular) }),
    } });
    return res.json({ success: true, package: fmt(pkg) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Package not found' });
    next(error);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    await prisma.package.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Package deactivated' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Package not found' });
    next(error);
  }
};
