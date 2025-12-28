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

    listPets = async (account_id) => {
        const user = await authRepo.findUserById(account_id);

        return userRepo.listPets(user.id);
    }

    createPet = async (account_id, petData) => {
        const user = await authRepo.findUserById(account_id);

        return userRepo.createPet(user.id, petData);
    }

    updateProfile = async (account_id, updateData) => {
        const user = await authRepo.findUserById(account_id);
        return userRepo.updateProfile(user.id, updateData);
    }

    getDashboardStats = async (account_id) => {
        const user = await authRepo.findUserById(account_id);
        return userRepo.getDashboardStats(user.id);
    }
}

export default new UserService();