declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher, Object3D, MOUSE, TOUCH, Vector3 } from 'three';

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement | Document;
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };
    mouseButtons: Partial<Record<MOUSE, number>>;
    touches: Partial<Record<TOUCH, number>>;
    target0: Vector3;
    position0: Vector3;
    zoom0: number;

    update(): boolean;
    listenToKeyEvents(domElement: HTMLElement | Window): void;
    saveState(): void;
    reset(): void;
    dispose(): void;
    getAzimuthalAngle(): number;
    getPolarAngle(): number;
    getDistance(): number;
  }
}
