import Layout from "../components/layout";
import { useEffect, useRef, useState } from "react";
import { UserPlus, Frown, Search, CheckCircle, LoaderCircle, RotateCcw, FileText, WandSparkles, Eye } from "lucide-react";
import Predict from "../api/ai";
import {
  findNonFriends,
  getUser,
  getUserById,
  addFriend,
  type UserData,
} from "../api/db";
import { Avatar } from "../api/icons";
import { useNavigate } from "react-router-dom";
import { DefaultPallate, GetPallate, type Pallate } from "../api/settings";
import Loading from "../components/Loading";
import Confetti from "react-confetti";

type SearchStage = {
  title: string;
  progress: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStage, setSearchStage] = useState<SearchStage | null>(null);
  const [found, setFound] = useState<UserData | null>(null);
  const [activeView, setActiveView] = useState<"search" | "match">("search");
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [user, setUser] = useState<UserData | null>(null);
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate());
  const navigate = useNavigate();

  // Ref for the auto-resizing textarea
  const searchRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate("/");
        return;
      }
      setUser(userData);
      setPallate(GetPallate(userData));
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!user) {
    return <Loading />;
  }

  const showConfetti = activeView === "match" && !!found;
  const matchPalette = found ? GetPallate(found) : pallate;

  const handleSearchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Auto-resize the textarea
    if (searchRef.current) {
      searchRef.current.style.height = "auto";
      searchRef.current.style.height = `${searchRef.current.scrollHeight}px`;
    }
    setSearchQuery(e.target.value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setActiveView("search");
    setIsSearching(true);
    setShowResult(false);
    setFound(null);

    const others = (await findNonFriends(user, 20)).filter(
      (u) => u.id !== user.id
    );

    const stages: SearchStage[] = [
      {
        title: "בודק מה בא לך",
        progress: 22,
      },
      {
        title: "מחפש התאמה טובה",
        progress: 52,
      },
      {
        title: "מסדר את התוצאות",
        progress: 79,
      },
      {
        title: "עוד שנייה וזה מוכן",
        progress: 96,
      },
    ];

    for (const stage of stages) {
      setSearchStage(stage);
      await wait(420);
    }

    const result = await Predict(user, others, searchQuery);
    setSearchStage((previous) =>
      previous
        ? {
            ...previous,
            progress: 100,
            title: "מוכן!",
          }
        : null
    );
    await wait(160);

    if (result === "null") {
      setShowResult(true);
      setIsSearching(false);
      setSearchStage(null);
      return;
    }
    const foundUser = await getUserById(result.trim());
    if (!foundUser) {
      setShowResult(true);
      setIsSearching(false);
      setSearchStage(null);
      return;
    }
    setFound(foundUser);
    setShowResult(true);
    setIsSearching(false);
    setSearchStage(null);
    setActiveView("match");
  };

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    // Persist the friend addition
    await addFriend(user, friendId);
    // Re-fetch the current user to update the friend list
    const updatedUser = await getUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  return (
    <Layout>
      <div
        className="h-[92vh] relative overflow-hidden ai-page"
        dir="rtl"
        style={{ 
          backgroundColor: pallate.background,
          backgroundImage: `radial-gradient(circle at top right, ${pallate.primary}20 0%, transparent 50%)`
        }}
      >
        {showConfetti && (
          <Confetti
            width={viewportSize.width}
            height={viewportSize.height}
            recycle={true}
            numberOfPieces={180}
            gravity={0.22}
            colors={[pallate.primary, pallate.secondary, "#22c55e", "#f59e0b", "#ffffff"]}
          />
        )}

        <main className="relative min-h-screen px-4 py-10 sm:px-6">
          <section
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
              activeView === "search" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <h1
              className="text-5xl font-bold mb-12 text-center"
              style={{ color: pallate.text }}
            >
              חיפוש חברים באמצעות <span style={{ color: pallate.primary }}>AI</span>
            </h1>

            <form
              onSubmit={handleSearch}
              className="w-full max-w-3xl relative mb-12 rounded-[28px] border p-4 sm:p-5"
              style={{ backgroundColor: `${pallate.main}cc`, borderColor: `${pallate.primary}1f` }}
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold" style={{ color: pallate.primary }}>
                <WandSparkles className="h-4 w-4" />
                <span>ספר בקצרה את סוג החבר שאתה מחפש</span>
              </div>

              <div className="relative">
                <div
                  className="absolute inset-0 bg-gradient-to-tr rounded-lg"
                  style={{
                    background: `linear-gradient(to right, ${pallate.primary}, ${pallate.secondary})`,
                    padding: "2px",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: pallate.background }}
                  ></div>
                </div>
                <textarea
                  ref={searchRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="חפש חבר..."
                  rows={1}
                  className="w-full py-4 px-6 text-xl text-right bg-transparent rounded-lg focus:outline-none relative z-10 placeholder:text-gray-400 resize-none overflow-hidden"
                  style={{ color: pallate.text, backgroundColor: pallate.background }}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="hidden md:flex md:absolute left-2 top-1/2 transform -translate-y-1/2 items-center gap-2 px-5 py-2 rounded-lg text-base font-semibold transition-colors duration-300 disabled:cursor-not-allowed z-20"
                  style={{
                    backgroundColor: isSearching ? pallate.secondary : pallate.primary,
                    color: pallate.background,
                  }}
                >
                  <Search size={18} />
                  {isSearching ? "מחפש..." : "חפש"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-300 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSearching ? pallate.secondary : pallate.primary,
                  color: pallate.background,
                }}
              >
                <Search size={20} />
                {isSearching ? "מחפש..." : "חפש"}
              </button>
            </form>

            {!showResult && !isSearching && (
              <p
                className="mt-8 text-xl text-center max-w-2xl"
                style={{ color: pallate.text }}
              >
                הזן שם או תיאור קצר ונמצא לך התאמה נעימה.
              </p>
            )}

            {isSearching && searchStage && (
              <div
                className="w-full max-w-xl rounded-2xl border p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                style={{ backgroundColor: `${pallate.main}f2`, borderColor: `${pallate.primary}20` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium" style={{ color: pallate.text }}>
                    {searchStage.title}
                  </p>
                  <LoaderCircle className="h-4 w-4 animate-spin" style={{ color: pallate.primary }} />
                </div>

                <div className="mt-3 h-2 w-full rounded-full" style={{ backgroundColor: `${pallate.primary}14` }}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${searchStage.progress}%`, backgroundColor: pallate.primary }}
                  />
                </div>
              </div>
            )}

            {showResult && !found && (
              <div
                className="w-full max-w-md mx-auto rounded-xl p-8 flex flex-col items-center justify-center shadow-2xl animate-fade-in-up"
                style={{ backgroundColor: pallate.main }}
              >
                <Frown size={48} className="mb-4" style={{ color: pallate.primary }} />
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: pallate.text }}
                >
                  סליחה, לא מצאנו חבר עבורך
                </h2>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setFound(null);
                    setSearchQuery("");
                  }}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 hover:bg-opacity-80"
                  style={{
                    backgroundColor: pallate.primary,
                    color: pallate.background,
                  }}
                >
                  <RotateCcw size={16} />
                  נסה שוב
                </button>
              </div>
            )}
          </section>

          <section
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeView === "match" && found ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {found && user && (
              <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <div
                  className="w-full max-w-2xl overflow-hidden rounded-[36px] border text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
                  style={{ backgroundColor: `${pallate.main}f4`, borderColor: `${matchPalette.primary}26` }}
                >
                  <div
                    className="relative h-44 sm:h-52"
                    style={{
                      background: `linear-gradient(140deg, ${matchPalette.primary}32 0%, ${matchPalette.tertiary}24 42%, ${matchPalette.secondary}66 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_55%)]" />

                    <button
                      type="button"
                      onClick={() => navigate(`/user/${found.id}`)}
                      className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition hover:-translate-y-0.5"
                      style={{ backgroundColor: `${matchPalette.main}f2`, borderColor: `${matchPalette.primary}30`, color: matchPalette.primary }}
                      aria-label="צפה בפרופיל"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <div className="relative px-6 pb-10 sm:px-10">
                    <div className="mx-auto -mt-16 w-fit rounded-full border-4 shadow-xl sm:-mt-20" style={{ borderColor: pallate.main }}>
                      <Avatar
                        userID={found.id}
                        className="h-32 w-32 rounded-full object-cover"
                        icon={found.icon}
                      />
                    </div>

                    <p
                      className="mt-4 inline-flex rounded-full px-4 py-1 text-xs font-semibold"
                      style={{ backgroundColor: `${matchPalette.primary}1a`, color: matchPalette.primary }}
                    >
                      מצאנו חבר מושלם עבורך!
                    </p>

                    <h2 className="mt-6 text-3xl font-semibold" style={{ color: pallate.text }}>
                      {found.name}
                    </h2>

                    <div className="mx-auto mt-4 w-full max-w-xl rounded-2xl border px-4 py-3" style={{ borderColor: `${matchPalette.primary}22`, backgroundColor: `${pallate.background}d6` }}>
                      {found.bio?.trim() ? (
                        <p className="text-sm leading-6 opacity-85" style={{ color: pallate.text }}>
                          {found.bio}
                        </p>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-sm" style={{ color: "#6b7280" }}>
                          <FileText className="h-4 w-4" />
                          <span>אין תיאור</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        onClick={() => handleAddFriend(found.id)}
                        disabled={user.friends.includes(found.id)}
                        className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65"
                        style={{ backgroundColor: user.friends.includes(found.id) ? "#22c55e" : matchPalette.primary }}
                      >
                        {user.friends.includes(found.id) ? <CheckCircle size={18} /> : <UserPlus size={18} />}
                        {user.friends.includes(found.id) ? "נוסף" : "הוסף חבר"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView("search");
                          setShowResult(false);
                          setFound(null);
                          setSearchQuery("");
                        }}
                        className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                        style={{ borderColor: `${matchPalette.primary}26`, color: pallate.text, backgroundColor: `${pallate.background}e6` }}
                      >
                        <Search size={17} />
                        חיפוש חדש
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </Layout>
  );
}
