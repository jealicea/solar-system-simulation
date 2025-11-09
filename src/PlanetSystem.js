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
import moonTexture from './assets/textures/Moon.jpg';

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
            
            // Add Saturn's rings if this is Saturn
            if (planet.name === 'Saturn') {
                const rings = this.createSaturnRings(planet);
                planetGroup.add(rings);
            }
            
            // Add the planet group to the main group
            group.add(planetGroup);
            
            // Create orbital lines for planets (not for the Sun)
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
            // Special material for the sun - make it emissive and self-illuminating
            const sunTextureMap = this.textureLoader.load(planet.texture);
            material = new THREE.MeshBasicMaterial({ 
                map: sunTextureMap,
                emissive: new THREE.Color(0xffaa00),
                emissiveIntensity: 0.3
            });
        } else if (planet.texture) {
            // Create material with texture for other planets
            const planetTexture = this.textureLoader.load(planet.texture);
            material = new THREE.MeshPhongMaterial({ map: planetTexture });
        } else {
            // Fallback to color material
            material = new THREE.MeshPhongMaterial({ color: planet.color });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        mesh.name = planet.name;
        
        return mesh;
    }

    createSaturnRings(planet) {
        // Create ring geometry - a flat ring shape
        const innerRadius = planet.size * 1.2;  // Slightly larger than Saturn
        const outerRadius = planet.size * 2.2;  // Outer edge of the rings
        const thetaSegments = 64;  // Number of segments for smooth circle
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        
        // Load the ring texture
        const ringTexture = this.textureLoader.load(saturnRingTexture);
        
        // Create ring material
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,  // Visible from both sides
            transparent: true,
            opacity: 0.8
        });
        
        // Create the ring mesh
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Position the rings at the same location as Saturn
        ringMesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        
        // Rotate the rings to be horizontal (Saturn's rings are roughly in the equatorial plane)
        ringMesh.rotation.x = Math.PI / 2;
        
        // Give the rings a slight tilt for more realism
        ringMesh.rotation.z = 0.1;
        
        ringMesh.name = 'SaturnRings';
        
        return ringMesh;
    }

    createOrbitalLine(planet) {
        // Calculate the orbital radius based on the planet's distance from the Sun
        const orbitalRadius = Math.sqrt(
            planet.position.x * planet.position.x + 
            planet.position.z * planet.position.z
        );
        
        // Create a circular geometry for the orbital path
        const points = [];
        const segments = 128; // Number of segments for smooth circle
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * orbitalRadius,
                0,
                Math.sin(theta) * orbitalRadius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create a white material for the orbital line
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            opacity: 0.3,
            transparent: true
        });
        
        const orbitalLine = new THREE.Line(geometry, material);
        orbitalLine.name = `${planet.name}Orbit`;
        
        return orbitalLine;
    }
}
