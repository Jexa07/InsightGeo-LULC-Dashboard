import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { AnalysisResults, LandUseCategory } from '@/types/geo';
import { LAND_USE_CATEGORIES, LAND_USE_COLORS } from '@/types/geo';
import { formatArea, formatPercent } from '@/lib/geoUtils';

interface CategoryIntelligenceProps {
    results: AnalysisResults;
    selectedCategory: LandUseCategory | null;
    onCategorySelect: (category: LandUseCategory | null) => void;
}

export function CategoryIntelligence({ results, selectedCategory, onCategorySelect }: CategoryIntelligenceProps) {
    const getMetrics = (categoryId: LandUseCategory) => {
        const before = results.classesBefore.find(c => (c.id as LandUseCategory) === categoryId)?.area || 0;
        const after = results.classesAfter.find(c => (c.id as LandUseCategory) === categoryId)?.area || 0;
        const change = results.changes.find(c => c.classId === categoryId);

        return {
            before,
            after,
            delta: change?.change || 0,
            percent: change?.percentChange || 0,
            status: (change?.change || 0) > 0.001 ? 'increase' : (change?.change || 0) < -0.001 ? 'decrease' : 'stable'
        };
    };

    const categories = results.changes.map(c => c.classId as LandUseCategory);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
                <Info className="w-4 h-4 text-secondary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Category Intelligence Matrix</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {categories.map((catId) => {
                    const metrics = getMetrics(catId);
                    const isSelected = selectedCategory === catId;
                    const config = LAND_USE_CATEGORIES[catId];

                    return (
                        <motion.div
                            key={catId}
                            layout
                            initial={false}
                            className={`
                glass-card overflow-hidden transition-all duration-300 border-white/10
                ${isSelected ? 'ring-1 ring-primary/40 bg-white/5' : 'hover:bg-white/2'}
              `}
                        >
                            <button
                                onClick={() => onCategorySelect(isSelected ? null : catId)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-white/10"
                                        style={{ backgroundColor: `${LAND_USE_COLORS[catId]}15` }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_currentcolor]"
                                            style={{ backgroundColor: LAND_USE_COLORS[catId], color: LAND_USE_COLORS[catId] }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white tracking-tight uppercase leading-none">{config.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            {metrics.status === 'increase' ? (
                                                <span className="text-primary flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> Growth Detected
                                                </span>
                                            ) : metrics.status === 'decrease' ? (
                                                <span className="text-destructive flex items-center gap-1">
                                                    <TrendingDown className="w-3 h-3" /> Area Loss
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Minus className="w-3 h-3" /> Stable Region
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-white/40 uppercase opacity-40">Net Delta</p>
                                        <p className={`text-sm font-black ${metrics.delta > 0 ? 'text-primary' : metrics.delta < 0 ? 'text-destructive' : 'text-white'}`}>
                                            {metrics.delta > 0 ? '+' : ''}{formatArea(metrics.delta, results.totalAreaAfter)}
                                        </p>
                                    </div>
                                    <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 shadow-xl
                    ${isSelected ? 'rotate-90 bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}
                  `}>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-4 pb-6 pt-2 border-t border-white/10 bg-black/20">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-3 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                                                    <p className="text-[8px] font-black uppercase text-white/40 mb-1 tracking-widest">2016 State</p>
                                                    <p className="text-sm font-black text-white">{formatArea(metrics.before, results.totalAreaBefore)}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                                                    <p className="text-[8px] font-black uppercase text-white/40 mb-1 tracking-widest">2024 Result</p>
                                                    <p className="text-sm font-black text-white">{formatArea(metrics.after, results.totalAreaAfter)}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                                                    <p className="text-[8px] font-black uppercase text-white/40 mb-1 tracking-widest">Net Variance</p>
                                                    <p className={`text-sm font-black ${metrics.delta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                                        {metrics.delta > 0 ? '+' : ''}{formatArea(metrics.delta, results.totalAreaAfter)}
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                                                    <p className="text-[8px] font-black uppercase text-white/40 mb-1 tracking-widest">Rel. Change</p>
                                                    <p className={`text-sm font-black ${metrics.percent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                                        {formatPercent(metrics.percent)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-xl">
                                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Neural Insight</p>
                                                <p className="text-xs text-white/80 leading-relaxed font-semibold">
                                                    {metrics.status === 'increase'
                                                        ? `Significant urbanization or expansion detected. The class has grown by ${formatArea(metrics.delta)} over the observation period, representing a ${formatPercent(metrics.percent)} shift in distribution.`
                                                        : metrics.status === 'decrease'
                                                            ? `Land transition detected. A net loss of ${formatArea(Math.abs(metrics.delta))} has been recorded as this area likely converted to other high-density configurations.`
                                                            : `Environmental equilibrium maintained. No significant deviation from baseline detected for this statistical class.`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
