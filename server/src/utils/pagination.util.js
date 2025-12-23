export const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  return {
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};
