import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Service } from "@/lib/api/services";

// Fix default marker icon issue with webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ServiceLocationCardProps {
  location: Service["location"];
}

const ServiceLocationCard = ({ location }: ServiceLocationCardProps) => {
  if (!location) return null;

  return (
    <Card className="p-6 gap-0">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Location</h2>
      </div>

      <div className="h-64 rounded-lg overflow-hidden border">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>Service Location</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        <p>Latitude: {location.latitude}</p>
        <p>Longitude: {location.longitude}</p>
      </div>
    </Card>
  );
};

export default ServiceLocationCard;
