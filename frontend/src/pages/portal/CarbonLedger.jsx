import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import api from '../../services/api';

const CarbonLedger = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isActive) return;
    setLoading(true);
    api
      .get('/ledger')
      .then((res) => {
        if (res.data.success) setEntries(res.data.entries || []);
        else setError(res.data.message || 'Failed to load ledger');
      })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load ledger'))
      .finally(() => setLoading(false));
  }, [isActive]);

  const exportCsv = () => {
    if (!entries.length) return;
    const header = [
      'Plantation ID',
      'Land ID',
      'Tree Count',
      'Biomass (t)',
      'Carbon (t)',
      'CO2eq (t)',
      'Tokens',
      'Blockchain Tx',
      'Mint Tx',
      'Mint Date',
      'Status',
    ];
    const rows = entries.map((e) => [
      e.plantationId,
      e.landId,
      e.treeCount,
      e.carbonCalculation?.biomass,
      e.carbonCalculation?.carbon,
      e.carbonCalculation?.co2eq,
      e.carbonCalculation?.tokens,
      e.blockchainTxHash || '',
      e.tokenTxHash || '',
      e.submissionTimestamp ? new Date(e.submissionTimestamp).toISOString() : '',
      e.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => (v === undefined || v === null ? '' : String(v))).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'carbon-ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-600">
          Carbon ledger is available after your account is fully verified.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Carbon Credit Ledger</h1>
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700"
        >
          Export CSV
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading ledger...
        </div>
      ) : !entries.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No verified plantations with carbon credits yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Plantation ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Land ID</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Tree Count</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">CO₂eq (t)</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Tokens</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Blockchain Tx</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((e) => (
                  <tr key={e._id}>
                    <td className="px-4 py-2 font-mono text-xs text-gray-900">{e.plantationId}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{e.landId}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{e.treeCount}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{e.carbonCalculation?.co2eq ?? '—'}</td>
                    <td className="px-4 py-2 text-right text-bc-green-700 font-medium">
                      {e.carbonCalculation?.tokens ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-gray-600 max-w-[130px] truncate" title={e.tokenTxHash || e.blockchainTxHash}>
                      {e.tokenTxHash || e.blockchainTxHash || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-block px-2 py-1 rounded text-xs bg-bc-green-50 text-bc-green-700">
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setSelected(e)}
                        className="text-sm text-bc-green-600 hover:underline"
                      >
                        View breakdown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Carbon Calculation Breakdown</h2>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Plantation ID:</span>{' '}
              <span className="font-mono text-xs">{selected.plantationId}</span>
            </p>
            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>
                <span className="font-semibold">Tree Count:</span> {selected.treeCount}
              </li>
              <li>
                <span className="font-semibold">Average Biomass per Tree:</span>{' '}
                {selected.carbonCalculation?.avgBiomassPerTree} kg
              </li>
              <li>
                <span className="font-semibold">Biomass:</span> {selected.carbonCalculation?.biomass} tons
              </li>
              <li>
                <span className="font-semibold">Carbon:</span>{' '}
                {selected.carbonCalculation?.carbon} tons (Biomass × 0.48)
              </li>
              <li>
                <span className="font-semibold">CO₂ Equivalent:</span>{' '}
                {selected.carbonCalculation?.co2eq} tons (Carbon × 3.67)
              </li>
              <li>
                <span className="font-semibold">Tokens Minted:</span>{' '}
                {selected.carbonCalculation?.tokens} (1 token = 1 tCO₂eq)
              </li>
            </ul>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonLedger;

