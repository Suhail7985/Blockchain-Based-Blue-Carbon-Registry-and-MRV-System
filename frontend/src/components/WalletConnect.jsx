import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { getCarbonSummary } from '../services/api';

/**
 * WalletConnect component (Web3 Integrated)
 * - Detects MetaMask
 * - Connects wallet, saves address to backend via PATCH /profile
 * - Fetches BCC token balance from backend state (which mirrors on-chain)
 * - Displays professional wallet status widget
 */
export default function WalletConnect({ onWalletConnected }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [maticBalance, setMaticBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);

  // Fetch MATIC balance directly from MetaMask
  const fetchMaticBalance = useCallback(async (address) => {
    if (!address || !hasMetaMask) return;
    setLoadingBalance(true);
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setMaticBalance(balance);
    } catch (err) {
      console.error('Failed to fetch MATIC balance:', err);
      setMaticBalance('Error');
    } finally {
      setLoadingBalance(false);
    }
  }, [hasMetaMask]);

  // Load stored wallet on mount (from server)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data.profile?.walletAddress) {
          setWalletAddress(res.data.profile.walletAddress);
          fetchMaticBalance(res.data.profile.walletAddress);
        }
      } catch {}
    };
    load();
  }, [fetchMaticBalance]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (!hasMetaMask) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnected from MetaMask UI directly
        setWalletAddress(null);
        setMaticBalance(null);
      } else if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
        // Switched accounts; update DB silently
        const newAddress = accounts[0].toLowerCase();
        setWalletAddress(newAddress);
        api.patch('/profile', { walletAddress: newAddress }).catch(console.error);
        fetchMaticBalance(newAddress);
        onWalletConnected?.(newAddress);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [hasMetaMask, walletAddress, fetchMaticBalance, onWalletConnected]);

  const connectWallet = async () => {
    if (!hasMetaMask) {
      toast.error('MetaMask not found! Please install MetaMask extension.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0]?.toLowerCase();

      if (!address) {
        toast.error('No account selected. Please unlock MetaMask.');
        return;
      }

      // Check network — Polygon Amoy = 0x13882 (decimal 80002)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x13882') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Add Polygon Amoy if not present
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              }],
            });
          } else {
            toast.error('Please switch to Polygon Amoy Testnet in MetaMask.');
            return;
          }
        }
      }

      // Save wallet address to backend
      const res = await api.patch('/profile', { walletAddress: address });
      if (res.data.success) {
        setWalletAddress(address);
        toast.success('Wallet connected & linked to registry!');
        fetchMaticBalance(address);
        onWalletConnected?.(address);
      }
    } catch (err) {
      if (err.code === 4001) {
        toast.error('Connection rejected. Please approve in MetaMask.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to connect wallet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await api.patch('/profile', { walletAddress: '' });
      setWalletAddress(null);
      setMaticBalance(null);
      toast.success('Wallet disconnected from registry.');
    } catch {
      toast.error('Failed to unlink wallet.');
    }
  };

  if (walletAddress) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-2xl p-6 shadow-xl border border-indigo-700/50 relative overflow-hidden text-white">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-indigo-900"></span>
              </div>
              <span className="text-sm font-semibold text-indigo-200 tracking-wide uppercase">Wallet Connected</span>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-800/80 border border-indigo-600/50 text-[10px] text-indigo-300 font-mono">
                Polygon Amoy
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🦊</span>
                </div>
              </div>
              <div>
                <p className="font-mono text-lg text-white font-medium break-all">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Address copied!'); }}
                    className="text-xs text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    📋 Copy
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    ↗ Explorer
                  </a>
                  <button onClick={disconnectWallet} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[200px] text-center shadow-inner">
            <p className="text-xs text-indigo-200 font-medium mb-1 uppercase tracking-wider">Matic Wallet Balance</p>
            {loadingBalance ? (
              <div className="h-8 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl font-bold text-white drop-shadow-md">
                  {maticBalance !== null ? maticBalance : '0.0000'}
                </span>
                <span className="text-sm font-semibold text-indigo-300">MATIC</span>
              </div>
            )}
            <p className="text-[10px] text-indigo-300 mt-2">Subsidy & Gas Token</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">💼</span> Connect Web3 Wallet
          </h3>
          <p className="text-sm text-gray-600 max-w-lg">
            {hasMetaMask
              ? 'Connect your MetaMask wallet to monitor your MATIC wallet balance and securely receive subsidy payouts on the Polygon Amoy blockchain.'
              : 'MetaMask is required to interact with the blockchain. Please install the browser extension to receive and view your MATIC subsidies.'}
          </p>
        </div>
        <button
          onClick={connectWallet}
          disabled={loading}
          className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#F6851B] hover:bg-[#E2761B] text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Connecting...</>
          ) : (
            <><span className="text-xl">🦊</span> {hasMetaMask ? 'Connect MetaMask' : 'Install MetaMask'}</>
          )}
        </button>
      </div>
    </div>
  );
}
