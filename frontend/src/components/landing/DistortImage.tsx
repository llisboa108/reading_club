import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, supportsFineHover } from "../../lib/landingMotion";

interface DistortImageProps {
  src: string;
  alt: string;
  className?: string;
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Subtle cursor-follow displacement + slight zoom toward the pointer, applied
// within the same "cover" crop the plain <img> uses so it doesn't look
// stretched relative to the object-cover fallback it replaces on hover-out.
const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  varying vec2 vUv;

  void main() {
    vec2 coveredUv = vUv * uUvScale + uUvOffset;
    vec2 mouseUv = uMouse * uUvScale + uUvOffset;
    vec2 toMouse = coveredUv - mouseUv;
    float dist = length(toMouse);
    float falloff = smoothstep(0.6, 0.0, dist);
    vec2 displaced = coveredUv - toMouse * falloff * uHover * 0.06;
    vec2 center = uUvOffset + uUvScale * 0.5;
    vec2 zoomed = (displaced - center) * (1.0 - uHover * 0.05) + center;
    gl_FragColor = texture2D(uTexture, zoomed);
  }
`;

/**
 * Drop-in replacement for a photo <img> that adds a subtle WebGL
 * displacement/zoom toward the cursor on hover. Scoped to gallery/timeline
 * thumbnails only — not a page-wide effect. `three` itself is only imported
 * once a thumbnail is near the viewport (not at module load), so it never
 * costs authenticated app routes anything and doesn't block the landing
 * page's own initial paint either. The WebGL scene is torn down again once
 * the thumbnail scrolls back out, since a full gallery of always-live
 * contexts risks the browser's ~16 concurrent WebGL context budget. Falls
 * back to a plain <img> with CSS hover-zoom on touch devices and under
 * prefers-reduced-motion.
 */
export default function DistortImage({ src, alt, className = "" }: DistortImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inView, setInView] = useState(false);
  const [webglActive, setWebglActive] = useState(false);
  const enhancable = !prefersReducedMotion() && supportsFineHover();

  useEffect(() => {
    if (!enhancable) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enhancable]);

  useEffect(() => {
    if (!enhancable || !inView) {
      setWebglActive(false);
      return;
    }
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed || !container || !canvas) return;

      let frameId = 0;
      let hover = 0;
      let targetHover = 0;
      const mouse = { x: 0.5, y: 0.5 };

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
      camera.position.z = 1;

      const texture = new THREE.TextureLoader().load(src, () => {
        if (disposed) return;
        // Deliberately NOT tagging this SRGBColorSpace: this ShaderMaterial is
        // fully custom (no Three.js color-management shader chunks), so an
        // sRGB-tagged texture gets linearized on sample by the GPU and then
        // written straight to gl_FragColor with no re-encode — the image
        // renders darker and off-saturation relative to a plain <img>. Leaving
        // the texture untagged (NoColorSpace, the default) makes the shader
        // pass the raw sRGB bytes straight through, matching the plain <img>.
        applyCoverUv();
        setWebglActive(true);
        // The initial frame(s) may have rendered before the texture finished
        // loading (TextureLoader is async) — the animate loop stops itself
        // right after that first frame since hover isn't moving yet, so
        // without this the canvas would show an empty draw forever.
        renderer.render(scene, camera);
      });

      const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uUvScale: { value: new THREE.Vector2(1, 1) },
          uUvOffset: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      function applyCoverUv() {
        const img = texture.image as HTMLImageElement | undefined;
        if (!img?.naturalWidth || !container) return;
        const imageAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = container.clientWidth / container.clientHeight;
        let scaleX = 1;
        let scaleY = 1;
        if (containerAspect > imageAspect) {
          scaleY = imageAspect / containerAspect;
        } else {
          scaleX = containerAspect / imageAspect;
        }
        material.uniforms.uUvScale.value.set(scaleX, scaleY);
        material.uniforms.uUvOffset.value.set((1 - scaleX) / 2, (1 - scaleY) / 2);
      }

      function resize() {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        applyCoverUv();
      }
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      function ensureLoop() {
        if (!frameId) frameId = requestAnimationFrame(animate);
      }

      function handleMove(event: PointerEvent) {
        const rect = container!.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) / rect.width;
        mouse.y = 1 - (event.clientY - rect.top) / rect.height;
        targetHover = 1;
        ensureLoop();
      }
      function handleLeave() {
        targetHover = 0;
        ensureLoop();
      }

      container.addEventListener("pointermove", handleMove);
      container.addEventListener("pointerleave", handleLeave);

      function animate() {
        if (disposed) return;
        hover += (targetHover - hover) * 0.08;
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        material.uniforms.uHover.value = hover;
        renderer.render(scene, camera);
        if (Math.abs(targetHover - hover) > 0.001) {
          frameId = requestAnimationFrame(animate);
        } else {
          frameId = 0;
        }
      }
      frameId = requestAnimationFrame(animate);

      teardown = () => {
        if (frameId) cancelAnimationFrame(frameId);
        container.removeEventListener("pointermove", handleMove);
        container.removeEventListener("pointerleave", handleLeave);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [enhancable, inView, src]);

  return (
    <div ref={containerRef} className={`group relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          webglActive ? "opacity-0" : "opacity-100 group-hover:scale-105 duration-300"
        }`}
      />
      {enhancable && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${
            webglActive ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
