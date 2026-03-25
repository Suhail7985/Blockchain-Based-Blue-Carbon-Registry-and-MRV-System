import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { PLANTATION_STATUS } from '../../constants/plantationStatus';

// Custom Marker Icons based on Status
const getMarkerIcon = (status) => {
  let color = '#3b82f6'; // Default Blue (Pending)
  
  if (status === PLANTATION_STATUS.TOKEN_MINTED || status === PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED || status === PLANTATION_STATUS.VERIFIED) {
    color = '#10b981'; // Green (Verified)
  } else if (status === PLANTATION_STATUS.REJECTED) {
    color = '#ef4444'; // Red (Rejected)
  }

  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); color: white; font-size: 14px;"><i class="fas fa-seedling"></i></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const PlantationGIS = () => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, verified: 0, co2: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/public/impact');
        if (response.data.success) {
          setMapData(response.data.data.mapData || []);
          setStats({
            total: response.data.data.totalPlantations,
            verified: response.data.data.verifiedPlantations,
            co2: response.data.data.totalCO2
          });
        }
      } catch (err) {
        console.error('Failed to load GIS data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading GIS Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white">
      {/* GIS Sidebar / Legend */}
      <div className="absolute top-4 right-4 z-[1000] w-72 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-5 pointer-events-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-bc-green-600" />
          GIS Navigation
        </h2>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Live Statistics</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-[10px] text-gray-500">Total Sites</p>
              </div>
              <div>
                <p className="text-xl font-bold text-bc-green-600">{stats.verified}</p>
                <p className="text-[10px] text-gray-500">Verified</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Map Legend</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                <span className="text-gray-700">Verified & Minted</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                <span className="text-gray-700">Pending Review</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
                <span className="text-gray-700">Rejected / Issue</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-tight">
              Interactive GIS view showing all registered blue carbon plantation modules nationwide.
            </p>
          </div>
        </div>
      </div>

      {/* Main GIS Map */}
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {mapData.map((site) => (
          <Marker 
            key={site.id} 
            position={[site.lat, site.lng]} 
            icon={getMarkerIcon(site.status)}
          >
            <Popup className="request-popup">
              <div className="w-64 p-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    site.status.includes('VERIFIED') || site.status.includes('MINTED') 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : site.status.includes('REJECTED') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-blue-50 text-blue-700'
                  }`}>
                    {site.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">#{site.plantationId.slice(-6)}</span>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 mb-1">{site.species || 'Mangrove Plantation'}</h3>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-400" /> {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <p className="text-[9px] text-emerald-700 font-bold uppercase">Carbon CO₂</p>
                    <p className="text-sm font-bold text-gray-900">{site.co2} t</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-[9px] text-blue-700 font-bold uppercase">Trees</p>
                    <p className="text-sm font-bold text-gray-900">{site.treeCount}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-gray-600 border-t border-gray-100 pt-3">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-400">Area:</span>
                    <span className="font-bold">{site.area} Hectares</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-400">Planted:</span>
                    <span className="font-bold">{new Date(site.date).toLocaleDateString()}</span>
                  </p>
                </div>

                <button className="w-full mt-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <FaInfoCircle /> View Full Audit Log
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PlantationGIS;
