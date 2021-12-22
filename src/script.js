import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { WEBGL } from "three/examples/jsm/WebGL.js";

import fluidVertexShader from "./shaders/fluid/vertex.glsl";
import fluidFragmentShader from "./shaders/fluid/fragment.glsl";
import gasVertexShader from "./shaders/gas/vertex.glsl";
import gasFragmentShader from "./shaders/gas/fragment.glsl";


// if ( WEBGL.isWebGL2Available() === false ) {

//   document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

// }

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
var scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// default bg canvas color
renderer.setClearColor(0x000000);
//  use device aspect ratio
renderer.setPixelRatio(window.devicePixelRatio);
// set size of canvas within window
renderer.setSize(window.innerWidth, window.innerHeight);

/**
 * Camera
 */
var camera = new THREE.PerspectiveCamera(75,sizes.width / sizes.height, 0.01, 1000);
camera.position.z = 5;
scene.add(camera);

/**
 * Solid Geometry
 */
const solidCubeGeometry = new THREE.BoxGeometry(1.3,1.3,1.3)
const solidCubeMaterial = new THREE.MeshStandardMaterial(
  {
    color: 0xFFFFFF,
    roughness: 0.4,
  }
)
// const solidCubeMaterial = new THREE.MeshBasicMaterial()
const solidCube = new THREE.Mesh(solidCubeGeometry, solidCubeMaterial)
solidCube.position.x = -3
scene.add(solidCube)

/**
 * Fluid Geometry
 */

// Geometry
const fluidGeometry = new THREE.SphereGeometry(1, 128, 128)

// // Material
const fluidMaterial = new THREE.ShaderMaterial({
    vertexShader: fluidVertexShader,
    fragmentShader: fluidFragmentShader,
    uniforms: {
        uMouseDentro: { type: 'bool', value: 'false'},
        uTime: { type: '1f', value: 0 },
        uColor: { type: 'vec3', value: new THREE.Color(0x000000) },
        uColor1: { type: 'vec3', value: new THREE.Color(0xF8F8F8) },
        //uTexture: { value: metallicTexture }
    },
    transparent: true,
    
})


// // Fluid Sphere 
const sphere = new THREE.Mesh(fluidGeometry, fluidMaterial)
scene.add(sphere)


/**
 * Volume Cloud (Gas)
 */

// Texture
const size = 128;
const data = new Uint8Array( size * size * size );

let i = 0;
const scale = 0.05;
const perlin = new ImprovedNoise();
const vector = new THREE.Vector3();

for ( let z = 0; z < size; z ++ ) {

  for ( let y = 0; y < size; y ++ ) {

    for ( let x = 0; x < size; x ++ ) {

      const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
      data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
      i ++;

    }

  }

}

const gasTexture = new THREE.DataTexture3D( data, size, size, size );
gasTexture.format = THREE.RedFormat;
gasTexture.minFilter = THREE.LinearFilter;
gasTexture.magFilter = THREE.LinearFilter;
gasTexture.unpackAlignment = 1;

// Geometry
const gasGeometry = new THREE.BoxGeometry( 1, 1, 1);

// Material
const gasMaterial = new THREE.ShaderMaterial( {
  glslVersion: THREE.GLSL3,
  uniforms: {
    base: { value: new THREE.Color( 0xFFFFFF ) },
    map: { value: gasTexture },
    cameraPos: { value: new THREE.Vector3() },
    threshold: { value: 0.25 },
    opacity: { value: 0.25 },
    range: { value: 0.1 },
    steps: { value: 100 },
    frame: { value: 0 }
  },
  vertexShader: gasVertexShader,
  fragmentShader: gasFragmentShader,
  side: THREE.FrontSide,
  transparent: true
} );

// Mesh
const mesh = new THREE.Mesh( gasGeometry, gasMaterial );
mesh.position.x = 3
mesh.scale.set(2.3,2.3,2.3)
scene.add( mesh );

/**
 * Debug Panel
 */
const parameters = {
  threshold: 0.25,
  opacity: 0.25,
  range: 0.1,
  steps: 100
};

function update() {

  gasMaterial.uniforms.threshold.value = parameters.threshold;
  gasMaterial.uniforms.opacity.value = parameters.opacity;
  gasMaterial.uniforms.range.value = parameters.range;
  gasMaterial.uniforms.steps.value = parameters.steps;

}

const gui = new GUI();
gui.add( parameters, 'threshold', 0, 1, 0.01 ).onChange( update );
gui.add( parameters, 'opacity', 0, 1, 0.01 ).onChange( update );
gui.add( parameters, 'range', 0, 1, 0.01 ).onChange( update );
gui.add( parameters, 'steps', 0, 200, 1 ).onChange( update );

/**
 * Lights
 */
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0)
directionalLight1.position.set(5,5,1)
scene.add(directionalLight1)
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight1)
// scene.add(directionalLightHelper)

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0)
directionalLight2.position.set(-5,-2,5)
scene.add(directionalLight2)
// const directionalLightHelper1 = new THREE.DirectionalLightHelper(directionalLight2)
// scene.add(directionalLightHelper1)


const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight3.position.set(5,-2,5)
scene.add(directionalLight3)
// const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight3)
// scene.add(directionalLightHelper2)
/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const gridHelper = new THREE.GridHelper( 10, 10, 0xFFFFFF,0xFFFFFF);
scene.add( gridHelper );

// Responsive Einstellungen
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock()

function animate() {

  const elapsedTime = clock.getElapsedTime()

  const delta = clock.getDelta();
  // Update controls
  controls.update( delta )

  // Update Solid Cube
  solidCube.rotation.x = elapsedTime * 0.01
  solidCube.rotation.y = elapsedTime * 0.02
  solidCube.rotation.z = elapsedTime * 0.01

  // Update Fluid Sphere
  fluidMaterial.uniforms.uTime.value = elapsedTime

  // Update Gas Sphere
  mesh.material.uniforms.cameraPos.value.copy( camera.position );
  mesh.rotation.y = - performance.now() / 7500;
  
	mesh.material.uniforms.frame.value ++;
  
  /* render scene and camera */
  renderer.render(scene, camera);

  requestAnimationFrame(animate);  

}

animate();
