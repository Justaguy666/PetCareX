import managerRepo from './manager.repo.js';

class ManagerService {
    getRevenueStatistics = async (type) => {
        const result = await managerRepo.fetchRevenueStatistics(type);

        return result;
    };
    
    // getAppointmentStatistics = async () => {
    //     const result = await managerRepo.fetchAppointmentStatistics();

    //     return result;
    // };

    // getProductRevenueStatistics = async () => {
    //     const result = await managerRepo.fetchProductRevenueStatistics();

    //     return result;
    // };
};

export default new ManagerService();