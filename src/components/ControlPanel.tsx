import { motion } from 'framer-motion';
import { Layers, Eye, EyeOff, Palette, Filter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { LayerVisibility, LandUseCategory } from '@/types/geo';
import { LAND_USE_CATEGORIES, LAND_USE_COLORS } from '@/types/geo';

interface ControlPanelProps {
  layerVisibility: LayerVisibility;
  onLayerVisibilityChange: (layer: keyof LayerVisibility, visible: boolean) => void;
  selectedClasses: LandUseCategory[];
  onClassSelectionChange: (classes: LandUseCategory[]) => void;
  availableClasses: LandUseCategory[];
}

export function ControlPanel({
  layerVisibility,
  onLayerVisibilityChange,
  selectedClasses,
  onClassSelectionChange,
  availableClasses,
}: ControlPanelProps) {
  const handleClassToggle = (category: LandUseCategory, checked: boolean) => {
    if (checked) {
      onClassSelectionChange([...selectedClasses, category]);
    } else {
      onClassSelectionChange(selectedClasses.filter(c => c !== category));
    }
  };

  const handleSelectAll = () => {
    if (selectedClasses.length === availableClasses.length) {
      onClassSelectionChange([]);
    } else {
      onClassSelectionChange([...availableClasses]);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Layer Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Visual Streams</h3>
        </div>

        <div className="space-y-3">
          {[
            { id: 'before', label: 'Baseline Matrix (T1)', color: 'bg-[#2979FF]', icon: Eye },
            { id: 'after', label: 'Current Matrix (T2)', color: 'bg-[#00E5FF]', icon: Eye },
            { id: 'change', label: 'Computed Deltas', color: 'bg-[#FF5252] border border-dashed border-white/20', icon: Eye }
          ].map((layer) => (
            <div key={layer.id} className="group flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${layer.color} shadow-lg shadow-black/40`} />
                <Label htmlFor={`layer-${layer.id}`} className="text-xs font-black text-white/60 group-hover:text-white transition-colors cursor-pointer uppercase tracking-tight">
                  {layer.label}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                {layerVisibility[layer.id as keyof LayerVisibility] ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-black/10" />
                )}
                <Switch
                  id={`layer-${layer.id}`}
                  checked={layerVisibility[layer.id as keyof LayerVisibility]}
                  onCheckedChange={(checked) => onLayerVisibilityChange(layer.id as keyof LayerVisibility, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Land-Use Filter */}
      <div className="flex flex-col flex-1 min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Class Intelligence</h3>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:text-white transition-colors"
          >
            {selectedClasses.length === availableClasses.length ? 'Reset Filters' : 'Isolate All'}
          </button>
        </div>

        <div className="space-y-1 pr-2">
          {availableClasses.map((category) => (
            <div
              key={category}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 cursor-pointer"
              onClick={() => handleClassToggle(category, !selectedClasses.includes(category))}
            >
              <Checkbox
                id={`class-${category}`}
                checked={selectedClasses.includes(category)}
                onCheckedChange={(checked) => handleClassToggle(category, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white/5 shadow-inner group-hover:scale-110 transition-transform"
                style={{ backgroundColor: LAND_USE_COLORS[category] }}
              />
              <Label
                htmlFor={`class-${category}`}
                className="text-xs font-black text-white/60 group-hover:text-white transition-colors cursor-pointer flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {LAND_USE_CATEGORIES[category].name}
              </Label>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(2,136,209,0.3)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
