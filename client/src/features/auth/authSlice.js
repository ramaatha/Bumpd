import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

const initialState = {
  data: null,
  loading: false,
  error: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    fetchPending: (state) => {
      state.data = initialState.data;
      state.loading = true;
      state.error = initialState.error;
    },
    fetchSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = initialState.loading;
      state.error = initialState.error;
    },
    fetchFailed: (state, action) => {
      state.data = initialState.data;
      state.loading = initialState.loading;
      state.error = action.payload;
    },
    logout: (state) => {
      state.data = initialState.data;
      localStorage.removeItem("access_token");
      localStorage.removeItem("seen_like_count");
      localStorage.removeItem("preferred_gender");
      localStorage.removeItem("my_gender");
    },
    resetError: (state) => {
      state.error = initialState.error;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed, logout, resetError } =
  authSlice.actions;

export const register = (formData) => async (dispatch) => {
  try {
    dispatch(fetchPending());
    await axios.post(`${url}/auth/register`, formData);
    dispatch(fetchSuccess(null));
  } catch (error) {
    dispatch(fetchFailed(error.response?.data?.message || "Register failed"));
    throw error;
  }
};

export const login = (formData) => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const { data } = await axios.post(`${url}/auth/login`, formData);
    localStorage.setItem("access_token", data.access_token);
    localStorage.removeItem("seen_like_count");
    localStorage.removeItem("preferred_gender");
    localStorage.removeItem("my_gender");
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(fetchFailed(error.response?.data?.message || "Login failed"));
    throw error;
  }
};

export const authReducer = authSlice.reducer;
