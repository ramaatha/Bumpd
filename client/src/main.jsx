import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./utils/axiosAuth.js";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="92273274709-l3mgserdtc2ob3m3rd7mte408kii17v0.apps.googleusercontent.com">
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
