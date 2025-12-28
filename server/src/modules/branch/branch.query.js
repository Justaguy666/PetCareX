export const GET_ALL_BRANCHES = `
  SELECT * FROM branches
`;

export const GET_BRANCH_BY_ID = `
  SELECT * FROM branches WHERE id = $1
`;
