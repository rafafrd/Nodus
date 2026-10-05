import { useEffect, useRef } from 'react';
export function Ambient() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cleanup = () => {}; let stopped = false;
    void import('three').then(T => {
      if (stopped || !host.current) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
      renderer.setSize(640, 210); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      host.current.appendChild(renderer.domElement);
      const scene = new T.Scene(); const camera = new T.PerspectiveCamera(35, 640 / 210, 0.1, 100); camera.position.z = 13;
      const group = new T.Group(); scene.add(group);
      const geometries: InstanceType<typeof T.BufferGeometry>[] = [], materials: InstanceType<typeof T.Material>[] = [];
      for (let i = 0; i < 3; i++) {
        const points = new T.EllipseCurve(0, 0, 2.2 + i * 0.6, 2.2 + i * 0.6, 0, Math.PI * 2, false, 0).getPoints(120);
        const geo = new T.BufferGeometry().setFromPoints(points); const mat = new T.LineBasicMaterial({ color: '#a9c297', transparent: true, opacity: 0.25 - i * 0.05 });
        const ring = new T.LineLoop(geo, mat); ring.rotation.x = 1.0 + i * 0.1; ring.rotation.y = i * 0.4; group.add(ring); geometries.push(geo); materials.push(mat);
      }
      const starGeo = new T.BufferGeometry(); const vertices = new Float32Array(160 * 3);
      for (let i = 0; i < 160; i++) { vertices[i * 3] = Math.sin(i * 12.7) * 11; vertices[i * 3 + 1] = Math.cos(i * 8.2) * 3.5; vertices[i * 3 + 2] = -2 - (i % 7); }
      starGeo.setAttribute('position', new T.BufferAttribute(vertices, 3)); const stars = new T.PointsMaterial({ color: '#a3b5b3', size: 0.018, transparent: true, opacity: 0.5 }); scene.add(new T.Points(starGeo, stars)); geometries.push(starGeo); materials.push(stars);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)'); let frame = 0, last = 0;
      function draw(now: number) {
        frame = requestAnimationFrame(draw);
        if (document.hidden || now - last < 50) return; last = now;
        if (!reduced.matches) group.rotation.z = now * 0.000025;
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(draw);
      cleanup = () => { cancelAnimationFrame(frame); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => {});
    return () => { stopped = true; cleanup(); };
  }, []);
  return <div ref={host} className="ambient" aria-hidden="true"/>;
}
