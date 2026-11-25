// The "Recently viewed" strip under product pages: the last few products the
// shopper opened, newest first, each product shown once.

const MAX_PRODUCTS = 5;

export function createRecentlyViewed() {
  let products = [];

  return {
    // Called whenever a product page opens.
    opened(product) {
      const earlier = products.findIndex((seen) => seen.id === product.id);
      if (earlier !== -1) {
        products.splice(earlier, 1);
      }
      products.unshift(product);
      if (products.length > MAX_PRODUCTS) {
        products = products.slice(0, MAX_PRODUCTS);
      }
    },

    // The "x" on a product in the strip.
    remove(productId) {
      products = products.filter((product) => product.id !== productId);
    },

    names() {
      return products.map((product) => product.name);
    },

    prices() {
      return products.map((product) => product.price);
    },
  };
}
