import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"
import { AuthProvider } from "./contexts/AuthContext.jsx"


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceworker.js")
      .then((reg) => {
        // console.log("Service worker registered.", reg)
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err)
      })
  })
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
