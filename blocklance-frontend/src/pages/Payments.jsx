import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Check for connected wallet on component mount and when user changes
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have a user with wallet from auth context
        if (user?.walletAddress) {
          setWalletAddress(user.walletAddress);
          await updateBalance(user.walletAddress);
        } 
        // If no user wallet, check if MetaMask is already connected
        else if (window.ethereum?.selectedAddress) {
          const address = window.ethereum.selectedAddress;
          setWalletAddress(address);
          await updateBalance(address);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          setWalletAddress('');
          setBalance('0');
        }
      });
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [user]);

  // Update wallet balance
  const updateBalance = async (address) => {
    if (!address || !window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Handle MetaMask connection
  const handleConnectMetaMask = async () => {
    if (walletAddress) return; // Already connected
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        window.open('https://metamask.io/download.html', '_blank');
        throw new Error('Please install MetaMask to connect your wallet');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        await updateBalance(address);
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert(error.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleWithdrawFunds = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    // TODO: Implement withdrawal logic
    alert('Withdrawal request received!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading wallet information...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">
          Manage your payments, earnings, and blockchain transactions here.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Wallet & Blockchain Section */}
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Wallet & Blockchain
            </h2>
            
            {walletAddress ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Connected Wallet</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gray-800">
                      {formatAddress(walletAddress)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        alert('Wallet address copied to clipboard!');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {parseFloat(balance).toFixed(4)} ETH
                  </p>
                </div>
                
                <button
                  onClick={() => updateBalance(walletAddress)}
                  disabled={isConnecting}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg 
                    className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  Refresh Balance
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Connect your wallet to view your balance and make transactions
                </p>
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.61 4.72l-6.8 6.8 1.41 1.41 6.79-6.8-1.4-1.41zM3.5 11.5c0-2.5 2-4.5 4.5-4.5 1.5 0 2.8.9 3.5 2.1.7-1.2 2-2.1 3.5-2.1 2.5 0 4.5 2 4.5 4.5 0 2.5-2 4.5-4.5 4.5-1.5 0-2.8-.9-3.5-2.1-.7 1.2-2 2.1-3.5 2.1-2.5 0-4.5-2-4.5-4.5z"/>
                      </svg>
                      Connect MetaMask
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Traditional Payments */}
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border shadow space-y-5">
            <h2 className="text-lg font-semibold text-gray-800">Traditional Payments</h2>
            <p className="text-sm text-gray-600">
              Choose your preferred payment method to withdraw funds or make deposits.
            </p>

            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { name: "Razorpay", icon: "/icons/razorpay.svg" },
                { name: "UPI", icon: "/icons/upi.svg" },
                { name: "Net Banking", icon: "/icons/bank.svg" },
                { name: "Wallet", icon: "/icons/wallet.svg" },
              ].map((method) => (
                <button
                  key={method.name}
                  onClick={() => setSelectedMethod(method.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    selectedMethod === method.name
                      ? "bg-blue-600 text-white"
                      : "bg-white/40 hover:bg-white/60 text-gray-700"
                  } backdrop-blur-md transition-all`}
                >
                  <img
                    src={method.icon}
                    alt={method.name}
                    className="w-5 h-5 opacity-80"
                  />
                  {method.name}
                </button>
              ))}
            </div>

            {/* Payment Form */}
            {selectedMethod && (
              <div className="mt-6 space-y-4 bg-white/40 p-5 rounded-2xl backdrop-blur-lg border">
                {selectedMethod === "UPI" && (
                  <>
                    <p className="text-sm text-gray-700">
                      Enter your UPI ID to proceed with the transaction:
                    </p>
                    <input
                      type="text"
                      placeholder="example@upi"
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}

                {selectedMethod === "Razorpay" && (
                  <div className="text-sm text-gray-700">
                    <p>
                      Razorpay integration placeholder. Click below to simulate payment.
                    </p>
                    <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Open Razorpay Checkout
                    </button>
                  </div>
                )}

                {selectedMethod === "Net Banking" && (
                  <>
                    <p className="text-sm text-gray-700">Select your bank:</p>
                    <select className="w-full border border-gray-200 rounded-lg p-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Others</option>
                    </select>
                  </>
                )}

                {selectedMethod === "Wallet" && (
                  <div className="text-sm text-gray-700">
                    <p>Use funds from your Blocklance wallet to pay freelancers.</p>
                    <p className="mt-2 text-gray-500">Balance: ₹0.00</p>
                  </div>
                )}

                <button
                  onClick={() => alert(`${selectedMethod} payment simulated ✅`)}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {selectedMethod === "Wallet" ? "Use Wallet" : "Proceed to Pay"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => alert('Refreshing transactions...')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {walletAddress ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Your completed transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Connect your wallet to view transaction history</p>
              <button
                onClick={handleConnectMetaMask}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
