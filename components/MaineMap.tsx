"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import properties from '@/data/properties.json';

// Configure default icon using CDN-hosted marker images so asset paths don't break
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


export default function MaineMap() {
  // Center roughly on Maine
  const center: [number, number] = [45.0, -69.0];
  const zoom = 7;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: 420, width: '100%' }} 
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        {properties.map((p: any) => {
          const coords = p.coordinates;
          if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return null;
          
          // Apply small offset to 115 Somerset Ave so it doesn't overlap with 135 Main St
          let lat = coords.lat;
          let lng = coords.lng;
          if (p.id === '115-somerset-ave') {
            lat += 0.0003;  // ~30 meters north
          }
          
          return (
            <Marker 
              key={p.id} 
              position={[lat, lng]} 
              icon={DefaultIcon}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-600">{p.address}</div>
                  <div className="mt-2">
                    <a href={`/properties/${p.id}`} className="text-xs font-medium text-blue-600 underline">View listing</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
