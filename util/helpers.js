const Product = require("../models/product");

const ITEMS_PER_PAGE = 1;

async function getPaginatedProducts(filter, page) {
  const totalItems = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  return {
    products,
    totalItems,
    currentPage: page,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}

module.exports = {
  ITEMS_PER_PAGE,
  getPaginatedProducts,
};
