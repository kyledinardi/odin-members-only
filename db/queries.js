const pool = require('./pool');

exports.custom = async (q) => {
  const result = await pool.query(q);
  return result;
};

exports.getAllUsers = async () => {
  const { rows } = await pool.query(`SELECT * FROM users`);
  return rows;
};

exports.getUserByUsername = async (username) => {
  const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);

  return result.rows[0];
};

exports.getUserById = async (userId) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    userId,
  ]);

  return result.rows[0];
};

exports.createUser = async (user) => {
  await pool.query(
    `
      INSERT INTO users (
          first_name,
          last_name,
          username,
          password_hash,
          is_Member,
          is_Admin
        )
      VALUES ($1, $2, $3, $4, 'false', 'false')
      RETURNING id;
    `,
    [user.firstName, user.lastName, user.username, user.passHash],
  );
};

exports.updateUserMembership = async (userId) => {
  await pool.query(`UPDATE users SET is_member = true WHERE id = $1`, [userId]);
};

exports.updateUserAdminStatus = async (userId) => {
  await pool.query(`Update users SET is_admin = true WHERE id = $1`, [userId]);
};

exports.getAllMessages = async () => {
  const { rows } = await pool.query(
    `
      SELECT messages.id AS message_id,
        messages.user_id,
        messages.title,
        messages.timestamp,
        messages.text,
        users.first_name,
        users.last_name
      FROM messages
        JOIN users ON messages.user_id = users.id;
    `,
  );

  return rows;
};

exports.createMessage = async (message) => {
  await pool.query(
    `
      INSERT INTO messages (user_id, title, timestamp, text)
      VALUES ($1, $2, $3, $4);
    `,
    [message.userId, message.title, message.timestamp, message.text],
  );
};

exports.deleteMessage = async (messageId) => {
  await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);
};
