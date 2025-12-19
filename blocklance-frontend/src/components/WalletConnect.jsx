import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    // Check if user is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const address = accounts[0].address;
            setWalletAddress(address);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress("");
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download.html", "_blank");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      setWalletAddress(address);
      
      // Update user profile with wallet address
      try {
        await api.patch("/users/update", { walletAddress: address });
        // Update auth context if needed
        if (updateUser) {
          updateUser({ walletAddress: address });
        }
      } catch (err) {
        console.error("Error updating user profile:", err);
        // Don't fail the entire connection if profile update fails
      }

    } catch (err) {
      console.error("Wallet connect error:", err);
      if (err.code === 4001) {
        // User rejected the request
        alert("Wallet connection was rejected. Please try again.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    // Note: MetaMask doesn't support programmatic disconnection
    // This just removes the address from our state
  };

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">🔗 Wallet Connection</h3>
          <p className="text-sm text-white/70">
            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect your MetaMask wallet to interact with smart contracts"}
          </p>
        </div>
        {walletAddress ? (
          <div className="flex gap-2">
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Disconnect
            </button>
            <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium cursor-default">
              Connected
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              isConnecting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {!window.ethereum && (
        <div className="mt-4 p-3 bg-yellow-500/20 text-yellow-200 text-sm rounded-lg">
          <p>MetaMask not detected. Please install the extension to continue.</p>
          <a 
            href="https://metamask.io/download.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline mt-1 inline-block"
          >
            Install MetaMask
          </a>
        </div>
      )}
    </div>
  );
}
