import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

const initialState = {
  data: null,
  loading: false,
  error: "",
};

export const profileSlice = createSlice({
  name: "profile",
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
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = profileSlice.actions;

export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const { data } = await axios.get(`${url}/profile/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(
      fetchFailed(error.response?.data?.message || "Failed to fetch profile"),
    );
  }
};

export const updateProfile = (formData) => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const { data } = await axios.put(`${url}/profile/me`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(
      fetchFailed(error.response?.data?.message || "Failed to update profile"),
    );
    throw error;
  }
};

export const uploadPhoto = (file) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await axios.patch(`${url}/upload/photo`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(fetchProfile());
    return data.photoUrl;
  } catch (error) {
    throw error;
  }
};

export const profileReducer = profileSlice.reducer;
