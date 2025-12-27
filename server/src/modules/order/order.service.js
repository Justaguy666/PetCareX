import authRepo from "../auth/auth.repo.js";
import orderRepo from "./order.repo.js";

class OrderController {
    buy = async (account_id, branch_id, items, payment_method) => {
        const user = await authRepo.findUserById(account_id);

        return orderRepo.buy(user.id, branch_id, items, payment_method);
    }
}

export default new OrderController();