import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type {
  GeoJSONData,
  GeoFeature,
  LandUseClass,
  LandUseChange,
  AnalysisResults,
  LandUseCategory,
  LandUseProperties,
  TransitionEntry
} from '@/types/geo';
import { LAND_USE_CATEGORIES, LAND_USE_COLORS } from '@/types/geo';

type PolygonFeature = Feature<Polygon | MultiPolygon, LandUseProperties>;

/**
 * Detect land-use category from feature properties
 */
export function detectLandUseCategory(properties: LandUseProperties): LandUseCategory {
  const searchFields = ['landuse', 'land_use', 'class', 'sub_class', 'type', 'category', 'name'];

  for (const field of searchFields) {
    const value = properties[field];
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();

      for (const [category, config] of Object.entries(LAND_USE_CATEGORIES)) {
        if (config.keywords.some(keyword => lowerValue.includes(keyword))) {
          return category as LandUseCategory;
        }
      }
    }
  }

  return 'other';
}

/**
 * Calculate area of a feature in square kilometers
 */
export function calculateFeatureArea(feature: GeoFeature): number {
  try {
    // Prioritize project-specific area property if it exists (assumed to be in m²)
    const propArea = (feature.properties as any).area || (feature.properties as any).Shape_Area;
    if (typeof propArea === 'number' && propArea > 0) {
      return propArea / 1_000_000;
    }

    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      return turf.area(feature) / 1_000_000; // Convert to km²
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Analyze land-use classes in a GeoJSON dataset
 */
export function analyzeLandUseClasses(data: GeoJSONData): LandUseClass[] {
  const classMap = new Map<LandUseCategory, { area: number; count: number }>();

  // Initialize all categories
  for (const category of Object.keys(LAND_USE_CATEGORIES) as LandUseCategory[]) {
    classMap.set(category, { area: 0, count: 0 });
  }

  for (const feature of data.features) {
    const category = detectLandUseCategory(feature.properties);
    const area = calculateFeatureArea(feature);

    const current = classMap.get(category)!;
    classMap.set(category, {
      area: current.area + area,
      count: current.count + 1,
    });
  }

  const classes: LandUseClass[] = [];

  for (const [category, stats] of classMap.entries()) {
    if (stats.count > 0) {
      classes.push({
        id: category,
        name: LAND_USE_CATEGORIES[category].name,
        color: LAND_USE_COLORS[category],
        area: stats.area,
        featureCount: stats.count,
      });
    }
  }

  return classes.sort((a, b) => b.area - a.area);
}

/**
 * Compute land-use changes between two time periods
 */
export function computeLandUseChanges(
  before: GeoJSONData,
  after: GeoJSONData
): AnalysisResults {
  const classesBefore = analyzeLandUseClasses(before);
  const classesAfter = analyzeLandUseClasses(after);

  const beforeMap = new Map(classesBefore.map(c => [c.id, c]));
  const afterMap = new Map(classesAfter.map(c => [c.id, c]));

  const allCategories = new Set([...beforeMap.keys(), ...afterMap.keys()]);

  const changes: LandUseChange[] = [];

  for (const categoryId of allCategories) {
    const beforeClass = beforeMap.get(categoryId);
    const afterClass = afterMap.get(categoryId);

    const areaBefore = beforeClass?.area ?? 0;
    const areaAfter = afterClass?.area ?? 0;
    const change = areaAfter - areaBefore;
    const percentChange = areaBefore > 0 ? (change / areaBefore) * 100 : (areaAfter > 0 ? 100 : 0);

    changes.push({
      classId: categoryId,
      className: LAND_USE_CATEGORIES[categoryId as LandUseCategory]?.name ?? categoryId,
      color: LAND_USE_COLORS[categoryId as LandUseCategory] ?? '#7F8C8D',
      areaBefore,
      areaAfter,
      change,
      percentChange,
    });
  }

  // Sort by absolute change
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const totalAreaBefore = classesBefore.reduce((sum, c) => sum + c.area, 0);
  const totalAreaAfter = classesAfter.reduce((sum, c) => sum + c.area, 0);
  const totalChanged = changes.reduce((sum, c) => sum + Math.abs(c.change), 0) / 2;

  const largestIncrease = changes.reduce<LandUseChange | null>(
    (max, c) => (!max || c.change > max.change) ? c : max,
    null
  );

  const largestDecrease = changes.reduce<LandUseChange | null>(
    (min, c) => (!min || c.change < min.change) ? c : min,
    null
  );

  // Calculate transitions by analyzing spatial intersections of changes
  const transitionMap = new Map<string, number>();
  const changeLayer = createChangeFeatures(before, after);

  changeLayer.features.forEach(feature => {
    const fromId = feature.properties?._changeBefore as string;
    const toId = feature.properties?._changeAfter as string;
    const area = calculateFeatureArea(feature as GeoFeature);

    if (fromId && toId && area > 0) {
      const key = `${fromId}→${toId}`;
      transitionMap.set(key, (transitionMap.get(key) || 0) + area);
    }
  });

  const transitions: TransitionEntry[] = Array.from(transitionMap.entries())
    .map(([key, area]) => {
      const [fromId, toId] = key.split('→');
      return {
        fromId,
        toId,
        fromName: LAND_USE_CATEGORIES[fromId as LandUseCategory]?.name || fromId,
        toName: LAND_USE_CATEGORIES[toId as LandUseCategory]?.name || toId,
        area,
        percentage: totalAreaAfter > 0 ? (area / totalAreaAfter) * 100 : 0
      };
    })
    .sort((a, b) => b.area - a.area)
    .slice(0, 5); // Take top 5 major conversions

  return {
    classesBefore,
    classesAfter,
    changes,
    transitions,
    totalAreaBefore,
    totalAreaAfter,
    totalChanged,
    largestIncrease: largestIncrease?.change > 0 ? largestIncrease : null,
    largestDecrease: largestDecrease?.change < 0 ? largestDecrease : null,
  };
}

/**
 * Get bounding box for a GeoJSON dataset
 */
export function getBoundingBox(data: GeoJSONData): [[number, number], [number, number]] | null {
  try {
    const bbox = turf.bbox(data);
    return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
  } catch {
    return null;
  }
}

/**
 * Create change features (features that differ between datasets)
 */
export function createChangeFeatures(
  before: GeoJSONData,
  after: GeoJSONData
): GeoJSONData {
  const changeFeatures: GeoFeature[] = [];

  // For each feature in the after dataset, check if it represents a change
  for (const afterFeature of after.features) {
    const afterGeom = afterFeature.geometry;
    if (afterGeom.type !== 'Polygon' && afterGeom.type !== 'MultiPolygon') continue;

    const afterCategory = detectLandUseCategory(afterFeature.properties);
    const afterPolygon = afterFeature as PolygonFeature;

    // Check if there's an overlapping feature with different category in before
    for (const beforeFeature of before.features) {
      const beforeGeom = beforeFeature.geometry;
      if (beforeGeom.type !== 'Polygon' && beforeGeom.type !== 'MultiPolygon') continue;

      const beforeCategory = detectLandUseCategory(beforeFeature.properties);
      const beforePolygon = beforeFeature as PolygonFeature;

      if (afterCategory !== beforeCategory) {
        try {
          // Check for intersection
          if (turf.booleanIntersects(afterPolygon, beforePolygon)) {
            const intersection = turf.intersect(
              turf.featureCollection([afterPolygon, beforePolygon])
            );

            if (intersection) {
              changeFeatures.push({
                ...intersection,
                properties: {
                  ...afterFeature.properties,
                  _changeBefore: beforeCategory,
                  _changeAfter: afterCategory,
                  _changeType: 'modified',
                },
              } as GeoFeature);
            }
          }
        } catch {
          // Skip features that can't be processed
        }
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features: changeFeatures,
  };
}

/**
 * Format area for display
 */
export function formatArea(areaKm2: number, totalKm2?: number): string {
  const absArea = Math.abs(areaKm2);
  const formattedArea = `${absArea.toFixed(4)} km²`;

  if (totalKm2 && totalKm2 > 0) {
    const percent = (absArea / totalKm2) * 100;
    return `${formattedArea} (${percent.toFixed(2)}%)`;
  }

  return formattedArea;
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
