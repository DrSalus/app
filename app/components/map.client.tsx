import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { ErrorBoundary } from "./errorBoundary";
import NonIdealState from "./nonIdealState";
import { StopCircleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";

export default function Map(p: {
  name: string;
  height: number;
  width: number;
  locations: { lat: number; lng: number }[];
}) {
  const accessToken =
    "pk.eyJ1Ijoia2VpeCIsImEiOiJjaWxuZmd5bGowMDA3eG5tMGxsNGExaTFkIn0.NVKDhlurVQyIogw6hH5fOA";
  return (
    <ErrorBoundary
      fallbackRender={() => (
        <NonIdealState
          className="p-4"
          icon={<StopCircleIcon />}
          title="Something went wrong"
        />
      )}
    >
      <MapContainer
        style={{ height: p.height, width: p.width }}
        zoom={13}
        center={p.locations[0]}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="Mapbox"
          url={
            "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=" +
            accessToken
          }
        />
        <MapPositions {...p} />
      </MapContainer>
    </ErrorBoundary>
  );
}

function MapPositions(p: {
  name: string;
  locations: { lat: number; lng: number }[];
}) {
  const map = useMap();

  // useEffect(() => {
  //   if (p.locations.length > 1) {
  //     map.fitBounds(
  //       p.locations.map((p) => [p.lat, p.lng]),
  //       { padding: [50, 50] }
  //     );
  //   } else if (p.locations.length === 1) {
  //     map.panTo(p.locations[0]);
  //   }
  // }, [p.locations]);
  return (
    <>
      {p.locations.map((l, i) => (
        <Marker key={i} position={l}>
          <Tooltip>{p.name}</Tooltip>
        </Marker>
      ))}
    </>
  );
}
