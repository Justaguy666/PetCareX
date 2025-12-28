export const GET_BRANCHES_REVENUE = `
  SELECT * FROM fn_statistics_branches_revenue()
`;

export const GET_DOCTORS_REVENUE = `
  SELECT * FROM fn_statistics_doctors_revenue()
`;

export const GET_APPOINTMENTS_BY_BRANCH = `
  SELECT * FROM fn_statistic_appointments_by_branch($1)
`;

export const GET_APPOINTMENTS_ALL = `
  SELECT * FROM fn_statistic_appointments_all()
`;

export const GET_PRODUCTS_REVENUE_BY_BRANCH = `
  SELECT * FROM fn_statistics_products_revenue_by_branch($1)
`;

export const GET_PRODUCTS_REVENUE_ALL = `
  SELECT * FROM fn_statistics_products_revenue_all()
`;
