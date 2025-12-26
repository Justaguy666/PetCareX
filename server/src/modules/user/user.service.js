import authRepo from "../auth/auth.repo.js";
import userRepo from "./user.repo.js";

class UserService {
    buyProduct = async (account_id, branch_id, items, payment_method) => {
        const user = await authRepo.findUserById(account_id);

        return userRepo.buyProducts(user.id, branch_id, items, payment_method);
    }
}

export default new UserService();