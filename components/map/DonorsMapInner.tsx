"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { bloodTypeLabel } from "@/lib/blood-type";
import type { DonorSearchResult } from "@/actions/donor.actions";

const donorIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DonorsMapInnerProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  donors: DonorSearchResult[];
}

export default function DonorsMapInner({ center, radiusKm, donors }: DonorsMapInnerProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: "var(--primary)", fillOpacity: 0.05 }}
      />
      {donors.map((donor) => (
        <Marker key={donor.id} position={[donor.latitude, donor.longitude]} icon={donorIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{donor.name}</p>
              <p>{bloodTypeLabel(donor.bloodType)} · {donor.city}</p>
              <p className="text-muted-foreground">{donor.distanceKm} km dari kamu</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}