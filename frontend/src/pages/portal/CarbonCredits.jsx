import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { getCarbonSummary } from '../../services/api';
import { FaCoins, FaLock, FaWallet, FaExternalLinkAlt, FaHandHoldingUsd, FaSeedling } from 'react-icons/fa';

const EXPLORER_TX = 'https://amoy.polygonscan.com/tx';
const EXPLORER_ADDRESS = 'https://amoy.polygonscan.com/address';

const CarbonCredits = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isActive) {
      getCarbonSummary().then((r) => r.success && setData(r));
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carbon Credits Locked</h2>
          <p className="text-gray-600">
            Complete verification to access your carbon credits and token dashboard.
          </p>
        </div>
      </div>
    );
  }

  const totalCO2 = data?.totalCO2 ?? 0;
  const totalTokens = data?.totalTokens ?? 0;
  const totalSubsidy = data?.totalSubsidy ?? 0;
  const verifiedCount = data?.verifiedPlantations ?? 0;
  const history = data?.history ?? [];
  const walletAddress = data?.walletAddress ?? null;
  const walletBalance = data?.walletBalance != null ? String(data.walletBalance) : null;
  const explorerAddressUrl = data?.explorerAddressUrl || (walletAddress ? `${EXPLORER_ADDRESS}/${walletAddress}` : null);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaHandHoldingUsd className="w-7 h-7 text-emerald-600" />
        Subsidy Earnings
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total CO₂ Captured</p>
          <p className="text-2xl font-bold text-gray-900">{totalCO2} tCO₂e</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 bg-emerald-50/30">
          <p className="text-sm text-gray-500">Total Subsidy Earned</p>
          <p className="text-2xl font-bold text-emerald-600">{totalSubsidy} MATIC</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Verified Plantations</p>
          <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Subsidy Rate</p>
          <p className="text-sm text-gray-600 font-medium">1 BCC = 0.01 MATIC</p>
        </div>
      </div>

      {walletAddress && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <FaWallet className="w-5 h-5 text-emerald-600" />
                Receiving Wallet Address
              </h2>
              <p className="text-sm text-gray-500 mb-3">Subsidies are paid instantly to this polygon wallet address.</p>
              <p className="text-sm text-gray-800 font-mono bg-gray-50 py-1 px-2 rounded border border-gray-100 inline-block break-all">{walletAddress}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Government Aggregator</p>
              <p className="text-sm text-gray-600">Your generated BCC tokens are held in the NCCR Treasury. You receive MATIC as compensation.</p>
              {explorerAddressUrl && (
                <a
                  href={explorerAddressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline mt-2 font-medium"
                >
                  View Wallet on Explorer <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!walletAddress && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            Add your wallet address in <strong>Profile & KYC</strong> to receive instant MATIC subsidies after Panchayat approval.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Subsidy Payout History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No approved plantations yet. Submit plantations and complete verification to earn subsidies.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantation ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tokens Minted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subsidy Payout</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tx Proof</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">{h.plantationId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600 font-medium">
                      {h.tokens} BCC <span className="text-xs text-gray-400 block">(To Treasury)</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-emerald-600 font-bold">
                      {h.subsidyPaid ? `${h.subsidyPaid} ${h.subsidyCurrency}` : 'Pending'}
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      {h.subsidyTxHash ? (
                        <a
                          href={`${EXPLORER_TX}/${h.subsidyTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          View tx <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      ) : h.tokenTxHash ? (
                        <span className="text-xs text-gray-500">Processing Subsidy...</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonCredits;
