import dashboardRepo from "./dashboard.repo.js";
import authRepo from "../auth/auth.repo.js";

class DashboardService {
    getStats = async (account) => {
        const { id: accountId, role } = account;

        if (role === 'Khách hàng') {
            const user = await authRepo.findUserById(accountId);
            return dashboardRepo.getCustomerStats(user.id);
        }

        if (role === 'Quản lý chi nhánh') {
            return dashboardRepo.getAdminStats();
        }

        if (role === 'Bác sĩ thú y') {
            const employee = await authRepo.findEmployeeById(accountId);
            return dashboardRepo.getVetStats(employee.id);
        }

        if (role === 'Nhân viên tiếp tân') {
            return dashboardRepo.getReceptionistStats();
        }

        // Default or other roles
        return { message: 'Dashboard not implemented for this role' };
    }

    getPublicStats = async () => {
        return dashboardRepo.getPublicStats();
    }
}

export default new DashboardService();
