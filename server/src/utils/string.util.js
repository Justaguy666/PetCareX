export const slugify = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const capitalize = (text = '') =>
  text.charAt(0).toUpperCase() + text.slice(1);
