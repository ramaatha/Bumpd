import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

const initialState = {
  data: [],
  loading: false,
  error: "",
};

export const placeSlice = createSlice({
  name: "place",
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
    removePlace: (state, action) => {
      state.data = state.data.filter((p) => p.id !== action.payload);
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed, removePlace } =
  placeSlice.actions;

export const fetchPlaces = () => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const { data } = await axios.get(`${url}/places`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(
      fetchFailed(error.response?.data?.message || "Failed to fetch places"),
    );
  }
};

export const addPlace = (formData) => async (dispatch) => {
  try {
    await axios.post(`${url}/places`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    await dispatch(fetchPlaces());
  } catch (error) {
    throw error;
  }
};

export const deletePlace = (id) => async (dispatch) => {
  try {
    await axios.delete(`${url}/places/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(removePlace(id));
  } catch (error) {
    throw error;
  }
};

export const placeReducer = placeSlice.reducer;
