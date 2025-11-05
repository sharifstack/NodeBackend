exports.getAllProductsName = (items) => {
  let allProductNames = [];
  items.map((product) => {
    if (product.varientType == "singleVarient") {
      allProductNames.push(product.Name);
    } else {
      allProductNames.push(variant.variantName);
    }
  });

  return allProductNames.join(", ");
};
