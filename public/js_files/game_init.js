//----- THREE IMPORTS
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import doorGLTF from '../THREE/Assets/gltf_files/Door.gltf'
//----- CUSTOM FUNCTION IMPORTS
//----- GSAP IMPORTS
import gsap from 'gsap';

let fadeIn = gsap.timeline()

// Setting up the environment with 'THREE.js' (name of library not a count) assets
// export const init = (item) => {

// All THREE.JS NEEDS AT MINIMUM THESE COMPONENTS:
// scene, camera, renderer (and animate function to actually utilize it), object (including material,mesh, and or textures), light

//--------------------- SCENE SETTINGS -----------------------------------------
const scene = new THREE.Scene();
//--------------------- CAMERA SETTINGS -----------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.set(0, 100, 300);

//--------------------- RENDERER SETTINGS -----------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadow maps
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// enable hdr settings
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 
container.appendChild(renderer.domElement);



//--------------------- ORBIT CONTROL SETTINGS -----------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);

//--------------------- CUSTOM FLOOR SETTINGS-----------------------------------
var floor = new THREE.PlaneBufferGeometry(2000, 2000);
floor.rotateX(- Math.PI / 2);
const shadowFloorMat = new THREE.ShadowMaterial();
shadowFloorMat.opacity = 0.5;

var floorMesh = new THREE.Mesh(floor, shadowFloorMat);
floorMesh.receiveShadow = true;
scene.add(floorMesh);


//--------------------- 3D ASSET LOADER SETTINGS-----------------------------------
const loader = new GLTFLoader();
let doorMain;
let doorFrame;
let loaded = false
loader.load(doorGLTF, (gltf) => {
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    doorMain = gltf.scene.children[1];
    doorFrame = gltf.scene.children[0];
    console.log(doorMain)
    loaded = true;
    scene.add(gltf.scene);
    animate(loaded);
},
    (xhr) => {
        console.log(`${parseInt(xhr.loaded / xhr.total * 100)} % loaded`)
    },
    (err) => {
        console.error('An error occured. Try again later');
    }
)



//--------------------- LIGHT SETTINGS -----------------------------------------
const spotLight = new THREE.SpotLight(0xFFFFFF, 3, 450, 0.9, 1.0, 1.6) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
spotLight.position.set(0, 300, 110)
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
// spotLight.shadow.camera.near = 1.0;
// spotLight.shadow.camera.far = 10000
spotLight.shadow.bias = - 0.00005;

const sphereSize = 20;
const lightHelper = new THREE.SpotLightHelper(spotLight, sphereSize)
scene.add(spotLight)
scene.add(lightHelper)




//------------------ ANIMATE/RUN THE RENDERER ----------------------------
const animate = (loaded) => {
    if (loaded) {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
}


const onWindowResize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

container.addEventListener("resize", onWindowResize);



//============================= GAME CONTROL SECTION ====================================

// -------------------- RAY CAST FOR BUTTON CLICK FUNCTION ------------------
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const GameClick = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;



    raycaster.setFromCamera(mouse, camera);

    // intersects returns array of what is clicked with ray cast
    let intersects = raycaster.intersectObjects(scene.children, true);
    intersects.map(item => {
        if (item.object.name === "DoorMain") {
            gsap.timeline()
                .to(item.object.rotation, { duration: 1, y: 1.4, ease: "circ.inOut" })
                .to(item.object.rotation, { duration: 1, y: 0, ease: "circ.inOut" })
        }
    })

}

window.addEventListener('click', GameClick);