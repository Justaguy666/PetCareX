import db from "../../config/db.js";
import * as Q from "./catalog.query.js";

class CatalogRepo {
  async listDoctors() {
    const result = await db.query(Q.LIST_DOCTORS);
    return result.rows;
  }

  async listDoctorsByBranch(branchId) {
    const result = await db.query(Q.LIST_DOCTORS_BY_BRANCH, [branchId]);
    return result.rows;
  }

  async listVaccines() {
    const result = await db.query(Q.LIST_VACCINES);
    return result.rows;
  }

  async listVaccinePackages() {
    const result = await db.query(Q.LIST_VACCINE_PACKAGES);
    return result.rows;
  }
}

export default new CatalogRepo();
