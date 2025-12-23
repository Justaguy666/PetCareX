import * as userService from './user.service.js';

export const example = async (req, res, next) => {
  try {
    res.json({ message: 'user controller works' });
  } catch (err) {
    next(err);
  }
};