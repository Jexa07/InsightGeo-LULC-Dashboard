import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Radar,
    RadarChart,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PolarGrid,
    PolarAngleAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
} from 'recharts';
import { LAND_USE_COLORS } from '@/types/geo';
import type { AnalysisResults, LandUseCategory, TransitionEntry } from '@/types/geo';
import { formatArea } from '@/lib/geoUtils';

interface CompositionAnalyticsProps {
    results: AnalysisResults;
    onCategoryClick?: (category: LandUseCategory) => void;
}

export function CompositionAnalytics({ results, onCategoryClick }: CompositionAnalyticsProps) {
    const radarData = results.changes.map((change) => ({
        name: change.className,
        id: change.classId as LandUseCategory,
        '2016 State': change.areaBefore,
        '2024 Result': change.areaAfter,
    }));

    const pieData = results.classesAfter.map((c) => ({
        name: c.name,
        id: c.id as LandUseCategory,
        value: c.area,
        color: LAND_USE_COLORS[c.id as LandUseCategory] || '#7F8C8D',
    })).sort((a, b) => b.value - a.value);

    const fluxData = results.changes
        .map((change) => ({
            name: change.className,
            id: change.classId as LandUseCategory,
            value: Math.abs(change.change),
            isPositive: change.change > 0,
            color: LAND_USE_COLORS[change.classId as LandUseCategory] || '#7F8C8D',
            fullValue: Math.max(...results.changes.map(c => Math.abs(c.change))) || 1
        }))
        .sort((a, b) => b.value - a.value);

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 border-white/10 shadow-3xl backdrop-blur-xl bg-black/90">
                    <p className="font-bold text-white mb-1.5 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 pb-1">
                        {label || payload[0]?.name}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                            <p className="text-[11px] text-white/90 font-mono font-semibold">
                                <span className="text-white/40">{entry.name}:</span> {formatArea(entry.value, results.totalAreaAfter)}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-20 px-4">
            {/* Radar Chart */}
            <div className="h-[420px] flex flex-col relative group">
                <div className="mb-8 pl-2 border-l-2 border-primary/60">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                        LANDSCAPE DNA
                        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                    </h4>
                    <p className="text-[9px] text-primary uppercase mt-1.5 font-black tracking-[0.2em]">Morphological Signature</p>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <defs>
                                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2979FF" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#2979FF" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 900, letterSpacing: '0.05em' }} />
                            <Radar name="2016 State" dataKey="2016 State" stroke="#1565C0" strokeWidth={2.5} fill="url(#primaryGradient)" fillOpacity={1} />
                            <Radar name="2024 Result" dataKey="2024 Result" stroke="#00BCD4" strokeWidth={2.5} fill="url(#secondaryGradient)" fillOpacity={1} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '30px', fontWeight: 800, opacity: 0.9 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Donut Chart */}
            <div className="h-[420px] flex flex-col">
                <div className="mb-8 pl-2 border-l-2 border-secondary/60">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                        COMPOSITION
                        <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-transparent" />
                    </h4>
                    <p className="text-[9px] text-secondary uppercase mt-1.5 font-black tracking-[0.2em]">Share Intensity</p>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                            onClick={(data) => {
                                if (data && data.activePayload && onCategoryClick) {
                                    onCategoryClick(data.activePayload[0].payload.id);
                                }
                            }}
                        >
                            <Pie
                                data={pieData}
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={0.9}
                                        style={{ filter: `drop-shadow(0 0 12px ${entry.color}44)` }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                layout="horizontal"
                                iconType="rect"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '9px', paddingTop: '40px', fontWeight: 600, opacity: 0.8 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Land-Use Transition Pathways Chart */}
            <div className="h-[550px] flex flex-col relative">
                <div className="mb-10 pl-3 border-l-4 border-[#FF3366]">
                    <h4 className="text-[14px] font-black uppercase tracking-[0.2em] text-white leading-tight">
                        LAND-USE TRANSITION PATHWAYS
                    </h4>
                    <p className="text-[10px] text-[#FF3366] uppercase mt-1.5 font-black tracking-[0.2em]">Major Conversions (2016–2024)</p>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={results.transitions}
                            layout="vertical"
                            margin={{ left: 10, right: 60, top: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="grad-0" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#CC2B5E" />
                                    <stop offset="100%" stopColor="#FF3366" />
                                </linearGradient>
                                <linearGradient id="grad-1" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#0F9D58" />
                                    <stop offset="100%" stopColor="#4285F4" />
                                </linearGradient>
                                <linearGradient id="grad-2" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8E2DE2" />
                                    <stop offset="100%" stopColor="#4A00E0" />
                                </linearGradient>
                                <linearGradient id="grad-3" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#FF9900" />
                                    <stop offset="100%" stopColor="#FFCC00" />
                                </linearGradient>
                                <linearGradient id="grad-4" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#2193b0" />
                                    <stop offset="100%" stopColor="#6dd5ed" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="fromName"
                                type="category"
                                hide
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload as TransitionEntry;
                                        return (
                                            <div className="glass-card p-4 border-white/10 shadow-3xl bg-black/95 min-w-[300px]">
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                                    Conversion Pathway
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[11px] font-black text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                                            {data.fromName}
                                                        </div>
                                                        <div className="text-white/40 font-black">→</div>
                                                        <div className="text-[11px] font-black text-primary px-2 py-0.5 rounded bg-primary/5 border border-primary/20">
                                                            {data.toName}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-2">
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-white/30 mb-0.5">Area Shift</p>
                                                            <p className="text-[16px] font-mono font-black text-white">{data.area.toFixed(3)} km²</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] uppercase font-black text-white/30 mb-0.5">Intensity</p>
                                                            <p className="text-[14px] font-mono font-black text-[#FF3366]">{data.percentage.toFixed(2)}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                        <p className="text-[9px] text-white/50 leading-relaxed font-medium italic">
                                                            "Dominant land-use conversion contributing to urban expansion."
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="area"
                                radius={[0, 12, 12, 0]}
                                barSize={34}
                                label={({ x, y, width, height, value, index }) => {
                                    const data = results.transitions[index];
                                    if (!data) return null;
                                    return (
                                        <g>
                                            {/* Transition Name BELOW Bar */}
                                            <text
                                                x={x}
                                                y={y + height + 18}
                                                fill="rgba(255,255,255,0.9)"
                                                fontSize={8}
                                                fontWeight={900}
                                                className="uppercase tracking-[0.05em] pointer-events-none"
                                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                                            >
                                                <tspan fill="rgba(255,255,255,0.5)">{data.fromName}</tspan>
                                                <tspan dx={4} fill="#FF3366">→</tspan>
                                                <tspan dx={4}>{data.toName}</tspan>
                                            </text>
                                            {/* KM2 Value RIGHT of Bar */}
                                            <text
                                                x={x + width + 12}
                                                y={y + height / 2 + 5}
                                                fill="rgba(255,255,255,0.8)"
                                                fontSize={11}
                                                fontWeight={900}
                                                textAnchor="start"
                                                className="font-mono"
                                            >
                                                {`${value.toFixed(2)} KM²`}
                                            </text>
                                        </g>
                                    );
                                }}
                            >
                                {results.transitions.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#grad-${index % 5})`}
                                        style={{ filter: `drop-shadow(0 0 15px rgba(255, 51, 102, 0.1))` }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
