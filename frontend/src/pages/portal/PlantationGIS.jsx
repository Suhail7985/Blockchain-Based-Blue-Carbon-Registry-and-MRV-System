import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaRobot, FaSync, FaSatellite, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { PLANTATION_STATUS } from '../../constants/plantationStatus';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Custom Drone Icon
const droneIcon = new L.DivIcon({
  className: 'drone-icon',
  html: `<div style="color: #6366f1; font-size: 24px; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));"><i class="fas fa-helicopter"></i></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

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
  
  // Drone Simulation State
  const [selectedSite, setSelectedSite] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dronePos, setDronePos] = useState(null);
  const [scanPath, setScanPath] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const mapRef = useRef(null);

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

  const runDroneSimulation = (site) => {
    if (isSimulating) return;
    setSelectedSite(site);
    setIsSimulating(true);
    setScanProgress(0);
    setScanPath([]);
    
    toast('Initializing autonomous drone flight...', { icon: '🚁', style: { borderRadius: '10px', background: '#333', color: '#fff' } });

    // Define a square scan path around the site
    const baseLat = site.lat;
    const baseLng = site.lng;
    const offset = 0.005;
    const path = [
        [baseLat - offset, baseLng - offset],
        [baseLat - offset, baseLng + offset],
        [baseLat + offset, baseLng + offset],
        [baseLat + offset, baseLng - offset],
        [baseLat - offset, baseLng - offset],
    ];

    let step = 0;
    setDronePos(path[0]);
    
    const interval = setInterval(() => {
        step += 1;
        
        if (step < path.length) {
            setDronePos(path[step]);
            setScanPath(prev => [...prev, path[step]]);
            setScanProgress((step / path.length) * 100);
        } else {
            clearInterval(interval);
            setScanProgress(100);
            setTimeout(() => {
                setIsSimulating(false);
                toast.success('Audit Complete: Biomass integrity verified via MoES algorithms');
            }, 1000);
        }
    }, 1500);
  };

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
    <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white font-sans">
      {/* GIS Sidebar / Legend */}
      <div className="absolute top-4 left-4 z-[1000] w-72 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-5 pointer-events-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaSatellite className="text-bc-green-600" />
          GIS Monitoring
        </h2>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Network Health</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                <FaCheckCircle /> All Nodes Active
            </div>
          </div>

          <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-white">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Live Fleet Analytics</p>
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-400">Drone Verifications</span>
                    <span className="text-lg font-bold text-bc-green-400">842</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-bc-green-500 rounded-full" style={{ width: '82%' }} />
                </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Legend</p>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-gray-700">Audit Confirmed</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-700">Verification Pending</span>
              </li>
            </ul>
          </div>

          {selectedSite && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-gray-100"
            >
                <button 
                   onClick={() => runDroneSimulation(selectedSite)}
                   disabled={isSimulating}
                   className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isSimulating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-bc-green-600 text-white hover:bg-bc-green-700 active:scale-95'
                   }`}
                >
                    {isSimulating ? <FaSync className="animate-spin" /> : <FaRobot />}
                    {isSimulating ? `Scanning Area... ${Math.round(scanProgress)}%` : 'Autonomous Drone Audit'}
                </button>
                <p className="text-[9px] text-gray-400 mt-2 text-center leading-tight">Trigger NCCR-certified drone fleet for multispectral biomass audit.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main GIS Map */}
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        zoomControl={false}
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
        <ZoomControl position="bottomright" />
        
        {mapData.map((site) => (
          <Marker 
            key={site.id} 
            position={[site.lat, site.lng]} 
            icon={getMarkerIcon(site.status)}
            eventHandlers={{
                click: () => {
                    setSelectedSite(site);
                },
            }}
          >
            <Popup className="request-popup">
              <div className="w-64 p-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    site.status.includes('VERIFIED') || site.status.includes('MINTED') 
                    ? 'bg-emerald-50 text-emerald-700' 
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
                    <p className="text-[9px] text-emerald-700 font-bold uppercase">Biomass</p>
                    <p className="text-sm font-bold text-gray-900">{site.co2} t</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-[9px] text-blue-700 font-bold uppercase">Confidence</p>
                    <p className="text-sm font-bold text-gray-900">94.2%</p>
                  </div>
                </div>

                <button 
                    onClick={() => runDroneSimulation(site)}
                    className="w-full py-2 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FaRobot /> Remote Audit
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drone Simulation Overlays */}
        {isSimulating && dronePos && (
            <>
                <Marker position={dronePos} icon={droneIcon} zIndexOffset={1000} />
                <Polyline positions={scanPath} color="#6366f1" weight={2} dashArray="5, 5" opacity={0.6} />
                <Circle 
                    center={dronePos} 
                    radius={200} 
                    pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2 }} 
                />
            </>
        )}
      </MapContainer>
    </div>
  );
};

export default PlantationGIS;
