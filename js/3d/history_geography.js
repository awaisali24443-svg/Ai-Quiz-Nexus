import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, particles, mapPlane, compassGroup;
let mouseX = 0, mouseY = 0;
let animationFrameId;

/**
 * Creates a texture for the vintage map.
 * This is a procedural approach to avoid embedding a large image file.
 * @returns {THREE.CanvasTexture}
 */
function createMapTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Parchment background
    ctx.fillStyle = '#f5e5c3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise for texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 25 - 12.5;
        data[i] += value;     // red
        data[i + 1] += value; // green
        data[i + 2] += value; // blue
    }
    ctx.putImageData(imageData, 0, 0);

    // Add text labels from the image
    ctx.fillStyle = '#5a4a3a';
    ctx.font = 'italic 90px "Times New Roman", serif';
    ctx.globalAlpha = 0.7;

    const labels = [
        { text: 'Tartaria', x: 2000, y: 500 },
        { text: 'Aegyptus', x: 1700, y: 1000 },
        { text: 'AFRICA', x: 1500, y: 1200 },
        { text: 'OCEANVS AE thiopicus', x: 1400, y: 1500 },
        { text: 'Europa', x: 1300, y: 700 },
        { text: 'MAR DEL NORT', x: 800, y: 1100 },
        { text: 'India Orien', x: 2800, y: 800 },
        { text: 'China', x: 3200, y: 600 },
    ];

    labels.forEach(label => {
        ctx.save();
        ctx.translate(label.x, label.y);
        ctx.rotate((Math.random() - 0.5) * 0.1);
        ctx.fillText(label.text, 0, 0);
        ctx.restore();
    });

    // Add grid lines
    ctx.strokeStyle = '#a08c72';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < canvas.width; i += 200) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 200) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }


    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}


/**
 * Creates the 3D compass model.
 * @returns {THREE.Group}
 */
function createCompass() {
    const group = new THREE.Group();

    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0x8c7853,
        metalness: 0.8,
        roughness: 0.3,
        envMapIntensity: 0.5
    });

    // Casing
    const caseGeo = new THREE.CylinderGeometry(100, 100, 15, 64);
    const casing = new THREE.Mesh(caseGeo, brassMaterial);
    group.add(casing);

    // Rim
    const rimGeo = new THREE.TorusGeometry(100, 5, 16, 100);
    const rim = new THREE.Mesh(rimGeo, brassMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 7.5;
    group.add(rim);

    // Compass Face
    const faceTex = new THREE.CanvasTexture(createCompassFaceCanvas());
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
    const faceGeo = new THREE.CircleGeometry(95, 64);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.rotation.x = -Math.PI / 2;
    face.position.y = 8;
    group.add(face);

    // Needle
    const needleShape = new THREE.Shape();
    needleShape.moveTo(-10, 0);
    needleShape.lineTo(10, 0);
    needleShape.lineTo(0, 80);
    needleShape.lineTo(-10, 0);
    const needleGeo = new THREE.ShapeGeometry(needleShape);
    
    const needleMatRed = new THREE.MeshBasicMaterial({ color: 0x990000 });
    const needleMatBlack = new THREE.MeshBasicMaterial({ color: 0x222222 });

    const needleNorth = new THREE.Mesh(needleGeo, needleMatRed);
    const needleSouth = new THREE.Mesh(needleGeo, needleMatBlack);
    needleSouth.rotation.z = Math.PI;
    
    const needleGroup = new THREE.Group();
    needleGroup.add(needleNorth);
    needleGroup.add(needleSouth);
    needleGroup.position.y = 12;
    needleGroup.rotation.x = -Math.PI / 2;
    group.add(needleGroup);

    group.scale.set(0.8, 0.8, 0.8);
    return group;
}


function createCompassFaceCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5e5c3';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#5a4a3a';
    ctx.fillStyle = '#5a4a3a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const center = { x: 256, y: 256 };

    for (let i = 0; i < 360; i += 10) {
        ctx.beginPath();
        const angle = i * Math.PI / 180;
        const length = i % 30 === 0 ? 20 : 10;
        ctx.moveTo(center.x + Math.cos(angle) * 230, center.y + Math.sin(angle) * 230);
        ctx.lineTo(center.x + Math.cos(angle) * (230 - length), center.y + Math.sin(angle) * (230 - length));
        ctx.stroke();
    }

    ctx.font = 'bold 40px "Times New Roman"';
    ctx.fillText('N', center.x, center.y - 180);
    ctx.fillText('S', center.x, center.y + 180);
    ctx.fillText('E', center.x + 180, center.y);
    ctx.fillText('W', center.x - 180, center.y);

    return canvas;
}

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a1d13);
    scene.fog = new THREE.Fog(0x2a1d13, 500, 2500);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 300, 600);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffdfb3, 1.0);
    keyLight.position.set(-300, 400, 200);
    scene.add(keyLight);
    
    // Map Plane
    const mapTexture = createMapTexture();
    const mapMaterial = new THREE.MeshPhongMaterial({ map: mapTexture, shininess: 10 });
    const mapGeometry = new THREE.PlaneGeometry(4096, 2048, 100, 50);
    mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
    mapPlane.rotation.x = -Math.PI / 2;
    scene.add(mapPlane);

    // Compass
    compassGroup = createCompass();
    compassGroup.position.set(0, 150, 0);
    scene.add(compassGroup);
    
    // Dust Motes Particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = THREE.MathUtils.randFloatSpread(2000);
        positions[i * 3 + 1] = THREE.MathUtils.randFloat(0, 800);
        positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(2000);
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffeebb, size: 1.5, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5 });
    particles = new THREE.Points(pGeom, pMat);
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
    const time = Date.now() * 0.0001;

    // Camera movement
    camera.position.x = Math.sin(time * 0.2) * 100;
    camera.position.z = 600 + Math.cos(time * 0.2) * 100;
    camera.lookAt(compassGroup.position);
    
    // Mouse parallax effect
    camera.position.x += mouseX * 0.2;
    camera.position.y += -mouseY * 0.2 + 300;
    
    // Map undulation
    const pos = mapPlane.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const y = 30 * Math.sin(i / 5 + (time * 10 + i / 10));
        pos.setY(i, y);
    }
    pos.needsUpdate = true;

    // Dust motes movement
    particles.position.y = -time * 50 % 800;
    
    // Compass animation
    compassGroup.rotation.y = time * 0.5;
    const needleGroup = compassGroup.children.find(c => c.children.length === 2);
    if (needleGroup) {
        needleGroup.rotation.y = Math.sin(time * 5) * 0.1 - time * 2; // Sway and spin
    }

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
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };