import axios from "axios";

// Auto-logout and redirect to landing page on 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("preferred_gender");
      localStorage.removeItem("my_gender");
      localStorage.removeItem("seen_like_count");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
