import { 
  UnauthorizedError, 
  BadRequestError,
} from "../../errors/app.error.js";
import userService from "./user.service.js";

class UserController {
    listOrders = async (req, res) => {
      const accountId = req.account.id;
      if(!accountId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const orders = await userService.listOrders(accountId);
      res.status(200).json({
        data: orders
      });
    }

    listAppointments = async (req, res) => {
      const accountId = req.account.id;
      if(!accountId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const appointments = await userService.listAppointments(accountId);
      res.status(200).json({
        data: appointments
      });
    }
}

export default new UserController();