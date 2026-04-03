import { useState, useCallback, useRef, type RefObject, type WheelEvent, type MouseEvent } from "react";

interface ViewBoxState {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_VIEWBOX: ViewBoxState = { x: -50, y: -50, w: 100, h: 100 };
const ZOOM_FACTOR = 1.1;
const MIN_W = 20;
const MAX_W = 2000;

export function useViewBox(svgRef: RefObject<SVGSVGElement | null>) {
  const [vb, setVb] = useState<ViewBoxState>(INITIAL_VIEWBOX);
  const dragRef = useRef<{ startX: number; startY: number; startVb: ViewBoxState } | null>(null);

  const screenToSvgScale = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return 1;
    return vb.w / svg.clientWidth;
  }, [svgRef, vb.w]);

  const onWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseXFrac = (e.clientX - rect.left) / rect.width;
      const mouseYFrac = (e.clientY - rect.top) / rect.height;

      setVb((prev) => {
        const zoomIn = e.deltaY < 0;
        const factor = zoomIn ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

        let newW = prev.w * factor;
        let newH = prev.h * factor;

        if (newW < MIN_W) {
          newW = MIN_W;
          newH = MIN_W * (prev.h / prev.w);
        }
        if (newW > MAX_W) {
          newW = MAX_W;
          newH = MAX_W * (prev.h / prev.w);
        }

        const newX = prev.x + (prev.w - newW) * mouseXFrac;
        const newY = prev.y + (prev.h - newH) * mouseYFrac;

        return { x: newX, y: newY, w: newW, h: newH };
      });
    },
    [svgRef]
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      dragRef.current = { startX: e.clientX, startY: e.clientY, startVb: vb };
    },
    [vb]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!dragRef.current) return;
      const scale = screenToSvgScale();
      const dx = (e.clientX - dragRef.current.startX) * scale;
      const dy = (e.clientY - dragRef.current.startY) * scale;
      setVb({
        x: dragRef.current.startVb.x - dx,
        y: dragRef.current.startVb.y - dy,
        w: dragRef.current.startVb.w,
        h: dragRef.current.startVb.h,
      });
    },
    [screenToSvgScale]
  );

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const viewBox = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;

  return {
    viewBox,
    handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp },
  };
}
