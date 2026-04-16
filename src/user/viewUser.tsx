import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserData, getUserById, getUser, addFriend, removeFriend } from "../api/db";
import { GetPallate } from "../api/settings";
import { Avatar } from "../api/icons";
import Loading from "../components/Loading";
import { UserPlus, UserMinus, Mail, Clock3, Users, ChevronRight } from "lucide-react";
import Layout from "../components/layout";

interface ViewUserProps {
  user?: UserData;
}

export default function ViewUser({ user: userProp }: ViewUserProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const palette = GetPallate(currentUser);
  const isFriend = currentUser.friends.includes(user.id);
  const isMe = currentUser.id === user.id;
  const mutualFriends = currentUser.friends.filter((f) => user.friends.includes(f)).length;

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

  const statCards = [
    {
      label: "חברים",
      value: user.friends.length.toLocaleString(),
      icon: Users,
    },
    {
      label: "חברים משותפים",
      value: mutualFriends.toLocaleString(),
      icon: Users,
      hidden: isMe,
    },
    {
      label: "נראה לאחרונה",
      value: formattedLastSeen,
      icon: Clock3,
    },
  ].filter((item) => !item.hidden);

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
        className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{ background: palette.background, color: palette.text }}
        dir="rtl"
      >
        <div className="mx-auto w-full max-w-5xl mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-75 active:scale-95"
            style={{ backgroundColor: `${palette.primary}15`, color: palette.primary }}
          >
            <ChevronRight size={20} />
            חזור
          </button>
        </div>
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border shadow-[0_22px_70px_rgba(15,23,42,0.12)]" style={{ background: palette.main, borderColor: `${palette.primary}25` }}>
          <div
            className="relative h-44 sm:h-52"
            style={{
              background: `linear-gradient(140deg, ${palette.primary}30 0%, ${palette.tertiary}22 40%, ${palette.secondary}60 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_55%)]" />
          </div>

          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="rounded-[30px] border-4 bg-white p-1 shadow-xl" style={{ borderColor: `${palette.main}` }}>
                  <Avatar userID={user.id} icon={user.icon} className="h-24 w-24 rounded-[24px] sm:h-28 sm:w-28" />
                </div>

                <div className="pb-2">
                  <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: palette.text }}>
                    {user.name}
                  </h1>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm opacity-75" style={{ color: palette.text }}>
                    <Clock3 size={14} />
                    {formattedLastSeen}
                  </p>
                </div>
              </div>

              {!isMe && (
                <div className="pb-2">
                  {isFriend ? (
                    <button
                      onClick={handleUnfriend}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      <UserMinus size={18} />
                      הסר חבר
                    </button>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <UserPlus size={18} />
                      הוסף חבר
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-[24px] border p-5" style={{ borderColor: `${palette.primary}18`, backgroundColor: `${palette.background}` }}>
                <h2 className="text-base font-semibold" style={{ color: palette.text }}>
                  אודות
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 opacity-90" style={{ color: palette.text }}>
                  {user.bio?.trim() ? user.bio : "המשתמש עדיין לא הוסיף ביוגרפיה."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: `${palette.primary}12`, color: palette.text }}
                  >
                    <Mail size={14} />
                    {user.email}
                  </span>
                </div>
              </section>

              <section className="rounded-[24px] border p-4" style={{ borderColor: `${palette.primary}18`, backgroundColor: `${palette.background}` }}>
                <h2 className="mb-3 text-base font-semibold" style={{ color: palette.text }}>
                  נתונים
                </h2>
                <div className="space-y-3">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between rounded-2xl border px-3 py-3"
                        style={{ borderColor: `${palette.primary}16`, backgroundColor: palette.main }}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: palette.text }}>
                          <Icon size={15} style={{ color: palette.primary }} />
                          {stat.label}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: palette.text }}>
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: palette.primary }}>
                צבעים
              </span>
              <div className="flex gap-2">
                {Object.entries(palette).map(([key, value]) => (
                  <div
                    key={key}
                    title={key}
                    className="h-6 w-6 rounded-full border"
                    style={{ background: value, borderColor: `${palette.text}33` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
