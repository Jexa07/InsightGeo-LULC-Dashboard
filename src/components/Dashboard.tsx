import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, BarChart3 } from 'lucide-react';
import { MapPanel } from '@/components/MapPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { KPICards } from '@/components/KPICards';
import { ChartsPanel } from '@/components/ChartsPanel';
import { CategoryIntelligence } from '@/components/CategoryIntelligence';
import { CompositionAnalytics } from '@/components/CompositionAnalytics';
import { useGeoAnalysis } from '@/hooks/useGeoAnalysis';
import type { GeoJSONData, LayerVisibility, LandUseCategory } from '@/types/geo';

interface DashboardProps {
  before: GeoJSONData;
  after: GeoJSONData;
  onBack: () => void;
}

export function Dashboard({ before, after, onBack }: DashboardProps) {
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    before: true,
    after: true,
    change: false,
  });

  const [selectedClasses, setSelectedClasses] = useState<LandUseCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<LandUseCategory | null>(null);

  const { results, bounds, changeLayer } = useGeoAnalysis(before, after);

  // Get available classes from results
  const availableClasses = useMemo(() => {
    if (!results) return [];
    const classIds = new Set<LandUseCategory>();
    results.classesBefore.forEach((c) => classIds.add(c.id as LandUseCategory));
    results.classesAfter.forEach((c) => classIds.add(c.id as LandUseCategory));
    return Array.from(classIds);
  }, [results]);

  const handleLayerVisibilityChange = (layer: keyof LayerVisibility, visible: boolean) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: visible }));
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header - Designer Overhaul */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-header px-8 py-3"
      >
        <div className="flex items-center justify-between max-w-[1920px] mx-auto w-full">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <div className="p-2 rounded-full border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Reset Workspace</span>
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-1 ring-white/10 shadow-inner group">
                <Map className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground font-display uppercase italic leading-none">
                  INSIGHT<span className="text-primary not-italic">GEO</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-0.5">
                  LULC Transition Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Analysis Engine</span>
              <span className="text-xs font-mono text-primary">v2.4.0-STABLE</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <span className="text-sm font-black text-foreground">
                {results.changes.length} <span className="text-white/40 font-black uppercase text-[10px]">Classes</span>
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 lg:p-8 max-w-[1920px] mx-auto w-full overflow-hidden">
        {/* Left Side: Control & Stats */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            className="glass-card flex flex-col h-full relative overflow-hidden"
          >
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="p-5 border-b border-white/10 bg-black/20 flex items-center justify-between relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                Parameters Matrix
              </h3>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 bg-primary/20 rounded-full"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-10 p-5 gap-8">
              <ControlPanel
                layerVisibility={layerVisibility}
                onLayerVisibilityChange={handleLayerVisibilityChange}
                selectedClasses={selectedClasses}
                onClassSelectionChange={setSelectedClasses}
                availableClasses={availableClasses}
              />

              <div className="border-t border-white/10 pt-8">
                <CompositionAnalytics results={results} onCategoryClick={setActiveCategory} />
              </div>

              <div className="mt-auto border-t border-white/5 bg-black/20 relative group overflow-hidden h-64 shrink-0 flex flex-col items-center justify-end -mx-5 -mb-5">
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                <img
                  src="/indian_building.png"
                  alt="Indian Architectural Silhouette"
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-700 hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center shadow-xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">Heritage Intelligence</p>
                  <p className="text-[10px] font-black text-primary uppercase">Spatial Cultural Matrix</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Right Side: Map & Analytics */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full h-[600px] shrink-0 map-wrapper group relative ring-1 ring-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
              <div className="glass-card px-4 py-2 flex items-center gap-2 bg-black/60 border-white/10 border shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-white/80">Live Projection</span>
              </div>
            </div>
            <MapPanel
              before={before}
              after={after}
              changeLayer={changeLayer}
              layerVisibility={layerVisibility}
              bounds={bounds}
              selectedClasses={selectedClasses}
            />
          </motion.div>

          {/* Bottom Section: Vertical Stacked Metrics & Charts */}
          <div className="flex flex-col gap-10">
            {/* KPI Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">Delta Metrics</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-1">Statistical Variance Analysis</p>
                </div>
              </div>
              <KPICards results={results} />
            </motion.section>

            {/* Charts Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">Transition Dynamics</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-1">Inter-Period Flux Matrix</p>
                </div>
              </div>
              <ChartsPanel results={results} onCategoryClick={setActiveCategory} />
            </motion.section>


            {/* Category Intelligence Drill-Down */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col gap-4"
            >
              <CategoryIntelligence
                results={results}
                selectedCategory={activeCategory}
                onCategorySelect={setActiveCategory}
              />
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
