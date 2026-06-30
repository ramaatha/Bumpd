import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, markNotificationsRead, clearLikedYouCount, fetchReceivedLikes } from "../features/match/matchSlice";
import { likeUser } from "../features/user/userSlice";
import Loading from "../components/Loading";
import useMinLoading from "../hooks/useMinLoading";

const INTEREST_EMOJI = {
  "football": "⚽", "basketball": "🏀", "gym": "💪", "badminton": "🏸",
  "swimming": "🏊", "martial arts": "🥋", "action": "💥", "crime": "🔍",
  "thriller": "😱", "drama": "🎭", "sci-fi": "🚀", "documentaries": "🎬",
  "traveling": "✈️", "hiking": "🥾", "camping": "⛺", "road trips": "🚗",
  "beach": "🏖️", "mountains": "⛰️", "cafe-hopping": "☕",
  "museum and galleries": "🏛️", "shopping": "🛍️", "karaoke": "🎤",
  "going to movies": "🍿", "concerts": "🎵",
};

export default function Matches() {
  const dispatch = useDispatch();
  const { data: matches, receivedLikes, loading } = useSelector((state) => state.match);
  const myId = useSelector((state) => state.profile.data?.id);
  const showLoading = useMinLoading(loading);

  const [selectedLike, setSelectedLike] = useState(null);
  const [likingBack, setLikingBack] = useState(false);
  const [likeMsg, setLikeMsg] = useState("");

  useEffect(() => {
    dispatch(fetchMatches());
    dispatch(fetchReceivedLikes());
    dispatch(markNotificationsRead());
    dispatch(clearLikedYouCount());
  }, []);

  // Filter out people who already matched
  const matchedUserIds = matches.flatMap((m) => [m.user1Id, m.user2Id]).filter((id) => id !== myId);
  const pendingLikes = receivedLikes.filter((like) => !matchedUserIds.includes(like.fromUserId));

  const handleLikeBack = async (fromUserId) => {
    setLikingBack(true);
    try {
      const result = await dispatch(likeUser(fromUserId));
      setLikeMsg(result?.matched ? "It's a match! 🎉" : "Liked back! 💖");
      setTimeout(() => setLikeMsg(""), 2500);
      setSelectedLike(null);
      // Refresh data
      dispatch(fetchMatches());
      dispatch(fetchReceivedLikes());
    } catch {
      // silent
    } finally {
      setLikingBack(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f5f6" }}>
      {showLoading && <Loading />}

      {/* Toast */}
      {likeMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success"><span>{likeMsg}</span></div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedLike && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(17, 24, 39, 0.65)" }}
          onClick={() => setSelectedLike(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Rose top bar */}
            <div className="h-1 w-full" style={{ backgroundColor: "#E8647A" }} />

            {/* Close button */}
            <div className="flex justify-end px-5 pt-4">
              <button
                onClick={() => setSelectedLike(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar */}
            {(() => {
              const liker = selectedLike.Liker;
              const p = liker?.Profile;
              const avatar = p?.photoUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${liker?.email || "user"}`;
              return (
                <div className="px-6 pb-6">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 mb-3" style={{ borderColor: "#E8647A" }}>
                      <img src={avatar} alt={p?.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {p?.name || liker?.email}
                      {p?.age && <span className="font-normal text-gray-400">, {p.age}</span>}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                      {p?.city && <span className="text-sm text-gray-400">📍 {p.city}</span>}
                      {p?.personality && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#E8647A" }}>
                          {p.personality}
                        </span>
                      )}
                    </div>
                    {p?.relationshipGoals && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        🎯 Looking for <span className="font-medium text-gray-600">{p.relationshipGoals}</span>
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  {p?.bio && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">About</p>
                      <p className="text-sm text-gray-700 leading-relaxed">"{p.bio}"</p>
                    </div>
                  )}

                  {/* Interests */}
                  {p?.interests?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {p.interests.map((interest) => (
                          <span
                            key={interest}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: "#fff0f3", color: "#E8647A" }}
                          >
                            <span>{INTEREST_EMOJI[interest] || "✨"}</span>
                            <span>{interest.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedLike(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() => handleLikeBack(selectedLike.fromUserId)}
                      disabled={likingBack}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#E8647A" }}
                    >
                      {likingBack ? <span className="loading loading-spinner loading-sm" /> : "Like Back 💖"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">

        {/* Liked You Section */}
        {pendingLikes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Liked You</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#E8647A" }}>
                {pendingLikes.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {pendingLikes.map((like) => {
                const liker = like.Liker;
                const likerProfile = liker?.Profile;
                const avatarUrl = likerProfile?.photoUrl ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${liker?.email || "user"}`;

                return (
                  <div
                    key={like.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedLike(like)}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-none" style={{ borderColor: "#fcc8d3" }}>
                      <img src={avatarUrl} alt={likerProfile?.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{likerProfile?.name || liker?.email}</p>
                      {(likerProfile?.age || likerProfile?.city) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[likerProfile.age, likerProfile.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLikeBack(like.fromUserId); }}
                      disabled={likingBack}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity flex-none"
                      style={{ backgroundColor: "#E8647A" }}
                    >
                      Like Back 💖
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matches Section */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Your Matches</h1>
          {matches.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#E8647A" }}>
              {matches.length}
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5" style={{ backgroundColor: "#fff0f3" }}>
              💔
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No matches yet</p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Keep exploring and liking people — your first match is just around the corner!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((match) => {
              const other = match.user1Id === myId ? match.User2 : match.User1;
              const otherProfile = other?.Profile;
              const avatarUrl = otherProfile?.photoUrl ||
                `https://api.dicebear.com/7.x/thumbs/svg?seed=${other?.email || "user"}`;

              return (
                <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex-none" style={{ borderColor: "#E8647A" }}>
                      <img src={avatarUrl} alt={otherProfile?.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-base">{otherProfile?.name || other?.email}</p>
                      {(otherProfile?.age || otherProfile?.city) && (
                        <p className="text-sm text-gray-400 mt-0.5">
                          {[otherProfile.age, otherProfile.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#E8647A" }}>
                        Matched ✓
                      </span>
                    </div>
                  </div>

                  {match.icebreaker && match.user1Id === myId && (
                    <div className="rounded-xl p-3.5 border" style={{ backgroundColor: "#fff5f7", borderColor: "#fcc8d3" }}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: "#E8647A" }}>✨ AI Icebreaker</p>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"{match.icebreaker}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
