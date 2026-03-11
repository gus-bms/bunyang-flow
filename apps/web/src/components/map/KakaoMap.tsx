import { useEffect, useRef } from "react";
import type { OfferingStage } from "@bunyang-flow/shared";
import { getStageTone } from "../../lib/format";

// Marker fill colors matching stage badge tones
const TONE_COLOR: Record<string, string> = {
  rose: "#c84b2e",
  amber: "#c07800",
  sky: "#1967a8",
  emerald: "#1a7a54",
  slate: "#3e5673",
  sand: "#7a5c3e",
};

export interface MapItem {
  id: string;
  complexName: string;
  latitude: number;
  longitude: number;
  currentStage: OfferingStage;
  minSalePrice: number;
  nextScheduleLabel: string;
  nextScheduleAt: string;
}

interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface Props {
  items: MapItem[];
  selectedId?: string | null;
  onBoundsChange?: (bounds: MapBounds) => void;
  onSelect?: (item: MapItem | null) => void;
}

export function KakaoMap({ items, selectedId, onBoundsChange, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<Array<{ id: string; overlay: kakao.maps.CustomOverlay; el: HTMLElement }>>([]);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onSelectRef = useRef(onSelect);

  onBoundsChangeRef.current = onBoundsChange;
  onSelectRef.current = onSelect;

  // Initialize map once
  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;
    if (!appKey) return;

    function init() {
      kakao.maps.load(() => {
        if (!containerRef.current || mapRef.current) return;

        const center = new kakao.maps.LatLng(37.5665, 126.978);
        const map = new kakao.maps.Map(containerRef.current, { center, level: 7 });
        mapRef.current = map;

        const emitBounds = () => {
          const b = map.getBounds();
          const sw = b.getSouthWest();
          const ne = b.getNorthEast();
          onBoundsChangeRef.current?.({
            swLat: sw.getLat(),
            swLng: sw.getLng(),
            neLat: ne.getLat(),
            neLng: ne.getLng(),
          });
        };

        kakao.maps.event.addListener(map, "idle", emitBounds);
        emitBounds();
      });
    }

    // SDK가 이미 로드돼 있으면 바로 init
    if (typeof window.kakao !== "undefined" && window.kakao.maps) {
      init();
      return;
    }

    // 이미 script 태그가 있으면 로드 완료를 기다림
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com/v2/maps"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", init);
      return () => existingScript.removeEventListener("load", init);
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, []); // run once on mount

  // Sync markers when items change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old overlays
    for (const { overlay } of overlaysRef.current) {
      overlay.setMap(null);
    }
    overlaysRef.current = [];

    // Add new overlays (좌표가 없는 항목 제외)
    for (const item of items.filter(
      (i) => Math.abs(i.latitude) > 0.001 || Math.abs(i.longitude) > 0.001,
    )) {
      const tone = getStageTone(item.currentStage);
      const color = TONE_COLOR[tone] ?? "#172033";
      const isSelected = item.id === selectedId;

      const el = document.createElement("div");
      el.style.cssText = [
        `padding:8px 12px`,
        `border-radius:18px`,
        `background:${isSelected ? "#172033" : color}`,
        `color:#fff`,
        `font-size:12px`,
        `font-weight:700`,
        `cursor:pointer`,
        `box-shadow:0 4px 14px rgba(0,0,0,${isSelected ? "0.35" : "0.2"})`,
        `white-space:nowrap`,
        `transform:${isSelected ? "scale(1.1)" : "scale(1)"}`,
        `transition:transform 120ms ease`,
      ].join(";");
      el.textContent = item.complexName;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current?.(item);
      });

      const pos = new kakao.maps.LatLng(item.latitude, item.longitude);
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: el,
        map,
        yAnchor: 1.3,
      });

      overlaysRef.current.push({ id: item.id, overlay, el });
    }
  }, [items, selectedId]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
