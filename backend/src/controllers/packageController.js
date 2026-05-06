const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

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
    const pkg = await prisma.package.create({
      data: {
        name,
        slug,
        price: Number(price),
        description,
        features: features || [],
        pages: pages ? Number(pages) : null,
        revisions: revisions ? Number(revisions) : null,
        deliveryDays: deliveryDays ? Number(deliveryDays) : null,
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
    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(price !== undefined && { price: Number(price) }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(pages !== undefined && { pages: Number(pages) }),
        ...(revisions !== undefined && { revisions: Number(revisions) }),
        ...(deliveryDays !== undefined && { deliveryDays: Number(deliveryDays) }),
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
    next(err);
  }
};
