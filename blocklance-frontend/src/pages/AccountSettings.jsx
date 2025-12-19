import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const AccountSettings = () => {
  const { user, authMethods, updateAuthMethods } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle connecting MetaMask
  const handleConnectMetaMask = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: '', message: '' });
      
      // This will trigger the MetaMask login flow
      const { ethereum } = window;
      if (!ethereum) {
        window.open('https://metamask.io/download.html', '_blank');
        throw new Error('MetaMask is not installed');
      }
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // The metamaskLogin function from AuthContext will handle the rest
      setStatus({ type: 'success', message: 'MetaMask connected successfully!' });
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to connect MetaMask' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disconnecting MetaMask
  const handleDisconnectMetaMask = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: '', message: '' });
      
      // Call your backend API to disconnect MetaMask
      // This is a placeholder - implement according to your backend API
      // await api.post('/auth/disconnect-metamask');
      
      // Update local state
      updateAuthMethods({
        ...user,
        walletAddress: null,
        authMethods: {
          ...(user.authMethods || {}),
          metamask: false
        }
      });
      
      setStatus({ type: 'success', message: 'MetaMask disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting MetaMask:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to disconnect MetaMask' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle connecting Google
  const handleConnectGoogle = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: '', message: '' });
      
      // The googleLogin function will handle the popup and authentication
      // This is just a placeholder - the actual implementation will be in the AuthContext
      // await googleLogin();
      
      setStatus({ type: 'success', message: 'Google account connected successfully!' });
    } catch (error) {
      console.error('Error connecting Google:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to connect Google account' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disconnecting Google
  const handleDisconnectGoogle = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: '', message: '' });
      
      // Call your backend API to disconnect Google
      // This is a placeholder - implement according to your backend API
      // await api.post('/auth/disconnect-google');
      
      // Update local state
      updateAuthMethods({
        ...user,
        authMethods: {
          ...(user.authMethods || {}),
          google: false
        }
      });
      
      setStatus({ type: 'success', message: 'Google account disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to disconnect Google account' });
    } finally {
      setIsLoading(false);
    }
  };

  // Status message component
  const StatusMessage = () => {
    if (!status.message) return null;
    
    const baseStyles = 'p-3 rounded-lg mb-4 text-sm';
    const typeStyles = {
      success: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
    };
    
    return (
      <div className={`${baseStyles} ${typeStyles[status.type] || typeStyles.info}`}>
        {status.message}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account and authentication methods</p>
        </div>

        <StatusMessage />

        {/* Connected Accounts Section */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Connected Accounts</h2>
          
          <div className="space-y-4">
            {/* Google Account */}
            <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Google</h3>
                  <p className="text-sm text-gray-500">
                    {authMethods.google ? 
                      (user?.email || 'Connected with Google') : 
                      'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={authMethods.google ? handleDisconnectGoogle : handleConnectGoogle}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  authMethods.google 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                {isLoading ? 'Processing...' : authMethods.google ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* MetaMask Wallet */}
            <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.5 1.5L5.5 6.5L7 8L11.5 4.5L16 8L17.5 6.5L11.5 1.5ZM5.5 16.5L11.5 21.5L17.5 16.5L16 15L11.5 18.5L7 15L5.5 16.5Z"/>
                    <path d="M11.5 8.5L5.5 13.5L7 15L11.5 11.5L16 15L17.5 13.5L11.5 8.5Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">MetaMask Wallet</h3>
                  <p className="text-sm text-gray-500">
                    {authMethods.metamask ? 
                      `Connected (${formatAddress(user?.walletAddress)})` : 
                      'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={authMethods.metamask ? handleDisconnectMetaMask : handleConnectMetaMask}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  authMethods.metamask 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {isLoading ? 'Processing...' : authMethods.metamask ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Email & Password */}
            <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email & Password</h3>
                  <p className="text-sm text-gray-500">
                    {authMethods.email ? 
                      (user?.email || 'Email login enabled') : 
                      'Not set up'}
                  </p>
                </div>
              </div>
              <button
                disabled={isLoading || authMethods.email}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authMethods.email ? 'Connected' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Security Tip</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>For better security, we recommend connecting at least two authentication methods.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
