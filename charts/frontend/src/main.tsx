import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#3b82f6',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
