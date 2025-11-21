// src/SolarSystemSimulation.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Starfield } from './Starfield.js';
import { PlanetSystem } from './PlanetSystem.js';
import { AsteroidBelt } from './AsteroidBelt.js';
import { Constellation } from './Constellation.js';

let scene, camera, renderer, clock, controls, planetSystem, planetsGroup, asteroidBelt, asteroidBeltGroup, constellationSystem, constellationGroup;
let composer, bloomPass;
let raycaster, mouse;
let speedMultiplier = 1.0;

const planetKeyMap = {
    '1': 'Mercury',
    '2': 'Venus',
    '3': 'Earth',
    '4': 'Mars',
    '5': 'Jupiter',
    '6': 'Saturn',
    '7': 'Uranus',
    '8': 'Neptune',
    '9': 'Sun'
};

/**
 * Initializes the solar system simulation.
 */
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
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

    // Orbit controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 550;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    // Set up keyboard and mouse controls
    setupKeyboardControls();
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 2.0; // Increase threshold for easier clicking on small star objects
    mouse = new THREE.Vector2();
    setupMouseControls();
    
    // Set up reset button
    setupResetButton();
    
    // Set up speed control slider
    setupSpeedControl();
    
    // Set up constellation controls
    setupConstellationControls();
    
    // Set up constellation controls
    setupConstellationControls();

    // Clock setup
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

    controls.update();

    if (planetSystem) {
        planetSystem.update(delta);
        planetSystem.updateLabels(camera);
    }

    if (asteroidBelt) {
        asteroidBelt.update(delta);
    }

    if (constellationSystem) {
        constellationSystem.update(delta);
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
 * Sets up keyboard controls for planet selection.
 */
function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (planetKeyMap[key]) {
            const planetName = planetKeyMap[key];
            planetSystem.toggleLabel(planetName);
            focusCameraOnPlanet(planetName);
        }
    });
}

/**
 * Sets up mouse controls for planet interaction.
 */
function setupMouseControls() {
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
}

/**
 * Handles mouse click events for planet selection.
 * @param {*} event 
 */
function onMouseClick(event) {
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
        return; // Exit early if planet was clicked
    }
    
    // Check for constellation clicks
    const constellationObjects = [];
    if (constellationGroup) {
        constellationGroup.traverse((child) => {
            if (child.isMesh && child.userData && child.userData.isConstellationStar) {
                constellationObjects.push(child);
            }
        });
    }
    
    const constellationIntersects = raycaster.intersectObjects(constellationObjects);
    if (constellationIntersects.length > 0) {
        const clickedStar = constellationIntersects[0].object;
        const constellationName = clickedStar.userData.constellationName;
        
        console.log('Clicked constellation star:', clickedStar.userData.starName, 'in constellation:', constellationName); // Debug
        
        if (constellationName && constellationSystem) {
            constellationSystem.toggleConstellationFocus(constellationName);
            focusCameraOnConstellation(constellationName);
        }
    }
}

/**
 * Handles mouse move events for planet interaction.
 * @param {*} event 
 */
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
    
    // Check for constellation hover
    const constellationObjects = [];
    if (constellationGroup) {
        constellationGroup.traverse((child) => {
            if (child.isMesh && child.userData && child.userData.isConstellationStar) {
                constellationObjects.push(child);
            }
        });
    }
    
    const constellationIntersects = raycaster.intersectObjects(constellationObjects);
    if (constellationIntersects.length > 0) {
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
    const planetGroup = planetsGroup.getObjectByName(`${planetName}Group`);
    if (!planetGroup) {
        return;
    }
    
    const planet = planetGroup.getObjectByName(planetName);
    if (!planet) {
        return;
    }
    
    const planetPosition = new THREE.Vector3();
    planet.getWorldPosition(planetPosition);
    
    let cameraDistance;
    switch(planetName) {
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
    
    // Calculate camera distance based on constellation spread
    const cameraDistance = 50; // Constellations are far away, so we need more distance
    
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

/** 
 * Sets up the speed control slider functionality.
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
