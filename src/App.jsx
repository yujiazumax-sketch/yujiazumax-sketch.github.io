import React, { useState, useEffect, useRef, useMemo } from 'react';

// アコーディオンコンポーネント
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-center w-full py-6 text-left text-slate-200 hover:text-white transition-colors focus:outline-none group"
      >
        <span className="font-light tracking-wide text-lg">{question}</span>
        <span className="text-xl font-light opacity-50 group-hover:opacity-100 transition-opacity">{isOpen ? '−' : '＋'}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400 font-light leading-relaxed tracking-wide text-lg">{answer}</p>
      </div>
    </div>
  );
};

const App = () => {
  const containerRef = useRef(null);
  const surfaceMeshRef = useRef(null); 
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [dividend, setDividend] = useState(14);
  const [divisor, setDivisor] = useState(4);
  const [showSurface, setShowSurface] = useState(true); 
  
  const calc = useMemo(() => {
    const a = Math.max(0, parseInt(dividend) || 0);
    const b = Math.max(1, parseInt(divisor) || 1);
    return { a, b, q: Math.floor(a / b), r: a % b };
  }, [dividend, divisor]);

  const getThemeColors = (r) => {
    if (r === 0) {
      return {
        bg: 0x020617,
        bgTw: 'from-slate-950 to-blue-950',
        crystal: 0x06b6d4, 
        crystalEmissive: 0x0891b2, 
        line: 0x22d3ee, 
        accentTw: 'text-cyan-400',
        accentBorderTw: 'border-cyan-500',
        titleGradientTw: 'from-cyan-400 to-blue-500'
      };
    } else if (r === 1) {
      return {
        bg: 0x022c22, 
        bgTw: 'from-teal-950 to-green-950',
        crystal: 0x10b981, 
        crystalEmissive: 0x059669, 
        line: 0x34d399, 
        accentTw: 'text-emerald-400',
        accentBorderTw: 'border-emerald-500',
        titleGradientTw: 'from-teal-400 to-emerald-500'
      };
    } else if (r === 2) {
      return {
        bg: 0x271a00, 
        bgTw: 'from-amber-950 to-orange-950',
        crystal: 0xf59e0b, 
        crystalEmissive: 0xd97706, 
        line: 0xfbbf24, 
        accentTw: 'text-amber-400',
        accentBorderTw: 'border-amber-500',
        titleGradientTw: 'from-amber-400 to-orange-500'
      };
    } else {
      return {
        bg: 0x2e020c, 
        bgTw: 'from-rose-950 to-purple-950',
        crystal: 0xf43f5e, 
        crystalEmissive: 0xe11d48, 
        line: 0xfb7185, 
        accentTw: 'text-rose-400',
        accentBorderTw: 'border-rose-500',
        titleGradientTw: 'from-rose-400 to-purple-500'
      };
    }
  };

  const theme = useMemo(() => getThemeColors(calc.r), [calc.r]);

  useEffect(() => {
    let checkInterval;
    const loadScripts = () => {
      if (window.THREE && window.THREE.OrbitControls) return;
      if (!document.getElementById('three-core-script')) {
        const script = document.createElement('script');
        script.id = 'three-core-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
          if (!document.getElementById('three-orbit-script')) {
            const controlsScript = document.createElement('script');
            controlsScript.id = 'three-orbit-script';
            controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            document.head.appendChild(controlsScript);
          }
        };
        document.head.appendChild(script);
      }
    };
    loadScripts();
    checkInterval = setInterval(() => {
      if (window.THREE && window.THREE.OrbitControls) {
        setThreeLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (!threeLoaded || !containerRef.current || !window.THREE || !window.THREE.OrbitControls) return;
    const THREE = window.THREE;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bg);
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 1.0;
    controls.maxDistance = 100; 
    
    // ライティング
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);
    
    const roomFillLight = new THREE.PointLight(0xffffff, 0.7, 150);
    roomFillLight.position.set(0, 20, 10);
    scene.add(roomFillLight);
    
    const deskLight = new THREE.SpotLight(0xffffff, 2.0); 
    deskLight.position.set(5, 35, 10); 
    deskLight.angle = Math.PI / 4;
    deskLight.penumbra = 0.5;
    deskLight.castShadow = true;
    deskLight.shadow.mapSize.width = 2048;
    deskLight.shadow.mapSize.height = 2048;
    scene.add(deskLight);
    
    const rimLight = new THREE.PointLight(theme.crystal, 1.5, 50);
    rimLight.position.set(-10, 10, -10);
    scene.add(rimLight);

    const { a, b, q, r } = calc;

    // 部屋の構築
    const roomSize = 120;
    const roomGeo = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
    
    const baseBgColor = new THREE.Color(theme.bg);
    const wallColor = baseBgColor.clone().lerp(new THREE.Color(0xffffff), 0.08);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.2 }); 
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 }); 
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1.0 }); 
    
    const roomMaterials = [wallMat, wallMat, ceilMat, floorMat, wallMat, wallMat];
    const room = new THREE.Mesh(roomGeo, roomMaterials);
    room.geometry.scale(-1, 1, 1);
    
    const floorY = -15; 
    room.position.y = roomSize / 2 + floorY;
    room.receiveShadow = true;
    scene.add(room);

    // 金属製の机の構築
    const tableGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0xa0a0a0, 
      roughness: 0.25,  
      metalness: 0.85 
    });
    
    const legH = 10;
    const topH = 0.6;

    const tableTopGeo = new THREE.BoxGeometry(24, topH, 16);
    const tableTop = new THREE.Mesh(tableTopGeo, metalMat);
    tableTop.position.y = floorY + legH + topH / 2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const tableSurfaceY = floorY + legH + topH;

    const legGeo = new THREE.CylinderGeometry(0.4, 0.4, legH, 16);
    for (let x = -10; x <= 10; x += 20) {
      for (let z = -6; z <= 6; z += 12) {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(x, floorY + legH / 2, z);
        leg.castShadow = true;
        tableGroup.add(leg);
      }
    }
    scene.add(tableGroup);

    // 結晶の構築
    const crystalGroup = new THREE.Group();
    scene.add(crystalGroup);
    
    const coreColor = new THREE.Color(0xf59e0b).lerp(new THREE.Color(theme.crystal), 0.3);
    const coreMaterial = new THREE.MeshPhysicalMaterial({ color: coreColor, emissive: 0xb45309, roughness: 0.2, metalness: 0.8 });
    const coreAuraMaterial = new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.15, wireframe: true });
    const nodeMaterial = new THREE.MeshPhysicalMaterial({ color: theme.crystal, emissive: theme.crystalEmissive, roughness: 0.1, metalness: 0.5 });
    const lineMaterial = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0.5 });
    const webMaterial = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0.15 });

    const coreOffset = r > 0 ? 1.5 + r * 0.15 : 0.5;
    const spacing = 1.2;
    
    const estimatedMaxRadius = coreOffset + q * spacing + (r > 0 ? r * 0.2 + 2.0 : 1.0);
    const crystalY = tableSurfaceY + estimatedMaxRadius + 4.0; 
    crystalGroup.position.y = crystalY;

    if (r === 0) {
      const geo = new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: theme.crystal, wireframe: true });
      crystalGroup.add(new THREE.Mesh(geo, mat));
    } else {
      const auraGeo = new THREE.SphereGeometry(1 + r * 0.15, 32, 32);
      crystalGroup.add(new THREE.Mesh(auraGeo, coreAuraMaterial));
      
      for (let i = 0; i < r; i++) {
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.acos((Math.random() * 2) - 1);
        const radius = Math.random() * (0.8 + r * 0.1);
        
        const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), coreMaterial);
        coreMesh.position.set(
          radius * Math.sin(angle2) * Math.cos(angle1),
          radius * Math.sin(angle2) * Math.sin(angle1),
          radius * Math.cos(angle2)
        );
        coreMesh.userData = {
          rx: Math.random() * 0.05,
          ry: Math.random() * 0.05,
          orbitSpeed: 0.01 + Math.random() * 0.02,
          orbitAxis: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize()
        };
        crystalGroup.add(coreMesh);
      }
    }

    const directions = [];
    if (b === 1) {
      directions.push(new THREE.Vector3(0, 1, 0));
    } else if (b === 2) {
      directions.push(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0));
    } else {
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < b; i++) {
        const y = 1 - (i / (b - 1)) * 2; 
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        directions.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius));
      }
    }

    const webPoints = Array.from({ length: q }, () => []);

    directions.forEach(dir => {
      const theta = Math.atan2(dir.z, dir.x);
      const phi = Math.acos(dir.y);
      const distortion = r === 0 ? 1.0 : 1.0 + (0.3 * Math.cos(r * theta) * Math.sin(phi));

      let prevPos = dir.clone().multiplyScalar((coreOffset - 0.5) * distortion);
      
      for (let j = 0; j < q; j++) {
        const distance = (coreOffset + j * spacing) * distortion;
        const pos = dir.clone().multiplyScalar(distance);
        
        const isOuter = (j === q - 1);
        const nodeMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(isOuter ? 0.4 : 0.25),
          isOuter ? new THREE.MeshPhysicalMaterial({ color: theme.line, emissive: theme.crystalEmissive, roughness: 0.1, metalness: 0.5 }) : nodeMaterial
        );
        nodeMesh.position.copy(pos);
        nodeMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        nodeMesh.castShadow = true;
        crystalGroup.add(nodeMesh);
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints([prevPos, pos]);
        crystalGroup.add(new THREE.Line(lineGeo, lineMaterial));
        
        prevPos = pos;
        webPoints[j].push(pos);
      }
    });

    webPoints.forEach((points, depthIndex) => {
      if (points.length > 2) {
        const loopPoints = [...points, points[0]];
        const webGeo = new THREE.BufferGeometry().setFromPoints(loopPoints);
        const currentWebMat = (depthIndex === q - 1)
          ? new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0.3, linewidth: 2 })
          : webMaterial;
        crystalGroup.add(new THREE.Line(webGeo, currentWebMat));
      }
    });

    if (q > 0 || r > 0) {
      const surfaceGeo = new THREE.SphereGeometry(1, 200, 200);
      const positions = surfaceGeo.attributes.position;
      const vertex = new THREE.Vector3();
      const baseDistance = coreOffset + (q > 0 ? (q - 1) * spacing : 0);
      
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i);
        const theta = Math.atan2(vertex.z, vertex.x);
        let clampedY = Math.max(-1, Math.min(1, vertex.y));
        const phi = Math.acos(clampedY);
        
        let maxDot = 0;
        for (let k = 0; k < directions.length; k++) {
          const dot = vertex.dot(directions[k]);
          if (dot > maxDot) maxDot = dot;
        }
        
        const distortion = r === 0 ? 1.0 : 1.0 + (0.3 * Math.cos(r * theta) * Math.sin(phi));
        let surfaceNoise = 0;
        if (r === 1) {
          const fineNoise = 0.04 * Math.sin(theta * 60) * Math.sin(phi * 60);
          const branchSwell = 0.15 * Math.pow(maxDot, 6);
          surfaceNoise = fineNoise + branchSwell;
        } else if (r === 2) {
          const bumpyNoise = 0.08 * (Math.sin(theta * 20) * Math.cos(phi * 20));
          const branchBumps = 0.3 * Math.pow(maxDot, 10) * (1 + 0.3 * Math.sin(theta * 30));
          surfaceNoise = bumpyNoise + branchBumps;
        } else if (r >= 3) {
          const spikeLength = 0.5 + (r * 0.1); 
          const spikeSharpness = 20 + (r * 2);
          const mainSpikes = spikeLength * Math.pow(maxDot, spikeSharpness);
          const rootNoise = 0.1 * Math.pow(Math.max(0, Math.sin(theta * 40) * Math.sin(phi * 40)), 4);
          surfaceNoise = mainSpikes + (rootNoise * Math.pow(maxDot, 4));
        }
        
        const finalRadius = (baseDistance * distortion) + 0.6 + surfaceNoise;
        vertex.multiplyScalar(finalRadius);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      surfaceGeo.computeVertexNormals(); 

      let materialProps = {
        color: theme.crystal,
        transparent: true,
        side: THREE.DoubleSide,
      };

      if (r === 0) {
        materialProps = { ...materialProps, metalness: 0.1, roughness: 0.05, transmission: 0.6, thickness: 0.5, ior: 1.5, opacity: 0.8, clearcoat: 1.0, clearcoatRoughness: 0.1 };
      } else if (r === 1) {
        materialProps = { ...materialProps, metalness: 0.0, roughness: 0.8, transmission: 0.4, thickness: 1.0, ior: 1.4, opacity: 0.6, clearcoat: 0.0 };
      } else if (r === 2) {
        materialProps = { ...materialProps, metalness: 0.9, roughness: 0.4, transmission: 0.2, opacity: 0.9, color: theme.line };
      } else {
        materialProps = { ...materialProps, metalness: 0.3, roughness: 0.2, transmission: 0.5, thickness: 0.8, ior: 1.6, opacity: 0.7, clearcoat: 0.8, clearcoatRoughness: 0.2, color: theme.line };
      }

      const surfaceMaterial = new THREE.MeshPhysicalMaterial(materialProps);
      const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMaterial);
      surfaceMesh.castShadow = true;
      crystalGroup.add(surfaceMesh);
      surfaceMeshRef.current = surfaceMesh; 
    }

    // 星屑
    const starsGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(800 * 3);
    for(let i = 0; i < 2400; i++) posArray[i] = (Math.random() - 0.5) * 100;
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.3 });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starsMesh);

    // カメラ
    const camDist = Math.max(30, estimatedMaxRadius * 2.5);
    camera.position.set(camDist * 0.8, crystalY + camDist * 0.3, camDist);
    controls.target.set(0, crystalY - estimatedMaxRadius * 0.5, 0);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      
      crystalGroup.children.forEach(child => {
        if (child.userData && child.userData.orbitAxis) {
          child.rotateX(child.userData.rx);
          child.rotateY(child.userData.ry);
          child.position.applyAxisAngle(child.userData.orbitAxis, child.userData.orbitSpeed);
        }
      });
      starsMesh.rotation.y += 0.0005;
      crystalGroup.rotation.y += 0.005; 

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) containerRef.current.innerHTML = '';
      renderer.dispose();
    };
  }, [threeLoaded, dividend, divisor, theme, calc]);

  useEffect(() => {
    if (surfaceMeshRef.current) {
      surfaceMeshRef.current.visible = showSurface;
    }
  }, [showSurface]);

  const scrollToInfo = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans relative selection:bg-cyan-900 selection:text-white">
      
      {/* 3D Viewport Area (Sticky to fill screen) */}
      <div className={`h-screen w-full sticky top-0 left-0 bg-gradient-to-b ${theme.bgTw} transition-colors duration-1000 overflow-hidden`}>
        
        {/* Top Header UI */}
        <div className="absolute top-0 left-0 w-full z-10 p-6 sm:p-8 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none transition-colors duration-1000">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pointer-events-auto">
            
            <div>
              <h1 className={`text-2xl sm:text-3xl font-light tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradientTw} drop-shadow-md transition-all duration-1000`}>
                結晶数学_Crystal Math
              </h1>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div className="flex items-center space-x-4 bg-slate-950/40 backdrop-blur-md px-5 py-3 rounded-xl border border-slate-700/30 shadow-2xl">
                <input
                  type="number" min="0" max="500" value={dividend}
                  onChange={(e) => setDividend(e.target.value)}
                  className={`w-16 sm:w-20 bg-transparent text-center ${theme.accentTw} font-light text-2xl py-1 border-b border-slate-600 focus:outline-none focus:${theme.accentBorderTw} transition-colors duration-500`}
                />
                <span className="text-slate-500 font-light text-xl">÷</span>
                <input
                  type="number" min="1" max="50" value={divisor}
                  onChange={(e) => setDivisor(e.target.value)}
                  className="w-16 sm:w-20 bg-transparent text-center text-slate-300 font-light text-2xl py-1 border-b border-slate-600 focus:outline-none focus:border-slate-400 transition-colors"
                />
                
                <div className="flex flex-col ml-4 sm:ml-6 border-l border-slate-700/50 pl-4 sm:pl-6 space-y-1">
                  <span className="text-xs text-slate-400 font-light tracking-wider">
                    Quotient: <span className={`${theme.accentTw} font-medium text-sm transition-colors duration-500 ml-1`}>{calc.q}</span> <span className="text-slate-500 ml-1">× {calc.b}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-light tracking-wider">
                    Remainder: <span className="text-amber-400 font-medium text-sm ml-1">{calc.r}</span>
                  </span>
                </div>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showSurface}
                  onChange={(e) => setShowSurface(e.target.checked)}
                  className={`w-4 h-4 rounded bg-transparent border-slate-500 ${theme.accentTw} focus:ring-offset-slate-900 transition-colors duration-500`}
                />
                <span className={`text-sm font-light tracking-wide text-slate-400 group-hover:text-slate-200 transition-colors duration-500`}>
                  Show Glass Shell
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {!threeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-20">
            <div className={`${theme.accentTw} animate-pulse flex flex-col items-center transition-colors duration-500`}>
              <svg className="w-8 h-8 mb-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-light tracking-widest text-sm">Loading 3D Engine...</span>
            </div>
          </div>
        )}
        
        {/* 3D Canvas Container */}
        <div ref={containerRef} className="absolute inset-0 outline-none cursor-grab active:cursor-grabbing" />
        
        {/* Scroll Down Hint */}
        <button 
          onClick={scrollToInfo}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-auto group focus:outline-none"
        >
          <span className="text-xs text-slate-400 font-light tracking-widest mb-3 group-hover:text-slate-200 transition-colors duration-300">
            Scroll down for info
          </span>
          <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-300 animate-bounce transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>

        {/* Interaction Hints */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end pointer-events-none hidden md:flex">
            <div className="text-slate-400 text-xs font-light tracking-widest space-y-2 text-right opacity-60">
              <div className="flex items-center justify-end space-x-3">
                  <span>Drag to rotate</span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                  <span>Scroll to zoom</span>
              </div>
            </div>
        </div>
      </div>

      {/* Scrollable Information Section */}
      <div className="relative z-20 w-full bg-slate-950 border-t border-slate-900 pt-32 pb-40 px-6 sm:px-12">
        <div className="max-w-3xl mx-auto flex flex-col gap-24">
          
          {/* Section Header */}
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-5xl font-light text-slate-100 tracking-wide leading-tight">
              Crystal Math gives purpose to the remainder.
            </h2>
            <p className="text-lg sm:text-xl font-light text-slate-400 tracking-widest">
              結晶数学は、余りに役割を与える数学です。
            </p>
          </div>

          {/* Concept Poem */}
          <div className="text-center">
            <p className="text-slate-300 font-light leading-loose text-lg sm:text-xl tracking-wide max-w-2xl mx-auto">
              10 ÷ 3 leaves a remainder of 1. I used to find this leftover part unsettling.<br className="hidden sm:block" />
              So, let's give the remainder a role and create a "beautiful" and "striking" crystal!<br className="hidden sm:block" />
              Let's turn this unresolved leftover into something uniquely fascinating.
            </p>
          </div>

          {/* Q&A Section */}
          <div className="pt-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-200 mb-12 text-center tracking-widest uppercase opacity-80">
              How it works
            </h3>
            
            <div className="space-y-2 border-t border-slate-800">
              <AccordionItem 
                question="What do the Quotient and Divisor define?" 
                answer="The divisor dictates the number of branches, uniformly distributed in 3D space using a Fibonacci lattice algorithm. The quotient defines the length and depth of these branches, constructing the internal geometric skeleton." 
              />
              <AccordionItem 
                question="What is the role of the Remainder?" 
                answer="The remainder acts as a catalyst for spatial distortion. It applies mathematical sine wave interference patterns to warp the 3D space, generating unique geometric noise on the outer shell." 
              />
              <AccordionItem 
                question="How are the colors and materials generated?" 
                answer="All input variables are combined into a pseudo-random hash function to create a unique 'chaos seed'. This dictates the RGB color blend, metalness, and surface roughness." 
              />
              <AccordionItem 
                question="What happens if it divides evenly (no remainder)?" 
                answer="It achieves mathematical equilibrium. Without the interference waves of a remainder, the structure resolves into a perfectly symmetrical, smooth, and transparent glass sphere." 
              />
            </div>
          </div>

          {/* Call for Ideas Section */}
          <div className="pt-16 text-center">
            <h3 className="text-xl sm:text-2xl font-light text-slate-200 mb-8 tracking-widest uppercase opacity-80">
              The Aesthetics of the Unresolved
            </h3>
            <p className="text-slate-400 font-light leading-relaxed tracking-wide text-lg max-w-2xl mx-auto mb-6">
              Every remainder holds a unique beauty. How else can we transform mathematical leftovers into visual art?<br className="hidden sm:block" />
              We welcome your ideas.
            </p>
            <a href="mailto:ya.and.strangers@gmail.com" className="inline-block text-slate-300 font-light tracking-widest text-base hover:text-white transition-colors border-b border-slate-700 hover:border-slate-400 pb-1">
              ya.and.strangers@gmail.com
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
          <p className="text-slate-600 font-light tracking-widest text-sm uppercase opacity-80">
            Created by YA!! and Gemini
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
