import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme/theme-provider";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { bootstrapAuth } from "./features/auth/authSlice";

const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!clientId) {
  console.error("Missing VITE_GOOGLE_CLIENT_ID");
}

store.dispatch(bootstrapAuth());

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <GoogleOAuthProvider clientId={clientId!}>
              <App />
            </GoogleOAuthProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
