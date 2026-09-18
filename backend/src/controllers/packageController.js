// Package records hold marketing copy. The pricing engine remains the only
// authority for the amount charged by checkout.
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { parseOptionalNumber } = require('../lib/numberParsing');
const { PACKAGE_INCLUSIONS } = require('../lib/pricing');

function canonicalPlan(slug) {
  return Object.prototype.hasOwnProperty.call(PACKAGE_INCLUSIONS, slug)
    ? PACKAGE_INCLUSIONS[slug] : null;
}

function priceConflict(slug, price) {
  const plan = canonicalPlan(slug);
  return Boolean(plan && Number(price) !== plan.price);
}

function publicPackage(pkg) {
  const plan = canonicalPlan(pkg.slug);
  if (!plan) return fmt(pkg);
  // Avoid marketing a 99-page inclusion as truly unlimited and avoid hard
  // delivery guarantees across different service types and client approvals.
  const features = (Array.isArray(pkg.features) ? pkg.features : []).map((feature) => {
    if (/unlimited\s+pages/i.test(feature)) return `Up to ${plan.includedPages} pages; additional pages are quoted separately`;
    if (/delivery\s+in\s+\d+\s+days/i.test(feature)) return 'Delivery schedule confirmed in your proposal';
    return feature;
  });
  return fmt({ ...pkg, price: plan.price, pages: plan.includedPages, features });
}

exports.getPackages = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
    const listed = packages.map(publicPackage).sort((a, b) => Number(a.price) - Number(b.price));
    return res.json({ success: true, packages: listed });
  } catch (error) { next(error); }
};

exports.createPackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, features, pages, revisions, deliveryDays, popular } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug are required.' });
    const numericPrice = Number(price);
    if (price === undefined || !Number.isFinite(numericPrice) || numericPrice < 0) return res.status(400).json({ success: false, message: 'price must be a non-negative number.' });
    if (priceConflict(slug, numericPrice)) return res.status(400).json({ success: false, message: 'The checkout price of this standard package is fixed. Change the pricing engine in a reviewed code update first.' });
    const parsedPages = parseOptionalNumber(pages);
    const parsedRevisions = parseOptionalNumber(revisions);
    const parsedDelivery = parseOptionalNumber(deliveryDays);
    if ([parsedPages, parsedRevisions, parsedDelivery].some((value) => value === undefined)) return res.status(400).json({ success: false, message: 'pages, revisions and deliveryDays must be numbers.' });
    const pkg = await prisma.package.create({ data: { name, slug, price: numericPrice, description, features: features || [], pages: parsedPages, revisions: parsedRevisions, deliveryDays: parsedDelivery, popular: Boolean(popular) } });
    return res.status(201).json({ success: true, package: fmt(pkg) });
  } catch (error) { next(error); }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, features, pages, revisions, deliveryDays, popular } = req.body;
    let numericPrice;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) return res.status(400).json({ success: false, message: 'price must be a non-negative number.' });
    }
    if (price !== undefined || slug !== undefined) {
      const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ success: false, message: 'Package not found' });
      if (priceConflict(slug ?? existing.slug, numericPrice ?? existing.price)) {
        return res.status(400).json({ success: false, message: 'The checkout price of this standard package is fixed. Change the pricing engine in a reviewed code update first.' });
      }
    }
    const parsedPages = pages !== undefined ? parseOptionalNumber(pages) : null;
    const parsedRevisions = revisions !== undefined ? parseOptionalNumber(revisions) : null;
    const parsedDelivery = deliveryDays !== undefined ? parseOptionalNumber(deliveryDays) : null;
    if ([parsedPages, parsedRevisions, parsedDelivery].some((value) => value === undefined)) return res.status(400).json({ success: false, message: 'pages, revisions and deliveryDays must be numbers.' });
    const pkg = await prisma.package.update({ where: { id: req.params.id }, data: {
      ...(name !== undefined && { name }), ...(slug !== undefined && { slug }),
      ...(price !== undefined && { price: numericPrice }), ...(description !== undefined && { description }),
      ...(features !== undefined && { features }), ...(pages !== undefined && { pages: parsedPages }),
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
