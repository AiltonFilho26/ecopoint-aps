import express from "express";
import prisma from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const types = await prisma.wasteType.findMany();
  res.json(types);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const newType = await prisma.wasteType.create({ data: { name } });
  res.json(newType);
});

export default router;
