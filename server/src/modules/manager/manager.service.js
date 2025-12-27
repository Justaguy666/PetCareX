import managerRepo from './manager.repo.js';

class ManagerService {
    getRevenueStatistics = async (type) => {
        const result = await managerRepo.fetchRevenueStatistics(type);

        return result;
    };
    
    getAppointmentStatistics = async (branch_id) => {
        const result = await managerRepo.fetchAppointmentStatistics(branch_id);

        return result;
    };

    getProductRevenueStatistics = async (branch_id) => {
        const result = await managerRepo.fetchProductRevenueStatistics(branch_id);

        return result;
    };
};

export default new ManagerService();