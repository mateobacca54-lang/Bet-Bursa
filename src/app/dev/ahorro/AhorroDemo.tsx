'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createTimeline, createTimer, utils, animate } from 'animejs';
import 'animejs/adapters/three';

// --- Texturas Procedurales Hiperrealistas ---
// Generan un billete y bordes de papel altamente detallados sin descargar imágenes

const getTopTexture = () => {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Fondo de papel moneda
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#5f8a6b');
  grad.addColorStop(0.5, '#7ba888');
  grad.addColorStop(1, '#5f8a6b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);
  
  // Ruido de micro-fibras del billete
  for(let i=0; i<30000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random()*1024, Math.random()*512, 2, 2);
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random()*1024, Math.random()*512, 1, 1);
  }

  // Patrón geométrico
  ctx.strokeStyle = '#3e6147';
  ctx.lineWidth = 2;
  for(let i=0; i<40; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i*15);
    ctx.bezierCurveTo(300, i*15 + 150, 700, i*15 - 150, 1024, i*15);
    ctx.stroke();
  }

  // Marcos
  ctx.strokeStyle = '#2b4d36';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, 964, 452);

  // Sello principal
  ctx.fillStyle = '#b0d1b9';
  ctx.beginPath(); ctx.arc(180, 256, 120, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eaf5ed';
  ctx.beginPath(); ctx.arc(180, 256, 80, 0, Math.PI * 2); ctx.fill();

  // Hilo holográfico
  ctx.fillStyle = '#a1bda9';
  ctx.fillRect(720, 0, 45, 512);

  // Denominación gigante
  ctx.fillStyle = '#183020';
  ctx.font = '900 180px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('100', 512, 240);
  ctx.font = '800 50px "Arial", sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('MIL PESOS', 512, 360);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const getTopMetalnessTexture = () => {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#050505'; 
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#FFFFFF'; // Brillo solo en el hilo
  ctx.fillRect(720, 0, 45, 512);

  return new THREE.CanvasTexture(canvas);
};

