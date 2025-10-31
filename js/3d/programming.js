import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, textGroup;
let mouseX = 0, mouseY = 0;
let animationFrameId;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

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
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000010, 500, 2000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    textGroup = new THREE.Group();
    
    const blueColor = '#509ee3';
    const greyColor = '#888888';

    const codeSnippets = [
        'cin >> a;', 'cout << "b="', 'if (a < b)', 'while (!in1.eof())',
        'getline(in1, s);', 'try {', 'catch(int a)', 'return 1;',
        '#include <iostream>', 'using namespace std;', 'int main() {', '}',
        'str.erase(0, s.find(" "));', 'if (size == 0)', 'else',
        'str.compare()', 'for(int i=0; i<n; i++)', 'void function()', 'class MyClass'
    ];
    
    const binaryStrings = ['010110', '100101', '01110001', '10101011', '00101101', '11100101', '1', '0'];

    // Create code snippet planes
    for (let i = 0; i < 150; i++) {
        const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        const color = Math.random() > 0.3 ? blueColor : greyColor;
        const texture = createTextTexture(text, color, 48);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        
        const geometry = new THREE.PlaneGeometry(texture.image.width * 0.5, texture.image.height * 0.5);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000)
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        textGroup.add(mesh);
    }

    // Create binary digit planes
    for (let i = 0; i < 400; i++) {
        const text = binaryStrings[Math.floor(Math.random() * binaryStrings.length)];
        const texture = createTextTexture(text, greyColor, 32);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
        });
        
        const geometry = new THREE.PlaneGeometry(texture.image.width * 0.5, texture.image.height * 0.5);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000)
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        textGroup.add(mesh);
    }

    scene.add(textGroup);

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
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    textGroup.rotation.y += 0.0002;

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
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
    textGroup = null;
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };
