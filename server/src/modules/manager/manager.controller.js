import { 
  BadRequestError,
} from "../../errors/app.error.js";
import managerService from './manager.service.js';

const statsTypes = ['branch', 'doctor'];

class ManagerController {
    getRevenueStatistics = async (req, res) => {
        const type = req.params.type;

        if (!type) {
          throw new BadRequestError("Type parameter is required");
        }

        if (!statsTypes.includes(type)) {
          throw new BadRequestError(`Invalid type parameter. Allowed values are: ${statsTypes.join(', ')}`);
        }

        const result = await managerService.getRevenueStatistics(type);

        const metadata = {
          type: type,
          total_records: result.length,
          total: result.reduce((sum, record) => sum + parseFloat(record.total_revenue), 0),
        }

        return res.status(200).json({ 
          data: result,
          metadata: metadata,
        });
    }

    // getAppointmentStatistics = async (req, res) => {
    //     const result = await managerService.getAppointmentStatistics();
        
    //     return res.status(200).json({ data: result });
    // }

    // getProductRevenueStatistics = async (req, res) => {
    //     const result = await managerService.getProductRevenueStatistics();
        
    //     return res.status(200).json({ data: result });
    // }
}

export default new ManagerController();