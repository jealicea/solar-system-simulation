import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SpaceShuttleModel from './assets/models/SpaceShuttle.glb';

export class SpaceShuttle {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.mixer = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);
        this.visible = false; // Start hidden
        
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        loader.load(
            SpaceShuttleModel,
            (gltf) => {
                this.model = gltf.scene;
                
                // Set initial position, rotation, and scale
                this.model.position.copy(this.position);
                this.model.rotation.copy(this.rotation);
                this.model.scale.copy(this.scale);
                
                // Set initial visibility
                this.model.visible = this.visible;
                
                // Add the model to the scene
                this.scene.add(this.model);
                
                // Set up animation mixer if animations exist
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    gltf.animations.forEach((clip) => {
                        this.mixer.clipAction(clip).play();
                    });
                }
                
                // Model loaded successfully
            },
            () => {
                // Loading progress tracking (if needed)
            },
            (error) => {
                // Error loading Space Shuttle model
                throw new Error('Failed to load Space Shuttle model: ' + error.message);
            }
        );
    }

    update(deltaTime) {
        // Update animations if mixer exists
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getRotation() {
        return this.rotation.clone();
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        if (this.model) {
            this.model.position.copy(this.position);
        }
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        if (this.model) {
            this.model.rotation.copy(this.rotation);
        }
    }

    setScale(x, y, z) {
        this.scale.set(x, y, z);
        if (this.model) {
            this.model.scale.copy(this.scale);
        }
    }

    setVisible(visible) {
        this.visible = visible;
        if (this.model) {
            this.model.visible = visible;
        }
    }

    dispose() {
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        if (this.mixer) {
            this.mixer = null;
        }
    }
}