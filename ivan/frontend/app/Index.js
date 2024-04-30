import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./assets/AuthContext"

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render( 
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>   
    </React.StrictMode>
)
if (module.hot) {
    module.hot.accept()
}