import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, atomGroup;
let mouseX = 0, mouseY = 0;
let animationFrameId;

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000510, 200, 1200);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 500;

    // Atom Group
    atomGroup = new THREE.Group();

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(50, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({
        color: 0x00F6A3,
        emissive: 0x00aa77,
        shininess: 50
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(nucleus);

    // Electrons
    const electronCount = 8;
    for (let i = 0; i < electronCount; i++) {
        const electron = new THREE.Mesh(
            new THREE.SphereGeometry(10, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
        );
        
        const orbit = new THREE.Group();
        orbit.add(electron);
        
        electron.position.x = 150 + Math.random() * 50;

        orbit.rotation.x = Math.random() * Math.PI;
        orbit.rotation.y = Math.random() * Math.PI;
        orbit.rotation.z = Math.random() * Math.PI;
        
        atomGroup.add(orbit);
    }
    scene.add(atomGroup);
    
    // Lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    const ambientLight = new THREE.AmbientLight(0x222255);
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
    const time = Date.now() * 0.001;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    atomGroup.children.forEach((child, index) => {
        if (index > 0) { // Skip nucleus
            child.rotation.x += 0.005 * (index / 2 + 1);
            child.rotation.y += 0.005 * (index / 2 + 1);
        }
    });

    atomGroup.rotation.y = time * 0.3;

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 2;
    mouseY = (event.clientY - window.innerHeight / 2) / 2;
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