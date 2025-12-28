import db from '../../config/db.js';
import * as Q from './pet.query.js';

class PetRepo {
  fetchPets = async ({ page = 1, pageSize = 10, keyword = '' } = {}) => {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    const params = [];

    if (keyword && keyword.trim()) {
      params.push(`%${keyword.trim()}%`);
      params.push(`%${keyword.trim()}%`);
      whereClauses.push(`(p.pet_name ILIKE $${params.length - 1} OR u.full_name ILIKE $${params.length})`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = Q.FETCH_PETS + ` ${whereSql} ORDER BY p.id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(pageSize);
    params.push(offset);

    const { rows } = await db.query(query, params);
    const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;
    const cleaned = rows.map((r) => {
      const { total_count, ...rest } = r;
      return rest;
    });

    return { rows: cleaned, total };
  };

  fetchPetById = async (petId) => {
    const { rows } = await db.query(Q.FETCH_PET_BY_ID, [petId]);
    return rows[0] || null;
  };
}

export default new PetRepo();