// src/Constellation.js
import * as THREE from 'three';

// 12 Zodiac Constellations with astronomically accurate positions on celestial sphere
// Positions are calculated using right ascension and declination converted to 3D coordinates
const CELESTIAL_RADIUS = 300; // Distance from center for all constellations

// Helper function to convert RA/Dec to 3D coordinates on celestial sphere
function raDecToCartesian(ra, dec, radius = CELESTIAL_RADIUS) {
    const raRad = (ra * 15) * Math.PI / 180; // RA in hours to radians
    const decRad = dec * Math.PI / 180; // Dec in degrees to radians
    
    return {
        x: radius * Math.cos(decRad) * Math.cos(raRad),
        y: radius * Math.sin(decRad),
        z: radius * Math.cos(decRad) * Math.sin(raRad)
    };
}

const constellationData = [
    {
        name: 'Aries',
        symbol: '♈',
        stars: [
            { name: 'Hamal', ...raDecToCartesian(2.12, 23.5), brightness: 1.0 },
            { name: 'Sheratan', ...raDecToCartesian(1.91, 20.8), brightness: 0.8 },
            { name: 'Mesarthim', ...raDecToCartesian(1.88, 19.3), brightness: 0.7 },
            { name: '41 Arietis', ...raDecToCartesian(2.83, 27.3), brightness: 0.6 }
        ],
        connections: [[0, 1], [1, 2], [0, 3]]
    },
    {
        name: 'Taurus',
        symbol: '♉',
        stars: [
            { name: 'Aldebaran', ...raDecToCartesian(4.60, 16.5), brightness: 1.0 },
            { name: 'Elnath', ...raDecToCartesian(5.44, 28.6), brightness: 0.9 },
            { name: 'Alcyone', ...raDecToCartesian(3.79, 24.1), brightness: 0.8 },
            { name: 'Maia', ...raDecToCartesian(3.76, 24.4), brightness: 0.7 },
            { name: 'Ain', ...raDecToCartesian(4.49, 19.2), brightness: 0.6 }
        ],
        connections: [[0, 1], [0, 4], [2, 3], [0, 2]]
    },
    {
        name: 'Gemini',
        symbol: '♊',
        stars: [
            { name: 'Castor', ...raDecToCartesian(7.58, 31.9), brightness: 1.0 },
            { name: 'Pollux', ...raDecToCartesian(7.75, 28.0), brightness: 0.95 },
            { name: 'Alhena', ...raDecToCartesian(6.63, 16.4), brightness: 0.8 },
            { name: 'Wasat', ...raDecToCartesian(7.33, 21.9), brightness: 0.7 },
            { name: 'Mebsuta', ...raDecToCartesian(6.38, 25.1), brightness: 0.6 }
        ],
        connections: [[0, 1], [1, 3], [3, 2], [0, 4], [4, 3]]
    },
    {
        name: 'Cancer',
        symbol: '♋',
        stars: [
            { name: 'Altarf', ...raDecToCartesian(8.16, 9.2), brightness: 0.8 },
            { name: 'Acubens', ...raDecToCartesian(8.78, 11.9), brightness: 0.7 },
            { name: 'Asellus Australis', ...raDecToCartesian(8.78, 18.2), brightness: 0.6 },
            { name: 'Asellus Borealis', ...raDecToCartesian(8.73, 21.5), brightness: 0.5 }
        ],
        connections: [[0, 1], [1, 2], [2, 3]]
    },
    {
        name: 'Leo',
        symbol: '♌',
        stars: [
            { name: 'Regulus', ...raDecToCartesian(10.14, 11.9), brightness: 1.0 },
            { name: 'Algieba', ...raDecToCartesian(10.33, 19.8), brightness: 0.9 },
            { name: 'Denebola', ...raDecToCartesian(11.82, 14.6), brightness: 0.8 },
            { name: 'Zosma', ...raDecToCartesian(11.23, 20.5), brightness: 0.7 },
            { name: 'Chertan', ...raDecToCartesian(11.24, 15.4), brightness: 0.6 }
        ],
        connections: [[0, 1], [1, 3], [3, 4], [4, 2], [0, 4]]
    },
    {
        name: 'Virgo',
        symbol: '♍',
        stars: [
            { name: 'Spica', ...raDecToCartesian(13.42, -11.2), brightness: 1.0 },
            { name: 'Zavijava', ...raDecToCartesian(11.84, 1.8), brightness: 0.8 },
            { name: 'Porrima', ...raDecToCartesian(12.69, -1.4), brightness: 0.7 },
            { name: 'Vindemiatrix', ...raDecToCartesian(13.04, 10.9), brightness: 0.6 },
            { name: 'Minelauva', ...raDecToCartesian(12.93, 3.4), brightness: 0.5 }
        ],
        connections: [[1, 2], [2, 4], [4, 3], [2, 0]]
    },
    {
        name: 'Libra',
        symbol: '♎',
        stars: [
            { name: 'Zubeneschamali', ...raDecToCartesian(14.85, -9.4), brightness: 0.9 },
            { name: 'Zubenelgenubi', ...raDecToCartesian(14.85, -16.0), brightness: 0.8 },
            { name: 'Zubenelakrab', ...raDecToCartesian(15.59, -25.3), brightness: 0.6 },
            { name: 'Brachium', ...raDecToCartesian(15.28, -14.8), brightness: 0.5 }
        ],
        connections: [[0, 1], [1, 3], [3, 2]]
    },
    {
        name: 'Scorpio',
        symbol: '♏',
        stars: [
            { name: 'Antares', ...raDecToCartesian(16.49, -26.4), brightness: 1.0 },
            { name: 'Shaula', ...raDecToCartesian(17.56, -37.1), brightness: 0.9 },
            { name: 'Sargas', ...raDecToCartesian(17.62, -43.0), brightness: 0.8 },
            { name: 'Dschubba', ...raDecToCartesian(16.00, -19.8), brightness: 0.7 },
            { name: 'Larawag', ...raDecToCartesian(17.71, -39.0), brightness: 0.6 }
        ],
        connections: [[3, 0], [0, 1], [1, 4], [4, 2]]
    },
    {
        name: 'Sagittarius',
        symbol: '♐',
        stars: [
            { name: 'Kaus Australis', ...raDecToCartesian(18.40, -34.4), brightness: 1.0 },
            { name: 'Nunki', ...raDecToCartesian(18.92, -26.3), brightness: 0.9 },
            { name: 'Ascella', ...raDecToCartesian(19.39, -29.9), brightness: 0.8 },
            { name: 'Kaus Media', ...raDecToCartesian(18.35, -29.8), brightness: 0.7 },
            { name: 'Kaus Borealis', ...raDecToCartesian(18.28, -25.4), brightness: 0.6 }
        ],
        connections: [[4, 3], [3, 0], [0, 1], [1, 2]]
    },
    {
        name: 'Capricorn',
        symbol: '♑',
        stars: [
            { name: 'Deneb Algedi', ...raDecToCartesian(21.78, -16.1), brightness: 0.9 },
            { name: 'Dabih', ...raDecToCartesian(20.35, -14.8), brightness: 0.8 },
            { name: 'Algedi', ...raDecToCartesian(20.29, -12.5), brightness: 0.7 },
            { name: 'Nashira', ...raDecToCartesian(21.67, -16.7), brightness: 0.6 }
        ],
        connections: [[2, 1], [1, 3], [3, 0]]
    },
    {
        name: 'Aquarius',
        symbol: '♒',
        stars: [
            { name: 'Sadalsuud', ...raDecToCartesian(21.52, -5.6), brightness: 0.9 },
            { name: 'Sadalmelik', ...raDecToCartesian(22.10, -0.3), brightness: 0.8 },
            { name: 'Sadachbia', ...raDecToCartesian(22.88, -7.6), brightness: 0.7 },
            { name: 'Skat', ...raDecToCartesian(22.91, -15.8), brightness: 0.6 }
        ],
        connections: [[0, 1], [1, 2], [2, 3]]
    },
    {
        name: 'Pisces',
        symbol: '♓',
        stars: [
            { name: 'Alrisha', ...raDecToCartesian(2.03, 2.8), brightness: 0.8 },
            { name: 'Fum al Samakah', ...raDecToCartesian(23.28, 6.4), brightness: 0.7 },
            { name: 'Revati', ...raDecToCartesian(1.69, 5.5), brightness: 0.6 },
            { name: 'Torcular', ...raDecToCartesian(0.83, 7.9), brightness: 0.5 }
        ],
        connections: [[1, 3], [3, 2], [2, 0]]
    },
    {
        name: 'Ursa Major (Big Dipper)',
        symbol: '🐻',
        stars: [
            { name: 'Dubhe', ...raDecToCartesian(11.06, 61.8), brightness: 1.0 },
            { name: 'Merak', ...raDecToCartesian(11.01, 56.4), brightness: 0.9 },
            { name: 'Phecda', ...raDecToCartesian(11.90, 53.7), brightness: 0.8 },
            { name: 'Megrez', ...raDecToCartesian(12.26, 57.0), brightness: 0.7 },
            { name: 'Alioth', ...raDecToCartesian(12.90, 55.9), brightness: 0.9 },
            { name: 'Mizar', ...raDecToCartesian(13.40, 54.9), brightness: 0.8 },
            { name: 'Alkaid', ...raDecToCartesian(13.79, 49.3), brightness: 0.9 }
        ],
        connections: [[0, 1], [1, 3], [3, 4], [4, 5], [5, 6], [3, 2]]
    },
    {
        name: 'Ursa Minor (Little Dipper)',
        symbol: '🐻‍❄️',
        stars: [
            { name: 'Polaris', ...raDecToCartesian(2.53, 89.3), brightness: 1.0 },
            { name: 'Kochab', ...raDecToCartesian(14.85, 74.2), brightness: 0.9 },
            { name: 'Pherkad', ...raDecToCartesian(15.35, 71.8), brightness: 0.8 },
            { name: 'Yildun', ...raDecToCartesian(17.54, 86.6), brightness: 0.6 },
            { name: 'Urodelus', ...raDecToCartesian(15.73, 77.8), brightness: 0.5 },
            { name: 'Ahfa al Farkadain', ...raDecToCartesian(16.76, 82.0), brightness: 0.4 },
            { name: 'Anwar al Farkadain', ...raDecToCartesian(14.78, 75.8), brightness: 0.4 }
        ],
        connections: [[0, 3], [3, 5], [5, 4], [4, 1], [1, 6], [6, 2], [2, 4]]
    },
    {
        name: 'Orion',
        symbol: '🏹',
        stars: [
            { name: 'Betelgeuse', ...raDecToCartesian(5.92, 7.4), brightness: 1.0 },
            { name: 'Rigel', ...raDecToCartesian(5.24, -8.2), brightness: 1.0 },
            { name: 'Bellatrix', ...raDecToCartesian(5.42, 6.3), brightness: 0.9 },
            { name: 'Mintaka', ...raDecToCartesian(5.53, -0.3), brightness: 0.8 },
            { name: 'Alnilam', ...raDecToCartesian(5.60, -1.2), brightness: 0.9 },
            { name: 'Alnitak', ...raDecToCartesian(5.68, -1.9), brightness: 0.8 },
            { name: 'Saiph', ...raDecToCartesian(5.80, -9.7), brightness: 0.7 },
            { name: 'Meissa', ...raDecToCartesian(5.59, 9.9), brightness: 0.6 }
        ],
        connections: [[0, 2], [2, 7], [7, 3], [3, 4], [4, 5], [5, 6], [6, 1], [1, 4], [0, 4]]
    }
];

