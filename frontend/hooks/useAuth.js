import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiMethods } from '../utils/api';
import toast from 'react-hot-toast';
import nacl from 'tweetnacl';

export const useAuth = () => {
  const { publicKey, signMessage, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('skillchain_token');
    const userData = localStorage.getItem('skillchain_user');
    
    if (token && userData && connected) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        verifyExistingToken();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAuth();
      }
    }
  }, [connected]);

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!connected) {
      clearAuth();
    }
  }, [connected]);

  const verifyExistingToken = async () => {
    try {
      const response = await apiMethods.verifyToken();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('skillchain_token');
    localStorage.removeItem('skillchain_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = useCallback(async (username) => {
    if (!publicKey || !signMessage) {
      toast.error('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    
    try {
      // Get challenge message
      const challengeResponse = await apiMethods.getAuthChallenge(publicKey.toString());
      
      if (!challengeResponse.success) {
        throw new Error('Failed to get authentication challenge');
      }

      const { message } = challengeResponse.data;
      
      // Sign the message
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      
      // Authenticate with backend
      const authResponse = await apiMethods.authenticateWallet({
        walletAddress: publicKey.toString(),
        signature: Buffer.from(signature).toString('base64'),
        message,
        username,
      });

      if (authResponse.success) {
        const { user: userData, token } = authResponse.data;
        
        // Store auth data
        localStorage.setItem('skillchain_token', token);
        localStorage.setItem('skillchain_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Welcome, ${userData.username}!`);
        return true;
      } else {
        throw new Error(authResponse.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage]);

  const logout = useCallback(async () => {
    try {
      await apiMethods.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('skillchain_user', JSON.stringify(userData));
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    clearAuth,
  };
};