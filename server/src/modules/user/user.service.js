import authRepo from "../auth/auth.repo.js";
import userRepo from "./user.repo.js";

class UserService {
    listOrders = async (account_id) => {
        const user = await authRepo.findUserById(account_id);

        return userRepo.listOrders(user.id);
    }

    listAppointments = async (account_id) => {
        const user = await authRepo.findUserById(account_id);

        return userRepo.listAppointments(user.id);
    }
}

export default new UserService();