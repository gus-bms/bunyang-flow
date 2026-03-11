// Minimal Kakao Maps SDK type declarations
// Kakao Maps JavaScript SDK (https://apis.map.kakao.com/web/documentation/)

declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      getCenter(): LatLng;
      getBounds(): LatLngBounds;
      setCenter(latlng: LatLng): void;
      getLevel(): number;
      setLevel(level: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      yAnchor?: number;
      xAnchor?: number;
      zIndex?: number;
    }

    namespace event {
      function addListener(target: object, type: string, handler: () => void): void;
      function removeListener(target: object, type: string, handler: () => void): void;
    }
  }
}

declare global {
  interface Window {
    kakao: typeof kakao | undefined;
  }
}
