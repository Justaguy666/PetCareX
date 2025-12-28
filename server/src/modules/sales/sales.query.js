export const GET_SALES_BRANCH = `
  SELECT b.id, b.branch_name, b.address
  FROM accounts a
  JOIN employees e ON e.id = a.employee_id
  JOIN mobilizations m ON m.employee_id = e.id
  JOIN branches b ON b.id = m.branch_id
  WHERE a.id = $1
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  LIMIT 1
`;

export const GET_BRANCH_INVENTORY = `
  SELECT p.id, p.product_name, p.description, p.price, p.product_type,
         COALESCE(pi.quantity, 0) as stock
  FROM products p
  LEFT JOIN product_inventory pi ON pi.product_id = p.id AND pi.branch_id = $1
  ORDER BY p.product_name ASC
`;

export const UPDATE_STOCK = `
  INSERT INTO product_inventory (branch_id, product_id, quantity)
  VALUES ($1, $2, $3)
  ON CONFLICT (branch_id, product_id) 
  DO UPDATE SET quantity = $3
  RETURNING *
`;

export const ADJUST_STOCK = `
  INSERT INTO product_inventory (branch_id, product_id, quantity)
  VALUES ($1, $2, GREATEST(0, $3))
  ON CONFLICT (branch_id, product_id) 
  DO UPDATE SET quantity = GREATEST(0, product_inventory.quantity + $3)
  RETURNING *
`;

export const GET_TODAY_SALES = `
  SELECT i.id, i.total_amount, i.payment_method, i.created_at,
         u.full_name as customer_name
  FROM invoices i
  LEFT JOIN users u ON u.id = i.customer_id
  WHERE i.branch_id = $1
    AND DATE(i.created_at) = CURRENT_DATE
  ORDER BY i.created_at DESC
`;

export const GET_SALES_STATS = `
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue
  FROM invoices
  WHERE branch_id = $1
    AND DATE(created_at) = CURRENT_DATE
`;

export const GET_PENDING_SERVICE_INVOICES = `
  SELECT i.id, i.total_amount, i.total_discount, i.payment_method, i.created_at,
         u.full_name as customer_name,
         s.type_of_service
  FROM invoices i
  LEFT JOIN users u ON u.id = i.customer_id
  LEFT JOIN services s ON s.invoice_id = i.id
  WHERE i.branch_id = $1
    AND s.type_of_service != 'Mua hàng'
  ORDER BY i.created_at DESC
  LIMIT 50
`;
