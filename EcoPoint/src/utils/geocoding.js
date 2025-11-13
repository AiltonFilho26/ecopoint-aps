import "dotenv/config";
import axios from "axios";

export async function getCoordsFromText(queryText) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = "https://maps.googleapis.com/maps/api/geocode/json";

  try {
    const response = await axios.get(url, {
      params: {
        address: queryText,
        key: apiKey,
        components: "country:BR|administrative_area:Goiás",
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Endereço não encontrado.");
    }
  } catch (error) {
    console.error("Erro na API de Geocoding:", error.message);
    throw new Error("Não foi possível converter o endereço em coordenadas.");
  }
}
