let scene, camera, renderer, particles, floor;
let mouseX = 0, mouseY = 0;
let animationFrameId;

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814); // Deep navy
    scene.fog = new THREE.Fog(0x000814, 500, 1500);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 150, 600);
    camera.lookAt(0, 0, 0);

    // Particles (Golden Calligraphy Dust)
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const color = new THREE.Color(0xFFBD3E);

    for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 300 * Math.pow(Math.random(), 0.5);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi) + 150; // Elevate
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: color,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Reflective Floor
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000);
    floor = new THREE.Mesh(
        floorGeometry,
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 })
    );
    
    // This is a simplified reflection using a second particle system
    const reflectionParticles = particles.clone();
    reflectionParticles.scale.y = -1;
    reflectionParticles.material = reflectionParticles.material.clone();
    reflectionParticles.material.opacity = 0.1;
    scene.add(reflectionParticles);

    // Light
    const light = new THREE.PointLight(0xFFBD3E, 1, 1000);
    light.position.set(0, 300, 0);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x001d3d, 0.5);
    scene.add(ambientLight);

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
    const time = Date.now() * 0.0002;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y + 150) * 0.05;
    camera.lookAt(scene.position);

    particles.rotation.y = time;
    particles.children.forEach(p => { p.rotation.y = -time * 2; });
    
    // Also rotate the reflection
    scene.children[1].rotation.y = time;


    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
}

function destroy3DScene() {
    cancelAnimationFrame(animationFrameId);
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    renderer = null;
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };
