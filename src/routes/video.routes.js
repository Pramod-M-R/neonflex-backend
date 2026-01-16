import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

/**
 * ADMIN — Add a video
 */
router.post(
  "/admin/videos",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        thumbnail_url,
        stream_asset_id,
        duration
      } = req.body;

      if (!title || !stream_asset_id) {
        return res.status(400).json({
          error: "Title and stream_asset_id are required"
        });
      }

      const result = await pool.query(
        `
        INSERT INTO videos
        (id, title, description, thumbnail_url, stream_asset_id, duration)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          uuidv4(),
          title,
          description || "",
          thumbnail_url || "",
          stream_asset_id,
          duration || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * VIEWER — List all videos
 */
router.get("/videos", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM videos ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
