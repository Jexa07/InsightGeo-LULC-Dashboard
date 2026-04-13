import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import type { AnalysisResults, LandUseCategory } from '@/types/geo';
import { formatArea } from '@/lib/geoUtils';

interface ChartsPanelProps {
    results: AnalysisResults;
    onCategoryClick?: (category: LandUseCategory) => void;
}

export function ChartsPanel({ results, onCategoryClick }: ChartsPanelProps) {
    const fluxData = results.changes
        .filter((change) => Math.abs(change.change) > 0.0001)
        .sort((a, b) => b.change - a.change)
        .map((change) => ({
            name: change.className,
            id: change.classId as LandUseCategory,
            change: change.change,
            color: change.color,
            isPositive: change.change > 0,
            percentChange: change.percentChange,
        }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 flex flex-col h-[500px] relative overflow-hidden"
        >
            {/* Dot Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="mb-8 relative z-10">
                <h3 className="text-xl font-black tracking-tight text-white italic uppercase leading-none border-l-4 border-[#FF3366] pl-4">
                    Net Flux Matrix
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2 font-bold pl-4">
                    Inter-Period Proportional Transition (km²)
                </p>
            </div>

            <div className="flex-1 min-h-0 text-foreground relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={fluxData}
                        margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                        layout="vertical"
                        onClick={(data) => {
                            if (data && data.activePayload && onCategoryClick) {
                                onCategoryClick(data.activePayload[0].payload.id);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.4)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={140}
                            tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.6)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    const value = data.change;
                                    return (
                                        <div className="glass-card p-5 border-white/10 bg-black/95 shadow-3xl min-w-[240px]">
                                            <p className="font-black text-white text-[10px] mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
                                                {label}
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] uppercase font-black text-white/40">Variance</span>
                                                <p className={`text-sm font-mono font-black ${value > 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                                                    {value > 0 ? '+' : ''}{value.toFixed(4)} km² ({data.percentChange.toFixed(2)}%)
                                                </p>
                                                <p className="text-[8px] font-black text-primary/60 uppercase mt-1 tracking-tighter">Refined Projection</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="change" radius={[0, 8, 8, 0]} barSize={24} className="cursor-pointer">
                            {fluxData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isPositive ? '#10B981' : '#F43F5E'}
                                    fillOpacity={0.8}
                                    style={{
                                        filter: `drop-shadow(0 0 10px ${entry.isPositive ? '#10B981' : '#F43F5E'}44)`
                                    }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
