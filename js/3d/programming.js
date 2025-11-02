import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer;
let meshes = [];
let mouseX = 0, mouseY = 0;
let animationFrameId;

/**
 * Creates a canvas texture with the given text.
 * @param {string} text The text to draw.
 * @param {string} color The color of the text.
 * @param {number} fontSize The font size.
 * @returns {THREE.CanvasTexture}
 */
function createTextTexture(text, color, fontSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = `bold ${fontSize}px monospace`;
    context.font = font;

    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    // Use power-of-2 dimensions for better performance
    canvas.width = THREE.MathUtils.ceilPowerOfTwo(textWidth + fontSize); // Add padding
    canvas.height = THREE.MathUtils.ceilPowerOfTwo(fontSize * 1.5);

    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function init3DScene(container) {
    meshes = [];

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000010, 500, 2500);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;
    
    const blueColor = '#509ee3';
    const greyColor = '#888888';

    // Snippets extracted from the user-provided image
    const codeSnippets = [
        'cin >> a;', 'cout << "b="', 'if (a < b)', 'while (!in1.eof())',
        'getline(in1, s);', 'try {', 'catch(int a)', 'return 1;',
        's.erase(0, s.find("]"));', 'if (a > b)', 'str.substr(0, s.find("]"));',
        'if (size==0)', 'else', 'size=str.compare()', 'cout << a+b;', 'if (a==b)',
        'f_out', 'cout << "\\na>b";', 'else if', 'int main()'
    ];
    
    const binaryStrings = ['0101', '1001', '011100', '101010', '001101', '111001', '1', '0'];
    const animationBounds = 1500;

    const createTextPlane = (text, color, fontSize, isBinary) => {
        const texture = createTextTexture(text, color, fontSize);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: isBinary ? THREE.NormalBlending : THREE.AdditiveBlending,
            opacity: isBinary ? 0.4 : 1.0,
            depthWrite: false,
        });
        
        const geometry = new THREE.PlaneGeometry(texture.image.width * 0.5, texture.image.height * 0.5);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            THREE.MathUtils.randFloatSpread(animationBounds * 2),
            THREE.MathUtils.randFloatSpread(animationBounds * 2),
            THREE.MathUtils.randFloatSpread(animationBounds * 2)
        );
        
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // Custom properties for animation
        mesh.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        mesh.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002
        );

        meshes.push(mesh);
        scene.add(mesh);
    };

    // Create code snippet planes
    for (let i = 0; i < 250; i++) {
        const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        const color = Math.random() > 0.3 ? blueColor : greyColor;
        createTextPlane(text, color, 48, false);
    }

    // Create binary digit planes
    for (let i = 0; i < 500; i++) {
        const text = binaryStrings[Math.floor(Math.random() * binaryStrings.length)];
        createTextPlane(text, greyColor, 32, true);
    }

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'matrix-canvas';
    container.appendChild(renderer.domElement);
    
    animate();
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    render();
}

function render() {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    const animationBounds = 1500;
    meshes.forEach(mesh => {
        mesh.position.add(mesh.velocity);
        mesh.rotation.x += mesh.rotationSpeed.x;
        mesh.rotation.y += mesh.rotationSpeed.y;
        mesh.rotation.z += mesh.rotationSpeed.z;

        // Wrap positions
        if (mesh.position.x > animationBounds) mesh.position.x = -animationBounds;
        if (mesh.position.x < -animationBounds) mesh.position.x = animationBounds;
        if (mesh.position.y > animationBounds) mesh.position.y = -animationBounds;
        if (mesh.position.y < -animationBounds) mesh.position.y = animationBounds;
        if (mesh.position.z > animationBounds) mesh.position.z = -animationBounds;
        if (mesh.position.z < -animationBounds) mesh.position.z = animationBounds;
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
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
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
                if (object.material.map) {
                    object.material.map.dispose();
                }
                object.material.dispose();
            }
        });
        renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    renderer = null;
    meshes = [];
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };