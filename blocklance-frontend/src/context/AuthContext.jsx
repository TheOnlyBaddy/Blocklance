import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { ethers } from "ethers";
import app from "../lib/firebase";
import api from "../lib/api";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMethods, setAuthMethods] = useState({
    google: false,
    metamask: false,
    email: false
  });

  // Google Login
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection and get email scope
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send token to backend for verification
      const res = await api.post(
        "/auth/firebase-login", 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Store the JWT token and update user state
      localStorage.setItem("token", res.data.token);
      const updatedUser = {
        ...res.data.user,
        authMethods: {
          ...(res.data.user.authMethods || {}),
          google: true
        }
      };
      setUser(updatedUser);
      updateAuthMethods(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("[Auth] Google login failed:", error);
      throw error;
    }
  };

  // Update auth methods based on user data
  const updateAuthMethods = (userData) => {
    const methods = {
      google: false,
      metamask: false,
      email: false
    };

    if (userData) {
      methods.email = !!userData.email && !userData.email.endsWith('@metamask.user');
      methods.google = userData.providerData?.some(provider => provider?.providerId === 'google.com');
      methods.metamask = !!userData.walletAddress;
    }
    
    setAuthMethods(methods);
    return methods;
  };

  // Email Signup
  const emailSignup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const res = await api.post(
        "/auth/firebase-login", 
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("token", res.data.token);
      const userData = {
        ...res.data.user,
        authMethods: {
          ...(res.data.user.authMethods || {}),
          email: true
        }
      };
      setUser(userData);
      updateAuthMethods(userData);
      return userData;
    } catch (error) {
      console.error("[Auth] Email signup failed:", error);
      throw error;
    }
  };

  // Email Login
  const emailLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const res = await api.post(
        "/auth/firebase-login", 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("token", res.data.token);
      const userData = {
        ...res.data.user,
        authMethods: {
          ...(res.data.user.authMethods || {}),
          email: true
        }
      };
      setUser(userData);
      updateAuthMethods(userData);
      return userData;
    } catch (error) {
      console.error("[Auth] Email login failed:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      throw error;
    }
  };

  // Handle session state and auto-login
  useEffect(() => {
    const checkAuth = async () => {
      // Check for Firebase auth first
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            console.log('[Auth] Firebase user detected, getting ID token...');
            const token = await firebaseUser.getIdToken(true); // Force token refresh
            console.log('[Auth] Token received, verifying with backend...');
            
            const res = await api.post(
              "/auth/firebase-login", 
              {},
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            console.log('[Auth] Backend verification successful:', res.data);
            
            if (!res.data.token) {
              throw new Error('No authentication token received from backend');
            }
            
            // Store the backend JWT token
            localStorage.setItem("token", res.data.token);
            
            // Update user state with the complete user data from backend
            const userData = {
              ...res.data.user,
              isAuthenticated: true,
              authMethods: {
                ...(res.data.user?.authMethods || {}),
                [firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email']: true
              }
            };
            
            console.log('[Auth] Setting user data:', userData);
            setUser(userData);
            
          } catch (err) {
            console.error("[Auth] Firebase auto-login failed:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status
            });
            
            // Clear any invalid tokens
            localStorage.removeItem("token");
            setUser(null);
            
            // Force sign out from Firebase if the token is invalid
            try {
              await signOut(auth);
            } catch (signOutErr) {
              console.error("[Auth] Error during sign out:", signOutErr);
            }
          }
        } else {
          // Check for existing MetaMask login
          const token = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          
          if (token && storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              
              // Instead of verifying the token with the server, we'll just check if it exists
              // and has the expected format (starts with 'ey' for JWT)
              if (token.startsWith('ey')) {
                console.log('[Auth] Restoring MetaMask user from localStorage:', userData);
                setUser({
                  ...userData,
                  isAuthenticated: true
                });
              } else {
                throw new Error('Invalid token format');
              }
            } catch (err) {
              console.error('[Auth] Failed to restore session:', err);
              // Clear invalid auth data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            // No valid session found
            setUser(null);
          }
        }
        setLoading(false);
      });
      
      return () => unsubscribe();
    };

    checkAuth();
  }, []);

  // MetaMask Login
  const metamaskLogin = async () => {
    console.log('[Auth] Starting MetaMask login...');
    
    try {
      // 1. Check if MetaMask is installed and accessible
      if (!window.ethereum) {
        const error = new Error('MetaMask is not installed. Please install it to continue.');
        error.code = 'METAMASK_NOT_INSTALLED';
        throw error;
      }

      console.log('[Auth] MetaMask detected, requesting accounts...');
      
      // 2. Request account access
      let accounts;
      try {
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
      } catch (err) {
        console.error('[Auth] Error requesting accounts:', err);
        throw new Error('Failed to connect to MetaMask. Please check if MetaMask is unlocked.');
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is connected.');
      }

      const address = accounts[0];
      console.log('[Auth] Connected account:', address);
      
      // 3. Get a signer
      let provider, signer;
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      } catch (err) {
        console.error('[Auth] Error getting signer:', err);
        throw new Error('Failed to initialize wallet signer. Please try again.');
      }
      
      // 4. Get nonce from server
      let nonceResponse;
      try {
        console.log('[Auth] Requesting nonce from server...');
        const formattedAddress = address.toLowerCase();
        nonceResponse = await api.get(`/auth/metamask/nonce?address=${formattedAddress}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 400 errors
        });
        
        console.log('[Auth] Nonce response:', nonceResponse.data);
        
        // If we get a 404, it might mean the user needs to register first
        if (nonceResponse.status === 404) {
          throw new Error('User not found. Please sign up first.');
        }
        
        if (!nonceResponse.data?.nonce) {
          throw new Error('Invalid nonce received from server');
        }
      } catch (err) {
        console.error('[Auth] Error getting nonce:', err);
        throw new Error('Failed to authenticate with the server. Please try again later.');
      }
      
      const nonce = nonceResponse.data.nonce;
      console.log('[Auth] Generated nonce for signing:', nonce);
      
      // 5. Sign the nonce (just the nonce, not the full message)
      let signature;
      try {
        console.log('[Auth] Requesting signature...');
        // Sign only the nonce, not the full message
        signature = await signer.signMessage(nonce);
        console.log('[Auth] Signature received');
      } catch (err) {
        console.error('[Auth] Error signing message:', err);
        throw new Error('You need to sign the message to continue.');
      }
      
      // 6. Verify with backend
      console.log('[Auth] Verifying signature with backend...');
const verifyPayload = {
        walletAddress: address.toLowerCase(),
        signature
      };
      
      // Log the nonce for debugging
      console.log('[Auth] Nonce being verified:', nonce);
      
      console.log('[Auth] Verification request payload:', {
        ...verifyPayload,
        nonce // Log the nonce separately for clarity
      });
      
      let res;
      try {
        // Verify the signature with the original nonce
        res = await api.post('/auth/metamask/verify', verifyPayload, {
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        });
        
        console.log('[Auth] Verification response:', {
          status: res.status,
          statusText: res.statusText,
          data: res.data
        });
        
        if (!res.data?.token) {
          throw new Error('No authentication token received');
        }
      } catch (err) {
        console.error('[Auth] Verification failed:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        const errorMessage = err.response?.data?.message || 
                           'Authentication failed. Please try again.';
        const error = new Error(errorMessage);
        error.status = err.response?.status;
        throw error;
      }
      
      // 7. Store token and update state
      console.log('[Auth] Authentication successful, storing token and user data...', res.data);
      
      if (!res.data.token) {
        throw new Error('No authentication token received');
      }
      
      // Store the token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Create a complete user object with all required fields
      const userData = {
        ...(res.data.user || {}),
        walletAddress: address.toLowerCase(),
        // Ensure we have an ID, fallback to wallet address if not provided
        _id: res.data.user?._id || `metamask-${address.toLowerCase()}`,
        // Set default role if not provided
        role: res.data.user?.role || 'user',
        // Set default email if not provided
        email: res.data.user?.email || `${address.toLowerCase()}@metamask.user`,
        // Set default username if not provided
        username: res.data.user?.username || `user-${address.slice(0, 8)}`,
        // Mark as authenticated
        isAuthenticated: true,
        // Track authentication methods
        authMethods: {
          ...(res.data.user?.authMethods || {}),
          metamask: true
        }
      };
      
      console.log('[Auth] Setting user data:', userData);
      
      // Update the user state
      setUser(userData);
      
      // Store the complete user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { user: userData };
    } catch (error) {
      console.error('[Auth] MetaMask login failed:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Rethrow with user-friendly message
      if (!error.status) {
        error.message = 'Failed to connect to MetaMask. Please try again.';
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authMethods,
    updateAuthMethods,
    googleLogin,
    emailLogin,
    emailSignup,
    logout,
    metamaskLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
