class User {
  static async create(pool, { email, password }) {
    const query = `
      INSERT INTO users (email, password_hash, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, email, created_at
    `;
    const result = await pool.query(query, [email, password]);
    return result.rows[0];
  }

  static async findByEmail(pool, email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
}
