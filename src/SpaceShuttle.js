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
        this.visible = false; // Start hidden since we begin in perspective mode
        
        // Movement properties
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.maxSpeed = 50;
        this.thrustPower = 0;
        this.maxThrust = 100;
        this.drag = 0.98;
        
        // Rotation properties
        this.angularVelocity = new THREE.Euler(0, 0, 0);
        this.rotationSpeed = 2;
        this.angularDrag = 0.95;
        
        // Control state
        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false,
            rollLeft: false,
            rollRight: false,
            thrust: false,
            decreaseThrust: false
        };
        
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
        
        // Apply thrust
        if (this.controls.thrust) {
            this.thrustPower = Math.min(this.thrustPower + deltaTime * 50, this.maxThrust);
        } else if (this.controls.decreaseThrust) {
            this.thrustPower = Math.max(this.thrustPower - deltaTime * 50, 0);
        }
        
        // Calculate forward direction based on shuttle rotation
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.rotation);
        
        // Apply thrust force in forward direction
        const thrustForce = forward.multiplyScalar(this.thrustPower * deltaTime);
        this.acceleration.add(thrustForce);
        
        // Apply rotational controls
        if (this.controls.up) {
            this.angularVelocity.x -= this.rotationSpeed * deltaTime;
        }
        if (this.controls.down) {
            this.angularVelocity.x += this.rotationSpeed * deltaTime;
        }
        if (this.controls.left) {
            this.angularVelocity.y += this.rotationSpeed * deltaTime;
        }
        if (this.controls.right) {
            this.angularVelocity.y -= this.rotationSpeed * deltaTime;
        }
        if (this.controls.rollLeft) {
            this.angularVelocity.z += this.rotationSpeed * deltaTime;
        }
        if (this.controls.rollRight) {
            this.angularVelocity.z -= this.rotationSpeed * deltaTime;
        }
        
        // Apply angular drag
        this.angularVelocity.x *= this.angularDrag;
        this.angularVelocity.y *= this.angularDrag;
        this.angularVelocity.z *= this.angularDrag;
        
        // Update rotation
        this.rotation.x += this.angularVelocity.x * deltaTime;
        this.rotation.y += this.angularVelocity.y * deltaTime;
        this.rotation.z += this.angularVelocity.z * deltaTime;
        
        // Update velocity with acceleration
        this.velocity.add(this.acceleration);
        
        // Apply drag
        this.velocity.multiplyScalar(this.drag);
        
        // Limit max speed
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Reset acceleration
        this.acceleration.set(0, 0, 0);
        
        // Update model position and rotation
        if (this.model) {
            this.model.position.copy(this.position);
            this.model.rotation.copy(this.rotation);
        }
    }
    
    setControl(controlName, active) {
        if (Object.prototype.hasOwnProperty.call(this.controls, controlName)) {
            this.controls[controlName] = active;
        }
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getRotation() {
        return this.rotation.clone();
    }
    
    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.rotation);
        return forward;
    }
    
    getCameraPosition() {
        // Position camera behind the shuttle
        // Since shuttle's forward is (0,0,-1), behind is (0,0,+1)
        const backward = new THREE.Vector3(0, 0, 1); // Opposite of forward direction
        const up = new THREE.Vector3(0, 1, 0); // Slightly above
        
        // Scale the vectors for proper distance
        backward.multiplyScalar(15); // 15 units behind
        up.multiplyScalar(3); // 3 units above
        
        // Apply shuttle rotation to both vectors
        backward.applyEuler(this.rotation);
        up.applyEuler(this.rotation);
        
        // Combine position + backward offset + up offset
        return this.position.clone().add(backward).add(up);
    }
    
    getCameraTarget() {
        // Look ahead of the shuttle (in the direction the shuttle is facing)
        const forward = new THREE.Vector3(0, 0, 1); // Shuttle's forward direction
        forward.applyEuler(this.rotation);
        return this.position.clone().add(forward);
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