import { useMemo } from 'react';
import type { GeoJSONData, AnalysisResults } from '@/types/geo';
import { computeLandUseChanges, getBoundingBox, createChangeFeatures } from '@/lib/geoUtils';

interface UseGeoAnalysisResult {
  results: AnalysisResults | null;
  bounds: [[number, number], [number, number]] | null;
  changeLayer: GeoJSONData | null;
  isValid: boolean;
}

export function useGeoAnalysis(
  before: GeoJSONData | null,
  after: GeoJSONData | null
): UseGeoAnalysisResult {
  return useMemo(() => {
    if (!before || !after) {
      return {
        results: null,
        bounds: null,
        changeLayer: null,
        isValid: false,
      };
    }

    const results = computeLandUseChanges(before, after);

    // Get combined bounds
    const beforeBounds = getBoundingBox(before);
    const afterBounds = getBoundingBox(after);

    let bounds: [[number, number], [number, number]] | null = null;

    if (beforeBounds && afterBounds) {
      bounds = [
        [
          Math.min(beforeBounds[0][0], afterBounds[0][0]),
          Math.min(beforeBounds[0][1], afterBounds[0][1]),
        ],
        [
          Math.max(beforeBounds[1][0], afterBounds[1][0]),
          Math.max(beforeBounds[1][1], afterBounds[1][1]),
        ],
      ];
    } else {
      bounds = beforeBounds || afterBounds;
    }

    // Create change layer
    const changeLayer = createChangeFeatures(before, after);

    return {
      results,
      bounds,
      changeLayer,
      isValid: true,
    };
  }, [before, after]);
}
