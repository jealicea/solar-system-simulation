// src/Starfield.js
import * as THREE from 'three';

export class Starfield {
    constructor(starCount = 2000) {
        this.starCount = starCount;
        this.stars = null;
    }

    create() {
        const starGeometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(this.starCount * 3);
        
        for (let i = 0; i < this.starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5
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
