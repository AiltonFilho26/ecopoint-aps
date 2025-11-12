import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pointsRoutes from "./routes/points.js";
import typesRoutes from "./routes/types.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/points", pointsRoutes);
app.use("/api/types", typesRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`🚀 EcoPoint API rodando na porta ${PORT}`)
);
