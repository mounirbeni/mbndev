/**
 * Adds `_id` alias to every Prisma record so the existing frontend code
 * (which expects MongoDB-style `_id`) works without any changes.
 */
function fmt(doc) {
  if (doc === null || doc === undefined) return doc;
  if (Array.isArray(doc)) return doc.map(fmt);
  if (typeof doc !== 'object' || doc instanceof Date) return doc;

  const result = { _id: doc.id, ...doc };

  for (const key of Object.keys(result)) {
    const val = result[key];
    if (!val || key === '_id') continue;
    if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item && typeof item === 'object' && !(item instanceof Date) && item.id
          ? fmt(item)
          : item
      );
    } else if (typeof val === 'object' && !(val instanceof Date) && val.id) {
      result[key] = fmt(val);
    }
  }

  return result;
}

module.exports = { fmt };
