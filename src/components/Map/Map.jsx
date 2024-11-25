import React, { useEffect, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./MapComponent.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Function to calculate the centroid of a polygon
const calculateCentroid = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return null; // Return null if the coordinates are invalid
  }

  let totalLongitude = 0;
  let totalLatitude = 0;
  let count = 0;

  coordinates[0].forEach(([longitude, latitude]) => {
    if (!isNaN(longitude) && !isNaN(latitude)) {
      totalLongitude += longitude;
      totalLatitude += latitude;
      count++;
    }
  });

  if (count === 0) {
    return null; // No valid points to calculate a centroid
  }

  const centroidLongitude = totalLongitude / count;
  const centroidLatitude = totalLatitude / count;

  return {
    longitude: parseFloat(centroidLongitude.toFixed(3)),
    latitude: parseFloat(centroidLatitude.toFixed(3)),
  };
};

const MapComponent = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [indonesiaGeoJSON, setIndonesiaGeoJSON] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null); // State to keep clicked popup open
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indonesiaResponse, pondsResponse] = await Promise.all([
          fetch("/Indonesia_oil_palm_concessions.geojson"),
          fetch("/telangana_ponds_final_cleaned.geojson"),
        ]);

        if (!indonesiaResponse.ok) {
          throw new Error(
            `Failed to fetch Indonesia GeoJSON: ${indonesiaResponse.statusText}`
          );
        }
        if (!pondsResponse.ok) {
          throw new Error(
            `Failed to fetch ponds GeoJSON: ${pondsResponse.statusText}`
          );
        }

        const indonesiaData = await indonesiaResponse.json();
        const pondsData = await pondsResponse.json();

        setIndonesiaGeoJSON(indonesiaData);
        setGeojsonData(pondsData);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleMouseEnter = (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const { properties, geometry } = feature;

    if (geometry && geometry.coordinates) {
      const centroid = calculateCentroid(geometry.coordinates);

      if (centroid) {
        setHoverInfo({
          longitude: centroid.longitude,
          latitude: centroid.latitude,
          areaHa: properties.area_ha || "N/A",
          company: properties.company || "N/A",
          country: properties.country || "N/A",
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleClick = (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const { properties, geometry } = feature;

    if (geometry && geometry.coordinates) {
      const centroid = calculateCentroid(geometry.coordinates);

      if (centroid) {
        setPopupInfo({
          longitude: centroid.longitude,
          latitude: centroid.latitude,
          areaHa: properties.area_ha || "N/A",
          company: properties.company || "N/A",
          country: properties.country || "N/A",
        });
      }
    }
  };

  const openInGoogleMaps = (longitude, latitude) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && (
        <Map
          initialViewState={{
            longitude: 117.9903, // Centered over Indonesia
            latitude: -2.5489,
            zoom: 5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${
            import.meta.env.VITE_MAPTILER_KEY
          }`}
          mapLib={maplibregl}
          interactiveLayerIds={["indonesia-boundaries"]}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {indonesiaGeoJSON && (
            <Source id="indonesia-boundaries" type="geojson" data={indonesiaGeoJSON}>
              <Layer
                id="indonesia-boundaries"
                type="fill"
                paint={{
                  "fill-color": "#ffcccb",
                  "fill-opacity": 0.5,
                }}
              />
              <Layer
                id="indonesia-boundaries-line"
                type="line"
                paint={{
                  "line-color": "#ff0000",
                  "line-width": 2,
                }}
              />
            </Source>
          )}

          {hoverInfo &&
            hoverInfo.longitude !== undefined &&
            hoverInfo.latitude !== undefined && (
              <Popup
                longitude={hoverInfo.longitude}
                latitude={hoverInfo.latitude}
                closeButton={false}
                closeOnClick={false}
                anchor="top"
              >
                <div>
                  <p><strong>Country:</strong> {hoverInfo.country}</p>
                  <p><strong>Area (Ha):</strong> {hoverInfo.areaHa}</p>
                  <p><strong>Company:</strong> {hoverInfo.company}</p>
                  <p>
                    <strong>Centroid(lat, long):</strong> {hoverInfo.latitude}, {hoverInfo.longitude}
                  </p>
                  <button
                    onClick={() =>
                      openInGoogleMaps(hoverInfo.longitude, hoverInfo.latitude)
                    }
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      background: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Open in Google Maps
                  </button>
                </div>
              </Popup>
            )}

          {popupInfo &&
            popupInfo.longitude !== undefined &&
            popupInfo.latitude !== undefined && (
              <Popup
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                closeButton={true}
                closeOnClick={true}
                anchor="top"
                onClose={() => setPopupInfo(null)}
              >
                <div>
                  <p><strong>Country:</strong> {popupInfo.country}</p>
                  <p><strong>Area (Ha):</strong> {popupInfo.areaHa}</p>
                  <p><strong>Company:</strong> {popupInfo.company}</p>
                  <p>
                    <strong>Centroid(lat, long):</strong> {popupInfo.latitude}, {popupInfo.longitude}
                  </p>
                  <button
                    onClick={() =>
                      openInGoogleMaps(popupInfo.longitude, popupInfo.latitude)
                    }
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      background: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Open in Google Maps
                  </button>
                </div>
              </Popup>
            )}
        </Map>
      )}
    </div>
  );
};

export default MapComponent;
