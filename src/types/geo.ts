import type { FeatureCollection, Feature, Geometry } from 'geojson';

export interface LandUseProperties {
  landuse?: string;
  land_use?: string;
  class?: string;
  type?: string;
  category?: string;
  name?: string;
  area?: number;
  [key: string]: unknown;
}

export type GeoJSONData = FeatureCollection<Geometry, LandUseProperties>;
export type GeoFeature = Feature<Geometry, LandUseProperties>;

export interface LandUseClass {
  id: string;
  name: string;
  color: string;
  area: number;
  featureCount: number;
}

export interface LandUseChange {
  classId: string;
  className: string;
  color: string;
  areaBefore: number;
  areaAfter: number;
  change: number;
  percentChange: number;
}

export interface TransitionEntry {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  area: number;
  percentage: number;
}

export interface AnalysisResults {
  classesBefore: LandUseClass[];
  classesAfter: LandUseClass[];
  changes: LandUseChange[];
  transitions: TransitionEntry[];
  totalAreaBefore: number;
  totalAreaAfter: number;
  totalChanged: number;
  largestIncrease: LandUseChange | null;
  largestDecrease: LandUseChange | null;
}

export interface UploadedFiles {
  before: GeoJSONData | null;
  after: GeoJSONData | null;
}

export interface LayerVisibility {
  before: boolean;
  after: boolean;
  change: boolean;
}

export type LandUseCategory =
  | 'agricultural'
  | 'residential'
  | 'commercial'
  | 'forest'
  | 'water'
  | 'barren'
  | 'wetland'
  | 'vacant'
  | 'religious'
  | 'public'
  | 'transport'
  | 'recreational'
  | 'builtup'
  | 'other';

export const LAND_USE_CATEGORIES: Record<LandUseCategory, { name: string; keywords: string[] }> = {
  agricultural: {
    name: 'Agricultural Land',
    keywords: ['agricultural', 'agriculture', 'farm', 'farmland', 'crop', 'cropland', 'orchard', 'vineyard', 'pasture', 'meadow', 'fallow', 'plantation'],
  },
  residential: {
    name: 'Built-up (Residential/Commercial)',
    keywords: ['residential', 'housing', 'apartment', 'suburban', 'urban', 'settlement', 'residential/commercial', 'lodge'],
  },
  commercial: {
    name: 'Commercial',
    keywords: ['commercial', 'industrial', 'retail', 'office', 'business', 'manufacturing', 'brick kiln'],
  },
  forest: {
    name: 'Forest',
    keywords: ['forest', 'woodland', 'tree', 'woods', 'jungle', 'vegetation'],
  },
  water: {
    name: 'Water',
    keywords: ['water', 'lake', 'river', 'pond', 'stream', 'reservoir', 'ocean', 'sea'],
  },
  barren: {
    name: 'Barren',
    keywords: ['barren', 'bare', 'rock', 'sand', 'desert', 'quarry', 'mine'],
  },
  wetland: {
    name: 'Wetland',
    keywords: ['wetland', 'marsh', 'swamp', 'bog', 'fen'],
  },
  vacant: {
    name: 'Vacant Land',
    keywords: ['vacant', 'private vacant', 'government vacant'],
  },
  religious: {
    name: 'Religious Land',
    keywords: ['religious', 'temple', 'monastery', 'shrine', 'mosque', 'church'],
  },
  public: {
    name: 'Public Usage',
    keywords: ['public', 'utility', 'utilities', 'sewage', 'electric', 'toilet', 'ghats', 'semi-public', 'public utilities', 'public & semi-public'],
  },
  transport: {
    name: 'Transport',
    keywords: ['traffic', 'divider', 'road', 'transport', 'highway'],
  },
  recreational: {
    name: 'Recreational',
    keywords: ['recreational', 'garden', 'park', 'playground'],
  },
  builtup: {
    name: 'Built Up',
    keywords: ['built up', 'builtup', 'construction'],
  },
  other: {
    name: 'Other',
    keywords: [],
  },
};

export const LAND_USE_COLORS: Record<LandUseCategory, string> = {
  agricultural: '#4ADE80',    // Neon Emerald
  residential: '#D946EF',     // Fuchsia
  commercial: '#8B5CF6',      // Hyper Purple
  forest: '#059669',          // Deep Forest
  water: '#3B82F6',           // Royal Blue
  barren: '#94A3B8',          // Slate
  wetland: '#2DD4BF',         // Arctic Cyan
  vacant: '#475569',          // Slate Grey
  religious: '#F59E0B',       // Amber
  public: '#14B8A6',          // Teal
  transport: '#2563EB',       // Blue
  recreational: '#10B981',    // Emerald
  builtup: '#F43F5E',         // Electric Rose
  other: '#64748B',           // Slate
};
