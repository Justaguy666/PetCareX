import {
  UnauthorizedError,
  BadRequestError,
} from "../../errors/app.error.js";
import userService from "./user.service.js";

class UserController {
  listOrders = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const orders = await userService.listOrders(accountId);
    res.status(200).json({
      data: orders
    });
  }

  listAppointments = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const appointments = await userService.listAppointments(accountId);
    res.status(200).json({
      data: appointments
    });
  }

  listPets = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const pets = await userService.listPets(accountId);
    res.status(200).json({
      data: pets
    });
  }

  createPet = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const petData = req.body;
    const newPet = await userService.createPet(accountId, petData);

    res.status(201).json({
      data: newPet,
      message: 'Pet created successfully'
    });
  }

  updateProfile = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const updateData = req.body;
    await userService.updateProfile(accountId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  }

  getDashboardStats = async (req, res) => {
    const accountId = req.account.id;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const stats = await userService.getDashboardStats(accountId);
    res.status(200).json({
      data: stats
    });
  }
}

export default new UserController();