import { 
  UnauthorizedError, 
  BadRequestError,
} from "../../errors/app.error.js";
import userService from "./user.service.js";

class UserController {
    buyProducts = async (req, res) => {
        const accountId = req.account.id;
        const { branch_id, items, payment_method } = req.body;

        if(!accountId) {
          throw new UnauthorizedError("Unauthorized");
        }

        if(!branch_id || !payment_method) {
          throw new BadRequestError("Branch_id is required");
        }

        if (!Array.isArray(items) || items.length === 0) {
          throw new BadRequestError("Items must be a non-empty array");
        }

        const result = await userService.buyProduct(accountId, branch_id, items, payment_method);

        return res.status(201).json({ data: result });
    }
}

export default new UserController();