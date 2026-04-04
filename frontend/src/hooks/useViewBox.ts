import { useState, useCallback, useRef, useEffect, type RefObject, type MouseEvent } from "react";

interface ViewBoxState {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_VIEWBOX: ViewBoxState = { x: -50, y: -50, w: 100, h: 100 };
const MIN_W = 20;
const MAX_W = 2000;

// Zoom: proportional to deltaY magnitude
const ZOOM_SENSITIVITY = 0.002;
const MAX_DELTA = 300;

// Inertia
const FRICTION = 0.95;
const VELOCITY_THRESHOLD = 0.01;
const VELOCITY_SAMPLES = 3;

interface VelocitySample {
  vx: number;
  vy: number;
}

export function useViewBox(svgRef: RefObject<SVGSVGElement | null>, selectMode: boolean = true) {
  const [vb, setVb] = useState<ViewBoxState>(INITIAL_VIEWBOX);
  const dragRef = useRef<{ startX: number; startY: number; startVb: ViewBoxState } | null>(null);

  // Inertia refs
  const velocitySamples = useRef<VelocitySample[]>([]);
  const lastMoveTime = useRef<number>(0);
  const lastMovePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const inertiaRef = useRef<number | null>(null);

  const spaceHeld = useRef(false);
  const isPanning = useRef(false);

  const cancelInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => cancelInertia, [cancelInertia]);

  // Track Space key for Space+drag pan
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        spaceHeld.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const screenToSvgScale = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return 1;
    return vb.w / svg.clientWidth;
  }, [svgRef, vb.w]);

  // Attach wheel listener natively with { passive: false } so preventDefault works.
  // React's onWheel is registered as passive, making preventDefault a no-op.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      cancelInertia();

      const rect = svg.getBoundingClientRect();
      const mouseXFrac = (e.clientX - rect.left) / rect.width;
      const mouseYFrac = (e.clientY - rect.top) / rect.height;

      setVb((prev) => {
        const clampedDelta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, e.deltaY));
        const factor = Math.exp(clampedDelta * ZOOM_SENSITIVITY);

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
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [svgRef, cancelInertia]);

  const onMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      const isPan = e.button === 1 || (e.button === 0 && (spaceHeld.current || !selectMode));
      if (!isPan) return;
      e.preventDefault();
      cancelInertia();
      isPanning.current = true;
      dragRef.current = { startX: e.clientX, startY: e.clientY, startVb: vb };
      velocitySamples.current = [];
      lastMoveTime.current = performance.now();
      lastMovePos.current = { x: e.clientX, y: e.clientY };
    },
    [vb, cancelInertia, selectMode]
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

      // Track velocity
      const now = performance.now();
      const dt = now - lastMoveTime.current;
      if (dt > 0) {
        const moveDx = (e.clientX - lastMovePos.current.x) * scale;
        const moveDy = (e.clientY - lastMovePos.current.y) * scale;
        const sample: VelocitySample = { vx: moveDx / dt, vy: moveDy / dt };
        const samples = velocitySamples.current;
        if (samples.length >= VELOCITY_SAMPLES) samples.shift();
        samples.push(sample);
      }
      lastMoveTime.current = now;
      lastMovePos.current = { x: e.clientX, y: e.clientY };
    },
    [screenToSvgScale]
  );

  const onMouseUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    isPanning.current = false;

    const samples = velocitySamples.current;
    if (samples.length === 0) return;

    let vx = 0;
    let vy = 0;
    for (const s of samples) {
      vx += s.vx;
      vy += s.vy;
    }
    vx /= samples.length;
    vy /= samples.length;

    if (Math.abs(vx) + Math.abs(vy) < VELOCITY_THRESHOLD) return;

    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        inertiaRef.current = requestAnimationFrame(animate);
        return;
      }

      const frameDelta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const frictionFactor = Math.pow(FRICTION, frameDelta / 16);
      vx *= frictionFactor;
      vy *= frictionFactor;

      setVb((prev) => ({
        ...prev,
        x: prev.x - vx * frameDelta,
        y: prev.y - vy * frameDelta,
      }));

      if (Math.abs(vx) + Math.abs(vy) < VELOCITY_THRESHOLD) {
        inertiaRef.current = null;
        return;
      }

      inertiaRef.current = requestAnimationFrame(animate);
    };

    inertiaRef.current = requestAnimationFrame(animate);
  }, []);

  const viewBox = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;

  return {
    viewBox,
    handlers: { onMouseDown, onMouseMove, onMouseUp },
    spaceHeld,
    isPanning,
  };
}
