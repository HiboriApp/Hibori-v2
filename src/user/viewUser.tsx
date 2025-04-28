import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserData, getUserById, getUser, addFriend, removeFriend } from "../api/db";
import { GetPallate } from "../api/settings";
import { Avatar } from "../api/icons";
import Loading from "../components/Loading";
import { UserPlus, UserMinus } from "lucide-react";
import Layout from "../components/layout";

interface ViewUserProps {
  user?: UserData;
}

export default function ViewUser({ user: userProp }: ViewUserProps) {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserData | undefined>(userProp);
  const [loading, setLoading] = useState(!userProp);
  const [currentUser, setCurrentUser] = useState<UserData | undefined>();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userProp && id) {
      setLoading(true);
      getUserById(id).then((u) => {
        setUser(u);
        setLoading(false);
      });
    }
    getUser().then(setCurrentUser);
  }, [id, userProp]);

  if (loading || !user) return <Loading />;
  if (!currentUser) return <Loading />;

  const palette = GetPallate(user);
  const isFriend = currentUser.friends.includes(user.id);
  const isMe = currentUser.id === user.id;
  const mutualFriends = currentUser.friends.filter((f) => user.friends.includes(f)).length;

  // Format last seen as relative time in Hebrew
  function getRelativeTime(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSec < 60) return "לפני דקה";
    if (diffMin < 60) return `לפני ${diffMin} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    return `לפני ${diffDays} ימים`;
  }
  const formattedLastSeen = getRelativeTime(user.lastSeen);

  const handleAddFriend = async () => {
    setActionLoading(true);
    await addFriend(currentUser, user.id);
    const updated = await getUser();
    setCurrentUser(updated);
    setActionLoading(false);
  };

  const handleUnfriend = async () => {
    setActionLoading(true);
    await removeFriend(currentUser, user.id);
    const updated = await getUser();
    setCurrentUser(updated);
    setActionLoading(false);
  };

  return (
    <Layout>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: palette.background, color: palette.text }}
        dir="rtl"
      >
        <div
          className="w-full max-w-md rounded-xl shadow-lg p-0 flex flex-col items-center bg-opacity-90"
          style={{ background: palette.main }}
        >
          {/* Profile Header */}
          <div className="w-full flex flex-col items-center p-8 border-b" style={{ borderColor: palette.secondary }}>
            <Avatar userID={user.id} icon={user.icon} className={`w-32 h-32 rounded-full mb-4 shadow-lg border-4`} />
            <div style={{ borderColor: palette.primary, borderWidth: 4, borderStyle: 'solid', borderRadius: '9999px', marginTop: '-8.5rem', marginBottom: '1rem', width: '8rem', height: '8rem', position: 'absolute', zIndex: -1, left: '50%', transform: 'translateX(-50%)' }} />
            <h2 className="text-3xl font-bold mb-1" style={{ color: palette.primary }}>{user.name}</h2>
            <p className="text-sm mb-2 font-medium" style={{ color: palette.secondary }}>{user.email}</p>
            <p className="text-base mb-2 text-center" style={{ color: palette.text }}>{user.bio || "אין ביוגרפיה"}</p>
            {/* Palette Preview */}
            <div className="flex gap-2 mb-2 mt-2">
              {Object.entries(palette).map(([key, value]) => (
                <div key={key} title={key} className="w-6 h-6 rounded-full border" style={{ background: value, borderColor: palette.text }} />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full flex flex-col gap-2 p-6 border-b" style={{ borderColor: palette.secondary }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold" style={{ color: palette.tertiary }}>נראה לאחרונה:</span>
              <span className="text-sm" style={{ color: palette.text }}>{formattedLastSeen}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold" style={{ color: palette.tertiary }}>חברים:</span>
              <span className="text-lg font-bold" style={{ color: palette.primary }}>{user.friends.length.toLocaleString()}</span>
            </div>
            {!isMe && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold" style={{ color: palette.tertiary }}>חברים משותפים:</span>
                <span className="text-lg font-bold" style={{ color: palette.primary }}>{mutualFriends.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Action Section */}
          {!isMe && (
            <div className="w-full flex flex-col items-center p-6">
              {isFriend ? (
                <button
                  onClick={handleUnfriend}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition text-lg font-semibold shadow-md"
                >
                  <UserMinus size={22} /> הסר חבר
                </button>
              ) : (
                <button
                  onClick={handleAddFriend}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition text-lg font-semibold shadow-md"
                >
                  <UserPlus size={22} /> הוסף חבר
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
