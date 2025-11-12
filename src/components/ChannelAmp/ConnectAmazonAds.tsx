"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import api from "../../api/axios"
import { getLwaLoginUrl, getLwaAccessToken, fetchLwaProfiles } from "../../redux/slices/channelAmpSlice"

const ConnectAmazonAds = ({ onConnectionSuccess }) => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lwaLoginUrl, loading: reduxLoading } = useSelector((state: any) => state.channelAmp)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auto-detect authorization code from URL
  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    
    if (error) {
      setConnectionError(`Authorization failed: ${error}`)
      setLoading(false)
      // Clean up URL
      searchParams.delete("error")
      searchParams.delete("error_description")
      setSearchParams(searchParams)
      return
    }
    
    if (code) {
      // Code found in URL - automatically process it
      handleAutoConnect(code)
      // Clean up URL
      searchParams.delete("code")
      searchParams.delete("scope")
      setSearchParams(searchParams)
    }
  }, [searchParams])

  const handleAutoConnect = async (code: string) => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Exchange code for token
      const result = await dispatch(getLwaAccessToken(code) as any)
      
      if (getLwaAccessToken.fulfilled.match(result)) {
        // Wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Fetch profiles
        await dispatch(fetchLwaProfiles() as any)
        
        setIsConnected(true)
        
        if (onConnectionSuccess) {
          onConnectionSuccess()
        }
      } else {
        throw new Error(result.payload || 'Failed to exchange code')
      }
    } catch (error) {
      console.error('Auto connection error:', error)
      setConnectionError("Failed to connect automatically. Please try again.")
    } finally {
      setIsConnecting(false)
      setLoading(false)
    }
  }

  // Check if user is already connected by getting profiles
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        setLoading(true)
        // Get LWA profiles to check connection status
        const response = await api.get("/lwa-profiles")
        
        // Parse response - backend returns object {profiles: [...], message: "..."}
        let profiles;
        if (typeof response.data === 'string') {
          profiles = JSON.parse(response.data);
        } else if (response.data && typeof response.data === 'object') {
          profiles = response.data.profiles || response.data.data || [];
        } else {
          profiles = [];
        }
        
        const hasProfiles = Array.isArray(profiles) && profiles.length > 0;
        setIsConnected(hasProfiles)
        
        if (hasProfiles && onConnectionSuccess) {
          onConnectionSuccess()
        }
      } catch (error) {
        console.error("Failed to check Amazon connection status:", error)
        // If API call fails, assume not connected
        setIsConnected(false)
        setConnectionError("Unable to verify connection status.")
      } finally {
        setLoading(false)
      }
    }

    checkConnectionStatus()
  }, [onConnectionSuccess])

  const generateState = () => {
    return Math.random().toString(36).substring(2, 15)
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const state = generateState()
      sessionStorage.setItem("oauth_state", state)
      
      // Get the Amazon OAuth URL from the backend
      const result = await dispatch(getLwaLoginUrl() as any)
      
      if (getLwaLoginUrl.fulfilled.match(result)) {
        // Redirect to Amazon OAuth page (simplest approach)
        // Backend should redirect back to current page with ?code=xxx
        window.location.href = result.payload
      } else {
        throw new Error(result.payload || 'Failed to get login URL')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setConnectionError("Failed to initiate connection. Please try again.")
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      // Reset Redux state instead of API call
      setIsConnected(false)
      setConnectionError(null)
    } catch (error) {
      console.error("Failed to disconnect:", error)
      setConnectionError("Failed to disconnect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Checking Amazon Ads connection...</p>
        </div>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Amazon Ads Connected Successfully</h3>
              <p className="text-green-600">Your Amazon Ads account is now connected and syncing data.</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l4 5.917 4-5.917h-2.938c.244-4.277 3.769-7.75 8.438-7.75 4.781 0 8.5 3.719 8.5 8.5s-3.719 8.5-8.5 8.5c-1.957 0-3.68-.688-5.072-1.781l-2.844 2.844c1.875 1.406 4.156 2.437 6.916 2.437 6.125 0 11-4.875 11-11s-4.875-11-11-11z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Amazon Ads Account</h2>

        <p className="text-gray-600 mb-6">
          Connect your Amazon Ads account to start managing your campaigns, analyzing performance, and optimizing your
          advertising strategy.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div className="text-left">
              <h4 className="font-medium text-blue-800 mb-1">What you'll get access to:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Campaign performance data and analytics</li>
                <li>• Keyword and targeting insights</li>
                <li>• Automated bid management</li>
                <li>• Custom reporting and dashboards</li>
                <li>• Real-time spend and ROAS tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={16} />
              <p className="text-red-700 text-sm">{connectionError}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-800 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          {isConnecting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink size={16} className="mr-2" />
              Connect Amazon Ads
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          By connecting, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and secure.
        </p>
      </div>
    </div>
  )
}

export default ConnectAmazonAds
