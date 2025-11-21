// src/SolarSystemSimulation.js
import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Starfield } from './Starfield.js';
import { PlanetSystem } from './PlanetSystem.js';
import { AsteroidBelt } from './AsteroidBelt.js';
import { Constellation } from './Constellation.js';
import starsTexture from './assets/textures/stars.jpg';
import { SpaceShuttle } from './SpaceShuttle.js';

let scene, camera, renderer, clock, controls, planetSystem, planetsGroup, asteroidBelt, asteroidBeltGroup, constellationSystem, constellationGroup, spaceShuttle;
let composer, bloomPass;
let raycaster, mouse;
let speedMultiplier = 1.0;
let gui;

// Shuttle mode variables
let isShuttleMode = false;
let originalCameraPosition = new THREE.Vector3(0, 10, 30);
let originalCameraTarget = new THREE.Vector3(0, 0, 0);
let shuttleControlsRef = null; // Reference to GUI shuttle controls

// FPS tracking variables
let fpsCounter = 0;
let fpsElement;
let lastTime = performance.now();

const planetKeyMap = {
    '1': 'Mercury',
    '2': 'Venus',
    '3': 'Earth',
    '4': 'Mars',
    '5': 'Jupiter',
    '6': 'Saturn',
    '7': 'Uranus',
    '8': 'Neptune',
    '9': 'Sun',
    '0': 'Earth\'s Moon'
};

/**
 * Initializes the solar system simulation.
 */
function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Create 3D spherical background that wraps around everything
    const textureLoader = new THREE.TextureLoader();
    const starsBackground = textureLoader.load(starsTexture);
    
    // Create large sphere geometry for 3D background
    const skyboxRadius = 800; // Large enough to encompass constellations
    const skyboxGeometry = new THREE.SphereGeometry(skyboxRadius, 64, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
        map: starsBackground,
        side: THREE.DoubleSide, // Render both inside and outside faces
        transparent: true,
        opacity: 0.8
    });
    
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    skybox.name = 'StarsSkybox';
    scene.add(skybox);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
    );
    camera.position.set(0, 10, 30);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("scene"),
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    
    // Set clear color to transparent so stars background shows through
    renderer.setClearColor(0x000000, 0);

    // Post-processing setup
    setupPostProcessing();

    // Add some basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);
    
    // Point light at the sun's position to simulate sunlight
    const sunLight = new THREE.PointLight(0xffffff, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // Add additional directional light for better visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    // Add light helper for the sun light
    const sunLightHelper = new THREE.PointLightHelper(sunLight, 1);
    scene.add(sunLightHelper);

    // Create and add starfield
    const starfield = new Starfield();
    starfield.addToScene(scene);

    // Create and add planet system with all planets
    planetSystem = new PlanetSystem();
    planetsGroup = planetSystem.create();
    scene.add(planetsGroup);

    // Create and add asteroid belt
    asteroidBelt = new AsteroidBelt();
    asteroidBeltGroup = asteroidBelt.create();
    scene.add(asteroidBeltGroup);

    // Create and add constellations
    constellationSystem = new Constellation();
    constellationGroup = constellationSystem.create();
    scene.add(constellationGroup);

    // Create and add space shuttle
    spaceShuttle = new SpaceShuttle(scene);
    spaceShuttle.setPosition(5, 5, 5);
    spaceShuttle.setRotation(0, Math.PI / 2, 0);
    spaceShuttle.setScale(0.1, 0.1, 0.1);

    // Orbit controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 2000;
    controls.minDistance = 1;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;

    // Setup interaction controls
    setupKeyboardControls();
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 2.0;
    raycaster.layers.set(0); // Only check objects on layer 0 by default
    mouse = new THREE.Vector2();
    setupMouseControls();
    
    setupResetButton();
    setupSpeedControl();
    setupConstellationControls();
    setupGUIControls();

    // Initialize FPS counter
    fpsElement = document.getElementById('fps');

    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize);
    animate();
}

