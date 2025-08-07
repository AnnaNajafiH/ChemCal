import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore - Ignoring type errors for the OrbitControls import
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Molecule data type definitions
interface Atom {
  type: string;
  position: [number, number, number];
}

interface Molecule {
  atoms: Atom[];
  bonds: [number, number][];
}

interface MoleculeViewerProps {
  formula?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

// Default water molecule
const defaultMolecule: Molecule = {
  atoms: [
    { type: "C", position: [1.4, 0, 0] },       // C1
    { type: "C", position: [0.7, 1.2, 0] },     // C2 (with CH3)
    { type: "C", position: [-0.7, 1.2, 0] },    // C3
    { type: "C", position: [-1.4, 0, 0] },      // C4 (with OH)
    { type: "C", position: [-0.7, -1.2, 0] },   // C5
    { type: "C", position: [0.7, -1.2, 0] },    // C6 (with CH3)
    { type: "O", position: [-2.4, 0, 0] },      // OH oxygen
    { type: "C", position: [1.7, 2.0, 0] },     // CH3 near C2
    { type: "C", position: [1.7, -2.0, 0] },    // CH3 near C6
    { type: "H", position: [2.2, 0.5, 0] },     // H (C1)
    { type: "H", position: [1.7, 2.8, 0.5] },   // H (CH3 C2)
    { type: "H", position: [1.7, 2.8, -0.5] },  // H
    { type: "H", position: [2.4, 1.7, 0] },     // H
    { type: "H", position: [1.7, -2.8, 0.5] },  // H (CH3 C6)
    { type: "H", position: [1.7, -2.8, -0.5] }, // H
    { type: "H", position: [2.4, -1.7, 0] },    // H
    { type: "H", position: [-2.7, 0.5, 0] },    // H (OH)
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],  // Benzene ring
    [1, 7], [5, 8],                                  // Methyl groups
    [3, 6],                                          // OH
    [0, 9],                                          // H
    [7, 10], [7, 11], [7, 12],                       // CH3 Hs
    [8, 13], [8, 14], [8, 15],                       // CH3 Hs
    [6, 16],                                         // OH H
  ]
};


// Atom colors - more vibrant and colorful palette
const atomColors: Record<string, number> = {
  H: 0xffffff,    // Bright white for hydrogen
  O: 0xff5a5a,    // Bright red for oxygen
  C: 0x5a9bff,    // Bright blue for carbon
  N: 0xaa55ff,    // Bright purple for nitrogen
  S: 0xffdd44,    // Bright yellow for sulfur
  P: 0xffaa44,    // Bright orange for phosphorus
  F: 0x33eebb,    // Bright teal for fluorine
  Cl: 0x55ff77,   // Bright green for chlorine
  Br: 0xcc8844,   // Bright brown for bromine
  I: 0xdd55ff,    // Bright purple for iodine
};

// Lighter gray for better visibility
const bondColor = 0xcccccc;

// Helper function to create a bond between atoms
function createBond(start: THREE.Vector3, end: THREE.Vector3, radius: number, color: number): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
  
  // Use MeshStandardMaterial for bonds too
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.1, 
    roughness: 0.3
  });
  
  const cylinder = new THREE.Mesh(geometry, material);

  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  cylinder.position.copy(midpoint);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  return cylinder;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ 
  width = 300, 
  height = 300,
  backgroundColor = "#009094" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;
    
    // Create ambient environment lighting for more realistic reflections
    const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
    scene.add(ambientLight);

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Create renderer with better quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering
    // Note: physicallyCorrectLights is deprecated in newer Three.js versions
    // Use tone mapping instead for better lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    // outputEncoding was renamed to outputColorSpace in newer Three.js
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights for better shininess and highlights
    scene.add(new THREE.AmbientLight(0x505050, 2.5)); // Brighter ambient light
    
    // Add multiple light sources for better highlights
    const light1 = new THREE.PointLight(0xffffff, 1.2);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xeeeeff, 1);
    light2.position.set(-5, -5, 5);
    scene.add(light2);
    
    // Add a spotlight for extra shininess
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.2;
    spotLight.distance = 20;
    scene.add(spotLight);
    
    // Add a directional light from the front
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0, 10);
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Create molecule group
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    // Larger spheres for atoms
    const molecule = defaultMolecule; // Use default molecule

    // Different sized atoms based on type
    molecule.atoms.forEach(({ type, position }) => {
      // Different sizes for different atoms
      let radius = 0.4; // Default larger size
      
      if (type === 'H') {
        radius = 0.25; // Smaller for hydrogen
      } else if (type === 'O') {
        radius = 0.45; // Larger for oxygen
      } else if (type === 'C') {
        radius = 0.4;  // Medium for carbon
      }
      
      const atomGeometry = new THREE.SphereGeometry(radius, 32, 32);
      
      // Use MeshStandardMaterial for more realistic shiny appearance
      const material = new THREE.MeshStandardMaterial({ 
        color: atomColors[type] || 0xaaaaaa,
        metalness: 0.3,           // Slightly metallic look
        roughness: 0.2,           // Very smooth surface (more shiny)
        envMapIntensity: 1.0,     // Reflection intensity
        emissive: new THREE.Color(atomColors[type] || 0xaaaaaa).multiplyScalar(0.15) // Slight glow
      });
      
      const sphere = new THREE.Mesh(atomGeometry, material);
      sphere.position.set(...position);
      moleculeGroup.add(sphere);
    });

    // Add bonds with thicker, nicer-looking cylinders
    molecule.bonds.forEach(([i1, i2]) => {
      const pos1 = new THREE.Vector3(...molecule.atoms[i1].position);
      const pos2 = new THREE.Vector3(...molecule.atoms[i2].position);
      
      // Thicker bonds look better with shiny atoms
      const bond = createBond(pos1, pos2, 0.1, bondColor);
      moleculeGroup.add(bond);
    });

    // Animation function
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (moleculeGroup) {
        moleculeGroup.rotation.y += 0.005;
      }
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [backgroundColor, width, height]);

  return <div ref={containerRef} className="molecule-viewer" />;
};

export default MoleculeViewer;
