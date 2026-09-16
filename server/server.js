import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./services/auth-service.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`🚀 SajiloMarts Express Backend running on port ${PORT}`);
  });
}

startServer();
