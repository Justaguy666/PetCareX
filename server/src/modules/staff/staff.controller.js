import staffService from './staff.service.js';

const staffController = {
  getAllStaff: async (req, res, next) => {
    try {
      const staff = await staffService.getAllStaff();
      res.status(200).json(staff);
    } catch (error) {
      next(error);
    }
  },

  createStaff: async (req, res, next) => {
    try {
      const newStaff = await staffService.createStaff(req.body);
      res.status(201).json(newStaff);
    } catch (error) {
      next(error);
    }
  },
};

export default staffController;
