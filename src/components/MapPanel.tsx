import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJSONData, LayerVisibility, LandUseCategory } from '@/types/geo';
import { LAND_USE_CATEGORIES, LAND_USE_COLORS } from '@/types/geo';
import { detectLandUseCategory, calculateFeatureArea } from '@/lib/geoUtils';

interface MapPanelProps {
  before: GeoJSONData;
  after: GeoJSONData;
  changeLayer: GeoJSONData | null;
  layerVisibility: LayerVisibility;
  bounds: [[number, number], [number, number]] | null;
  selectedClasses: LandUseCategory[];
}

function getFeatureStyle(category: LandUseCategory, opacity: number): L.PathOptions {
  return {
    fillColor: LAND_USE_COLORS[category],
    fillOpacity: opacity,
    color: 'rgba(255,255,255,0.2)',
    weight: 1,
    opacity: 1,
  };
}

const changeStyle: L.PathOptions = {
  fillColor: '#FF3D00', // Saturated Neon Red
  fillOpacity: 0.6,
  color: '#FFFFFF',
  weight: 2,
  opacity: 1,
  dashArray: '3',
};

export function MapPanel({
  before,
  after,
  changeLayer,
  layerVisibility,
  bounds,
  selectedClasses,
}: MapPanelProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    before: L.GeoJSON | null;
    after: L.GeoJSON | null;
    change: L.GeoJSON | null;
  }>({ before: null, after: null, change: null });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40, -74.5], // Default but will be overridden by fitBounds
      zoom: 9,
      zoomControl: true,
      fadeAnimation: true,
    });

    // Pro Dark Matter Tiles with Labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle bounds
  useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [bounds]);

  // Utility to create premium popups
  const bindPremiumPopup = (feature: any, layer: L.Layer, era: 'Baseline' | 'Target' | 'Change') => {
    const props = feature.properties;
    const areaKm2 = calculateFeatureArea(feature);
    const category = detectLandUseCategory(props);
    const categoryName = LAND_USE_CATEGORIES[category]?.name || 'Unknown';
    const color = era === 'Baseline' ? '#8B5CF6' : era === 'Target' ? '#2DD4BF' : '#F43F5E';

    const popupContent = `
      <div class="custom-popup" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; min-width: 180px; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
           <span style="font-size: 8px; font-weight: 900; letter-spacing: 0.15em; color: ${color}; text-transform: uppercase;">${era} Analysis</span>
           <div style="width: 4px; h-4; border-radius: 50%; background: ${color};"></div>
        </div>
        <h4 style="color: white; font-weight: 900; font-size: 14px; margin: 0 0 4px 0; font-family: 'Plus Jakarta Sans', sans-serif;">${props.name || 'Geo-Segment'}</h4>
        <div style="background: rgba(255,255,255,0.05); padding: 8px 10px; border-radius: 8px; margin-top: 8px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 2px; background: ${LAND_USE_COLORS[category]}; box-shadow: 0 0 10px ${LAND_USE_COLORS[category]}44;"></div>
            <span style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">${categoryName}</span>
          </div>
          ${areaKm2 > 0 ? `<div style="color: white; font-size: 11px; font-weight: 800; margin-top: 6px; font-family: 'JetBrains Mono', monospace; opacity: 0.9;">${areaKm2.toFixed(4)} km²</div>` : ''}
        </div>
        ${era === 'Change' ? `
          <div style="margin-top: 8px; font-size: 9px; color: rgba(255,255,255,0.4); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
            TRANSITION: ${props._changeBefore || 'N/A'} → ${props._changeAfter || 'N/A'}
          </div>
        ` : ''}
      </div>
    `;

    layer.bindPopup(popupContent, {
      className: 'premium-leaflet-popup',
      closeButton: false,
      maxWidth: 300
    });

    // Hover effects
    layer.on('mouseover', function (e) {
      const l = e.target;
      l.setStyle({ fillOpacity: 0.9, weight: 2 });
    });
    layer.on('mouseout', function (e) {
      const l = e.target;
      const opacity = era === 'Baseline' ? 0.7 : 0.8;
      l.setStyle({ fillOpacity: opacity, weight: 1 });
    });
  };

  // Update before layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (layersRef.current.before) {
      mapRef.current.removeLayer(layersRef.current.before);
      layersRef.current.before = null;
    }
    if (!layerVisibility.before) return;

    const layer = L.geoJSON(before, {
      style: (feature) => {
        if (!feature?.properties) return {};
        const category = detectLandUseCategory(feature.properties);
        if (selectedClasses.length > 0 && !selectedClasses.includes(category)) {
          return { fillOpacity: 0, opacity: 0, pointerEvents: 'none' };
        }
        return getFeatureStyle(category, 0.7);
      },
      onEachFeature: (feature, layer) => bindPremiumPopup(feature, layer, 'Baseline'),
    });

    layer.addTo(mapRef.current);
    layersRef.current.before = layer;
  }, [before, layerVisibility.before, selectedClasses]);

  // Update after layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (layersRef.current.after) {
      mapRef.current.removeLayer(layersRef.current.after);
      layersRef.current.after = null;
    }
    if (!layerVisibility.after) return;

    const layer = L.geoJSON(after, {
      style: (feature) => {
        if (!feature?.properties) return {};
        const category = detectLandUseCategory(feature.properties);
        if (selectedClasses.length > 0 && !selectedClasses.includes(category)) {
          return { fillOpacity: 0, opacity: 0, pointerEvents: 'none' };
        }
        return getFeatureStyle(category, 0.8);
      },
      onEachFeature: (feature, layer) => bindPremiumPopup(feature, layer, 'Target'),
    });

    layer.addTo(mapRef.current);
    layersRef.current.after = layer;
  }, [after, layerVisibility.after, selectedClasses]);

  // Update change layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (layersRef.current.change) {
      mapRef.current.removeLayer(layersRef.current.change);
      layersRef.current.change = null;
    }
    if (!layerVisibility.change || !changeLayer || changeLayer.features.length === 0) return;

    const layer = L.geoJSON(changeLayer, {
      style: () => changeStyle,
      onEachFeature: (feature, layer) => bindPremiumPopup(feature, layer, 'Change'),
    });

    layer.addTo(mapRef.current);
    layersRef.current.change = layer;
  }, [changeLayer, layerVisibility.change]);

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full transition-all duration-700 brightness-110 contrast-110" />
      {/* Map Gradients Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.4)] z-[400]" />
    </div>
  );
}
