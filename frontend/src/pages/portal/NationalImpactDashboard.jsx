import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLeaf, FaGlobeAmericas, FaChartLine, FaCheckCircle, FaCoins } from 'react-icons/fa';

// Leaflet icon fix
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const NationalImpactDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const response = await api.get('/public/impact');
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Failed to load impact data.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <p className="font-semibold">{error || 'Data unavailable'}</p>
      </div>
    );
  }

  const { totalPlantations, verifiedPlantations, totalCO2, totalTokens, monthlyGrowth, carbonTrend, mapData } = data;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaGlobeAmericas className="text-bc-green-600" />
          {t('nationalImpact')}
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Live aggregated environmental metrics from CarbonSetu
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <FaChartLine />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('activeProjects')}</p>
            <p className="text-3xl font-bold text-gray-900">{totalPlantations}</p>
            <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 py-1 px-2 rounded-md inline-block">Registered Nationwide</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl shrink-0">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('verifiedSites')}</p>
            <p className="text-3xl font-bold text-gray-900">{verifiedPlantations}</p>
            <p className="text-xs text-teal-600 mt-2 font-medium bg-teal-50 py-1 px-2 rounded-md inline-block">NCCR Approved</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-bc-green-50 text-bc-green-600 flex items-center justify-center text-xl shrink-0">
            <FaLeaf />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('totalCO2')}</p>
            <p className="text-3xl font-bold text-gray-900">{totalCO2.toLocaleString()}</p>
            <p className="text-xs text-bc-green-700 mt-2 font-medium bg-bc-green-50 py-1 px-2 rounded-md inline-block">Tons of CO₂eq</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <FaCoins />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Carbon Tokens Minted</p>
            <p className="text-3xl font-bold text-purple-700">{totalTokens.toLocaleString()}</p>
            <p className="text-xs text-purple-700 mt-2 font-medium bg-purple-50 py-1 px-2 rounded-md inline-block">On Polygon Blockchain</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Carbon Sequestration Trend</h3>
          <div className="h-[300px]">
            {carbonTrend && carbonTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={carbonTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="co2" name="CO₂ (tons)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Not enough data to graph</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Plantation Growth</h3>
          <div className="h-[300px]">
            {monthlyGrowth && monthlyGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="plantations" name="New Submitals" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Not enough data to graph</div>
            )}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
        <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-end">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Verified Plantation Sites Map</h3>
            <p className="text-sm text-gray-500 mt-1">Geospatial distribution of all fully approved mangrove ecosystems</p>
          </div>
          <div className="mt-2 sm:mt-0 text-sm font-medium bg-bc-green-50 text-bc-green-700 px-3 py-1.5 rounded-lg inline-block">
            {mapData.length} active sites plotted
          </div>
        </div>
        
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 z-0">
          <MapContainer 
            center={[20.5937, 78.9629]} // Center of India
            zoom={4} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapData.map((site) => (
              <Marker 
                key={site.id} 
                position={[site.lat, site.lng]} 
                icon={customIcon}
              >
                <Popup className="rounded-xl">
                  <div className="p-1">
                    <p className="font-bold text-gray-900 text-sm mb-1">{site.species || 'Mangrove Plantation'}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><span className="font-semibold text-gray-800">ID:</span> {site.plantationId}</p>
                      <p><span className="font-semibold text-gray-800">Area:</span> {site.area} ha</p>
                      <p><span className="font-semibold text-gray-800">CO₂eq:</span> {site.co2} tons</p>
                      <p className="mt-2 text-[10px] uppercase tracking-wider font-bold text-bc-green-600 bg-bc-green-50 px-2 py-1 inline-block rounded">
                        {site.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default NationalImpactDashboard;
