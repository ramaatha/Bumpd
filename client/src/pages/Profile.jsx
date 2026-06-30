import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, uploadPhoto } from "../features/profile/profileSlice";
import Loading from "../components/Loading";
import useMinLoading from "../hooks/useMinLoading";

const INTERESTS = {
  Sports: ["football", "basketball", "gym", "badminton", "swimming", "martial arts"],
  Movies: ["action", "crime", "thriller", "drama", "sci-fi", "documentaries"],
  Exploring: ["traveling", "hiking", "camping", "road trips", "beach", "mountains"],
  "Going Out": ["cafe-hopping", "museum and galleries", "shopping", "karaoke", "going to movies", "concerts"],
};

const INTEREST_EMOJI = {
  "football": "⚽",
  "basketball": "🏀",
  "gym": "💪",
  "badminton": "🏸",
  "swimming": "🏊",
  "martial arts": "🥋",
  "action": "💥",
  "crime": "🔍",
  "thriller": "😱",
  "drama": "🎭",
  "sci-fi": "🚀",
  "documentaries": "🎬",
  "traveling": "✈️",
  "hiking": "🥾",
  "camping": "⛺",
  "road trips": "🚗",
  "beach": "🏖️",
  "mountains": "⛰️",
  "cafe-hopping": "☕",
  "museum and galleries": "🏛️",
  "shopping": "🛍️",
  "karaoke": "🎤",
  "going to movies": "🍿",
  "concerts": "🎵",
};

const PERSONALITIES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const RELATIONSHIP_GOALS = [
  { value: "marriage", label: "Marriage" },
  { value: "a serious relationship", label: "A Serious Relationship" },
  { value: "something casual", label: "Something Casual" },
  { value: "not sure yet", label: "Not Sure Yet" },
];

export default function Profile() {
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);
  const showLoading = useMinLoading(loading);

  const [genderPref, setGenderPref] = useState(
    localStorage.getItem("preferred_gender") || "everyone"
  );

  const handleGenderPrefChange = (val) => {
    setGenderPref(val);
    localStorage.setItem("preferred_gender", val);
  };

  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    city: "",
    bio: "",
    personality: "",
    interests: [],
    relationshipGoals: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  useEffect(() => {
    if (profile?.Profile) {
      const p = profile.Profile;
      setForm({
        name: p.name || "",
        gender: p.gender || "",
        age: p.age || "",
        city: p.city || "",
        bio: p.bio || "",
        personality: p.personality || "",
        interests: p.interests || [],
        relationshipGoals: p.relationshipGoals || "",
      });
      setPhotoPreview(p.photoUrl || null);
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    if (form.interests.includes(interest)) {
      setForm({ ...form, interests: form.interests.filter((i) => i !== interest) });
    } else {
      setForm({ ...form, interests: [...form.interests, interest] });
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const photoUrl = await dispatch(uploadPhoto(file));
      setPhotoPreview(photoUrl);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ ...form, age: Number(form.age) }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silent
    }
  };

  const avatarUrl = photoPreview ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile?.email || "user"}`;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f5f6" }}>
      {showLoading && <Loading />}
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>

      {/* Photo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-4"
          style={{ borderColor: "#E8647A" }}
        >
          <img src={avatarUrl} alt="profile" className="w-full h-full object-cover object-top" />
        </div>
        <button
          type="button"
          className="px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
          style={{ borderColor: "#E8647A", color: "#E8647A" }}
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? <span className="loading loading-spinner loading-xs" /> : "Change Photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* Gender + Age */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            <select
              name="gender"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors bg-white"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              min={18}
              max={99}
            />
          </div>
        </div>

        {/* City */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">City</label>
          <input
            type="text"
            name="city"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors"
            placeholder="e.g. Jakarta"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Bio</label>
          <textarea
            name="bio"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors resize-none"
            placeholder="Tell something about yourself..."
            rows={3}
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        {/* Personality */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Personality</label>
          <select
            name="personality"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors bg-white"
            value={form.personality}
            onChange={handleChange}
          >
            <option value="">Select MBTI</option>
            {PERSONALITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Relationship Goals */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Relationship Goals</label>
          <select
            name="relationshipGoals"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors bg-white"
            value={form.relationshipGoals}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {RELATIONSHIP_GOALS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Gender Preference */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Gender Preference</label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors bg-white"
            value={genderPref}
            onChange={(e) => handleGenderPrefChange(e.target.value)}
          >
            <option value="everyone">Everyone</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
          </select>
        </div>

        {/* Interests */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Interests</label>
          {Object.entries(INTERESTS).map(([category, items]) => (
            <div key={category}>
              <p className="text-sm font-semibold text-gray-600 mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all"
                    style={
                      form.interests.includes(item)
                        ? { backgroundColor: "#E8647A", borderColor: "#E8647A", color: "white" }
                        : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    <span>{INTEREST_EMOJI[item]}</span>
                    <span>{item.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity mt-2"
          style={{ backgroundColor: "#E8647A" }}
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
        </button>

        {saved && (
          <div className="toast toast-top toast-center z-50">
            <div className="alert alert-success">
              <span>Profile updated! ✅</span>
            </div>
          </div>
        )}
      </form>
    </div>
    </div>
  );
}
