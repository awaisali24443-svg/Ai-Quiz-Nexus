// Caches the loaded modules to avoid re-fetching
const sceneModulesCache = new Map();

let currentSceneModule = null;
let currentContainer = null;

const sceneManager = {
    async init(topicId, container) {
        // If the same scene is already running, do nothing
        if (currentSceneModule && currentSceneModule.topicId === topicId) {
            return;
        }

        // Clean up the previous scene before starting a new one
        if (currentSceneModule) {
            this.destroy();
        }

        currentContainer = container;
        currentContainer.classList.add('visible');

        try {
            let module;
            if (sceneModulesCache.has(topicId)) {
                module = sceneModulesCache.get(topicId);
            } else {
                // Dynamically import the module for the selected topic
                module = await import(`./${topicId}.js`);
                sceneModulesCache.set(topicId, module);
            }
            
            // Store a reference to the active module
            currentSceneModule = {
                ...module,
                topicId: topicId
            };

            // Initialize the 3D scene
            currentSceneModule.init3DScene(container);

            // Add event listeners for interaction
            window.addEventListener('resize', this.handleResize);
            window.addEventListener('mousemove', this.handleMouseMove);

        } catch (error) {
            console.error(`Failed to load or init 3D module for topic: ${topicId}`, error);
            // Fallback: hide the WebGL container if the scene fails to load
            if (currentContainer) {
                currentContainer.classList.remove('visible');
            }
        }
    },

    destroy() {
        if (currentSceneModule && typeof currentSceneModule.destroy3DScene === 'function') {
            currentSceneModule.destroy3DScene();
        }
        
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (currentContainer) {
            currentContainer.classList.remove('visible');
            // Clear the container's content to ensure the renderer's canvas is removed
            while (currentContainer.firstChild) {
                currentContainer.removeChild(currentContainer.firstChild);
            }
        }
        
        currentSceneModule = null;
        currentContainer = null;
    },

    handleResize() {
        if (currentSceneModule && typeof currentSceneModule.onWindowResize === 'function') {
            currentSceneModule.onWindowResize();
        }
    },

    handleMouseMove(event) {
        if (currentSceneModule && typeof currentSceneModule.onMouseMove === 'function') {
            currentSceneModule.onMouseMove(event);
        }
    },

    // Utility to check for WebGL support
    isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
};

export default sceneManager;
