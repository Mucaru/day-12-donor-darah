"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon (Leaflet + bundler issue)
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type LatLng = { lat: number; lng: number };

interface LocationPickerInnerProps {
  value: LatLng | null;
  onChange: (coords: LatLng) => void;
  defaultCenter?: LatLng;
}

function ClickHandler({ onChange }: { onChange: (coords: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Fly ke koordinat baru kalau value berubah dari SUMBER LUAR
 * (misal tombol "Gunakan lokasi saya"), bukan dari klik di map itu sendiri
 * (biar gak fight sama interaksi user yang lagi geser2 map manual).
 */
function RecenterOnExternalChange({ value }: { value: LatLng | null }) {
  const map = useMap();
  const lastValueRef = useRef<LatLng | null>(value);

  useEffect(() => {
    if (!value) return;
    const last = lastValueRef.current;
    const changed =
      !last ||
      Math.abs(last.lat - value.lat) > 0.0001 ||
      Math.abs(last.lng - value.lng) > 0.0001;

    if (changed) {
      map.flyTo([value.lat, value.lng], 14, { duration: 1 });
    }
    lastValueRef.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  return null;
}

export default function LocationPickerInner({
  value,
  onChange,
  defaultCenter = { lat: -6.2, lng: 106.816666 }, // Jakarta default
}: LocationPickerInnerProps) {
  const [center] = useState(value ?? defaultCenter);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%", borderRadius: "var(--radius)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value && <Marker position={[value.lat, value.lng]} icon={markerIcon} />}
      <ClickHandler onChange={onChange} />
      <RecenterOnExternalChange value={value} />
    </MapContainer>
  );
}