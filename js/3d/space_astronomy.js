
import * as THREE from 'https://cdn.jsdelivrnet.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, stars, nebula, mainPlanet, moon;
let mouseX = 0, mouseY = 0;
let animationFrameId;

const nebulaVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const nebulaFragmentShader = `
    uniform float time;
    uniform sampler2D noiseTexture;
    varying vec2 vUv;

    float turbulence(vec2 p) {
        float t = 0.0;
        float f = 1.0;
        for (int i = 0; i < 5; i++) {
            t += abs(texture2D(noiseTexture, p * f).r / f);
            f *= 2.0;
        }
        return t;
    }

    void main() {
        vec2 uv = vUv;
        vec2 centeredUv = uv - 0.5;
        float dist = length(centeredUv);

        vec2 baseUv = uv * 2.0 + vec2(time * 0.02, 0.0);
        float noise = turbulence(baseUv);

        vec3 color1 = vec3(0.05, 0.1, 0.25); // Deep Blue
        vec3 color2 = vec3(0.1, 0.4, 0.7);   // Mid Blue
        vec3 color3 = vec3(0.3, 0.7, 0.9);   // Teal/Cyan

        float mix1 = smoothstep(0.2, 0.5, noise);
        vec3 finalColor = mix(color1, color2, mix1);
        float mix2 = smoothstep(0.4, 0.6, noise);
        finalColor = mix(finalColor, color3, mix2);
        
        // Vignette effect
        finalColor *= smoothstep(0.8, 0.2, dist);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

function createNoiseTexture() {
    const size = 256;
    const data = new Uint8Array(size * size);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 255;
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

function createPlanetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Base ocean color
    ctx.fillStyle = '#1a3a7d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise for texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() - 0.5) * 20;
        data[i] += value;
        data[i+1] += value;
        data[i+2] += value;
    }
    ctx.putImageData(imageData, 0, 0);

    // Clouds
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 20 + 5;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
}

function createMoonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base rock color
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise for texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() - 0.5) * 40;
        data[i] += value; data[i+1] += value; data[i+2] += value;
    }
    ctx.putImageData(imageData, 0, 0);

    // Craters
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 30 + 5;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2 + 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}


function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
        const x = THREE.MathUtils.randFloatSpread(500);
        const y = THREE.MathUtils.randFloatSpread(500);
        const z = THREE.MathUtils.randFloatSpread(500);
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Nebula
    const nebulaGeometry = new THREE.PlaneGeometry(30, 15);
    const nebulaMaterial = new THREE.ShaderMaterial({
        vertexShader: nebulaVertexShader,
        fragmentShader: nebulaFragmentShader,
        uniforms: {
            time: { value: 0.0 },
            noiseTexture: { value: createNoiseTexture() }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -20;
    scene.add(nebula);

    // Main Planet
    const planetGeo = new THREE.SphereGeometry(2, 64, 64);
    const planetMat = new THREE.MeshPhongMaterial({
        map: createPlanetTexture(),
        shininess: 10
    });
    mainPlanet = new THREE.Mesh(planetGeo, planetMat);
    mainPlanet.position.set(2, -0.5, -3);
    scene.add(mainPlanet);
    
    // Planet Atmosphere
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec3 vNormal; void main() { float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0); gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity; }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(planetGeo, atmosphereMaterial);
    atmosphere.scale.set(1.05, 1.05, 1.05);
    mainPlanet.add(atmosphere);


    // Moon
    const moonGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
        map: createMoonTexture(),
        roughness: 0.9,
        metalness: 0.1
    });
    moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-2, 1, -2);
    scene.add(moon);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    animate();
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    render();
}

function render() {
    const time = Date.now() * 0.0001;
    nebula.material.uniforms.time.value = time;

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
    stars.rotation.y = time * 0.1;
    mainPlanet.rotation.y = time * 0.2;
    moon.rotation.y = time * 0.5;
    moon.position.x = -2 + Math.sin(time * 0.8) * 1;
    moon.position.z = -2 + Math.cos(time * 0.8) * 1;

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function destroy3DScene() {
    cancelAnimationFrame(animationFrameId);
    if (renderer) {
        renderer.dispose();
        scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => { if(m.map) m.map.dispose(); m.dispose(); });
                } else {
                    if (object.material.map) object.material.map.dispose();
                    if (object.material.uniforms) {
                        Object.values(object.material.uniforms).forEach(uniform => {
                           if(uniform.value instanceof THREE.Texture) uniform.value.dispose();
                        });
                    }
                    object.material.dispose();
                }
            }
        });
        renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    renderer = null;
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };
