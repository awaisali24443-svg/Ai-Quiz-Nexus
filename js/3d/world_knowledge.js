
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, earth, stars, networkGroup;
let mouseX = 0, mouseY = 0;
let animationFrameId;
let pulses = [];

/**
 * Creates a procedural texture of Earth at night.
 * @returns {THREE.CanvasTexture}
 */
function createEarthNightTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Dark blue oceans
    context.fillStyle = '#001538';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dark continents
    context.fillStyle = '#051d42';
    // Simplified continent shapes
    context.beginPath();
    // Americas
    context.rect(250, 200, 450, 550);
    // Africa/Europe
    context.rect(900, 150, 350, 500);
    // Asia/Australia
    context.rect(1300, 250, 600, 500);
    context.fill();

    // City lights
    context.fillStyle = '#ffffaacc';
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * 0.7 + 0.1; // Make lights vary in intensity
        context.globalAlpha = alpha;
        context.fillRect(x, y, Math.random() > 0.8 ? 2 : 1, 1);
    }
    context.globalAlpha = 1.0;

    return new THREE.CanvasTexture(canvas);
}

/**
 * Creates a quadratic bezier curve arcing from the sphere's surface.
 * @param {THREE.Vector3} start - The starting point on the sphere.
 * @param {THREE.Vector3} end - The ending point on the sphere.
 * @returns {THREE.QuadraticBezierCurve3}
 */
function createArc(start, end) {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = Math.max(0.1, start.distanceTo(end));
    // Arc height is proportional to the distance between points
    mid.setLength(1.0 + 0.4 * distance);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
}

function init3DScene(container) {
    pulses = [];

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Earth Globe
    const earthTexture = createEarthNightTexture();
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        specularMap: earthTexture, // Use the same map for some specular highlights
        specular: 0x111111,
        shininess: 10,
    });
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec3 vNormal; void main() { float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 2.0); gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity; }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.04, 1.04, 1.04);
    scene.add(atmosphere);

    // Network Group
    networkGroup = new THREE.Group();
    scene.add(networkGroup);
    
    const points = [];
    const nodeGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00eaff, blending: THREE.AdditiveBlending });

    for (let i = 0; i < 200; i++) {
        const point = new THREE.Vector3().setFromSphericalCoords(1.001, Math.acos(1 - 2 * Math.random()), Math.random() * 2 * Math.PI);
        points.push(point);
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.copy(point);
        networkGroup.add(node);
    }

    const curves = [];
    const curveMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.35 });

    for (let i = 0; i < 200; i++) {
        const start = points[Math.floor(Math.random() * points.length)];
        const end = points[Math.floor(Math.random() * points.length)];
        if (start.distanceTo(end) > 0.2) {
            const curve = createArc(start, end);
            curves.push(curve);
            const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.002, 8, false);
            const tube = new THREE.Mesh(tubeGeo, curveMaterial);
            networkGroup.add(tube);
        }
    }

    const pulseGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
    
    for (let i = 0; i < 50; i++) {
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        const curve = curves[Math.floor(Math.random() * curves.length)];
        pulses.push({ mesh: pulse, curve: curve, t: Math.random(), speed: Math.random() * 0.005 + 0.005 });
        networkGroup.add(pulse);
    }

    // Lights
    scene.add(new THREE.AmbientLight(0x222222));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 3, 5);
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
    earth.rotation.y += 0.0008;
    networkGroup.rotation.y += 0.0008;
    stars.rotation.y -= 0.0001;
    
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    pulses.forEach(p => {
        p.t += p.speed;
        if (p.t >= 1) {
            p.t = 0;
            // Optional: assign to a new random curve
        }
        p.mesh.position.copy(p.curve.getPointAt(p.t));
    });

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
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
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
                    object.material.dispose();
                }
            }
        });
        renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    renderer = null;
    pulses = [];
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };