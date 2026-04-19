import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext.tsx";
import { OpenAPI } from "./api/generated";
import { API_HOST, API_PREFIX, getAccessToken } from "./api/config";

OpenAPI.BASE = `${API_HOST}`;

OpenAPI.TOKEN = async () => {
  return getAccessToken() || "";
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);
