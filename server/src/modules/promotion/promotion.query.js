export const GET_USER_MEMBERSHIP = `
  SELECT membership_level FROM users WHERE id = $1
`;

export const GET_DISCOUNT_FOR_SERVICE = `
  SELECT pf.discount_percentage
  FROM promotions p
  JOIN promotion_for pf ON pf.promotion_id = p.id
  WHERE pf.service_type = $1
    AND (
      p.apply_for = 'Tất cả'
      OR (p.apply_for = 'Thân thiết trở lên' AND $2 IN ('Thân thiết', 'VIP'))
      OR (p.apply_for = 'VIP' AND $2 = 'VIP')
    )
  ORDER BY pf.discount_percentage DESC
  LIMIT 1
`;
