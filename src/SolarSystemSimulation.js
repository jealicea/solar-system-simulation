// src/SolarSystemSimulation.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Starfield } from './Starfield.js';
import { PlanetSystem } from './PlanetSystem.js';

let scene, camera, renderer, clock, controls, planetSystem, planetsGroup;
let composer, bloomPass;
let raycaster, mouse;

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

    // Orbit controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    // Set up keyboard and mouse controls
    setupKeyboardControls();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    setupMouseControls();

    // Clock setup
    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    controls.update();

    // Rotate ambient light indicator if it exists
    const ambientIndicator = scene.getObjectByName('ambientLightIndicator');
    if (ambientIndicator) {
        ambientIndicator.rotation.x += delta * 0.3;
        ambientIndicator.rotation.z += delta * 0.2;
    }
    composer.render();
}

function setupPostProcessing() {
    // Create the effect composer
    composer = new EffectComposer(renderer);

    // Add the render pass - this renders the scene normally
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom pass for glowing effects
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
}

init();

function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (planetKeyMap[key]) {
            const planetName = planetKeyMap[key];
            focusCameraOnPlanet(planetName);
        }
    });
}

function setupMouseControls() {
    // Add mouse click event listener
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Add mouse move event listener for hover effects
    renderer.domElement.addEventListener('mousemove', onMouseMove);
}

function onMouseClick(event) {
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const clickableObjects = [];
    planetsGroup.traverse((child) => {
        if (child.isMesh && child.name && !child.name.includes('Ring')) {
            clickableObjects.push(child);
        }
    });

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetName = clickedPlanet.name;
        focusCameraOnPlanet(planetName);
    }
}

function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const clickableObjects = [];
    planetsGroup.traverse((child) => {
        if (child.isMesh && child.name && !child.name.includes('Ring')) {
            clickableObjects.push(child);
        }
    });

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
    } else {
        renderer.domElement.style.cursor = 'default';
    }
}

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