/**
 * Class representing constellation system with individual groups for each zodiac constellation.
 */
export class Constellation {
    constructor() {
        this.constellations = constellationData.map(data => ({
            name: data.name,
            symbol: data.symbol,
            stars: data.stars,
            connections: data.connections
        }));
        this.constellationGroups = new Map();
        this.constellationLines = new Map();
        this.constellationLabels = new Map();
        this.constellationGlows = new Map();
        this.constellationColliders = new Map();
        this.showLines = true;
        this.showLabels = true;
        this.activeConstellation = null;
    }

    /**
     * Creates the constellation system group containing all zodiac constellations.
     * @returns {THREE.Group} The group containing all constellations.
     */
    create() {
        const group = new THREE.Group();
        group.name = 'ConstellationSystem';
        
        this.constellations.forEach(constellation => {
            const constellationGroup = new THREE.Group();
            constellationGroup.name = `${constellation.name}Group`;
            
            // Create stars for this constellation
            const starsGroup = this.createConstellationStars(constellation);
            constellationGroup.add(starsGroup);
            
            // Create constellation lines
            const linesGroup = this.createConstellationLines(constellation);
            constellationGroup.add(linesGroup);
            this.constellationLines.set(constellation.name, linesGroup);
            
            // Create constellation label
            const label = this.createConstellationLabel(constellation);
            label.visible = this.showLabels;
            constellationGroup.add(label);
            this.constellationLabels.set(constellation.name, label);
            
            // Create constellation glow effect
            const glow = this.createConstellationGlow(constellation);
            constellationGroup.add(glow);
            this.constellationGlows.set(constellation.name, glow);
            glow.visible = false;
            
            // Create clickable collision object for the constellation
            const collider = this.createConstellationCollider(constellation);
            constellationGroup.add(collider);
            this.constellationColliders.set(constellation.name, collider);
            
            this.constellationGroups.set(constellation.name, constellationGroup);
            group.add(constellationGroup);
        });
        
        return group;
    }

