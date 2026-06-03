// BracketRound.jsx
import { motion } from "framer-motion";
import MatchCard from "./MatchCard";

const BracketRound = ({ title, matches = [], isFinal, mobileView }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 w-full"
    >
      {/* Round title — only on desktop */}
      {!mobileView && (
        <div className={`text-center py-2 px-4 rounded-lg font-bold text-sm tracking-wide ${
          isFinal
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-white/5 text-cyan-400 border border-white/10"
        }`}>
          {isFinal && "🏆 "}{title}
        </div>
      )}

      {/* Match cards */}
      {matches.length > 0 ? (
        matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <MatchCard match={match} isFinal={isFinal} />
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm border border-white/5 rounded-xl bg-white/5">
          Matches to be determined
        </div>
      )}
    </motion.div>
  );
};

export default BracketRound;