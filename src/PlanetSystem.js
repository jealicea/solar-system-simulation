import * as THREE from 'three';
import sunTexture from './assets/textures/Sun.jpg';
import mercuryTexture from './assets/textures/Mercury.jpg';
import venusTexture from './assets/textures/Venus.jpg';
import earthTexture from './assets/textures/Earth.jpg';
import marsTexture from './assets/textures/Mars.jpg';
import jupiterTexture from './assets/textures/Jupiter.jpg';
import saturnTexture from './assets/textures/Saturn.jpg';
import saturnRingTexture from './assets/textures/SaturnsRing.png';
import uranusTexture from './assets/textures/Uranus.jpg';
import neptuneTexture from './assets/textures/Neptune.jpg';
import earthMoonTexture from './assets/textures/Moon.jpg';

const planetsData = [
    {
        name: 'Sun',
        size: 3.5,
        color: 0xffdd00,
        texture: sunTexture,
        position: { x: 0, y: 0, z: 0 },
        orbitRadius: 0,
        orbitSpeed: 0,
        rotationSpeed: 0.02,
        axialTilt: 7.25 * Math.PI / 180
    },
    {
        name: 'Mercury',
        size: 0.38,
        color: 0x909090,
        texture: mercuryTexture,
        position: { x: 5, y: 0, z: 0 },
        orbitRadius: 5,
        orbitSpeed: 0.04,
        rotationSpeed: 0.005,
        axialTilt: 0.034 * Math.PI / 180
    },
    {
        name: 'Venus',
        size: 0.95,
        color: 0xeccc9a,
        texture: venusTexture,
        position: { x: 8, y: 0, z: 0 },
        orbitRadius: 8,
        orbitSpeed: 0.035,
        rotationSpeed: -0.002,
        axialTilt: 177.3 * Math.PI / 180
    },
    {
        name: 'Earth',
        size: 1,
        color: 0x2233ff,
        texture: earthTexture,
        position: { x: 12, y: 0, z: 0 },
        orbitRadius: 12,
        orbitSpeed: 0.03,
        rotationSpeed: 0.01,
        axialTilt: 23.5 * Math.PI / 180
    },
    {
        name: 'Mars',
        size: 0.53,
        color: 0xff3300,
        texture: marsTexture,
        position: { x: 18, y: 0, z: 0 },
        orbitRadius: 18,
        orbitSpeed: 0.025,
        rotationSpeed: 0.0097,
        axialTilt: 25.2 * Math.PI / 180
    },
    {
        name: 'Jupiter',
        size: 2.8,
        color: 0xffaa33,
        texture: jupiterTexture,
        position: { x: 35, y: 0, z: 0 },
        orbitRadius: 35,
        orbitSpeed: 0.013,
        rotationSpeed: 0.024,
        axialTilt: 3.1 * Math.PI / 180
    },
    {
        name: 'Saturn',
        size: 2.4,
        color: 0xffddaa,
        texture: saturnTexture,
        position: { x: 55, y: 0, z: 0 },
        orbitRadius: 55,
        orbitSpeed: 0.009,
        rotationSpeed: 0.022,
        axialTilt: 26.7 * Math.PI / 180
    },
    {
        name: 'Uranus',
        size: 1.6,
        color: 0x66ccff,
        texture: uranusTexture,
        position: { x: 75, y: 0, z: 0 },
        orbitRadius: 75,
        orbitSpeed: 0.006,
        rotationSpeed: 0.014,
        axialTilt: 97.8 * Math.PI / 180
    },
    {
        name: 'Neptune',
        size: 1.5,
        color: 0x0066cc,
        texture: neptuneTexture,
        position: { x: 95, y: 0, z: 0 },
        orbitRadius: 95,
        orbitSpeed: 0.004,
        rotationSpeed: 0.016,
        axialTilt: 28.3 * Math.PI / 180
    }
];

/**
 * Class representing the planet system in the solar system simulation.
 */
export class PlanetSystem {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.planets = planetsData.map(data => ({
            name: data.name,
            size: data.size,
            color: data.color,
            texture: data.texture,
            position: data.position,
            orbitRadius: data.orbitRadius,
            orbitSpeed: data.orbitSpeed,
            rotationSpeed: data.rotationSpeed,
            axialTilt: data.axialTilt
        }));
        this.planetLabels = new Map();
        this.activeLabelName = null;
        this.planetMeshes = new Map();
        this.orbitAngles = new Map();
        