    /**
     * Creates stars for a specific constellation.
     * @param {Object} constellation - The constellation data.
     * @returns {THREE.Group} The group containing the constellation stars.
     */
    createConstellationStars(constellation) {
        const starsGroup = new THREE.Group();
        starsGroup.name = `${constellation.name}Stars`;
        
        constellation.stars.forEach((star) => {
            const starGeometry = new THREE.SphereGeometry(0.5 * star.brightness, 8, 6);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: this.getStarColor(star.brightness),
                transparent: true,
                opacity: 0.8 + 0.2 * star.brightness
            });
            
            const starMesh = new THREE.Mesh(starGeometry, starMaterial);
            starMesh.position.set(star.x, star.y, star.z);
            starMesh.name = star.name;
            starMesh.userData = { 
                constellationName: constellation.name,
                starName: star.name,
                isConstellationStar: true
            };
            
            starsGroup.add(starMesh);
        });
        
        return starsGroup;
    }

    /**
     * Creates connecting lines for a constellation.
     * @param {Object} constellation - The constellation data.
     * @returns {THREE.Group} The group containing the constellation lines.
     */
    createConstellationLines(constellation) {
        const linesGroup = new THREE.Group();
        linesGroup.name = `${constellation.name}Lines`;
        
        constellation.connections.forEach(connection => {
            const star1 = constellation.stars[connection[0]];
            const star2 = constellation.stars[connection[1]];
            
            const lineGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                star1.x, star1.y, star1.z,
                star2.x, star2.y, star2.z
            ]);
            
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x4a90e2,
                transparent: true,
                opacity: 0.6,
                linewidth: 1
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            linesGroup.add(line);
        });
        
        return linesGroup;
    }

    /**
     * Creates a label for a constellation.
     * @param {Object} constellation - The constellation data.
     * @returns {THREE.Sprite} The label sprite.
     */
    createConstellationLabel(constellation) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(`${constellation.symbol} ${constellation.name}`, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(20, 5, 1);
        
        const avgX = constellation.stars.reduce((sum, star) => sum + star.x, 0) / constellation.stars.length;
        const avgY = constellation.stars.reduce((sum, star) => sum + star.y, 0) / constellation.stars.length;
        const avgZ = constellation.stars.reduce((sum, star) => sum + star.z, 0) / constellation.stars.length;
        
        sprite.position.set(avgX, avgY + 10, avgZ);
        sprite.name = `${constellation.name}Label`;
        
        return sprite;
    }

    /**
     * Creates a glow effect for a constellation.
     * @param {Object} constellation - The constellation data.
     * @returns {THREE.Group} The group containing the glow effects.
     */
    createConstellationGlow(constellation) {
        const glowGroup = new THREE.Group();
        glowGroup.name = `${constellation.name}Glow`;
        
        constellation.stars.forEach((star) => {
            const glowGeometry = new THREE.SphereGeometry(1.5 * star.brightness, 16, 12);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x4a90e2,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.set(star.x, star.y, star.z);
            glowGroup.add(glowMesh);
            
            // Add inner glow
            const innerGlowGeometry = new THREE.SphereGeometry(1.0 * star.brightness, 16, 12);
            const innerGlowMaterial = new THREE.MeshBasicMaterial({
                color: 0x6fa8f5,
                transparent: true,
                opacity: 0.5
            });
            
            const innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
            innerGlowMesh.position.set(star.x, star.y, star.z);
            glowGroup.add(innerGlowMesh);
        });
        
        return glowGroup;
    }

    /**
     * Creates an invisible collision object for constellation clicking.
     * @param {Object} constellation - The constellation data.
     * @returns {THREE.Mesh} The collision mesh for the constellation.
     */
    createConstellationCollider(constellation) {
        const positions = constellation.stars.map(star => new THREE.Vector3(star.x, star.y, star.z));
        const box = new THREE.Box3().setFromPoints(positions);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const radius = Math.max(size.x, size.y, size.z) * 0.8;
        const colliderGeometry = new THREE.SphereGeometry(radius, 16, 12);
        const colliderMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            visible: false;
        });
        
        const colliderMesh = new THREE.Mesh(colliderGeometry, colliderMaterial);
        colliderMesh.position.copy(center);
        colliderMesh.name = `${constellation.name}Collider`;
        colliderMesh.userData = {
            isConstellationCollider: true,
            constellationName: constellation.name
        };
        
        return colliderMesh;
    }

    /**
     * Toggles the label and glow for a specific constellation.
     * @param {string} constellationName - The name of the constellation.
     */
    toggleConstellationFocus(constellationName) {
        if (this.activeConstellation) {
            const prevLabel = this.constellationLabels.get(this.activeConstellation);
            const prevGlow = this.constellationGlows.get(this.activeConstellation);
            if (prevLabel) {
                prevLabel.visible = false;
            }
            if (prevGlow) {
                prevGlow.visible = false;
            }
        }
        
        if (this.activeConstellation === constellationName) {
            this.activeConstellation = null;
            const label = this.constellationLabels.get(constellationName);
            if (label) {
                label.visible = this.showLabels;
            }
        } else {
            this.activeConstellation = constellationName;
            const label = this.constellationLabels.get(constellationName);
            const glow = this.constellationGlows.get(constellationName);
            if (label) {
                label.visible = true;
            }
            if (glow) {
                glow.visible = true;
            }
        }
    }

    /**
     * Gets the center position of a constellation.
     * @param {string} constellationName - The name of the constellation.
     * @returns {THREE.Vector3} The center position.
     */
    getConstellationCenter(constellationName) {
        const constellation = this.constellations.find(c => c.name === constellationName);
        if (!constellation) return new THREE.Vector3();
        
        const avgX = constellation.stars.reduce((sum, star) => sum + star.x, 0) / constellation.stars.length;
        const avgY = constellation.stars.reduce((sum, star) => sum + star.y, 0) / constellation.stars.length;
        const avgZ = constellation.stars.reduce((sum, star) => sum + star.z, 0) / constellation.stars.length;
        
        return new THREE.Vector3(avgX, avgY, avgZ);
    }

    /**
     * Gets star color based on brightness.
     * @param {number} brightness - The star brightness (0-1).
     * @returns {number} The color value.
     */
    getStarColor(brightness) {
        if (brightness > 0.9) return 0xffffff;
        if (brightness > 0.7) return 0xffffaa;
        if (brightness > 0.5) return 0xffddaa;
        return 0xffccaa;
    }

    /**
     * Toggles constellation lines visibility.
     */
    toggleLines() {
        this.showLines = !this.showLines;
        this.constellationLines.forEach(linesGroup => {
            linesGroup.visible = this.showLines;
        });
        return this.showLines;
    }

    /**
     * Toggles constellation labels visibility.
     */
    toggleLabels() {
        this.showLabels = !this.showLabels;
        this.constellationLabels.forEach((label, constellationName) => {
            if (this.activeConstellation !== constellationName) {
                label.visible = this.showLabels;
            }
        });
    }

    /**
     * Shows or hides a specific constellation.
     * @param {string} constellationName - The name of the constellation.
     * @param {boolean} visible - Whether to show or hide the constellation.
     */
    setConstellationVisibility(constellationName, visible) {
        const group = this.constellationGroups.get(constellationName);
        if (group) {
            group.visible = visible;
        }
    }

    /**
     * Gets all constellation names.
     * @returns {string[]} Array of constellation names.
     */
    getConstellationNames() {
        return this.constellations.map(c => c.name);
    }

    /**
     * Gets all constellation collider objects for click detection.
     * @returns {THREE.Mesh[]} Array of constellation collider meshes.
     */
    getConstellationColliders() {
        return Array.from(this.constellationColliders.values());
    }

    /**
     * Update method for animation (constellations are typically static).
     */
    update() {
        this.constellations.forEach(constellation => {
            constellation.stars.forEach(star => {
                star.mesh.rotation.y += 0.01;
            });
        });
    }

    /**
     * Disposes of constellation resources.
     */
    dispose() {
        this.constellationGroups.forEach(group => {
            group.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            });
        });
        
        this.constellationGroups.clear();
        this.constellationLines.clear();
        this.constellationLabels.clear();
        this.constellationGlows.clear();
        this.constellationColliders.clear();
    }
}
