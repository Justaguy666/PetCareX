import db from '../../config/db.js';

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

    const query = `
      SELECT 
        p.*, 
        u.id AS owner_id, u.full_name AS owner_name,
        la.appointment_time AS last_appointment_time,
        COUNT(*) OVER() AS total_count
      FROM pets p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN LATERAL (
        SELECT appointment_time
        FROM appointments
        WHERE pet_id = p.id AND status = 'Hoàn thành'
        ORDER BY appointment_time DESC
        LIMIT 1
      ) la ON true
      ${whereSql}
      ORDER BY p.id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(pageSize);
    params.push(offset);

    const { rows } = await db.query(query, params);

    const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;
    // remove total_count from each row before returning
    const cleaned = rows.map((r) => {
      const { total_count, ...rest } = r;
      return rest;
    });

    return { rows: cleaned, total };
  };

  fetchPetById = async (petId) => {
    const query = `
      SELECT 
        p.*, 
        u.id AS owner_id, u.full_name AS owner_name,
        la.id AS last_appointment_id,
        la.appointment_time AS last_appointment_time
      FROM pets p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN LATERAL (
        SELECT id, appointment_time
        FROM appointments
        WHERE pet_id = p.id AND status = 'Hoàn thành'
        ORDER BY appointment_time DESC
        LIMIT 1
      ) la ON true
      WHERE p.id = $1
    `;

    const { rows } = await db.query(query, [petId]);
    return rows[0] || null;
  };
};

export default new PetRepo();