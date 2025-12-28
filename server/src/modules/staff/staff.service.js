import staffRepo from './staff.repo.js';
import bcrypt from 'bcrypt';

const staffService = {
  getAllStaff: async () => {
    return await staffRepo.getAllStaff();
  },

  createStaff: async (staffData) => {
    const { fullName, email, password, role, branchId } = staffData;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return await staffRepo.createStaff(fullName, role, email, hashedPassword, branchId);
  },
};

export default staffService;
