import app from "./app.js";
import { initDatabase } from "./db/index.js";

const PORT = process.env.PORT || 4000;

(async () => {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 NeonFlex backend running on port ${PORT}`);
  });
})();
