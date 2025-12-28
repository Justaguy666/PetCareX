import dashboardService from "./dashboard.service.js";

class DashboardController {
    getStats = async (req, res) => {
        const account = req.account;
        const stats = await dashboardService.getStats(account);
        res.status(200).json({
            data: stats
        });
    }

    getPublicStats = async (req, res) => {
        const stats = await dashboardService.getPublicStats();
        res.status(200).json({
            data: stats
        });
    }
}

export default new DashboardController();
