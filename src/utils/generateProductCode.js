function toCode(str, limit = 3) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')
    .filter((w) => w.trim() !== '')
    .map((w) => w.slice(0, limit).toUpperCase())
    .join('');
}

function generateProductCode(brandName, categoryName, _id) {
  const brandCode = toCode(brandName, 1);
  const categoryCode = toCode(categoryName, 1);
  const idSuffix = _id.slice(-6).toUpperCase();

  return `${brandCode}-${categoryCode}-${idSuffix}`;
}

module.exports = generateProductCode;
