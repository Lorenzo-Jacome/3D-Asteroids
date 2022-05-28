//12 de mayo
//documento de javascript con el funcionamiento de la escena de juego
import * as THREE from '../../libs/three.js/three.module.js'
import { OrbitControls } from '../../libs/three.js/controls/OrbitControls.js'
import { OBJLoader } from '../../libs/three.js/loaders/OBJLoader.js'
import { MTLLoader } from '../../libs/three.js/loaders/MTLLoader.js'
import { FBXLoader } from '../../libs/three.js/loaders/FBXLoader.js'
import { GLTFLoader } from '../../libs/three.js/loaders/GLTFLoader.js'
import { KTX2Loader } from '../../libs/three.js/loaders/KTX2Loader.js'
import { DRACOLoader } from '../../libs/three.js/loaders/DRACOLoader.js'
import { MeshoptDecoder } from '../../libs/three.js/libs/meshopt_decoder.module.js'

const MANAGER = new THREE.LoadingManager()
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath('../../libs/three.js/libs/draco/gltf')
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath('../../libs/three.js/libs/basis/')

// depende lo desarrollado, eliminar el orbitControls
let renderer = null, scene = null, camera = null, orbitControls = null;
let spaceShip = null, laser = null, score = 0, shipGroup = null, cameraGroup = null;
let animation = null, bullet = [], bulletBase = null;
let asteroideGArray = {};
const textureEncoding = 'sRGB'
const stars = '../images/stars.jpg'

// para el control de la velocidad del movimiento de la nave
let xSpeed = 2;
let ySpeed = 2;
let zSpeed = 2;

// control de vidas
let lifesCounter = 3;

//Crear mouse:
let mouse = new THREE.Vector2();

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
const mixer = {}
let currentTime = Date.now();

//cargamos background
const spaceMapUrl = "../images/space2.jpeg"



// para cargar objetos en la escena
// obtenido del ejemplo del profe
function setVectorValue(vector, configuration, property, initialValues)
{
    if(configuration !== undefined)
    {
        if(property in configuration)
        {
            //console.log("setting:", property, "with", configuration[property]);
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
  console.log("imprimiendo en consola ahora")
  console.log(fbxModelUrl)
    try{
        let object = await new FBXLoader().loadAsync(fbxModelUrl);
        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        
        scene.add(object)
    }
    catch(err)
    {
        console.error( err );
    }
}

async function loadGLTF (gltfModelUrl, configuration) {
  try {
    const gltfLoader = new GLTFLoader(MANAGER).setDRACOLoader(DRACO_LOADER).setKTX2Loader(KTX2_LOADER.detectSupport(renderer)).setMeshoptDecoder(MeshoptDecoder)
    const result = await gltfLoader.loadAsync(gltfModelUrl)

    spaceShip = result.scene || result.scenes[0]
    spaceShip = spaceShip.children[0]
    //console.log(object)

    //console.log(result)
     setVectorValue(spaceShip.position, configuration, 'position')
     setVectorValue(spaceShip.scale, configuration, 'scale')
     setVectorValue(spaceShip.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

    updateTextureEncoding(spaceShip)
    shipGroup.add(spaceShip)

  } catch (err) {
    console.error(err)
  }
}

async function loadGLTFBullet (gltfModelUrl, configuration) {
  try {
    const gltfLoader = new GLTFLoader(MANAGER).setDRACOLoader(DRACO_LOADER).setKTX2Loader(KTX2_LOADER.detectSupport(renderer)).setMeshoptDecoder(MeshoptDecoder)
    const result = await gltfLoader.loadAsync(gltfModelUrl)

    bulletBase = result.scene || result.scenes[0]
    bulletBase = bulletBase.children[0]

    //console.log(result)
     setVectorValue(bulletBase.position, configuration, 'position')
     setVectorValue(bulletBase.scale, configuration, 'scale')
     setVectorValue(bulletBase.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

    updateTextureEncoding(bulletBase)

    //scene.add(bulletBase)

  } catch (err) {
    console.error(err)
  }
}

// esta es para cargar los asteroides, se obtuvo del ejemplo del profe
async function load3dModel (objModelUrl, mtlModelUrl, configuration) {
    try {
      const mtlLoader = new MTLLoader()
  
      const materials = await mtlLoader.loadAsync(mtlModelUrl)
  
      materials.preload()
  
      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
  
      const object = await objLoader.loadAsync(objModelUrl)
  
      setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0, 0, 0))
      setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
      setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))
  
      scene.add(object)

    } catch (err) {
      console.log('Error loading 3d Model:', err)
    }
  }

  function animate () {
    const now = Date.now()
    const deltat = now - currentTime
    currentTime = now

    if (mixer[animation] && spaceShip) {
     mixer.update(deltat * 0.001)
     mixer[animation].getMixer().update(TextureEndeltat * 0.00002)
    }
}
function updateTextureEncoding (object) {
    const encoding = textureEncoding === 'sRGB'
      ? THREE.sRGBEncoding
      : THREE.LinearEncoding
    traverseMaterials(object, (material) => {
      if (material.map) material.map.encoding = encoding
      if (material.emissiveMap) material.emissiveMap.encoding = encoding
      if (material.map || material.emissiveMap) material.needsUpdate = true
    })
  }
  
  function traverseMaterials (object, callback) {
    object.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material]
      materials.forEach(callback)
    })
  }

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    renderer.render( scene, camera );

    animate();

    //console.log("posicion en x: "+shipGroup.rotation.x)
    //console.log("posicion en y: "+shipGroup.rotation.y)
    //console.log("posicion en z: "+shipGroup.rotation.z)

    // Update the camera controller, probablemente se elimine
    //orbitControls.update();

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

  if(mouse.x > 0.1 || mouse.x < -0.1){
      //console.log(mouse.x);
      shipGroup.rotation.y -= (mouse.x / 80);
  }

  if(mouse.y > 0.1 || mouse.y < -0.1){
      //console.log(mouse.x);
      shipGroup.rotation.x += (mouse.y / 80);
  }
    
}

