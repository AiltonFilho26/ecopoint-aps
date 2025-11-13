import express from "express";
import prisma from "../db.js";
import { getDistanceFromLatLonInKm } from "../utils/distance.js";
import { getCoordsFromText } from "../utils/geocoding.js";
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
  const { lat, lon, typeIds, address } = req.query;

  let userLat, userLng;

  try {
    if (lat && lon) {
      userLat = parseFloat(lat);
      userLng = parseFloat(lon);
    } else if (address) {
      console.log("Buscando coordenadas para:", address);
      const coords = await getCoordsFromText(address);
      userLat = coords.lat;
      userLng = coords.lng;
      console.log("Coordenadas obtidas:", coords);
    } else {
      return res.status(400).json({
        error: "Parâmetros de localização são obrigatórios.",
      });
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

    const points = await prisma.point.findMany({
      where: filter,
      include: { wasteTypes: { include: { wasteType: true } } },
    });

    if (!points.length)
      return res.status(404).json({ error: "Nenhum ponto encontrado." });

    const pointsWithDistance = points.map((point) => {
      const distance = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        point.latitude,
        point.longitude
      );
      return { ...point, distanceInKm: distance };
    });

    pointsWithDistance.sort((a, b) => a.distanceInKm - b.distanceInKm);
    const nearestFive = pointsWithDistance.slice(0, 5);

    res.json(nearestFive);
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
