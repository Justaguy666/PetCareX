export const GET_PRODUCT_INVENTORY = `
  SELECT branch_id, product_id as item_id, quantity, updated_at FROM product_inventory
`;

export const GET_VACCINE_INVENTORY = `
  SELECT branch_id, vaccine_id as item_id, quantity, updated_at FROM vaccine_inventory
`;

export const GET_PACKAGE_INVENTORY = `
  SELECT branch_id, package_id as item_id, quantity, updated_at FROM package_inventory
`;