// funcion de terminar el juego
function endGame(){

}

// cargar todos los objetos a la escena, falta descomentar los asteroides
function loadObjects () {
     load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(40, 20, -100), scale: new THREE.Vector3(3,3,3), rotation: new THREE.Vector3(0, 0, 0) })
     load3dModel(asteroideM.obj,asteroideM.mtl,{ position: new THREE.Vector3(-20, 15, -100), scale: new THREE.Vector3(2, 2, 2), rotation: new THREE.Vector3(0, 0, 0) })
     load3dModel(asteroideS.obj,asteroideS.mtl,{ position: new THREE.Vector3(0, -20, -100), scale: new THREE.Vector3(1, 1, 1), rotation: new THREE.Vector3(0, 0, 0) })
     loadGLTFBullet('../../models/fbx/bullet/SA_45ACP_Example.glb',{ position: new THREE.Vector3(0, 10, -150), scale: new THREE.Vector3(5, 5, 5),  rotation: new THREE.Vector3(0, 0, 0)})
     loadGLTF('../../models/gltf/spaceShip.glb', { position: new THREE.Vector3(0, 0, -100), scale: new THREE.Vector3(0.02, 0.02, 0.02),  rotation: new THREE.Vector3((Math.PI * 1.5), (Math.PI * 1), 0)})

}

// funcion de prueba para crear asteroidesG, no jalo, preguntar20
function create_asteroideG(){
    asteroideGArray[0] = load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(0, 0, -200), scale: new THREE.Vector3(1,1,1), rotation: new THREE.Vector3(0, 0, 0) })
    scene.add(asteroideGArray[0]);
}


function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setSize(canvas.width, canvas.height);

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //creamos texturas de skybox
    scene = new THREE.Scene();
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load ([
      '../images/cubemap/opcion1/rightImage.png',
      '../images/cubemap/opcion1/leftImage.png',
      '../images/cubemap/opcion1/upImage.png',
      '../images/cubemap/opcion1/downImage.png',
      '../images/cubemap/opcion1/backImage.png',
      '../images/cubemap/opcion1/frontImage.png',
    ]);

    scene.background = texture;


    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 700 );
    camera.position.set(0.01, 20, 30);

    
    cameraGroup = new THREE.Object3D;
    cameraGroup.position.set(0.01, 10, 2);
    //camera.lookAt(0, 0, 0)
    cameraGroup.add(camera) 


    //orbitControls = new OrbitControls(camera, renderer.domElement)
    //eliminar en algun momento

    ambientLight = new THREE.AmbientLight ( 0xffffff, 10);

    scene.add( ambientLight );

    shipGroup = new THREE.Object3D;
    shipGroup.add(cameraGroup)
    scene.add( shipGroup )

    loadObjects();

    //MOUSE TEST:
    document.addEventListener('pointermove', onDocumentPointerDown);
}

function main()
{
    const canvas = document.getElementById("webGLCanvas");

    createScene(canvas);

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

//lanzar balas, falta arreglar el tema de la direccion de las balas
function throwBullet(){
  let bulletNew = bulletBase.clone();
  bulletNew.name = bullet.length;
  bulletNew.position.set(shipGroup.position.x, shipGroup.position.y+5, shipGroup.position.z-100);
  bulletNew.rotation.set(shipGroup.rotation.x, shipGroup.rotation.y, shipGroup.rotation.z)
  bullet.push(bulletNew)
  scene.add(bulletNew)
  //console.log("posicion en x shipGroup: "+shipGroup.position.x)
  //console.log("posicion en y shipGroup: "+shipGroup.position.y)
  //console.log("posicion en z shipGroup: "+shipGroup.position.z)
  //console.log("posicion en x spaceShip: "+spaceShip.position.x)
  //console.log("posicion en y spaceShip: "+spaceShip.position.y)
  //console.log("posicion en z spaceShip: "+spaceShip.position.z)
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    //w, hacia delante
    if (keyCode == 38 || keyCode == 87) {
        shipGroup.translateZ(-ySpeed);
    //S, hacia abajo
    } else if (keyCode == 40 || keyCode == 83) {
        shipGroup.translateZ(ySpeed);
    //A, izquierda
    } else if (keyCode == 65 || keyCode == 37) {
        //shipGroup.position.x -= xSpeed;
        shipGroup.rotation.z += 0.1;
    //D, derecha
    } else if (keyCode == 39 || keyCode == 68) {
        //shipGroup.position.x += xSpeed;
        shipGroup.rotation.z -= 0.1;
    } else if (keyCode == 32){
      throwBullet()
    }
};

const onDocumentPointerDown = (event) =>{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //console.log(mouse.x); 
}

const shipMovementHandler = (xRot, yRot, zRot, direction) => {
  
};