        // Initialize orbit angles
        this.planets.forEach(planet => {
            this.orbitAngles.set(planet.name, Math.random() * Math.PI * 2);
        });
    }

    /**
     * Adds a planet to the solar system model.
     * @param {*} planet - The planet to add.
     */
    addPlanet(planet) {
        this.planets.push(planet);
    }

    /**
     * Creates the planet system group containing all planets and their features.
     * @returns {THREE.Group} The group containing all planets.
     */
    create() {
        const group = new THREE.Group();
        
        this.planets.forEach(planet => {
            // Create a group for each planet
            const planetGroup = new THREE.Group();
            planetGroup.name = `${planet.name}Group`;
            
            // Create the planet mesh and add it to its own group
            const mesh = this.createPlanetMesh(planet);
            planetGroup.add(mesh);
            
            // Add atmosphere for all planets including the Sun
            const atmosphere = this.createPlanetAtmosphere(planet);
            planetGroup.add(atmosphere);
            
            // Create and add the label sprite for this planet
            const label = this.createPlanetLabel(planet);
            planetGroup.add(label);
            this.planetLabels.set(planet.name, label);
            
            // Add Saturn's rings if this is Saturn
            if (planet.name === 'Saturn') {
                const rings = this.createSaturnRings(planet);
                planetGroup.add(rings);
            }
            
            // Add Earth's moon if this is Earth
            if (planet.name === 'Earth') {
                const moon = this.createEarthMoon();
                planetGroup.add(moon);
            }
            
            // Add the planet group to the main group
            group.add(planetGroup);
            
            // Create orbital lines for planets
            if (planet.name !== 'Sun') {
                const orbitalLine = this.createOrbitalLine(planet);
                group.add(orbitalLine);
            }
        });
        
        return group;
    }

    /**
     * Creates the mesh for a planet.
     * @param {*} planet - The planet data.
     * @returns {THREE.Mesh} The mesh representing the planet.
     */
    createPlanetMesh(planet) {
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
        
        let material;
        if (planet.name === 'Sun') {
            const sunTextureMap = this.textureLoader.load(planet.texture);
            material = new THREE.MeshBasicMaterial({ 
                map: sunTextureMap,
                emissive: new THREE.Color(0xffaa00),
                emissiveIntensity: 1.0
            });
        } else if (planet.texture) {
            const planetTexture = this.textureLoader.load(planet.texture);
            material = new THREE.MeshPhongMaterial({ map: planetTexture });
        } else {
            material = new THREE.MeshPhongMaterial({ color: planet.color });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        mesh.name = planet.name;
        mesh.rotation.z = planet.axialTilt;
        this.planetMeshes.set(planet.name, mesh);
        
        return mesh;
    }

    /**
     * Creates the atmosphere for a planet.
     * @param {*} planet - The planet data.
     * @returns {THREE.Mesh} The mesh representing the planet's atmosphere.
     */
    createPlanetAtmosphere(planet) {
        const atmosphereRadius = planet.size * 1.1;
        const geometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        
        const atmosphereColor = this.getAtmosphereColor(planet.name);
        let opacity = 0.2;
        let material;
        
        if (planet.name === 'Sun') {
            opacity = 0.4;
            material = new THREE.MeshBasicMaterial({
                color: atmosphereColor,
                transparent: true,
                opacity: opacity,
                side: THREE.BackSide,
                emissive: new THREE.Color(atmosphereColor),
                emissiveIntensity: 0.3
            });
        } else {
            material = new THREE.MeshPhongMaterial({
                color: atmosphereColor,
                transparent: true,
                opacity: opacity,
                side: THREE.BackSide,
            });
        }
        
        const atmosphereMesh = new THREE.Mesh(geometry, material);
        atmosphereMesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        atmosphereMesh.name = `${planet.name}Atmosphere`;
        
        return atmosphereMesh;
    }

    /**
     * Gets the atmosphere color for a planet.
     * @param {string} planetName - The name of the planet.
     * @returns {number} The hexadecimal color of the atmosphere.
     */
    getAtmosphereColor(planetName) {
        const atmosphereColors = {
            'Sun': 0xff6600, 
            'Mercury': 0x909090,  
            'Venus': 0xffff99,     
            'Earth': 0x87ceeb, 
            'Mars': 0xff6b47,
            'Jupiter': 0xffa500,
            'Saturn': 0xffd700,
            'Uranus': 0x40e0d0,
            'Neptune': 0x4682b4
        };
        return atmosphereColors[planetName];
    }

    /**
     * Creates the rings for Saturn.
     * @param {*} planet - The planet data for Saturn.
     * @returns {THREE.Mesh} The mesh representing Saturn's rings.
     */
    createSaturnRings(planet) {
        const innerRadius = planet.size * 1.2;
        const outerRadius = planet.size * 2.2; 
        const thetaSegments = 64; 
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        
        const ringTexture = this.textureLoader.load(saturnRingTexture);
        
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
    
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.rotation.z = planet.axialTilt;
        
        ringMesh.name = 'SaturnRings';
        
        return ringMesh;
    }

    /**
     * Creates Earth's moon and adds it to the Earth group.
     * @returns {THREE.Group} The group containing the moon.
     */
    createEarthMoon() {
        const moonGroup = new THREE.Group();
        
        // Moon properties
        const moonSize = 0.27;
        const moonOrbitRadius = 2.5;
        
        // Create moon geometry and material
        const moonGeometry = new THREE.SphereGeometry(moonSize, 32, 32);
        const moonTexture = this.textureLoader.load(earthMoonTexture);
        const moonMaterial = new THREE.MeshPhongMaterial({ 
            map: moonTexture 
        });
        
        // Create moon mesh
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        moonMesh.name = 'EarthMoon';
        moonMesh.position.set(moonOrbitRadius, 0, 0); // Position relative to Earth
        
        // Add moon to the moon group
        moonGroup.add(moonMesh);
        moonGroup.name = 'MoonGroup';
        
        // Create and add label for the moon
        const moonLabel = this.createMoonLabel();
        moonGroup.add(moonLabel);
        this.planetLabels.set('Earth\'s Moon', moonLabel);
        
        // Store moon mesh for animation updates
        this.planetMeshes.set('EarthMoon', moonMesh);
        this.orbitAngles.set('EarthMoon', 0);
        
        // Add moon data for update animation
        this.planets.push({
            name: 'EarthMoon',
            size: moonSize,
            orbitRadius: moonOrbitRadius,
            orbitSpeed: 0.1,
            rotationSpeed: 0.01,
            axialTilt: 6.68 * Math.PI / 180
        });
        
        return moonGroup;
    }

    /**
     * Creates the label sprite for Earth's moon.
     * @returns {THREE.Sprite} The sprite representing the moon's label.
     */
    createMoonLabel() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 512;
        canvas.height = 128;
        
        context.font = 'bold 36px Arial';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const text = 'Earth\'s Moon';
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        const scale = 1.5;
        sprite.scale.set(scale * 3, scale * 0.75, 1);

        sprite.position.set(0, 0.67, 0);
        sprite.name = 'Earth\'s MoonLabel';
        
        return sprite;
    }

    /**
     * Creates the orbital line for a planet.
     * @param {*} planet - The planet data.
     * @returns {THREE.Line} The line representing the planet's orbit.
     */
    createOrbitalLine(planet) {
        const orbitalRadius = Math.sqrt(
            planet.position.x * planet.position.x + 
            planet.position.z * planet.position.z
        );
        
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * orbitalRadius,
                0,
                Math.sin(theta) * orbitalRadius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            opacity: 0.3,
            transparent: true
        });
        
        const orbitalLine = new THREE.Line(geometry, material);
        orbitalLine.name = `${planet.name}Orbit`;
        
        return orbitalLine;
    }

    /**
     * Creates the label sprite for a planet.
     * @param {*} planet - The planet data.
     * @returns {THREE.Sprite} The sprite representing the planet's label.
     */
    createPlanetLabel(planet) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 512;
        canvas.height = 128;
        
        context.font = 'bold 48px Arial';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 6;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const text = planet.name;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        

        const scale = Math.max(planet.size * 1.5, 2.0);
        sprite.scale.set(scale * 3, scale * 0.75, 1);

        sprite.position.set(
            planet.position.x,
            planet.position.y + planet.size + 1,
            planet.position.z
        );
        
        sprite.name = `${planet.name}Label`;
        
        return sprite;
    }

    /**
     * Shows the label for a specific planet.
     * @param {string} planetName - The name of the planet.
     */
    showLabel(planetName) {
        this.hideAllLabels();
        
        const label = this.planetLabels.get(planetName);
        if (label) {
            label.material.opacity = 1.0;
            this.activeLabelName = planetName;
        }
    }

    /**
     * Hides the label for a specific planet.
     * @param {string} planetName - The name of the planet.
     */
    hideLabel(planetName) {
        const label = this.planetLabels.get(planetName);
        if (label) {
            label.material.opacity = 0;
            if (this.activeLabelName === planetName) {
                this.activeLabelName = null;
            }
        }
    }

    /**
     * Hides all planet labels.
     */
    hideAllLabels() {
        this.planetLabels.forEach((label) => {
            label.material.opacity = 0;
        });
        this.activeLabelName = null;
    }

    /**
     * Toggles the label for a specific planet.
     * @param {string} planetName - The name of the planet.
     */
    toggleLabel(planetName) {
        if (this.activeLabelName === planetName) {
            this.hideLabel(planetName);
        } else {
            this.showLabel(planetName);
        }
    }

    /**
     * Updates the positions and scales of planet labels based on camera position.
     * @param {THREE.Camera} camera - The camera in the scene.
     */
    updateLabels(camera) {
        this.planetLabels.forEach((label, planetName) => {
            if (label.material.opacity > 0) {
                if (planetName === 'Earth\'s Moon') {
                    // Handle moon label positioning
                    const moonMesh = this.planetMeshes.get('EarthMoon');
                    if (moonMesh) {
                        label.position.set(
                            moonMesh.position.x,
                            moonMesh.position.y + 0.27 + 0.4, // Moon size + smaller offset
                            moonMesh.position.z
                        );
                        
                        const distance = camera.position.distanceTo(label.position);
                        const scale = 1.5;
                        const scaleFactor = Math.min(distance / 15, 2.0);
                        label.scale.set(scale * 3 * scaleFactor, scale * 0.75 * scaleFactor, 1);
                    }
                } else {
                    // Handle regular planet labels
                    const planet = this.planets.find(p => p.name === planetName);
                    if (planet) {
                        const planetMesh = this.planetMeshes.get(planetName);
                        if (planetMesh) {
                            label.position.set(
                                planetMesh.position.x,
                                planetMesh.position.y + planet.size + 1,
                                planetMesh.position.z
                            );
                            
                            const distance = camera.position.distanceTo(label.position);
                            const scale = Math.max(planet.size * 1.5, 2.0);
                            const scaleFactor = Math.min(distance / 15, 2.0);
                            label.scale.set(scale * 3 * scaleFactor, scale * 0.75 * scaleFactor, 1);
                        }
                    }
                }
            }
        });
    }

    /**
     * Updates the planet system for animation.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(deltaTime) {
        this.planets.forEach(planet => {
            const planetMesh = this.planetMeshes.get(planet.name);
            if (!planetMesh) return;

            planetMesh.rotation.y += planet.rotationSpeed * deltaTime;

            if (planet.name !== 'Sun' && planet.orbitRadius > 0) {
                let currentAngle = this.orbitAngles.get(planet.name);
                currentAngle += planet.orbitSpeed * deltaTime;
                this.orbitAngles.set(planet.name, currentAngle);

                let newX, newZ;
                
                if (planet.name === 'EarthMoon') {
                    // Moon orbits around Earth, not the Sun
                    const earthMesh = this.planetMeshes.get('Earth');
                    if (earthMesh) {
                        newX = earthMesh.position.x + Math.cos(currentAngle) * planet.orbitRadius;
                        newZ = earthMesh.position.z + Math.sin(currentAngle) * planet.orbitRadius;
                    } else {
                        return;
                    }
                } else {
                    // Regular planets orbit around the Sun
                    newX = Math.cos(currentAngle) * planet.orbitRadius;
                    newZ = Math.sin(currentAngle) * planet.orbitRadius;
                }

                planetMesh.position.set(newX, 0, newZ);

                const planetGroup = planetMesh.parent;
                if (planetGroup) {
                    const atmosphere = planetGroup.getObjectByName(`${planet.name}Atmosphere`);
                    if (atmosphere) {
                        atmosphere.position.set(newX, 0, newZ);
                    }

                    if (planet.name === 'Saturn') {
                        const rings = planetGroup.getObjectByName('SaturnRings');
                        if (rings) {
                            rings.position.set(newX, 0, newZ);
                            rings.rotation.y += 0.001 * deltaTime;
                        }
                    }

                    // Update planet position data (except for moon which is relative to Earth)
                    if (planet.name !== 'EarthMoon') {
                        planet.position.x = newX;
                        planet.position.z = newZ;
                    }
                }
            }
        });
    }
}
