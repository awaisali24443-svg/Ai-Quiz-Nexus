import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, dna, molecule, bubbles;
let mouseX = 0, mouseY = 0;
let animationFrameId;

// Helper function to create the DNA helix
function createDNA() {
    const group = new THREE.Group();
    const points = [];
    const rungs = 25;
    const height = 300;
    const radius = 40;

    for (let i = 0; i <= rungs * 2; i++) {
        points.push(new THREE.Vector3(
            Math.sin(i * 0.5) * radius,
            (i * (height / (rungs * 2))) - (height / 2),
            Math.cos(i * 0.5) * radius
        ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, 4, 8, false);
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x2288ff,
        emissive: 0x0033aa,
        shininess: 80,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });

    const helix1 = new THREE.Mesh(geometry, material);
    group.add(helix1);

    const helix2 = new THREE.Mesh(geometry, material.clone());
    helix2.rotation.y = Math.PI;
    group.add(helix2);

    // Create rungs
    const rungGeo = new THREE.CylinderGeometry(2, 2, radius * 2, 8);
    const rungMat = new THREE.MeshPhongMaterial({
        color: 0xadd8e6,
        emissive: 0x555577,
        shininess: 50
    });

    for (let i = 0; i < rungs; i++) {
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.y = (i * (height / rungs)) - (height / 2) + (height / rungs / 2);
        rung.rotation.y = i * 0.5 + Math.PI / 2;
        rung.rotation.z = Math.PI / 2;
        group.add(rung);
    }
    
    group.position.x = -150;
    return group;
}

// Helper function to create the molecule structure
function createMolecule() {
    const group = new THREE.Group();
    const atomGeo = new THREE.SphereGeometry(15, 16, 16);
    const bondGeo = new THREE.CylinderGeometry(5, 5, 1, 8); // Length will be scaled
    
    const atomMat = new THREE.MeshPhongMaterial({
        color: 0x00ccff,
        emissive: 0x0088cc,
        shininess: 100
    });
    
    const bondMat = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        emissive: 0x4682b4,
        shininess: 30
    });

    const atoms = [];
    const radius = 60;
    // Main hexagon
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const atom = new THREE.Mesh(atomGeo, atomMat);
        atom.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );
        atoms.push(atom);
        group.add(atom);
    }
    
    // Extra atoms based on the reference image
    const extraAtomsConfig = [
        { parentIndex: 1, angle: Math.PI * 0.8, distance: 55 },
        { parentIndex: 3, angle: Math.PI * 1.8, distance: 55 },
        { parentIndex: 5, angle: Math.PI * 0.2, distance: 55 },
    ];

    extraAtomsConfig.forEach(config => {
        const parentAtom = atoms[config.parentIndex];
        const atom = new THREE.Mesh(atomGeo.clone().scale(0.7, 0.7, 0.7), atomMat);
        atom.position.copy(parentAtom.position).add(
             new THREE.Vector3(
                Math.cos(config.angle) * config.distance,
                Math.sin(config.angle) * config.distance,
                (Math.random() - 0.5) * 20 
            )
        );
        atoms.push(atom);
        group.add(atom);
    });

    // Create bonds
    const createBond = (p1, p2) => {
        const bond = new THREE.Mesh(bondGeo, bondMat);
        const distance = p1.distanceTo(p2);
        bond.scale.y = distance;
        bond.position.copy(p1).lerp(p2, 0.5);
        bond.lookAt(p2);
        bond.rotateX(Math.PI / 2);
        group.add(bond);
    };

    // Hexagon bonds
    for (let i = 0; i < 6; i++) {
        createBond(atoms[i].position, atoms[(i + 1) % 6].position);
    }
    
    // Extra bonds
    createBond(atoms[1].position, atoms[6].position);
    createBond(atoms[3].position, atoms[7].position);
    createBond(atoms[5].position, atoms[8].position);

    group.position.x = 150;
    return group;
}


// Helper function to create floating bubbles
function createBubbles() {
    const group = new THREE.Group();
    const bubbleGeo = new THREE.SphereGeometry(1, 12, 12);
    const bubbleMat = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.25,
        emissive: 0x005555,
        shininess: 100
    });
    
    for(let i = 0; i < 300; i++) {
        const bubble = new THREE.Mesh(bubbleGeo.clone(), bubbleMat);
        bubble.scale.setScalar(Math.random() * 4 + 2);
        bubble.position.set(
            THREE.MathUtils.randFloatSpread(1200),
            THREE.MathUtils.randFloatSpread(800),
            THREE.MathUtils.randFloatSpread(1200)
        );
        // Custom property for animation
        bubble.userData.velocity = new THREE.Vector3(0, Math.random() * 0.2 + 0.1, 0);
        group.add(bubble);
    }
    return group;
}


function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000104, 0.0015);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.z = 450;

    // Lights
    const light1 = new THREE.PointLight(0x00aaff, 2, 800);
    light1.position.set(-200, 100, 200);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x55ffff, 1.5, 800);
    light2.position.set(200, -100, 150);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x051020);
    scene.add(ambientLight);

    // Create objects
    dna = createDNA();
    scene.add(dna);

    molecule = createMolecule();
    scene.add(molecule);
    
    bubbles = createBubbles();
    scene.add(bubbles);

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

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Animate DNA
    if (dna) {
        dna.rotation.y = time * 0.5;
        dna.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    // Animate Molecule
    if (molecule) {
        molecule.rotation.x = time * 0.3;
        molecule.rotation.y = time * 0.4;
        molecule.rotation.z = Math.sin(time * 0.25) * 0.2;
    }
    
    // Animate Bubbles
    if (bubbles) {
        bubbles.children.forEach(bubble => {
            bubble.position.add(bubble.userData.velocity);
            bubble.position.x += Math.sin(time + bubble.position.y * 0.01) * 0.2;
            if (bubble.position.y > 400) {
                bubble.position.y = -400;
                bubble.position.x = THREE.MathUtils.randFloatSpread(1200);
            }
        });
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
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function destroy3DScene() {
    cancelAnimationFrame(animationFrameId);
    if (renderer) {
        renderer.dispose();
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
    dna = null;
    molecule = null;
    bubbles = null;
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };