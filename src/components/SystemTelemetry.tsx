import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Globe } from 'lucide-react';

export function SystemTelemetry() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">Neural Telemetry</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Signal Stream */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Spatial Synapse</span>
                        <span className="text-primary">Operational</span>
                    </div>
                    <div className="h-12 flex items-end gap-[2px] px-1 bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-primary/40 rounded-t-sm"
                                animate={{
                                    height: [
                                        Math.random() * 20 + 10,
                                        Math.random() * 40 + 5,
                                        Math.random() * 15 + 10
                                    ]
                                }}
                                transition={{
                                    duration: 2 + Math.random(),
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Integrity', val: '99.9%', icon: ShieldCheck, color: 'text-green-500' },
                        { label: 'Latency', val: '12ms', icon: Zap, color: 'text-amber-500' },
                        { label: 'Coverage', val: 'Global', icon: Globe, color: 'text-blue-500' },
                        { label: 'Sync', val: 'Active', icon: Activity, color: 'text-secondary' },
                    ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <stat.icon className={`w-3 h-3 ${stat.color} opacity-70`} />
                                <span className="text-[10px] font-bold text-white">{stat.val}</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Scrolling Log (Subtle) */}
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 relative overflow-hidden h-24">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,var(--tw-gradient-stops))] from-primary via-transparent to-transparent animate-pulse" />
                    <div className="relative flex flex-col gap-1">
                        {[
                            '>> INITIALIZING SPATIAL SCAN...',
                            '>> PARSING GEOJSON DELTAS...',
                            '>> NEURAL CLASSIFIER ONLINE',
                            '>> NORMALIZING COORDINATES...',
                            '>> MAPPING TRANSITION NODES...',
                            '>> SYSTEM STABLE 102.4FPS'
                        ].map((log, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{
                                    duration: 4,
                                    delay: i * 0.8,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                                className="text-[9px] font-mono text-primary/60"
                            >
                                {log}
                            </motion.p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
