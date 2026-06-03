// Matches.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeagueService from "../api/services/league.service";
import TournamentService from "../api/services/tournament.service";
import MatchService from "../api/services/match.service";
import BracketRound from "../components/matches/BracketRound";

const ROUNDS = [
  { key: "round_of_16", name: "Round of 16", level: 1 },
  { key: "quarterfinals", name: "Quarterfinals", level: 2 },
  { key: "semifinals", name: "Semifinals", level: 3 },
  { key: "final", name: "Final", level: 4 },
];

const Matches = () => {
  const [bracketData, setBracketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [activeRound, setActiveRound] = useState("final");
  const [swipeDirection, setSwipeDirection] = useState("left");
  const [leagues, setLeagues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // Fetch tournaments on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const res = await TournamentService.getAllTournaments();
        const data = Array.isArray(res) ? res : res?.data || [];
        const sorted = [...data].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setTournaments(sorted);
        if (data.length > 0) {
          setSelectedTournamentId(sorted[0]?.tournament_id?.toString() || "");
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch tournaments");
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch leagues when tournament changes
  useEffect(() => {
    if (!selectedTournamentId) {
      setLeagues([]);
      setSelectedLeagueId("");
      return;
    }
    const fetchLeagues = async () => {
      try {
        const res = await LeagueService.getAllLeagues({
          tournamentId: parseInt(selectedTournamentId),
        });
        const data = Array.isArray(res) ? res : res?.data || [];
        setLeagues(data);
        if (data.length > 0) {
          setSelectedLeagueId(data[0]?.id?.toString() || "");
        } else {
          setSelectedLeagueId("");
          setBracketData(null);
        }
      } catch (err) {
        setError("Failed to fetch leagues");
        setLeagues([]);
        setSelectedLeagueId("");
      }
    };
    fetchLeagues();
  }, [selectedTournamentId]);

  // Fetch matches when league changes
  useEffect(() => {
    if (!selectedLeagueId) {
      setBracketData(null);
      return;
    }
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await MatchService.getMatchesByLeague(parseInt(selectedLeagueId));
        const matches = Array.isArray(res) ? res : res?.data || [];
        const transformed = transformMatchesToBracket(matches);
        setBracketData(transformed);

        // Set active round to the most advanced round with matches
        const priority = ["final", "semifinals", "quarterfinals", "round_of_16"];
        const firstActive = priority.find(
          (key) => transformed[key] && transformed[key].length > 0
        );
        if (firstActive) setActiveRound(firstActive);
      } catch (err) {
        setError("Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [selectedLeagueId]);

  const transformMatchesToBracket = (matches) => {
    const bracket = { round_of_16: [], quarterfinals: [], semifinals: [], final: [] };
    matches.forEach((match) => {
      const key = ROUNDS.find((r) => r.level === parseInt(match.round_level))?.key;
      if (key) {
        bracket[key].push({
          id: match.id,
          scheduled_time: match.scheduled_time || null,
          player_one_id: match.player_one_id,
          player_one_name: match.player_one_name || "TBD",
          player_two_id: match.player_two_id,
          player_two_name: match.player_two_name || "TBD",
          p_one_goal: match.p_one_goal ?? null,
          p_two_goal: match.p_two_goal ?? null,
          winner_id: match.winner_id,
        });
      }
    });
    return bracket;
  };

  const getAvailableRounds = () =>
    ROUNDS.filter((r) => bracketData?.[r.key]?.length > 0)
          .map((r) => ({ ...r, data: bracketData[r.key] }));

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) < 50) return;
    const available = getAvailableRounds();
    const idx = available.findIndex((r) => r.key === activeRound);
    if (distance > 0 && idx < available.length - 1) {
      setSwipeDirection("left");
      setActiveRound(available[idx + 1].key);
    } else if (distance < 0 && idx > 0) {
      setSwipeDirection("right");
      setActiveRound(available[idx - 1].key);
    }
    touchStart.current = 0;
    touchEnd.current = 0;
  };

  // ── Loading ──
  if (loading && !bracketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <h2 className="text-red-300 font-bold text-lg mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-5 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const availableRounds = getAvailableRounds();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            🎮 Tournament Bracket
          </h1>
          <p className="text-gray-400 text-sm">Select a tournament and league to view matches</p>
        </motion.div>

        {/* ── Selectors ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Tournament
            </label>
            <select
              value={selectedTournamentId}
              onChange={(e) => {
                setSelectedTournamentId(e.target.value);
                setSelectedLeagueId("");
              }}
              className="w-full px-4 py-2.5 bg-black/40 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            >
              <option value="" className="text-black bg-gray-800">Select Tournament</option>
              {tournaments.map((t) => {
                const isEnded = t.end_date && new Date(t.end_date) < new Date();
                return (
                  <option key={t.tournament_id} value={t.tournament_id} className="text-white bg-gray-800">
                    {isEnded ? "🔴" : "🟢"} {t.tournament_name}
                  </option>
                );
              })}
            </select>

            {/* Status badge for selected tournament */}
            {selectedTournamentId && (() => {
              const selected = tournaments.find(
                (t) => t.tournament_id?.toString() === selectedTournamentId?.toString()
              );
              if (!selected) return null;
              const isEnded = selected.end_date && new Date(selected.end_date) < new Date();
              return (
                <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                  isEnded
                    ? "bg-red-900/40 text-red-400 border border-red-500/30"
                    : "bg-green-900/40 text-green-400 border border-green-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isEnded ? "bg-red-400" : "bg-green-400 animate-pulse"}`} />
                  {isEnded
                    ? `Ended ${new Date(selected.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : `Active · Ends ${new Date(selected.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  }
                </div>
              );
            })()}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              League
            </label>
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              disabled={!selectedTournamentId || leagues.length === 0}
              className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/30 hover:border-purple-500/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="" className="text-white bg-gray-800">Select League</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id} className="text-white bg-gray-800">
                  {league.leaguename}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* ── No data state ── */}
        {(!bracketData || availableRounds.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-4 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="text-5xl mb-4">🏟️</div>
            <p className="text-gray-400 text-base">
              {!selectedTournamentId
                ? "Select a tournament to get started."
                : !selectedLeagueId
                ? "Select a league to view matches."
                : "No matches available for this league yet."}
            </p>
          </motion.div>
        )}

        {/* ── Bracket content ── */}
        {bracketData && availableRounds.length > 0 && (
          <>
            {/* Round tabs - mobile only */}
            <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
              {availableRounds.map((round) => {
                const isActive = activeRound === round.key;
                const isFinal = round.key === "final";
                return (
                  <button
                    key={round.key}
                    onClick={() => setActiveRound(round.key)}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? isFinal
                          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                          : "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                        : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {isFinal ? "🏆 " : ""}{round.name}
                  </button>
                );
              })}
            </div>

            {/* ── Mobile: single round animated view ── */}
            <div
              className="block md:hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                {availableRounds
                  .filter((r) => r.key === activeRound)
                  .map((round) => (
                    <motion.div
                      key={round.key}
                      initial={{ x: swipeDirection === "left" ? 80 : -80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: swipeDirection === "left" ? -80 : 80, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {/* Mobile round title */}
                      <div className={`text-center py-2 px-4 rounded-lg font-bold text-sm mb-4 ${
                        round.key === "final"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-white/5 text-cyan-400 border border-white/10"
                      }`}>
                        {round.key === "final" ? "🏆 " : ""}{round.name}
                      </div>
                      <BracketRound
                        matches={round.data}
                        isFinal={round.key === "final"}
                        mobileView={true}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Swipe hint */}
              {availableRounds.length > 1 && (
                <p className="text-center text-gray-600 text-xs mt-4">
                  ← Swipe to navigate rounds →
                </p>
              )}
            </div>

            {/* ── Desktop: all rounds in grid ── */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableRounds.map((round) => (
                <BracketRound
                  key={round.key}
                  title={round.name}
                  matches={round.data}
                  isFinal={round.key === "final"}
                  mobileView={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matches;