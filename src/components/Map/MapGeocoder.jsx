import { useEffect, useState } from "react";
import { useMap, Marker } from "react-map-gl/maplibre";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

//Custom local geocoder function to handle cordinate search
const coordinatesGeocoder = function (query) {
	// Match anything which looks like decimal degrees coordinate pair.
	const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
	if (!matches) {
		return null;
	}

	//Function to create a GeoJSON feature for coordinates
	function coordinateFeature(lng, lat) {
		return {
			center: [lng, lat],
			geometry: {
				type: "Point",
				coordinates: [lng, lat],
			},
			place_name: "Lat: " + lat + " Lng: " + lng,
			place_type: ["coordinate"],
			properties: {},
			type: "Feature",
		};
	}

	const coord1 = Number(matches[1]);
	const coord2 = Number(matches[2]);
	const geocodes = [];
	//If the second coordinate is outside the latitude range, assume it is longitude
	if (coord2 < -90 || coord2 > 90) {
		// must be lat, lng
		geocodes.push(coordinateFeature(coord2, coord1));
	}
	//If the first coordinate is outside the latitude range, assume it is longitude
	if (coord1 < -90 || coord1 > 90) {
		// must be lng, lat
		geocodes.push(coordinateFeature(coord1, coord2));
	}
	//if both coordinates are within the valid latitude range, assume either order
	if (geocodes.length === 0) {
		// else could be either lng, lat or lat, lng
		geocodes.push(coordinateFeature(coord2, coord1));
		geocodes.push(coordinateFeature(coord1, coord2));
	}

	return geocodes;
};

function MapGeocoder() {
	const { current: map } = useMap();// Get the current map instance using useMap hook

	const [markerCoordinates, setMarkerCoordinates] = useState(null);//State to store the coordinates of the marker

	useEffect(() => {
		const geocoder_div = document.getElementById("geocoder");// Get the geocoder div by its ID
		if (geocoder_div) {
			if (map) {
                console.log("TOKEN",import.meta.env.VITE_MAP_BOX_PROVIDER_ACCESS_TOKEN)
				const geocoder = new MapboxGeocoder({
					accessToken: import.meta.env.VITE_MAP_BOX_PROVIDER_ACCESS_TOKEN,
					placeholder: "Search with place name, coordinates",
					marker: false,
					localGeocoder: coordinatesGeocoder,//use custom local geocoder for coordinate search
				});
				geocoder.on("result", (selected) => {
					//Event listener for geocoder result
					console.log(selected);
					setMarkerCoordinates({
						longitude: selected?.result?.center?.[0],
						latitude: selected?.result?.center?.[1],
					});
				});
				geocoder_div.innerHTML = "";//Clear the existing geocoder div content
				geocoder_div.appendChild(geocoder.onAdd(map));// Add the geocoder to the map
			}

			return () => {
				geocoder_div.innerHTML = "";//Cleanup the geocoder div content on unmount
			};
		}
	}, [map]);

	return (
		<>
			{/* Render the mark on the map if coordinates are set */}
			{markerCoordinates && (
				<Marker
					longitude={markerCoordinates.longitude}
					latitude={markerCoordinates.latitude}
					anchor="bottom"
				/>
			)}
			<div
				id="geocoder"//Geocoder div for search input
				style={{
					position: "absolute",
					top: "90px",
					left: "16px",
					// marginLeft: "20px",
					marginTop: "10px",
					display: "block",
					width: "100%",
					maxWidth: "300px",
				}}
			></div>
		</>
	);
}

export default MapGeocoder;
