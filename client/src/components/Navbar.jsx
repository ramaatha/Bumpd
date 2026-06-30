import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchUnreadCount, fetchLikedYouCount } from "../features/match/matchSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useSelector((state) => state.match.unreadCount);
  const likedYouCount = useSelector((state) => state.match.likedYouCount);
  const totalBadge = unreadCount + likedYouCount;

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchLikedYouCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
      dispatch(fetchLikedYouCount());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 px-8 flex items-center justify-between" style={{ height: "64px" }}>
      {/* Logo */}
      <Link
        to="/home"
        className="text-2xl font-bold hover:opacity-80 transition-opacity"
        style={{ letterSpacing: "0.15em" }}
      >
        <span style={{ color: "#E8647A" }}>BUM</span>
        <span className="text-gray-800">PD</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        <NavLink to="/matches" active={isActive("/matches")}>
          <span className="relative flex items-center gap-1.5">
            Matches
            {totalBadge > 0 && (
              <span
                className="w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: "#E8647A" }}
              >
                {totalBadge}
              </span>
            )}
          </span>
        </NavLink>

        <NavLink to="/places" active={isActive("/places")}>
          Places
        </NavLink>

        <NavLink to="/profile" active={isActive("/profile")}>
          Profile
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-100 hover:bg-red-50 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "text-white"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
      style={active ? { backgroundColor: "#E8647A" } : {}}
    >
      {children}
    </Link>
  );
}
