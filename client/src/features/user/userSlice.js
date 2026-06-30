import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

const initialState = {
  data: [],
  loading: false,
  error: "",
};

export const userSlice = createSlice({
  name: "user",
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
    removeUser: (state, action) => {
      state.data = state.data.filter((user) => user.id !== action.payload);
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed, removeUser } =
  userSlice.actions;

export const fetchUsers = (lookingFor) => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const params = lookingFor ? { relationshipGoals: lookingFor } : {};
    const { data } = await axios.get(`${url}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params,
    });
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(
      fetchFailed(error.response?.data?.message || "Failed to fetch users"),
    );
  }
};

export const likeUser = (userId) => async (dispatch) => {
  try {
    const { data } = await axios.post(
      `${url}/likes/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      },
    );
    dispatch(removeUser(userId));
    return data;
  } catch (error) {
    throw error;
  }
};

export const userReducer = userSlice.reducer;
