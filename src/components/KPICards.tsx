import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AreaChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AnalysisResults } from '@/types/geo';
import { formatArea, formatPercent } from '@/lib/geoUtils';

interface KPICardsProps {
  results: AnalysisResults;
}

export function KPICards({ results }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Area Analyzed',
      value: formatArea(results.totalAreaAfter),
      subtitle: `${results.changes.length} land-use classes`,
      icon: AreaChart,
      color: 'primary',
    },
    {
      title: 'Net Area Changed',
      value: formatArea(results.totalChanged, results.totalAreaAfter),
      subtitle: 'Across all categories',
      icon: TrendingUp,
      color: 'accent',
    },
    {
      title: 'Largest Increase',
      value: results.largestIncrease?.className || 'None',
      subtitle: results.largestIncrease
        ? `${formatArea(results.largestIncrease.change, results.totalAreaAfter)} (${formatPercent(results.largestIncrease.percentChange)})`
        : 'No increase detected',
      icon: ArrowUpRight,
      color: 'success',
      iconColor: '#27AE60',
    },
    {
      title: 'Largest Decrease',
      value: results.largestDecrease?.className || 'None',
      subtitle: results.largestDecrease
        ? `${formatArea(results.largestDecrease.change, results.totalAreaAfter)} (${formatPercent(results.largestDecrease.percentChange)})`
        : 'No decrease detected',
      icon: ArrowDownRight,
      color: 'destructive',
      iconColor: '#E74C3C',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card p-6 group cursor-default relative ring-1 ring-white/10 border-none"
        >
          {/* Subtle Glow Effect */}
          <div
            className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl rounded-2xl pointer-events-none"
            style={{
              backgroundColor: card.iconColor || (card.color === 'primary' ? '#0288D1' : '#1565C0')
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-inner group-hover:ring-white/20 transition-all duration-300"
                style={{
                  backgroundColor: card.iconColor
                    ? `${card.iconColor}15`
                    : card.color === 'primary'
                      ? 'rgba(2, 136, 209, 0.1)'
                      : 'rgba(37, 99, 235, 0.1)',
                }}
              >
                <card.icon
                  className="w-5 h-5 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    color: card.iconColor || (card.color === 'primary' ? '#0288D1' : '#1565C0'),
                  }}
                />
              </div>
              <div className="h-1 w-8 rounded-full bg-white/5 group-hover:bg-white/20 transition-colors" />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-primary transition-colors">
                {card.title}
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                {card.value}
              </h3>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
                  {card.subtitle}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
