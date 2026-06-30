import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login, register, resetError } from "../features/auth/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { url } from "../constants/url";
import Alert from "../components/Alert";

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [modal, setModal] = useState(null); // null | "login" | "register"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const openModal = (type) => {
    setModal(type);
    setLocalError("");
    setFormData({ email: "", password: "" });
    dispatch(resetError());
  };

  const closeModal = () => {
    setModal(null);
    setLocalError("");
    dispatch(resetError());
  };

  const handleChange = (e) => {
    setLocalError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email) return setLocalError("Email is required");
    if (!formData.password) return setLocalError("Password is required");
    try {
      await dispatch(login(formData));
      navigate("/home");
    } catch {
      // handled by slice
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email) return setLocalError("Email is required");
    if (!formData.password) return setLocalError("Password is required");
    try {
      await dispatch(register(formData));
      await dispatch(login(formData));
      navigate("/home");
    } catch {
      // handled by slice
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await axios.post(
          `${url}/auth/google-login`,
          {},
          { headers: { access_token_google: tokenResponse.access_token } },
        );
        localStorage.removeItem("seen_like_count");
        localStorage.removeItem("preferred_gender");
        localStorage.removeItem("my_gender");
        localStorage.setItem("access_token", data.access_token);
        navigate("/home");
      } catch (err) {
        setLocalError(err.response?.data?.message || "Google login failed");
      }
    },
    onError: () => setLocalError("Google login failed"),
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* ── NAVBAR ── */}
      <nav
        className="grid bg-white border-b-2 border-gray-300 flex-none"
        style={{
          gridTemplateColumns: "calc(50vw - 130px) 260px 160px 160px",
          height: "64px",
        }}
      >
        {/* Left: Decorative assets */}
        <div className="flex items-center gap-3 px-8 border-r-2 border-gray-300">
          <div
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{ color: "#E8647A" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
            </svg>
            <span>Places</span>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-base"
            style={{ color: "#E8647A" }}
          >
            ♥
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-sm font-medium text-amber-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Match</span>
          </div>
        </div>

        {/* BUMPD — centered */}
        <Link
          to="/"
          className="flex items-center justify-center border-r-2 border-gray-300 text-2xl font-bold hover:opacity-80 transition-opacity"
          style={{ letterSpacing: "0.18em" }}
        >
          <span style={{ color: "#E8647A" }}>BUM</span>
          <span className="text-gray-800">PD</span>
        </Link>

        {/* Log In */}
        <button
          onClick={() => openModal("login")}
          className="flex items-center justify-center border-r-2 border-gray-300 text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
        >
          Log In
        </button>

        {/* Sign Up */}
        <button
          onClick={() => openModal("register")}
          className="flex items-center justify-center text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#E8647A" }}
        >
          Sign Up
        </button>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden flex-1 flex items-center px-8"
        style={{
          background:
            "linear-gradient(160deg, #ffffff 0%, #fff5f7 45%, #ffdde4 100%)",
        }}
      >
        {/* Floating card top-left */}
        <div className="absolute top-10 left-20 w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-rose-100 rotate-[-10deg]">
          <span className="text-2xl">📍</span>
        </div>
        <div
          className="absolute top-28 left-10 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-sm shadow-sm"
          style={{ color: "#E8647A" }}
        >
          ♥
        </div>

        {/* Floating card top-right */}
        <div className="absolute top-10 right-20 w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-rose-100 rotate-10deg">
          <span className="text-2xl" style={{ color: "#E8647A" }}>
            ♥
          </span>
        </div>
        <div className="absolute top-28 right-10 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm shadow-sm text-amber-400">
          ✦
        </div>

        {/* Dot decorations */}
        <div className="absolute bottom-12 left-28 w-3 h-3 rounded-full bg-rose-200" />
        <div className="absolute top-16 right-44 w-2 h-2 rounded-full bg-rose-300" />
        <div className="absolute bottom-16 right-32 w-4 h-4 rounded-full bg-rose-100" />
        <div className="absolute bottom-8 left-1/4 w-2 h-2 rounded-full bg-amber-200" />

        {/* Hero Content */}
        <div className="max-w-2xl mx-auto text-center relative z-10 w-full">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-3">
            Find Your <span style={{ color: "#E8647A" }}>Real Connection</span>
          </h1>
          <p className="text-xl font-semibold text-gray-500 mb-8 tracking-wide">
            Be Seen. Be Found. Be Matched.
          </p>
          <button
            onClick={() => openModal("register")}
            className="inline-block px-8 py-3 border-2 border-gray-800 text-gray-800 font-semibold rounded-full hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm"
          >
            Find Your Match
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className="grid grid-cols-3 flex-none"
        style={{ borderTop: "3px solid #111827" }}
      >
        {/* Card 1 - Mutual Places */}
        <div
          className="p-7"
          style={{
            backgroundColor: "#EBF5FF",
            borderRight: "3px solid #111827",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mb-5 text-xl">
            📍
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Mutual Places
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Temukan orang yang suka pergi ke tempat yang sama sepertimu. Koneksi
            yang nyata selalu dimulai dari kesamaan yang sesungguhnya.
          </p>
        </div>

        {/* Card 2 - AI Icebreaker Assist */}
        <div
          className="p-7"
          style={{
            backgroundColor: "#FFFDE7",
            borderRight: "3px solid #111827",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center mb-5 text-xl">
            ✨
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            AI Icebreaker Assist
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Bingung mau mulai ngobrol apa? AI kami siap carikan kalimat pembuka
            yang paling pas dan personal untuk kalian berdua.
          </p>
        </div>

        {/* Card 3 - Smart Matching */}
        <div className="p-7 relative" style={{ backgroundColor: "#FFE4E8" }}>
          <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center mb-5 text-xl">
            💡
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Smart Matching
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Algoritma kami mencocokkan kamu dengan orang yang paling relevan
            berdasarkan tempat favorit dan minat yang kamu miliki.
          </p>
          <div
            className="absolute bottom-5 right-5 text-4xl font-black select-none"
            style={{ color: "#E8647A" }}
          >
            ✦
          </div>
        </div>
      </section>

      {/* ── MODAL OVERLAY ── */}
      {(modal === "login" || modal === "register") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(17, 24, 39, 0.6)" }}
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full"
              style={{ backgroundColor: "#E8647A" }}
            />

            <div className="p-8">
              {/* Decorative elements */}
              <div className="absolute top-6 right-6 text-rose-300 text-lg select-none">
                ✦
              </div>
              <div className="absolute top-12 right-10 w-2 h-2 rounded-full bg-rose-200" />
              <div className="absolute bottom-20 left-5 w-2 h-2 rounded-full bg-rose-200" />
              <div className="absolute bottom-16 left-8 w-1.5 h-1.5 rounded-full bg-amber-200" />

              {/* Title */}
              {modal === "login" ? (
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-gray-800">Welcome Back, </span>
                  <span style={{ color: "#E8647A" }}>Cupid</span>
                </h2>
              ) : (
                <h2 className="text-2xl font-bold mb-6">
                  <span style={{ color: "#E8647A" }}>
                    Begin Your Love Journey.
                  </span>
                  <span className="text-gray-800"> Now.</span>
                </h2>
              )}

              {/* Error */}
              <div className="mb-2">
                <Alert message={localError || error} />
              </div>

              {/* Form */}
              <form
                onSubmit={modal === "login" ? handleLogin : handleRegister}
                className="flex flex-col gap-4"
                noValidate
              >
                {/* Email field with decorative dot */}
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#E8647A", opacity: 0.5 }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="input input-bordered w-full pl-7 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-200 text-xs select-none">
                    ✦
                  </span>
                </div>

                {/* Password field with decorative dot */}
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#E8647A", opacity: 0.5 }}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input input-bordered w-full pl-7 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-200 text-xs select-none">
                    ✦
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn w-full text-white font-semibold"
                  style={{ backgroundColor: "#E8647A", borderColor: "#E8647A" }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : modal === "login" ? (
                    "Login"
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              {/* Google — login only */}
              {modal === "login" && (
                <>
                  <div className="divider text-xs text-base-content/40 my-3">
                    OR
                  </div>
                  <button
                    type="button"
                    onClick={() => googleLogin()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      className="w-4 h-4"
                      alt="Google"
                    />
                    Continue with Google
                  </button>
                </>
              )}

              {/* Switch */}
              <p className="text-center text-sm mt-4 text-gray-500">
                {modal === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => openModal("register")}
                      className="font-semibold hover:underline"
                      style={{ color: "#E8647A" }}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => openModal("login")}
                      className="font-semibold hover:underline"
                      style={{ color: "#E8647A" }}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
