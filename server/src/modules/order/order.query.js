export const BUY_PRODUCT = `
  SELECT fn_buy_product($1::bigint, $2::bigint, $3::jsonb, $4::payment_method) AS invoice_id
`;
