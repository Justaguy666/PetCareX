export const now = () => new Date();

export const addMinutes = (date, minutes) =>
  new Date(date.getTime() + minutes * 60000);

export const toISOString = (date = new Date()) =>
  date.toISOString();
