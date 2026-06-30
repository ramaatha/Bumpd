import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

const initialState = {
  data: [],
  receivedLikes: [],
  unreadCount: 0,
  likedYouCount: 0,
  loading: false,
  error: "",
};

export const matchSlice = createSlice({
  name: "match",
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
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setLikedYouCount: (state, action) => {
      state.likedYouCount = action.payload;
    },
    setReceivedLikes: (state, action) => {
      state.receivedLikes = action.payload;
    },
  },
});

export const {
  fetchPending,
  fetchSuccess,
  fetchFailed,
  setUnreadCount,
  setLikedYouCount,
  setReceivedLikes,
} = matchSlice.actions;

export const fetchMatches = () => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const { data } = await axios.get(`${url}/matches`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(
      fetchFailed(error.response?.data?.message || "Failed to fetch matches"),
    );
  }
};

export const fetchUnreadCount = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${url}/matches/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(setUnreadCount(data.length));
  } catch {
    // silent
  }
};

export const fetchReceivedLikes = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${url}/likes/received`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    dispatch(setReceivedLikes(data));
  } catch {
    // silent
  }
};

export const fetchLikedYouCount = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${url}/likes/received-count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    const totalCount = data.count;
    const seenCount = Number(localStorage.getItem("seen_like_count") || 0);
    const newLikes = Math.max(0, totalCount - seenCount);
    dispatch(setLikedYouCount(newLikes));
  } catch {
    // silent
  }
};

export const clearLikedYouCount = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${url}/likes/received-count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    localStorage.setItem("seen_like_count", String(data.count));
    dispatch(setLikedYouCount(0));
  } catch {
    // silent
  }
};

export const markNotificationsRead = () => async (dispatch) => {
  try {
    await axios.patch(
      `${url}/matches/notifications/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      },
    );
    dispatch(setUnreadCount(0));
  } catch {
    // silent
  }
};

export const matchReducer = matchSlice.reducer;
