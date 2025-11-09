// src/Starfield.js
import * as THREE from 'three';

export class Starfield {
    constructor(starCount = 5000) {
        this.starCount = starCount;
        this.stars = null;
    }

    create() {
        const starGeometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(this.starCount * 3);
        const colors = new Float32Array(this.starCount * 3);
        const sizes = new Float32Array(this.starCount);
        
        // Create random star positions and properties
        for (let i = 0; i < this.starCount; i++) {
            const radius = 100 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Vary star colors (white to slightly blue/yellow tint)
            const colorVariation = 0.8 + Math.random() * 0.2;
            const blueShift = 0.9 + Math.random() * 0.1;
            
            colors[i * 3] = colorVariation;     // Red
            colors[i * 3 + 1] = colorVariation; // Green
            colors[i * 3 + 2] = blueShift;      // Blue
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 1.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        return this.stars;
    }

    addToScene(scene) {
        if (!this.stars) {
            this.create();
        }
        scene.add(this.stars);
    }

    removeFromScene(scene) {
        if (this.stars) {
            scene.remove(this.stars);
        }
    }

    dispose() {
        if (this.stars) {
            this.stars.geometry.dispose();
            this.stars.material.dispose();
        }
    }
}
