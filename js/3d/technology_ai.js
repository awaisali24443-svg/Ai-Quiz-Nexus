
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, network, particles;
let mouseX = 0, mouseY = 0;
let animationFrameId;

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 200, 1000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Neural Network
    network = new THREE.Group();
    const nodeGeometry = new THREE.SphereGeometry(4, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    
    const layers = 5;
    const nodesPerLayer = 15;
    const layerDistance = 150;
    const nodes = [];

    for (let i = 0; i < layers; i++) {
        const layerNodes = [];
        for (let j = 0; j < nodesPerLayer; j++) {
            const node = new THREE.Mesh(nodeGeometry.clone(), nodeMaterial);
            node.position.x = (j - nodesPerLayer / 2) * 50 + (Math.random() - 0.5) * 10;
            node.position.y = (Math.random() - 0.5) * 300;
            node.position.z = (i - layers / 2) * layerDistance + (Math.random() - 0.5) * 10;
            network.add(node);
            layerNodes.push(node);
        }
        nodes.push(layerNodes);
    }
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.1
    });

    for (let i = 0; i < layers - 1; i++) {
        for (let j = 0; j < nodesPerLayer; j++) {
            for (let k = 0; k < nodesPerLayer; k++) {
                if (Math.random() > 0.7) {
                    const points = [nodes[i][j].position, nodes[i+1][k].position];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    network.add(line);
                }
            }
        }
    }
    scene.add(network);

    // Background Particles
    const particleGeometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    }
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff00ff,
        size: 1.5,
        transparent: true,
        opacity: 0.5
    });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

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
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    network.rotation.y = time;
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
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
}

function destroy3DScene() {
    cancelAnimationFrame(animationFrameId);
    if (renderer) {
        renderer.dispose();
        // Recursively dispose of objects in the scene
        scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    });
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
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };
