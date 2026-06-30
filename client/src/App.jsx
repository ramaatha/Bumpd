import { Route, Routes } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FavoritePlaces from "./pages/FavoritePlaces";
import Matches from "./pages/Matches";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/home" element={<Home />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/places" element={<FavoritePlaces />} />
        <Route path="/matches" element={<Matches />} />
      </Route>
    </Routes>
  );
}

export default App;
