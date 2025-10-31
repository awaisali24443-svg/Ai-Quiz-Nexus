let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let animationFrameId;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
    float d = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (d > 0.5) discard;
  }
`;

function init3DScene(container) {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00001a, 0.001);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    // Particles
    const particleCount = 20000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = Math.random() * 2000 - 1000;
        positions[i * 3 + 1] = Math.random() * 2000 - 1000;
        positions[i * 3 + 2] = Math.random() * 2000 - 1000;

        color.setHSL(0.3 + Math.random() * 0.2, 0.9, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = 10 + Math.random() * 10;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0x00ffaa) },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
    });

    particles = new THREE.Points(geometry, material);
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

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 2;
        if (positions[i + 1] < -1000) {
            positions[i + 1] = 1000;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    scene.rotation.y = time * 0.2;
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
        renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    renderer = null;
}

export { init3DScene, destroy3DScene, onWindowResize, onMouseMove };
