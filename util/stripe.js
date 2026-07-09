exports.toStripeLineItems = (products) => {
  return products.map((product) => ({
    quantity: product.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(product.price * 100), // Stripe works with cents
      product_data: {
        name: product.title,
        description: product.description,
      },
    },
  }));
};
