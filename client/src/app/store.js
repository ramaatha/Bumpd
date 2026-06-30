import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth/authSlice";
import { userReducer } from "../features/user/userSlice";
import { profileReducer } from "../features/profile/profileSlice";
import { placeReducer } from "../features/place/placeSlice";
import { matchReducer } from "../features/match/matchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    profile: profileReducer,
    place: placeReducer,
    match: matchReducer,
  },
});
