export const getEnv = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value ?? defaultValue;
};
