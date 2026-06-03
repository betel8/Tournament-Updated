// MatchCard.jsx
import { motion } from "framer-motion";
import { CalendarOutlined, TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const MatchCard = ({ match, isFinal }) => {
  const isPlayerOneWinner = match.winner_id && match.winner_id === match.player_one_id;
  const isPlayerTwoWinner = match.winner_id && match.winner_id === match.player_two_id;
  const hasResult = match.p_one_goal !== null || match.p_two_goal !== null;

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const parsed = dayjs(dateString);
    return parsed.isValid() ? parsed.format("MMM D, YYYY · HH:mm") : "TBD";
  };

  const isLive =
    match.scheduled_time &&
    new Date(match.scheduled_time) < new Date(Date.now() + 1000 * 60 * 60) &&
    !match.winner_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl overflow-hidden border transition-all duration-300 ${
        isFinal
          ? "border-yellow-500/60 bg-gradient-to-br from-yellow-900/30 to-gray-900"
          : "border-white/10 bg-gradient-to-br from-white/5 to-gray-900/60"
      }`}
    >
      {/* Card header */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs border-b ${
        isFinal ? "border-yellow-500/30 bg-yellow-900/20" : "border-white/5 bg-white/5"
      }`}>
        <span className="flex items-center gap-1.5 text-gray-400">
          <CalendarOutlined />
          {formatDate(match.scheduled_time)}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            LIVE
          </span>
        )}
        {match.winner_id && (
          <span className="flex items-center gap-1.5 text-green-400 font-semibold">
            <TrophyOutlined />
            COMPLETED
          </span>
        )}
      </div>

      {/* Players vs layout */}
      <div className="flex items-stretch">

        {/* Player One */}
        <div className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-4 transition-colors ${
          isPlayerOneWinner ? "bg-green-900/30" : ""
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
            isFinal ? "bg-yellow-500/20 text-yellow-300" : "bg-cyan-500/20 text-cyan-300"
          }`}>
            {match.player_one_name ? match.player_one_name.charAt(0).toUpperCase() : "?"}
          </div>
          <span className={`text-sm font-semibold text-center leading-tight ${
            isPlayerOneWinner ? "text-green-300" : "text-white"
          }`}>
            {match.player_one_name || "TBD"}
          </span>
          {isPlayerOneWinner && (
            <span className="text-xs text-green-400 font-medium mt-0.5">Winner ✓</span>
          )}
          {hasResult && (
            <span className={`text-2xl font-bold mt-1 ${
              isPlayerOneWinner ? "text-green-300" : "text-gray-300"
            }`}>
              {match.p_one_goal ?? "-"}
            </span>
          )}
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center px-3 gap-1">
          <div className={`w-px flex-1 ${isFinal ? "bg-yellow-500/30" : "bg-white/10"}`} />
          <span className={`text-xs font-black px-2 py-1 rounded-full ${
            isFinal ? "text-yellow-400 bg-yellow-900/40" : "text-cyan-400 bg-cyan-900/30"
          }`}>
            VS
          </span>
          <div className={`w-px flex-1 ${isFinal ? "bg-yellow-500/30" : "bg-white/10"}`} />
        </div>

        {/* Player Two */}
        <div className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-4 transition-colors ${
          isPlayerTwoWinner ? "bg-green-900/30" : ""
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
            isFinal ? "bg-yellow-500/20 text-yellow-300" : "bg-purple-500/20 text-purple-300"
          }`}>
            {match.player_two_name ? match.player_two_name.charAt(0).toUpperCase() : "?"}
          </div>
          <span className={`text-sm font-semibold text-center leading-tight ${
            isPlayerTwoWinner ? "text-green-300" : "text-white"
          }`}>
            {match.player_two_name || "TBD"}
          </span>
          {isPlayerTwoWinner && (
            <span className="text-xs text-green-400 font-medium mt-0.5">Winner ✓</span>
          )}
          {hasResult && (
            <span className={`text-2xl font-bold mt-1 ${
              isPlayerTwoWinner ? "text-green-300" : "text-gray-300"
            }`}>
              {match.p_two_goal ?? "-"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;