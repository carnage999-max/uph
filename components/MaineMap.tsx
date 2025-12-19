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

// Red icon for under construction properties
const UnderConstructionIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
          
          // Use red icon for under construction properties
          const isUnderConstruction = p.status === 'Under Construction';
          const icon = isUnderConstruction ? UnderConstructionIcon : DefaultIcon;
          
          return (
            <Marker 
              key={p.id} 
              position={[lat, lng]} 
              icon={icon}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-600">{p.address}</div>
                  {isUnderConstruction && (
                    <div className="mt-1 text-xs font-semibold text-orange-600">Under Construction</div>
                  )}
                  <div className="mt-2">
                    <a href={`/properties/${p.id}`} className="text-xs font-medium text-blue-600 underline">View listing</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 text-sm">
        <div className="font-semibold text-gray-700 mb-2">Legend</div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full border border-gray-300"></div>
            <span className="text-gray-600">Current Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded-full border border-gray-300"></div>
            <span className="text-gray-600">Under Construction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
