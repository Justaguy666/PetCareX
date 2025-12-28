import db from "../../config/db.js";
import * as Q from "./user.query.js";

class UserRepo {
  listOrders = async (user_id) => {
    const result = await db.query(Q.LIST_ORDERS, [user_id]);
    return result.rows;
  }

  listAppointments = async (user_id) => {
    const result = await db.query(Q.LIST_APPOINTMENTS, [user_id]);
    return result.rows;
  }

  listPets = async (user_id) => {
    const result = await db.query(Q.LIST_PETS, [user_id]);
    return result.rows;
  }

  createPet = async (user_id, petData) => {
    const { pet_name, species, breed, date_of_birth, gender } = petData;
    const values = [pet_name, species, breed || null, date_of_birth || null, gender, user_id];
    const result = await db.query(Q.CREATE_PET, values);
    return result.rows[0];
  }

  updateProfile = async (user_id, updateData) => {
    const { fullName, phone_number, citizen_id, gender, date_of_birth } = updateData;
    const values = [fullName, phone_number, citizen_id, gender, date_of_birth, user_id];
    const result = await db.query(Q.UPDATE_PROFILE, values);
    return result.rows[0];
  }

  getDashboardStats = async (user_id) => {
    const petsCountRes = await db.query(Q.COUNT_PETS, [user_id]);
    const ordersStatsRes = await db.query(Q.COUNT_ORDERS_STATS, [user_id]);
    const appointmentsCountRes = await db.query(Q.COUNT_UPCOMING_APPOINTMENTS, [user_id]);
    const recentOrders = await this.listOrders(user_id);
    const upcomingAppointmentsRes = await db.query(Q.GET_UPCOMING_APPOINTMENTS, [user_id]);

    const totalSpent = parseFloat(ordersStatsRes.rows[0].total_spent || 0);
    const loyaltyPoints = Math.floor(totalSpent / 100000);

    return {
      stats: {
        totalPets: parseInt(petsCountRes.rows[0].count),
        totalOrders: parseInt(ordersStatsRes.rows[0].count),
        upcomingAppointments: parseInt(appointmentsCountRes.rows[0].count),
        loyaltyPoints: loyaltyPoints
      },
      recentOrders: recentOrders.slice(0, 3),
      upcomingAppointments: upcomingAppointmentsRes.rows
    };
  }
}

export default new UserRepo();