import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaces, addPlace, deletePlace } from "../features/place/placeSlice";
import Loading from "../components/Loading";
import useMinLoading from "../hooks/useMinLoading";

export default function FavoritePlaces() {
  const dispatch = useDispatch();
  const { data: places, loading } = useSelector((state) => state.place);
  const showLoading = useMinLoading(loading);

  const [form, setForm] = useState({ placeName: "", note: "" });
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState({ lat: null, long: null });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchPlaces());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.placeName.trim()) return;
    setAdding(true);
    try {
      await dispatch(addPlace({ ...form, ...coords }));
      setForm({ placeName: "", note: "" });
      setCoords({ lat: null, long: null });
      setShowForm(false);
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePlace(id));
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f5f6" }}>
      {showLoading && <Loading />}
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Favorite Places</h1>
            {places.length > 0 && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: "#E8647A" }}
              >
                {places.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: showForm ? "#9ca3af" : "#E8647A" }}
          >
            {showForm ? "✕ Cancel" : "+ Add Place"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Add a new place</p>
            <form onSubmit={handleAdd} className="flex flex-col gap-3" noValidate>
              <input
                type="text"
                name="placeName"
                placeholder="Place name (e.g. Kopi Kenangan SCBD)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors"
                value={form.placeName}
                onChange={handleChange}
              />
              <textarea
                name="note"
                placeholder="Why do you love this place? (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-rose-300 transition-colors resize-none"
                rows={2}
                value={form.note}
                onChange={handleChange}
              />

              {/* Location row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: coords.lat ? "#E8647A" : "#e5e7eb",
                    color: coords.lat ? "#E8647A" : "#6b7280",
                    backgroundColor: coords.lat ? "#fff5f7" : "white",
                  }}
                >
                  {locating ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use My Location
                    </>
                  )}
                </button>
                {coords.lat && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {coords.lat.toFixed(4)}, {coords.long.toFixed(4)}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#E8647A" }}
              >
                {adding ? <span className="loading loading-spinner loading-sm" /> : "Save Place"}
              </button>
            </form>
          </div>
        )}

        {/* Places List */}
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-32 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5"
              style={{ backgroundColor: "#fff0f3" }}
            >
              📍
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No favorite places yet</p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Add places you love to help find people with the same taste!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-none text-base"
                  style={{ backgroundColor: "#fff0f3", color: "#E8647A" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{place.placeName}</p>
                  {place.note && (
                    <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{place.note}</p>
                  )}
                  {place.lat && (
                    <p className="text-xs text-gray-300 mt-1">
                      {Number(place.lat).toFixed(4)}, {Number(place.long).toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(place.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
