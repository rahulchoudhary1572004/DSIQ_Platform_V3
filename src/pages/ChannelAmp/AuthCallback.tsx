"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import api from "../../api/axios"

const AuthCallback = () => {
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

        // Use your existing API call
        await api.post("/amazon-auth", { code })

        setStatus("success")
        setMessage("Successfully connected to Amazon Ads!")

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/channelamp/dashboard")
        }, 2000)
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
