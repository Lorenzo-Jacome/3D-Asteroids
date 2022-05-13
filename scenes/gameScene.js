//12 de mayo
//documento de javascript con el funcionamiento de la escena de juego

import * as THREE from '../libs/three.module.js'
import { OrbitControls } from '../libs/three.js/controls/OrbitControls.js';
import {FBXLoader} from '../libs/three.js/loaders/FBXLoader.js'
import { MTLLoader } from '../libs/three.js/loaders/MTLLoader.js';
import { OBJLoader } from '../libs/three.js/loaders/OBJLoader.js'

// depende lo desarrollado, eliminar el orbitControls
let renderer = null, scene = null, camera = null, orbitControls = null;
let spaceShip = null, laser = null, score = 0;
let asteroideGArray = {};

// para el control de la velocidad del movimiento de la nave
let xSpeed = 2;
let ySpeed = 2;

// control de vidas
let lifesCounter = 3;

//para crear asteroides
const asteroideG = {
    obj: '../models/obj/asteroid/Asteroid_1_LOW_MODEL_.obj',
    mtl: '../models/obj/asteroid/Asteroid_1_LOW_MODEL_.mtl'
  
  }
  const asteroideM = {
    obj: '../models/obj/asteroid/Asteroid_2_LOW_MODEL_.obj',
    mtl: '../models/obj/asteroid/Asteroid_2_LOW_MODEL_.mtl'
    
  }
  const asteroideS = {
    obj: '../models/obj/asteroid/Asteroid_3_LOW_MODEL_.obj',
    mtl: '../models/obj/asteroid/Asteroid_3_LOW_MODEL_.mtl'
  }

let ambientLight = null;

let currentTime = Date.now();

//cargamos background
const spaceMapUrl = "../images/space2.jpeg"

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

// para cargar objetos en la escena
// obtenido del ejemplo del profe
function setVectorValue(vector, configuration, property, initialValues)
{
    if(configuration !== undefined)
    {
        if(property in configuration)
        {
            console.log("setting:", property, "with", configuration[property]);
            vector.set(configuration[property].x, configuration[property].y, configuration[property].z);
            return;
        }
    }

    console.log("setting:", property, "with", initialValues);
    vector.set(initialValues.x, initialValues.y, initialValues.z);
}

// solo funciona para la nave espacial ya que lo guardamos en spaceShip
async function loadFBX(fbxModelUrl, configuration)
{
    try{
        spaceShip = await new FBXLoader().loadAsync(fbxModelUrl);

        setVectorValue(spaceShip.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(spaceShip.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(spaceShip.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        
        scene.add( spaceShip );
    }
    catch(err)
    {
        console.error( err );
    }
}

// esta es para cargar los asteroides, se obtuvo del ejemplo del profe
async function load3dModel (objModelUrl, mtlModelUrl, configuration) {
    try {
      const mtlLoader = new MTLLoader()
  
      const materials = await mtlLoader.loadAsync(mtlModelUrl, onProgress, onError)
  
      materials.preload()
  
      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
  
      const object = await objLoader.loadAsync(objModelUrl, onProgress, onError)
  
      setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0, 0, 0))
      setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
      setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))
  
      scene.add(object)

    } catch (err) {
      console.log('Error loading 3d Model:', err)
    }
  }

function animate()
{
    const now = Date.now();
    const deltat = now - currentTime;
    currentTime = now;
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    renderer.render( scene, camera );

    animate();

    // Update the camera controller, probablemente se elimine
    orbitControls.update();

    //mostrar o eliminar los coreazones de vida
    switch (lifesCounter) {
        case 2:
            document.getElementById("thirdLife").style.display = "none";
            break;
        case 1:
            document.getElementById("thirdLife").style.display = "none";
            document.getElementById("secondLife").style.display = "none";
            break;
        case 0:
            endGame();
            break;
        default:
            break;
    }
}

// funcion de terminar el juego
function endGame(){

}

// cargar todos los objetos a la escena, falta descomentar los asteroides
function loadObjects () {
    load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(40, 20, -200), scale: new THREE.Vector3(3,3,3), rotation: new THREE.Vector3(0, 0, 0) })
    load3dModel(asteroideM.obj,asteroideM.mtl,{ position: new THREE.Vector3(-20, 15, -200), scale: new THREE.Vector3(2, 2, 2), rotation: new THREE.Vector3(0, 0, 0) })
    load3dModel(asteroideS.obj,asteroideS.mtl,{ position: new THREE.Vector3(0, -20, -200), scale: new THREE.Vector3(1, 1, 1), rotation: new THREE.Vector3(0, 0, 0) })
    loadFBX('../models/fbx/spaceship/Intergalactic_Spaceship-(FBX 7.4 binary).fbx', { position: new THREE.Vector3(0, 0, -200), scale: new THREE.Vector3(0.02, 0.02, 0.02),  rotation: new THREE.Vector3(1.5, 3.18, 0)})
  
}

// funcion de prueba para crear asteroidesG, no jalo, preguntar
function create_asteroideG(){
    asteroideGArray[0] = load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(0, 0, -200), scale: new THREE.Vector3(1,1,1), rotation: new THREE.Vector3(0, 0, 0) })
    scene.add(asteroideGArray[0]);
}


function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setSize(canvas.width, canvas.height);

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load(spaceMapUrl)

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 700 );
    camera.position.set(0.01, 0.01, 1);
    scene.add(camera);

    //eliminar en algun momento
    orbitControls = new OrbitControls(camera, renderer.domElement);

    ambientLight = new THREE.AmbientLight ( 0xffffff, 10);

    scene.add( ambientLight );

}

function main()
{
    const canvas = document.getElementById("webGLCanvas");

    createScene(canvas);

    loadObjects();

    update();
}

function resize()
{
    const canvas = document.getElementById("webGLCanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    camera.aspect = canvas.width / canvas.height;

    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
    main();
    resize(); 
};

window.addEventListener('resize', resize, false);

// para controlar el movimiento de la nave espacial
document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 38) {
        spaceShip.position.y += ySpeed;
    } else if (keyCode == 40) {
        spaceShip.position.y -= ySpeed;
    } else if (keyCode == 37) {
        spaceShip.position.x -= xSpeed;
    } else if (keyCode == 39) {
        spaceShip.position.x += xSpeed;
    }
};