const getSideTexture = () => {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#e5ebd8'; 
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.fillStyle = '#9aa18c';
  for (let i = 0; i < 512; i += 2) {
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.fillRect(0, i, 512, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const getSideBumpTexture = () => {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  for (let i = 0; i < 512; i += 2) {
    const val = Math.random() > 0.5 ? 255 : 50;
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, i, 512, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// Modificador: Abulta el fajo simulando la compresión real del papel y la liga
const deformGeometry = (geometry: THREE.BufferGeometry) => {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    
    const curve = Math.cos((x / 1.0) * Math.PI) * 0.04;
    const noise = (Math.sin(x * 20) * Math.cos(z * 20)) * 0.005;
    
    pos.setY(i, y + curve + noise);
  }
  geometry.computeVertexNormals();
};

export default function AhorroDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'ahorro' | 'inversion'>('ahorro');
  
  const extraFajosRef = useRef<THREE.Group[]>([]);
  const baseFajosRef = useRef<THREE.Group[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const $container = containerRef.current;
    const width = $container.clientWidth;
    const height = $container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; 
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    $container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);
    
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 14, 20); 
    camera.lookAt(0, 0, 0);
    cameraRig.add(camera);

    const container = new THREE.Group();
    scene.add(container);

    // --- Iluminación para dar volumen masivo al cúmulo ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    container.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xffeedd, 220, 60, Math.PI / 4, 0.8, 1.5);
    keyLight.position.set(8, 20, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    container.add(keyLight);
    
    const fillLight = new THREE.PointLight(0xaabbff, 120, 40, 1.5);
    fillLight.position.set(-10, 10, -5);
    container.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 150, 40, 1.2);
    rimLight.position.set(0, 5, -15);
    container.add(rimLight);

    // Suelo invisible para atrapar sombras
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.18 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    container.add(ground);

    // --- Materiales Físicos (PBR) ---
    const topTex = getTopTexture();
    const metalTex = getTopMetalnessTexture();
    const sideTex = getSideTexture();
    const sideBumpTex = getSideBumpTexture();
    
    const topMat = new THREE.MeshPhysicalMaterial({ 
      map: topTex, 
      roughness: 0.85, 
      metalnessMap: metalTex,
      metalness: 1.0, 
    });
    
    const sideMat = new THREE.MeshStandardMaterial({ 
      map: sideTex, 
      bumpMap: sideBumpTex,
      bumpScale: 0.12, 
      roughness: 0.9 
    });
    
    const stackMaterials = [sideMat, sideMat, topMat, topMat, sideMat, sideMat];
    
    // --- Geometrías del Fajo Individual (Sólido y apretado) ---
    const paperGeo = new THREE.BoxGeometry(2.0, 0.35, 1.0, 32, 4, 8); 
    deformGeometry(paperGeo);

    // Liga Bursa (Zuncho anaranjado de papel)
    const bandGeo = new THREE.BoxGeometry(0.35, 0.38, 1.03, 8, 4, 8);
    deformGeometry(bandGeo);
    const bandMat = new THREE.MeshStandardMaterial({ color: '#F4501B', roughness: 0.8 });

    const createFajo = () => {
      const fajo = new THREE.Group();
      
      const paper = new THREE.Mesh(paperGeo, stackMaterials);
      paper.castShadow = true;
      paper.receiveShadow = true;
      fajo.add(paper);
      
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.castShadow = true;
      band.receiveShadow = true;
      fajo.add(band);

      return fajo;
    };

    // --- 1. MODO AHORRO (12 Fajos ordenados en el piso) ---
    const COLS = 4;
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const fajo = createFajo();
      
      const x = (col - 1.5) * 2.2;
      const z = (row - 1) * 1.2;
      
      fajo.position.set(x, 0.18, z); 
      fajo.rotation.y = (Math.random() - 0.5) * 0.15;
      fajo.rotation.z = (Math.random() - 0.5) * 0.02;
      fajo.rotation.x = (Math.random() - 0.5) * 0.02;
      
      container.add(fajo);
      baseFajosRef.current.push(fajo);
    }

    // --- 2. MODO INVERSIÓN (Un Cúmulo de Montaña Gigante: 120 fajos) ---
    for (let i = 0; i < 120; i++) {
      const fajo = createFajo();
      
      // Matemática para construir una montaña apilada sólida
      // Más fajos en la base, menos en la cima
      const level = Math.floor(Math.pow(i / 15, 1.2)); 
      const angle = i * 2.4; 
      const maxRadius = Math.max(0.2, 3.5 - (level * 0.5));
      const radius = Math.sqrt(Math.random()) * maxRadius;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      fajo.userData.targetY = level * 0.34 + 0.18; 
      fajo.userData.targetRotY = Math.random() * Math.PI;
      // Inclinaciones caóticas por estar apilados uno sobre otro
      fajo.userData.targetRotZ = (Math.random() - 0.5) * 0.25; 
      fajo.userData.targetRotX = (Math.random() - 0.5) * 0.25;
      
      fajo.position.set(x, fajo.userData.targetY + 40, z); // Inicialmente en el cielo
      fajo.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      fajo.scale.setScalar(0.001); 
      
      container.add(fajo);
      extraFajosRef.current.push(fajo);
    }

    createTimeline({ defaults: { duration: 60000, ease: 'linear', loop: true } })
      .add(cameraRig, { rotateY: 360 }, 0); 

    const timer = createTimer({
      onUpdate: () => {
        renderer.render(scene, camera);
      }
    });
    
    const handleResize = () => {
      if (!$container) return;
      camera.aspect = $container.clientWidth / $container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize($container.clientWidth, $container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timer.pause();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      $container.innerHTML = '';
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current || extraFajosRef.current.length === 0) return;

    if (mode === 'inversion') {
      // 1. Agrupar la base hacia el centro ligeramente
      baseFajosRef.current.forEach((fajo, i) => {
        animate(fajo, {
          x: fajo.position.x * 0.7,
          z: fajo.position.z * 0.7,
          ease: 'outExpo',
          duration: 1000
        });
      });

      // 2. Llover el cúmulo de fajos
      extraFajosRef.current.forEach((fajo, i) => {
        animate(fajo, {
          y: fajo.userData.targetY,
          x: fajo.position.x + (Math.random() - 0.5) * 0.3,
          scale: 1,
          rotateX: fajo.userData.targetRotX,
          rotateY: fajo.userData.targetRotY,
          rotateZ: fajo.userData.targetRotZ,
          delay: i * 15, 
          ease: 'outBounce', // Caída seca y caótica
          duration: 1800
        });
      });
      
    } else {
      // 1. Devolver la base a su cuadrícula original
      const COLS = 4;
      baseFajosRef.current.forEach((fajo, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        animate(fajo, {
          x: (col - 1.5) * 2.2,
          z: (row - 1) * 1.2,
          ease: 'outExpo',
          duration: 1000
        });
      });

      // 2. Desaparecer la montaña
      extraFajosRef.current.forEach((fajo, i) => {
        animate(fajo, {
          y: '+=30',
          x: '+=5',
          scale: 0.001,
          rotateY: '+=180',
          rotateX: '+=90',
          delay: (119 - i) * 6,
          ease: 'inExpo',
          duration: 800
        });
      });
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#0A0F1C] p-8 md:p-16 flex flex-col font-sans overflow-hidden">
      
      <div className="flex gap-4 mb-4 relative z-20">
        <button 
          onClick={() => setMode('ahorro')}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${mode === 'ahorro' ? 'bg-[#0A0F1C] text-white shadow-lg' : 'bg-white border border-[#D7DCE3] text-[#5B6478] hover:bg-gray-50'}`}
        >
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${mode === 'ahorro' ? 'bg-white text-[#0A0F1C]' : 'bg-[#F2F4F7]'}`}>1</span>
          Ahorro
        </button>
        <button 
          onClick={() => setMode('inversion')}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${mode === 'inversion' ? 'bg-[#0A0F1C] text-white shadow-lg' : 'bg-white border border-[#D7DCE3] text-[#5B6478] hover:bg-gray-50'}`}
        >
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${mode === 'inversion' ? 'bg-white text-[#0A0F1C]' : 'bg-[#F2F4F7]'}`}>2</span>
          Inversión
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12 h-full flex-1">
        
        <div 
          ref={containerRef}
          className="relative w-full max-w-[700px] h-[600px] flex items-center justify-center rounded-3xl"
        >
        </div>

        <div className="flex-1 max-w-lg mt-12 lg:mt-0 relative z-20">
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            {mode === 'ahorro' ? 'Apartas $100.000 al mes' : 'La magia del tiempo'}
          </h2>
          <div className="text-6xl font-bold text-[#B93A10] mb-6 transition-all duration-500">
            {mode === 'ahorro' ? '$1.200.000' : '$19.450.000'}
          </div>
          <p className="text-lg text-[#5B6478] mb-8 leading-relaxed">
            {mode === 'ahorro' 
              ? 'Después de 12 meses, la suma de tus aportes es $1.200.000. Tienes esa plata guardada para usarla cuando la necesites.'
              : 'Ese mismo dinero aportado de forma constante durante 10 años en una cuenta remunerada. ¡Tus billetes se apilan solos gracias al interés compuesto!'}
          </p>
          <p className="text-sm text-[#5B6478] mb-8">
            {mode === 'ahorro' ? 'Suma de aportes, sin intereses.' : 'Proyección aproximada del 10% E.A.'}
          </p>
          <button className="px-8 py-4 bg-transparent border-[1.5px] border-[#D7DCE3] rounded-full text-[#0A0F1C] font-semibold text-lg hover:border-[#0A0F1C] transition-colors">
            Empieza gratis
          </button>
        </div>

      </div>
    </div>
  );
}
