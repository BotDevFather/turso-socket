const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = async (req, res) => {

  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    // Create table automatically
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // POST
    // =========================

    if (req.method === "POST") {

      const { name, content } = req.body;

      if (!name || !content) {
        return res.status(400).json({
          success: false,
          message: "Missing name or content"
        });
      }

      await db.execute({
        sql: `
          INSERT INTO posts (name, content)
          VALUES (?, ?)
        `,
        args: [name, content]
      });

      return res.json({
        success: true,
        message: "Saved successfully"
      });
    }

    // =========================
    // GET
    // =========================

    if (req.method === "GET") {

      const result = await db.execute(`
        SELECT * FROM posts
        ORDER BY id DESC
      `);

      return res.json({
        success: true,
        data: result.rows
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