/**
 * Handles window resize events to adjust camera and renderer.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Animation loop for the simulation.
 */
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta() * speedMultiplier;

    // Calculate FPS
    const currentTime = performance.now();
    fpsCounter++;
    
    if (currentTime - lastTime >= 1000) {
        const fps = Math.round((fpsCounter * 1000) / (currentTime - lastTime));
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${fps}`;
        }
        fpsCounter = 0;
        lastTime = currentTime;
    }

    // Update shuttle
    if (spaceShuttle) {
        spaceShuttle.update(delta);
    }

    // Handle shuttle mode camera
    if (isShuttleMode && spaceShuttle && spaceShuttle.model) {
        const cameraPosition = spaceShuttle.getCameraPosition();
        const cameraTarget = spaceShuttle.getCameraTarget();
        
        camera.position.copy(cameraPosition);
        camera.lookAt(cameraTarget);
    } else {
        controls.update();
    }

    if (planetSystem) {
        planetSystem.update(delta);
        planetSystem.updateLabels(camera);
    }

    if (asteroidBelt) {
        asteroidBelt.update(delta);
    }

    const ambientIndicator = scene.getObjectByName('ambientLightIndicator');
    if (ambientIndicator) {
        ambientIndicator.rotation.x += delta * 0.3;
        ambientIndicator.rotation.z += delta * 0.2;
    }
    composer.render();
}

/**
 * Sets up post-processing effects.
 */
function setupPostProcessing() {
    composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85 
    );
    composer.addPass(bloomPass);
}

init();

/**
 * Sets up keyboard controls for planet selection and shuttle controls.
 */
function setupKeyboardControls() {
    // Handle keydown events
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        
        // Toggle shuttle mode with 'Tab' key
        if (event.code === 'Tab') {
            event.preventDefault();
            toggleShuttleMode();
            return;
        }
        
        // Handle shuttle controls when in shuttle mode
        if (isShuttleMode && spaceShuttle) {
            switch (key) {
            case 'w':
                spaceShuttle.setControl('up', true);
                break;
            case 's':
                spaceShuttle.setControl('down', true);
                break;
            case 'a':
                spaceShuttle.setControl('left', true);
                break;
            case 'd':
                spaceShuttle.setControl('right', true);
                break;
            case 'q':
                spaceShuttle.setControl('rollLeft', true);
                break;
            case 'e':
                spaceShuttle.setControl('rollRight', true);
                break;
            }
            
            if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
                spaceShuttle.setControl('thrust', true);
            }
            if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
                spaceShuttle.setControl('decreaseThrust', true);
            }
            return;
        }
        
        // Handle planet selection (only when not in shuttle mode)
        if (planetKeyMap[key]) {
            const planetName = planetKeyMap[key];

            if (planetName === 'Earth\'s Moon') {
                planetSystem.toggleLabel('Earth\'s Moon');
                focusCameraOnPlanet('EarthMoon');
            } else {
                planetSystem.toggleLabel(planetName);
                focusCameraOnPlanet(planetName);
            }
        }
    });
    
    // Handle keyup events
    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        
        // Handle shuttle controls when in shuttle mode
        if (isShuttleMode && spaceShuttle) {
            switch (key) {
            case 'w':
                spaceShuttle.setControl('up', false);
                break;
            case 's':
                spaceShuttle.setControl('down', false);
                break;
            case 'a':
                spaceShuttle.setControl('left', false);
                break;
            case 'd':
                spaceShuttle.setControl('right', false);
                break;
            case 'q':
                spaceShuttle.setControl('rollLeft', false);
                break;
            case 'e':
                spaceShuttle.setControl('rollRight', false);
                break;
            }
            
            if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
                spaceShuttle.setControl('thrust', false);
            }
            if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
                spaceShuttle.setControl('decreaseThrust', false);
            }
        }
    });
}

/**
 * Toggles between shuttle mode and normal camera mode.
 */
function toggleShuttleMode() {
    isShuttleMode = !isShuttleMode;
    
    if (isShuttleMode) {
        // Store current camera state
        originalCameraPosition.copy(camera.position);
        originalCameraTarget.copy(controls.target);
        
        // Disable orbit controls
        controls.enabled = false;
        
        // Position shuttle at current camera location if it exists
        if (spaceShuttle && spaceShuttle.model) {
            spaceShuttle.setPosition(camera.position.x, camera.position.y, camera.position.z);
        }
        
        // Show shuttle model in shuttle mode
        if (spaceShuttle) {
            spaceShuttle.setVisible(true);
        }
        
        // Show shuttle mode UI feedback
        showShuttleModeIndicator();
    } else {
        // Re-enable orbit controls
        controls.enabled = true;
        
        // Restore original camera position
        camera.position.copy(originalCameraPosition);
        controls.target.copy(originalCameraTarget);
        controls.update();
        
        // Hide shuttle model in perspective mode
        if (spaceShuttle) {
            spaceShuttle.setVisible(false);
        }
        
        // Hide shuttle mode UI feedback
        hideShuttleModeIndicator();
    }
    
    // Update GUI dropdown if it exists
    if (shuttleControlsRef) {
        shuttleControlsRef.cameraMode = isShuttleMode ? 'Shuttle Mode' : 'Perspective Camera';
    }
}

/**
 * Shows shuttle mode indicator on screen.
 */
function showShuttleModeIndicator() {
    let indicator = document.getElementById('shuttleModeIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'shuttleModeIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 255, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        indicator.innerHTML = `
            <div>🚀 SHUTTLE MODE</div>
            <div style="font-size: 12px; margin-top: 5px;">
                W/S: Pitch | A/D: Yaw | Q/E: Roll<br>
                Shift: Thrust | Ctrl: Brake | Tab: Exit
            </div>
        `;
        document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
}

/**
 * Hides shuttle mode indicator.
 */
function hideShuttleModeIndicator() {
    const indicator = document.getElementById('shuttleModeIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Sets up mouse controls for planet interaction.
 */
function setupMouseControls() {
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('dblclick', onMouseDoubleClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
}

/**
 * Handles mouse click events for planet selection only.
 * @param {*} event 
 */
function onMouseClick(event) {
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Only check planets on single click
    raycaster.layers.set(0);
    raycaster.setFromCamera(mouse, camera);

    const clickableObjects = [];
    planetsGroup.traverse((child) => {
        if (child.isMesh && child.name && !child.name.includes('Ring') && !child.name.includes('Atmosphere') && !child.name.includes('Label')) {
            clickableObjects.push(child);
        }
    });

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetName = clickedPlanet.name;

        planetSystem.toggleLabel(planetName);
        focusCameraOnPlanet(planetName);
    }
    
    // Reset raycaster to default layer
    raycaster.layers.set(0);
}

/**
 * Handles mouse double-click events for constellation selection.
 * @param {*} event 
 */
function onMouseDoubleClick(event) {
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // First check constellation stars on layer 0
    raycaster.layers.set(0);
    raycaster.setFromCamera(mouse, camera);
    
    const constellationStars = [];
    if (constellationGroup && constellationSystem) {
        constellationGroup.traverse((child) => {
            if (child.isMesh && child.userData && child.userData.isConstellationStar) {
                constellationStars.push(child);
            }
        });
    }
    
    const starIntersects = raycaster.intersectObjects(constellationStars);
    if (starIntersects.length > 0) {
        const clickedStar = starIntersects[0].object;
        const constellationName = clickedStar.userData.constellationName;
        
        if (constellationName && constellationSystem) {
            constellationSystem.toggleConstellationFocus(constellationName);
            focusCameraOnConstellation(constellationName);
        }
        return;
    }
    
    // Check constellation colliders on layer 1 as fallback
    raycaster.layers.set(1);
    raycaster.setFromCamera(mouse, camera);
    
    const colliders = constellationSystem ? constellationSystem.getConstellationColliders() : [];
    const colliderIntersects = raycaster.intersectObjects(colliders);
    
    if (colliderIntersects.length > 0) {
        const clickedCollider = colliderIntersects[0].object;
        const constellationName = clickedCollider.userData.constellationName;
        
        if (constellationName && constellationSystem) {
            constellationSystem.toggleConstellationFocus(constellationName);
            focusCameraOnConstellation(constellationName);
        }
    }
    
    // Reset raycaster to default layer
    raycaster.layers.set(0);
}

/**
 * Handles mouse move events for planet interaction.
 * @param {*} event 
 */
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Only check layer 0 objects for hover (planets and constellation stars)
    raycaster.layers.set(0);
    raycaster.setFromCamera(mouse, camera);

    const clickableObjects = [];
    planetsGroup.traverse((child) => {
        if (child.isMesh && child.name && !child.name.includes('Ring') && !child.name.includes('Atmosphere') && !child.name.includes('Label')) {
            clickableObjects.push(child);
        }
    });

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        return;
    }
    
    // Check constellation stars only (not collision spheres)
    const constellationStars = [];
    if (constellationGroup && constellationSystem) {
        constellationGroup.traverse((child) => {
            if (child.isMesh && child.userData && child.userData.isConstellationStar) {
                constellationStars.push(child);
            }
        });
    }
    
    const starIntersects = raycaster.intersectObjects(constellationStars);
    if (starIntersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
    } else {
        renderer.domElement.style.cursor = 'default';
    }
}

/**
 * Focuses the camera on a specific planet.
 * @param {*} planetName 
 * @returns 
 */
function focusCameraOnPlanet(planetName) {
    let planetGroup, planet;
    
    if (planetName === 'EarthMoon') {
        const earthGroup = planetsGroup.getObjectByName('EarthGroup');
        if (earthGroup) {
            const moonGroup = earthGroup.getObjectByName('MoonGroup');
            if (moonGroup) {
                planet = moonGroup.getObjectByName('EarthMoon');
            }
        }
    } else {
        planetGroup = planetsGroup.getObjectByName(`${planetName}Group`);
        if (planetGroup) {
            planet = planetGroup.getObjectByName(planetName);
        }
    }
    
    if (!planet) {
        return;
    }
    
    const planetPosition = new THREE.Vector3();
    planet.getWorldPosition(planetPosition);
    
    let cameraDistance;
    switch(planetName) {
    case 'EarthMoon':
        cameraDistance = 2;
        break;
    case 'Sun':
        cameraDistance = 15;
        break;
    case 'Jupiter':
    case 'Saturn':
        cameraDistance = 8;
        break;
    case 'Uranus':
    case 'Neptune':
        cameraDistance = 6;
        break;
    default:
        cameraDistance = 4;
    }
    
    const cameraPosition = new THREE.Vector3(
        planetPosition.x + cameraDistance * 0.7,
        planetPosition.y + cameraDistance * 0.5,
        planetPosition.z + cameraDistance * 0.7
    );

    animateCameraToTarget(cameraPosition, planetPosition);
}

/**
 * Focuses the camera on a specific constellation.
 * @param {string} constellationName - The name of the constellation to focus on.
 */
function focusCameraOnConstellation(constellationName) {
    if (!constellationSystem) return;
    
    const constellationCenter = constellationSystem.getConstellationCenter(constellationName);
    
    const cameraDistance = 50;
    
    const cameraPosition = new THREE.Vector3(
        constellationCenter.x + cameraDistance * 0.7,
        constellationCenter.y + cameraDistance * 0.5,
        constellationCenter.z + cameraDistance * 0.7
    );

    animateCameraToTarget(cameraPosition, constellationCenter);
}

/**
 * Animates the camera to a target position.
 * @param {*} cameraPosition 
 * @param {*} lookAtPosition 
 */
function animateCameraToTarget(cameraPosition, lookAtPosition) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    
    const duration = 2000;
    const startTime = performance.now();
    
    function animateCamera(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(startPosition, cameraPosition, easeProgress);
        controls.target.lerpVectors(startTarget, lookAtPosition, easeProgress);
        
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    requestAnimationFrame(animateCamera);
}

/**
 * Resets the camera to its original position and target.
 */
function resetCamera() {
    const originalPosition = new THREE.Vector3(0, 10, 30);
    const originalTarget = new THREE.Vector3(0, 0, 0);
    animateCameraToTarget(originalPosition, originalTarget);
}

/** 
 * Sets up the reset button functionality.
 */
function setupResetButton() {
    const resetButton = document.getElementById('reset');
    if (resetButton) {
        resetButton.addEventListener('click', resetCamera);
    }
}

/** Sets up the speed control slider functionality.
 */
function setupSpeedControl() {
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const revertButton = document.getElementById('revertSpeed');
    
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (event) => {
            speedMultiplier = parseFloat(event.target.value);
            speedValue.textContent = speedMultiplier.toFixed(1);
        });
        
        // Initialize the display
        speedValue.textContent = speedMultiplier.toFixed(1);
    }
    
    if (revertButton) {
        revertButton.addEventListener('click', () => {
            speedMultiplier = 1.0;
            speedSlider.value = 1.0;
            speedValue.textContent = speedMultiplier.toFixed(1);
        });
    }
}

/** 
 * Sets up the constellation control functionality.
 */
function setupConstellationControls() {
    const constellationLinesToggle = document.getElementById('toggleConstellationLines');
    const constellationLabelsToggle = document.getElementById('toggleConstellationLabels');
    
    if (constellationLinesToggle && constellationSystem) {
        constellationLinesToggle.addEventListener('change', () => {
            constellationSystem.toggleLines();
        });
    }
    
    if (constellationLabelsToggle && constellationSystem) {
        constellationLabelsToggle.addEventListener('change', () => {
            constellationSystem.toggleLabels();
        });
    }
}

/**
 * Sets up the GUI controls for the solar system simulation.
 */
function setupGUIControls() {
    gui = new GUI();
    gui.title('Solar System Controls');

    const orbitalControlsFolder = gui.addFolder('Orbital Controls');
    orbitalControlsFolder.add({ orbitalSpeed: speedMultiplier }, 'orbitalSpeed', 0, 5, 0.1)
        .name('Orbital Speed')
        .onChange((value) => {
            speedMultiplier = value;
        });

    // Add shuttle controls folder
    const shuttleControlsFolder = gui.addFolder('Shuttle Controls');
    
    const shuttleControls = {
        cameraMode: 'Perspective Camera', // Default mode
        toggleMode: () => {
            toggleShuttleMode();
            shuttleControls.cameraMode = isShuttleMode ? 'Shuttle Mode' : 'Perspective Camera';
        }
    };
    
    // Store reference for updating from keyboard toggle
    shuttleControlsRef = shuttleControls;
    
    // Dropdown for camera mode selection
    shuttleControlsFolder.add(shuttleControls, 'cameraMode', ['Perspective Camera', 'Shuttle Mode'])
        .name('Camera Mode')
        .onChange((value) => {
            const shouldBeShuttleMode = (value === 'Shuttle Mode');
            if (shouldBeShuttleMode !== isShuttleMode) {
                toggleShuttleMode();
            }
        });

    const constellationControlsFolder = gui.addFolder('Constellation Controls');

    const constellationControls = {
        showLines: true,
        showLabels: true
    };
    
    constellationControlsFolder.add(constellationControls, 'showLines')
        .name('Show Constellation Lines')
        .onChange(() => {
            if (constellationSystem) {
                constellationSystem.toggleLines();
            }
        });
    
    constellationControlsFolder.add(constellationControls, 'showLabels')
        .name('Show Constellation Labels')
        .onChange(() => {
            if (constellationSystem) {
                constellationSystem.toggleLabels();
            }
        });
}