import * as THREE from 'three';

/**
 * Class representing an asteroid belt in the solar system simulation.
 */
export class AsteroidBelt {
    constructor() {
        this.asteroids = [];
        this.asteroidBeltGroup = null;
    }

    /**
     * Creates the asteroid belt.
     * @returns {THREE.Group} The group containing all asteroids in the belt.
     */
    create() {
        this.asteroidBeltGroup = new THREE.Group();
        this.asteroidBeltGroup.name = 'AsteroidBeltGroup';

        const innerRadius = 23;
        const outerRadius = 32;
        const asteroidCount = 1500;
        const minSize = 0.02;
        const maxSize = 0.15;

        for (let i = 0; i < asteroidCount; i++) {
            const asteroid = this.createAsteroid(innerRadius, outerRadius, minSize, maxSize);
            this.asteroids.push(asteroid);
            this.asteroidBeltGroup.add(asteroid);
        }

        return this.asteroidBeltGroup;
    }

    /**
     * Creates a single asteroid with random properties.
     * @param {number} innerRadius - The inner radius of the asteroid belt.
     * @param {number} outerRadius - The outer radius of the asteroid belt.
     * @param {number} minSize - The minimum size of the asteroid.
     * @param {number} maxSize - The maximum size of the asteroid.
     * @returns {THREE.Mesh} The created asteroid mesh.
     */
    createAsteroid(innerRadius, outerRadius, minSize, maxSize) {
        const angle = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const height = (Math.random() - 0.5) * 2;

        const size = minSize + Math.random() * (maxSize - minSize);

        const geometry = this.createIrregularGeometry(size);
        
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(
                Math.random() * 0.1,
                0.2 + Math.random() * 0.3,
                0.1 + Math.random() * 0.3
            ),
            shininess: 5
        });

        const asteroid = new THREE.Mesh(geometry, material);
        
        asteroid.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        asteroid.userData = {
            angle: angle,
            radius: radius,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            orbitalSpeed: 0.001 + Math.random() * 0.001
        };

        asteroid.name = `Asteroid_${Date.now()}_${Math.random()}`;

        return asteroid;
    }

    /**
     * Creates an irregular geometry for the asteroid.
     * @param {number} baseSize - The base size of the asteroid.
     * @returns {THREE.BufferGeometry} The created irregular geometry.
     */
    createIrregularGeometry(baseSize) {
        const geometry = new THREE.SphereGeometry(baseSize, 8, 6);
        
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const variation = 0.3 + Math.random() * 0.4;
            positions.setXYZ(
                i,
                x * variation,
                y * variation,
                z * variation
            );
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    /**
     * Updates the asteroid belt for animation.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(deltaTime) {
        this.asteroids.forEach(asteroid => {
            const userData = asteroid.userData;
            
            asteroid.rotation.x += userData.rotationSpeed * deltaTime;
            asteroid.rotation.y += userData.rotationSpeed * deltaTime * 0.7;
            asteroid.rotation.z += userData.rotationSpeed * deltaTime * 0.5;
            
            userData.angle += userData.orbitalSpeed * deltaTime;
            asteroid.position.x = Math.cos(userData.angle) * userData.radius;
            asteroid.position.z = Math.sin(userData.angle) * userData.radius;
        });
    }
}