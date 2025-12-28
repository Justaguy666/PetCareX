export const COUNT_PRODUCTS = `
  SELECT COUNT(*) FROM products
`;

export const LIST_PRODUCTS = `
  SELECT 
    id, 
    product_name, 
    product_type, 
    price,
    created_at,
    updated_at
  FROM products
`;
