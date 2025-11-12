import express from "express";
import prisma from "../db.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, description, latitude, longitude, address, wasteTypeIds } =
    req.body;

  if (!wasteTypeIds || !Array.isArray(wasteTypeIds)) {
    return res.status(400).json({
      error:
        "O campo 'wasteTypeIds' deve ser uma lista de IDs de tipos de resíduos.",
    });
  }

  try {
    const point = await prisma.point.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        address,
        wasteTypes: {
          create: wasteTypeIds.map((id) => ({
            wasteType: { connect: { id } },
          })),
        },
      },
      include: {
        wasteTypes: { include: { wasteType: true } },
      },
    });

    res.status(201).json(point);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  const { typeIds } = req.query;
  let filter = {};

  if (typeIds) {
    const ids = typeIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    if (ids.length > 0) {
      filter = {
        wasteTypes: {
          some: {
            wasteTypeId: { in: ids },
          },
        },
      };
    }
  }

  try {
    const points = await prisma.point.findMany({
      where: filter,
      include: { wasteTypes: { include: { wasteType: true } } },
    });

    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/nearest", async (req, res) => {
  const { lat, lng, typeIds } = req.query;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude e longitude são obrigatórias." });
  }

  let filter = {};
  if (typeIds) {
    const ids = typeIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    if (ids.length > 0) {
      filter = {
        wasteTypes: {
          some: { wasteTypeId: { in: ids } },
        },
      };
    }
  }

  try {
    const points = await prisma.point.findMany({
      where: filter,
      include: { wasteTypes: { include: { wasteType: true } } },
    });

    if (!points.length)
      return res.status(404).json({ error: "Nenhum ponto encontrado." });

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const nearest = points.reduce((prev, curr) => {
      const distPrev = Math.sqrt(
        (prev.latitude - latNum) ** 2 + (prev.longitude - lngNum) ** 2
      );
      const distCurr = Math.sqrt(
        (curr.latitude - latNum) ** 2 + (curr.longitude - lngNum) ** 2
      );
      return distCurr < distPrev ? curr : prev;
    });

    res.json(nearest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { wasteTypeIds } = req.body;

  if (!Array.isArray(wasteTypeIds)) {
    return res
      .status(400)
      .json({ error: "O campo 'wasteTypeIds' deve ser um array de IDs." });
  }

  try {
    await prisma.pointWaste.deleteMany({ where: { pointId: id } });

    const updated = await prisma.point.update({
      where: { id: id },
      data: {
        wasteTypes: {
          create: wasteTypeIds.map((wasteTypeId) => ({
            wasteType: { connect: { id: wasteTypeId } },
          })),
        },
      },
      include: { wasteTypes: { include: { wasteType: true } } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
