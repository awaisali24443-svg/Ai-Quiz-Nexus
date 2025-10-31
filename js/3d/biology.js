let scene, camera, renderer, helix, particles;
let mouseX = 0, mouseY = 0;
let animationFrameId;

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x052025, 100, 800);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;

    // DNA Helix
    const points = [];
    for (let i = 0; i < 50; i++) {
        points.push(new THREE.Vector3(Math.sin(i * 0.5) * 30, i * 6 - 150, Math.cos(i * 0.5) * 30));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, 2, 8, false);
    
    const material = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00aaaa, shininess: 100 });
    const material2 = new THREE.MeshPhongMaterial({ color: 0x9B51E0, emissive: 0x3a0ca3, shininess: 100 });

    const helix1 = new THREE.Mesh(geometry, material);
    const helix2 = new THREE.Mesh(geometry, material2);
    helix2.rotation.y = Math.PI;

    helix = new THREE.Group();
    helix.add(helix1);
    helix.add(helix2);

    // Strands
    for (let i = 0; i < 25; i++) {
        const strandGeo = new THREE.CylinderGeometry(0.5, 0.5, 60, 8);
        const strandMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xaaaaaa });
        const strand = new THREE.Mesh(strandGeo, strandMat);
        strand.position.y = i * 12 - 150;
        strand.rotation.y = i * 0.5;
        helix.add(strand);
    }
    scene.add(helix);

    // Particles
    const particleGeo = new THREE.SphereGeometry(2, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x00F6A3, transparent: true, opacity: 0.5 });
    particles = new THREE.Group();
    for(let i=0; i<200; i++) {
        const p = new THREE.Mesh(particleGeo, particleMat);
        p.position.set((Math.random()-0.5)*800, (Math.random()-0.5)*800, (Math.random()-0.5)*800);
        particles.add(p);
    }
    scene.add(particles);

    // Lights
    const light1 = new THREE.DirectionalLight(0x00ffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x9B51E0, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);
    const ambientLight = new THREE.AmbientLight(0x101030);
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
    const time = Date.now() * 0.0005;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    helix.rotation.y = time;
    particles.rotation.y = -time * 0.2;

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 4;
    mouseY = (event.clientY - window.innerHeight / 2) / 4;
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
