import { useEffect, useRef } from 'react';

export function Ambient() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cleanup = () => {}; let stopped = false;
    void import('three').then(T => {
      const element = host.current;
      if (stopped || !element) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); element.appendChild(renderer.domElement);
      renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
      const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 2.4, .1, 100); camera.position.z = 12;
      const group = new T.Group(); group.position.x = 1.5; scene.add(group);
      const geometries: InstanceType<typeof T.BufferGeometry>[] = [], materials: InstanceType<typeof T.Material>[] = [];
      const coreGeometry = new T.IcosahedronGeometry(.8, 1);
      const coreMaterial = new T.MeshBasicMaterial({ color: '#c3d8a4', wireframe: true, transparent: true, opacity: .17 });
      const core = new T.Mesh(coreGeometry, coreMaterial); group.add(core); geometries.push(coreGeometry); materials.push(coreMaterial);
      for (let i = 0; i < 3; i++) {
        const points = new T.EllipseCurve(0, 0, 2.1 + i * .5, 2.1 + i * .5, 0, Math.PI * 2, false, 0).getPoints(128);
        const geometry = new T.BufferGeometry().setFromPoints(points);
        const material = new T.LineBasicMaterial({ color: i === 1 ? '#c5d8b1' : '#9eb187', transparent: true, opacity: .42 - i * .08 });
        const ring = new T.LineLoop(geometry, material); ring.rotation.x = 1 + i * .17; ring.rotation.y = i * .65; group.add(ring); geometries.push(geometry); materials.push(material);
      }
      const starsGeometry = new T.BufferGeometry(), vertices = new Float32Array(130 * 3);
      for (let i = 0; i < 130; i++) { vertices[i * 3] = Math.sin(i * 12.7) * 10; vertices[i * 3 + 1] = Math.cos(i * 8.2) * 3.5; vertices[i * 3 + 2] = -2 - i % 7; }
      starsGeometry.setAttribute('position', new T.BufferAttribute(vertices, 3));
      const starsMaterial = new T.PointsMaterial({ color: '#b6c3ab', size: .024, transparent: true, opacity: .5 });
      scene.add(new T.Points(starsGeometry, starsMaterial)); geometries.push(starsGeometry); materials.push(starsMaterial);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0, last = 0, target = 0;
      function draw(now: number) {
        frame = 0;
        if (!document.hidden && now - last >= 50) {
          last = now; group.rotation.z = now * .000018; group.rotation.y += (target - group.rotation.y) * .05;
          core.rotation.y = now * .00005; renderer.render(scene, camera);
        }
        if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
      }
      function restart() {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        if (document.hidden) return;
        if (reduced.matches) { group.rotation.set(0, 0, .15); core.rotation.set(0, .3, 0); renderer.render(scene, camera); }
        else frame = requestAnimationFrame(draw);
      }
      const observer = new ResizeObserver(() => {
        const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight);
        renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); restart();
      }); observer.observe(element);
      const move = (event: PointerEvent) => { if (!reduced.matches) target = (event.clientX / innerWidth - .5) * .2; };
      window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('visibilitychange', restart); reduced.addEventListener('change', restart);
      restart();
      cleanup = () => {
        cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', restart); reduced.removeEventListener('change', restart);
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => {});
    return () => { stopped = true; cleanup(); };
  }, []);
  return <div ref={host} className="ambient" aria-hidden="true"/>;
}
