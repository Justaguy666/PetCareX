export const GET_ALL_BRANCHES = `
  SELECT * FROM branches
`;

export const GET_BRANCH_BY_ID = `
  SELECT * FROM branches WHERE id = $1
`;

export const CREATE_BRANCH = `
  INSERT INTO branches (branch_name, address, phone_number)
  VALUES ($1, $2, $3)
  RETURNING *
`;

export const UPDATE_BRANCH = `
  UPDATE branches
  SET branch_name = $1, address = $2, phone_number = $3
  WHERE id = $4
  RETURNING *
`;

export const DELETE_BRANCH = `
  DELETE FROM branches WHERE id = $1
`;

