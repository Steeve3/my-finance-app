import { motion } from "framer-motion";

export default function DynamicCircle({ label, value, maxValue, onClick }) {
  // Calcola un fattore di scala: ad esempio, base 1 + (value / maxValue)
  const scale = maxValue > 0 ? 1 + value / maxValue : 1;
  // Limita il fattore di scala a un massimo (ad esempio, 2)
  const clampedScale = Math.min(scale, 2);

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: clampedScale }}
    >
      <div
        className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-500"
        style={{ transform: `scale(${clampedScale})` }}
      >
        <span className="text-xl font-bold">{label}</span>
      </div>
      <span className="mt-2">€{value.toFixed(2)}</span>
    </motion.div>
  );
}
