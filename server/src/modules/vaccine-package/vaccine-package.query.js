export const GET_ALL_VACCINE_PACKAGES = `
  SELECT id, package_name as name, monthly_milestone, cycle, price FROM vaccine_packages
`;
