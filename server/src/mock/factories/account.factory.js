import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const usedUsernames = new Set();

const generateUniqueUsername = (overridesValue) => {
  if (overridesValue) return overridesValue;
  
  let username;
  let retries = 0;
  const maxRetries = 100000;
  
  do {
    if (typeof faker.internet.userName === 'function') {
      username = faker.internet.userName();
    } else {
      username = `${faker.person.firstName().toLowerCase()}.${faker.person.lastName().toLowerCase()}${faker.number.int({ min: 1, max: 9999 })}`;
    }
    retries++;
    if (retries > maxRetries) {
      throw new Error('Exceeded maximum retries for generating unique username');
    }
  } while (usedUsernames.has(username));
  
  usedUsernames.add(username);
  return username;
};

const accountTypeLabels = loadEnum('account-type') || [];

// Prisma enum keys in the same logical order as labels in account-type.json
const ACCOUNT_TYPE_KEYS = [
  'KhachHang',
  'BacSiThuY',
  'NhanVienTiepTan',
  'NhanVienBanHang',
  'QuanLyChiNhanh',
];

const labelToKey = accountTypeLabels.reduce((acc, label, idx) => {
  acc[label] = ACCOUNT_TYPE_KEYS[idx];
  return acc;
}, {});

const normalizeToEnumKey = (value) => {
  if (!value) return null;
  // if already an enum key
  if (ACCOUNT_TYPE_KEYS.includes(value)) return value;
  // if matches a label
  if (labelToKey[value]) return labelToKey[value];
  // fallback: try case-insensitive match
  const found = accountTypeLabels.find(l => l.toLowerCase() === String(value).toLowerCase());
  if (found) return labelToKey[found];
  return null;
};

export default (overrides = {}) => {
  const pickedLabel = overrides.account_type || faker.helpers.arrayElement(accountTypeLabels);
  const account_type = normalizeToEnumKey(pickedLabel) || ACCOUNT_TYPE_KEYS[0];

  const isCustomer = account_type === 'KhachHang';

  const user_id = overrides.user_id ?? (isCustomer ? faker.number.int({ min: 1, max: 1000000 }) : null);
  const employee_id = overrides.employee_id ?? (!isCustomer ? faker.number.int({ min: 1, max: 1000000 }) : null);

  return {
    user_id,
    employee_id,
    username: generateUniqueUsername(overrides.username),
    hashed_password: overrides.hashed_password || faker.internet.password(),
    is_active: overrides.is_active ?? faker.datatype.boolean(),
    last_login_at: overrides.last_login_at || faker.date.recent().toISOString(),
    account_type,
  };
};