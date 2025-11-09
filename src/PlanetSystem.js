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

const planetsData = [
    {
        name: 'Sun',
        size: 3.5,
        color: 0xffdd00,
        texture: sunTexture,
        position: { x: 0, y: 0, z: 0 }
    },
    {
        name: 'Mercury',
        size: 0.38,
        color: 0x909090,
        texture: mercuryTexture,
        position: { x: 5, y: 0, z: 0 }
    },
    {
        name: 'Venus',
        size: 0.95,
        color: 0xeccc9a,
        texture: venusTexture,
        position: { x: 8, y: 0, z: 0 }
    },
    {
        name: 'Earth',
        size: 1,
        color: 0x2233ff,
        texture: earthTexture,
        position: { x: 12, y: 0, z: 0 },
        // moonPosition: { x: 13.5, y: 0, z: 0 }
    },
    {
        name: 'Mars',
        size: 0.53,
        color: 0xff3300,
        texture: marsTexture,
        position: { x: 18, y: 0, z: 0 },
        // moonPosition: { x: 19.5, y: 0, z: 0 }
    },
    {
        name: 'Jupiter',
        size: 2.8,
        color: 0xffaa33,
        texture: jupiterTexture,
        position: { x: 35, y: 0, z: 0 },
        // moonPosition: { x: 37, y: 0, z: 0 }
    },
    {
        name: 'Saturn',
        size: 2.4,
        color: 0xffddaa,
        texture: saturnTexture,
        position: { x: 55, y: 0, z: 0 },
        // moonPosition: { x: 57, y: 0, z: 0 }
    },
    {
        name: 'Uranus',
        size: 1.6,
        color: 0x66ccff,
        texture: uranusTexture,
        position: { x: 75, y: 0, z: 0 }
    },
    {
        name: 'Neptune',
        size: 1.5,
        color: 0x0066cc,
        texture: neptuneTexture,
        position: { x: 95, y: 0, z: 0 }
    }, 
    // {
    //     name: 'Moon',
    //     size: 0.27,
    //     color: 0x888888,
    //     texture: moonTexture,
    // }
];

export class PlanetSystem {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.planets = planetsData.map(data => ({
            name: data.name,
            size: data.size,
            color: data.color,
            texture: data.texture,
            position: data.position
        }));
        this.planetLabels = new Map(); // Store sprite labels for each planet
        this.activeLabelName = null; // Track currently active label
    }

    addPlanet(planet) {
        this.planets.push(planet);
    }

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
        
        return mesh;
    }

    createPlanetAtmosphere(planet) {
        const atmosphereRadius = planet.size * 1.1;
        const geometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        
        const atmosphereColor = this.getAtmosphereColor(planet.name);
        
        // Special handling for the Sun's atmosphere to make it more prominent
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
        ringMesh.rotation.z = 0.1;
        
        ringMesh.name = 'SaturnRings';
        
        return ringMesh;
    }

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

    createPlanetLabel(planet) {
        // Create a canvas to draw the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size (larger for bigger text)
        canvas.width = 512;
        canvas.height = 128;
        
        // Set font and style (much larger font)
        context.font = 'bold 48px Arial';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 6;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add text with outline for better visibility
        const text = planet.name;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create sprite material
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });
        
        // Create sprite
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Scale the sprite appropriately (larger scale for bigger text)
        const scale = Math.max(planet.size * 1.5, 2.0); // Increased minimum scale and multiplier
        sprite.scale.set(scale * 3, scale * 0.75, 1);
        
        // Position the label above the planet (closer to the planet)
        sprite.position.set(
            planet.position.x,
            planet.position.y + planet.size + 1,
            planet.position.z
        );
        
        sprite.name = `${planet.name}Label`;
        
        return sprite;
    }

    showLabel(planetName) {
        // Hide any currently active label
        this.hideAllLabels();
        
        // Show the requested label
        const label = this.planetLabels.get(planetName);
        if (label) {
            label.material.opacity = 1.0;
            this.activeLabelName = planetName;
        }
    }

    hideLabel(planetName) {
        const label = this.planetLabels.get(planetName);
        if (label) {
            label.material.opacity = 0;
            if (this.activeLabelName === planetName) {
                this.activeLabelName = null;
            }
        }
    }

    hideAllLabels() {
        this.planetLabels.forEach((label) => {
            label.material.opacity = 0;
        });
        this.activeLabelName = null;
    }

    toggleLabel(planetName) {
        if (this.activeLabelName === planetName) {
            this.hideLabel(planetName);
        } else {
            this.showLabel(planetName);
        }
    }

    updateLabels(camera) {
        // Update label positions and ensure they always face the camera
        this.planetLabels.forEach((label, planetName) => {
            const planet = this.planets.find(p => p.name === planetName);
            if (planet && label.material.opacity > 0) {
                // Update position to stay above the planet (closer to the planet)
                label.position.set(
                    planet.position.x,
                    planet.position.y + planet.size + 1,
                    planet.position.z
                );
                
                // Sprites automatically face the camera, but we can adjust scale based on distance
                const distance = camera.position.distanceTo(label.position);
                const scale = Math.max(planet.size * 1.5, 2.0); // Increased scale
                const scaleFactor = Math.min(distance / 15, 2.0); // Larger scale factor
                label.scale.set(scale * 3 * scaleFactor, scale * 0.75 * scaleFactor, 1);
            }
        });
    }
}
