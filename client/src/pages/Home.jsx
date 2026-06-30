import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, likeUser } from "../features/user/userSlice";
import { fetchUnreadCount, fetchLikedYouCount } from "../features/match/matchSlice";
import { fetchProfile, updateProfile } from "../features/profile/profileSlice";
import { logout } from "../features/auth/authSlice";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: users, loading } = useSelector((state) => state.user);
  const unreadCount = useSelector((state) => state.match.unreadCount);
  const likedYouCount = useSelector((state) => state.match.likedYouCount);
  const totalBadge = unreadCount + likedYouCount;
  const { data: profileData } = useSelector((state) => state.profile);

  // Search input states (display only)
  const [lookingForInput, setLookingForInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  // Applied filter states (only update on search)
  const [lookingFor, setLookingFor] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [likedMsg, setLikedMsg] = useState("");

  // Modal flow: null | "boost" | "gender" | "preference"
  const [modalStep, setModalStep] = useState(null);
  const [pendingNav, setPendingNav] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers(""));
    dispatch(fetchUnreadCount());
    dispatch(fetchLikedYouCount());
    dispatch(fetchProfile());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
      dispatch(fetchLikedYouCount());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Show modal flow based on profile state
  useEffect(() => {
    if (!profileData) return;
    const hasPref = !!localStorage.getItem("preferred_gender");

    if (!hasPref && profileData.Profile?.gender) {
      // Existing user in DB with gender set but no pref → auto-infer
      const opposite = profileData.Profile.gender === "male" ? "female" : "male";
      localStorage.setItem("preferred_gender", opposite);
      // Still check boost for incomplete profile
      const dismissed = sessionStorage.getItem("boost_dismissed");
      if (!dismissed) {
        const p = profileData.Profile;
        if (!p?.name || !p?.photoUrl || !p?.bio) {
          const timer = setTimeout(() => setModalStep("boost"), 800);
          return () => clearTimeout(timer);
        }
      }
    } else if (!hasPref) {
      // Brand new user — show full onboarding flow
      setModalStep("boost");
    } else {
      // Existing user with pref — show boost if profile incomplete
      const dismissed = sessionStorage.getItem("boost_dismissed");
      if (dismissed) return;
      const p = profileData.Profile;
      if (!p?.name || !p?.photoUrl || !p?.bio) {
        const timer = setTimeout(() => setModalStep("boost"), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [profileData]);

  const handleSearch = () => {
    setLookingFor(lookingForInput);
    setAgeFilter(ageInput);
    setLocationFilter(locationInput);
    dispatch(fetchUsers(lookingForInput));
  };

  const handleReset = () => {
    setLookingForInput("");
    setAgeInput("");
    setLocationInput("");
    setLookingFor("");
    setAgeFilter("");
    setLocationFilter("");
    dispatch(fetchUsers(""));
  };

  const hasActiveFilter = lookingFor || ageFilter || locationFilter;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLike = async (userId) => {
    try {
      const result = await dispatch(likeUser(userId));
      setLikedMsg(result?.matched ? "It's a match! 🎉" : "Liked! 💖");
      setTimeout(() => setLikedMsg(""), 2500);
    } catch {
      // silent
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Boost modal actions
  const handleBoostLater = () => {
    const hasPref = !!localStorage.getItem("preferred_gender");
    if (!hasPref) {
      setModalStep("gender");
    } else {
      sessionStorage.setItem("boost_dismissed", "1");
      setModalStep(null);
    }
  };

  const handleBoostComplete = () => {
    const hasPref = !!localStorage.getItem("preferred_gender");
    if (!hasPref) {
      setPendingNav("/profile");
      setModalStep("gender");
    } else {
      sessionStorage.setItem("boost_dismissed", "1");
      setModalStep(null);
      navigate("/profile");
    }
  };

  // Gender modal action — save to DB so filtering works correctly
  const handleGenderSelect = async (gender) => {
    localStorage.setItem("my_gender", gender);
    await dispatch(updateProfile({ gender }));
    setModalStep("preference");
  };

  // Preference modal action
  const handlePreference = (pref) => {
    localStorage.setItem("preferred_gender", pref);
    setModalStep(null);
    if (pendingNav) navigate(pendingNav);
  };

  const myProfile = profileData?.Profile;
  const myAvatar =
    myProfile?.photoUrl ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${profileData?.email || "user"}`;

  // Client-side filtering
  const preferredGender = localStorage.getItem("preferred_gender");
  const filteredUsers = useMemo(() =>
    users.filter((user) => {
      if (preferredGender && preferredGender !== "everyone") {
        if (user.Profile?.gender && user.Profile.gender !== preferredGender) return false;
      }
      if (ageFilter && user.Profile?.age) {
        if (user.Profile.age > Number(ageFilter)) return false;
      }
      if (locationFilter && user.Profile?.city) {
        if (!user.Profile.city.toLowerCase().includes(locationFilter.toLowerCase()))
          return false;
      }
      return true;
    }),
  [users, preferredGender, ageFilter, locationFilter]);

  const half = Math.ceil(filteredUsers.length / 2);
  const popularUsers = filteredUsers.slice(0, half);
  const newUsers = filteredUsers.slice(half);

  const showingModal = !!modalStep;

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#f9f5f6" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-56 flex-none flex flex-col bg-white border-r-2 border-gray-100 py-6 px-4" style={{ zIndex: showingModal ? 10 : "auto" }}>
        <Link to="/" className="mb-8 px-2 inline-block">
          <span className="text-2xl font-bold" style={{ letterSpacing: "0.15em" }}>
            <span style={{ color: "#E8647A" }}>BUM</span>
            <span className="text-gray-800">PD</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <SideNavItem icon={<IconDiscover />} label="Discover" to="/home" active />
          <SideNavItem icon={<IconMatches />} label="Matches" to="/matches" badge={totalBadge} />
          <SideNavItem icon={<IconPlaces />} label="Places" to="/places" />
          <SideNavItem icon={<IconProfile />} label="Profile" to="/profile" />
        </nav>

        <div className="border-t border-gray-100 my-3" />
        <div className="px-2">
          <div className="rounded-xl p-3 text-xs text-center" style={{ backgroundColor: "#fff5f7" }}>
            <p className="text-2xl mb-1">💫</p>
            <p className="font-semibold text-gray-700 mb-0.5">Find your match</p>
            <p className="text-gray-400 leading-relaxed">Add places to get better suggestions</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Modal overlay — only covers main content */}
        {showingModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(17, 24, 39, 0.65)" }}>

            {/* BOOST MODAL */}
            {modalStep === "boost" && (
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: "#E8647A" }} />
                <div className="p-6">
                  <div className="text-3xl mb-3">🚀</div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Boost Your Profile!</h2>
                  <p className="text-sm text-gray-400 mb-5">
                    Complete your profile to get more matches and stand out.
                  </p>
                  <div className="flex flex-col gap-2 mb-6">
                    <CheckItem done={!!myProfile?.name} label="Add your name" />
                    <CheckItem done={!!myProfile?.photoUrl} label="Upload a profile photo" />
                    <CheckItem done={!!myProfile?.bio} label="Write a short bio" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBoostLater}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleBoostComplete}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#E8647A" }}
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GENDER MODAL */}
            {modalStep === "gender" && (
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-6 overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: "#E8647A" }} />
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">What's your gender?</h2>
                  <p className="text-sm text-gray-400 mb-7">This helps us find better matches for you</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "male", label: "Male", icon: "👨" },
                      { value: "female", label: "Female", icon: "👩" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleGenderSelect(opt.value)}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50 transition-all group"
                      >
                        <span className="text-4xl">{opt.icon}</span>
                        <span className="font-semibold text-gray-800 text-base group-hover:text-rose-500">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCE MODAL */}
            {modalStep === "preference" && (
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-6 overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: "#E8647A" }} />
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Who are you looking for?</h2>
                  <p className="text-sm text-gray-400 mb-7">We'll show you people based on your preference</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "male", label: "Men", icon: "👨", desc: "Show men only" },
                      { value: "female", label: "Women", icon: "👩", desc: "Show women only" },
                      { value: "everyone", label: "Everyone", icon: "👥", desc: "Show everyone" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handlePreference(opt.value)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50 transition-all group"
                      >
                        <span className="text-3xl">{opt.icon}</span>
                        <span className="font-semibold text-gray-800 text-sm group-hover:text-rose-500">{opt.label}</span>
                        <span className="text-xs text-gray-400 text-center leading-tight">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header + Quick Search */}
        <div className="px-8 pt-6 pb-0 flex-none">
          <h1 className="text-xl font-bold text-gray-800">Discover People</h1>
          <p className="text-sm text-gray-400 mb-4">Find someone who shares your favorite places</p>

          {/* Quick Search Card */}
          <div className="rounded-2xl shadow-sm" style={{ backgroundColor: "#E8647A" }}>
            <div className="p-4 flex items-center gap-0">
            <p className="text-white font-bold text-base mr-4 whitespace-nowrap flex-none">Quick Search</p>
            <div className="flex-1 bg-white rounded-xl flex divide-x divide-gray-100 overflow-hidden">
              {/* Looking for */}
              <div className="flex-1 px-4 py-2.5">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Looking for</p>
                <select
                  className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none"
                  value={lookingForInput}
                  onChange={(e) => setLookingForInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  <option value="" disabled hidden>What are you looking for?</option>
                  <option value="">Everyone</option>
                  <option value="marriage">Marriage</option>
                  <option value="a serious relationship">Serious Relationship</option>
                  <option value="something casual">Something Casual</option>
                  <option value="not sure yet">Not Sure Yet</option>
                </select>
              </div>
              {/* Age */}
              <div className="flex-1 px-4 py-2.5">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Age</p>
                <input
                  type="number"
                  min={18}
                  max={99}
                  placeholder="Max age"
                  className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {/* Location */}
              <div className="flex-1 px-4 py-2.5">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Location</p>
                <input
                  type="text"
                  placeholder="Where are you based?"
                  className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            {/* Search button */}
            <button
              className="ml-3 w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors flex-none"
              onClick={handleSearch}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
            </button>
            </div>
            {/* Reset row */}
            {hasActiveFilter && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={handleReset}
                  className="text-white font-semibold text-sm hover:text-white/80 transition-colors"
                >
                  ✕ Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          {likedMsg && (
            <div className="toast toast-top toast-center z-50">
              <div className="alert alert-success"><span>{likedMsg}</span></div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg" style={{ color: "#E8647A" }} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-5xl mb-4">💔</p>
              <p className="text-lg font-semibold text-gray-600">No more people nearby.</p>
              <p className="text-sm text-gray-400">Check back later!</p>
            </div>
          ) : (
            <>
              <UserSection title="Popular Members" users={popularUsers} onLike={handleLike} />
              {newUsers.length > 0 && (
                <UserSection title="New to Bumpd" users={newUsers} onLike={handleLike} />
              )}
            </>
          )}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="w-64 flex-none bg-white border-l-2 border-gray-100 py-6 px-5 flex flex-col gap-4 overflow-y-auto" style={{ zIndex: showingModal ? 10 : "auto" }}>
        <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #E8647A 0%, #f0a0b0 100%)" }}>
          <div className="w-14 h-14 rounded-full bg-white/30 overflow-hidden mb-3 border-2 border-white/50">
            <img src={myAvatar} alt="me" className="w-full h-full object-cover object-top" />
          </div>
          <p className="text-xs opacity-75 mb-0.5">Welcome back!</p>
          <p className="font-bold text-sm truncate">{myProfile?.name || profileData?.email || "—"}</p>
          {myProfile?.city && <p className="text-xs opacity-75 mt-0.5">📍 {myProfile.city}</p>}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all border border-red-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log out</span>
        </button>

        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: "#E8647A" }}>{filteredUsers.length}</p>
            <p className="text-xs text-gray-400">Nearby</p>
          </div>
          <div className="flex-1 rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{totalBadge}</p>
            <p className="text-xs text-gray-400">Notifications</p>
          </div>
        </div>

        <Link
          to="/matches"
          className="w-full py-3 rounded-full font-semibold text-white text-sm text-center hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#E8647A" }}
        >
          See Matches ✨
        </Link>

        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-xs font-semibold text-amber-600 mb-1">💡 Tip</p>
          <p className="text-xs text-amber-500 leading-relaxed">
            Add more favorite places to your profile to get better matches!
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ── Sub-components ── */

function SideNavItem({ icon, label, to, active, badge }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? "text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
      }`}
      style={active ? { backgroundColor: "#E8647A" } : {}}
    >
      <span className="w-5 h-5 flex-none">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
          style={{ backgroundColor: active ? "rgba(255,255,255,0.3)" : "#E8647A" }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function CheckItem({ done, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none border-2 ${done ? "border-green-400 bg-green-400" : "border-gray-200"}`}>
        {done && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>{label}</span>
    </div>
  );
}

function UserSection({ title, users, onLike }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} onLike={onLike} />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, onLike }) {
  const name = user.Profile?.name || user.email;
  const bio = user.Profile?.bio;
  return (
    <div className="flex-none w-44 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow">
      <div className="relative h-52 bg-gray-100">
        {user.Profile?.photoUrl ? (
          <img src={user.Profile.photoUrl} alt={name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-rose-50">👤</div>
        )}
        <button
          onClick={() => onLike(user.id)}
          className="absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-white text-base"
          style={{ backgroundColor: "#E8647A" }}
        >♥</button>
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {name}
          {user.Profile?.age && <span className="font-normal text-gray-400"> · {user.Profile.age}</span>}
        </p>
        {user.Profile?.city && <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {user.Profile.city}</p>}
        {bio && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{bio.charAt(0).toUpperCase() + bio.slice(1)}</p>}
      </div>
    </div>
  );
}

/* ── SVG Icons ── */
function IconDiscover() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function IconMatches() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function IconPlaces() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
