import { Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * LOGIN WITH EMAIL
 * First user becomes ADMIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUser.rows.length === 0) {
      // First user becomes ADMIN
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM users"
      );

      const role =
        parseInt(countResult.rows[0].count) === 0
          ? "ADMIN"
          : "VIEWER";

      const newUser = await pool.query(
        "INSERT INTO users (id, email, role) VALUES ($1, $2, $3) RETURNING *",
        [uuidv4(), email, role]
      );

      user = newUser.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    });

    res.json({
      message: "Logged in successfully",
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET CURRENT USER
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
