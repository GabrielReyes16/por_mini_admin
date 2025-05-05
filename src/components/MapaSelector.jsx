import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';

const LocationMarker = ({ setCoords }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoords(e.latlng); // latlng = { lat, lng }
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapaSelector = ({ setCoords }) => {
  return (
    <MapContainer center={[-12.0464, -77.0428]} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setCoords={setCoords} />
    </MapContainer>
  );
};

export default MapaSelector;
