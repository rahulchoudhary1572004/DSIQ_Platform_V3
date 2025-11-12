"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getLwaAccessToken, fetchLwaProfiles } from "../../redux/slices/channelAmpSlice"

const AuthCallback = () => {
  const dispatch = useDispatch()
  const [status, setStatus] = useState("processing") // processing, success, error
  const [message, setMessage] = useState("Processing Amazon Ads authorization...")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code")
        const error = searchParams.get("error")
        const state = searchParams.get("state")
        const storedState = sessionStorage.getItem("oauth_state")


        if (state !== storedState) {
          setStatus("error")
          setMessage("Invalid state parameter. Possible CSRF attack.")
          return
        }
        if (error) {
          setStatus("error")
          setMessage(`Authorization failed: ${error}`)
          return
        }

        if (!code) {
          setStatus("error")
          setMessage("No authorization code received")
          return
        }

        setMessage("Exchanging authorization code for access token...")

        // Call the lwa-access-token API via Redux
        const result = await dispatch(getLwaAccessToken(code) as any)

        if (getLwaAccessToken.fulfilled.match(result)) {
          setMessage("Access token received! Fetching your Amazon Ads profiles...")
          
          // Add a small delay to ensure backend has stored the token
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Fetch profiles from Amazon after successful token exchange
          const profilesResult = await dispatch(fetchLwaProfiles() as any)
          
          if (fetchLwaProfiles.fulfilled.match(profilesResult)) {
            setStatus("success")
            setMessage("Successfully connected to Amazon Ads!")
            
            // Clear the stored state
            sessionStorage.removeItem("oauth_state")
            
            // Redirect to profiles page after a short delay
            setTimeout(() => {
              navigate("/channelamp/profiles")
            }, 2000)
          } else {
            // Token exchange succeeded but profile fetch failed
            // Still consider it a success, user can fetch profiles later
            setStatus("success")
            setMessage("Connected to Amazon Ads! You can now view your profiles.")
            
            sessionStorage.removeItem("oauth_state")
            
            setTimeout(() => {
              navigate("/channelamp")
            }, 2000)
          }
        } else {
          throw new Error(result.payload || 'Failed to exchange authorization code')
        }
      } catch (error) {
        console.error("Amazon auth failed:", error)
        setStatus("error")
        setMessage("Failed to connect to Amazon. Please try again.")
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "processing" && (
          <>
            <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Amazon Ads</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Connection Successful!</h2>
            <p className="text-green-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Failed</h2>
            <p className="text-red-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/channelamp")}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
