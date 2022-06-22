//12 de mayo
//documento de javascript con el funcionamiento de la escena de juego
import * as THREE from '../../libs/three.js/three.module.js'
import { OBJLoader } from '../../libs/three.js/loaders/OBJLoader.js'
import { MTLLoader } from '../../libs/three.js/loaders/MTLLoader.js'
import { GLTFLoader } from '../../libs/three.js/loaders/GLTFLoader.js'
import { KTX2Loader } from '../../libs/three.js/loaders/KTX2Loader.js'
import { DRACOLoader } from '../../libs/three.js/loaders/DRACOLoader.js'
import { MeshoptDecoder } from '../../libs/three.js/libs/meshopt_decoder.module.js'

const MANAGER = new THREE.LoadingManager()
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath('../../libs/three.js/libs/draco/gltf')
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath('../../libs/three.js/libs/basis/')

let renderer = null, scene = null, camera = null, score = 0, lifesCounter = 3, mouse = new THREE.Vector2(), ambientLight = null;// variables de escena
let shipGroup = null, spaceShip = null, cameraGroup = null, cross = null, ySpeed = 2;                                           // variables de la nave
let loopAnimation = true, bullet = [], bulletBase = null, bulletEnd = [], bulletDuration = 25;                                  // variables de balas
let asteroidG = null, asteroideGArray = [];                                                                                     // variables de asteroides
let tamanios = {"grande":new THREE.Vector3(6,6,6), "mediano":new THREE.Vector3(2,2,2), "chico":new THREE.Vector3(1,1,1)};       
let scores = {"grande":50, "mediano":75, "chico":100};                                                       
const speed = .09;                   
let ambientListener = null, sound = null, shotS = null, collS = null, astS = null;                                              // variables de sonido
const textureEncoding = 'sRGB'                                                                                                  // variables de loaders

// para crear asteroides
const asteroideG = {
    obj: '../models/obj/asteroid/Asteroid_1_LOW_MODEL_.obj',
    mtl: '../models/obj/asteroid/Asteroid_1_LOW_MODEL_.mtl'
  
  }
// para sonido
const ambientSound = '../sound/ambient.mp3'
const shotSound = '../sound/shot.mp3'  
const collSound = '../sound/collision.mp3'
const astSound = '../sound/asteroid.mp3'

const mixer = {}                                                                                                                // si no se usa, eliminar

let currentTime = Date.now();

// para cargar objetos en la escena
function setVectorValue(vector, configuration, property, initialValues){
    if(configuration !== undefined)
    {
        if(property in configuration)
        {
            //console.log("setting:", property, "with", configuration[property]);
            vector.set(configuration[property].x, configuration[property].y, configuration[property].z);
            return;
        }
    }

    //console.log("setting:", property, "with", initialValues);
    vector.set(initialValues.x, initialValues.y, initialValues.z);
}

// cargar nave espacial
async function loadGLTF (gltfModelUrl, configuration) {
  try {
    const gltfLoader = new GLTFLoader(MANAGER).setDRACOLoader(DRACO_LOADER).setKTX2Loader(KTX2_LOADER.detectSupport(renderer)).setMeshoptDecoder(MeshoptDecoder)
    const result = await gltfLoader.loadAsync(gltfModelUrl)

    spaceShip = result.scene || result.scenes[0]
    spaceShip = spaceShip.children[0]

     setVectorValue(spaceShip.position, configuration, 'position')
     setVectorValue(spaceShip.scale, configuration, 'scale')
     setVectorValue(spaceShip.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

    updateTextureEncoding(spaceShip)
    shipGroup.add(spaceShip)

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

    let object = await objLoader.loadAsync(objModelUrl)

    setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0, 0, 0))
    setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
    setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))
    object = getRandomProperties(object)
    scene.add(object)
    //console.log(object.position)
    asteroideGArray.push(object)
    return object

  } catch (err) {
    console.log('Error loading 3d Model:', err)
  }
}

// necesaria para los loaders
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

// necesaria para los loaders
function traverseMaterials (object, callback) {
  object.traverse((node) => {
    if (!node.isMesh) return
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material]
    materials.forEach(callback)
  })
}

  // para crear la base de una bala
function create_bullet_base(){
  //const geometry = new THREE.CapsuleGeometry( 1, 5, 1, 10 );
  const geometry = new THREE.ConeGeometry( 2, 8, 6 );
  const material = new THREE.MeshBasicMaterial({ color:0x00ff00 });
  bulletBase = new THREE.Mesh( geometry,material );
  bulletBase.scale.set(0.5, 0.5, 0.5)
}

// crea un asteroide, es llamada en interval
function createAsteroids(){
  let copia = asteroidG.clone()
  copia = getRandomProperties(copia)
  scene.add(copia)
  asteroideGArray.push(copia)
}

// funcion que anima todos los objetos en la escena
function animate () {
  const now = Date.now()
  const deltat = now - currentTime
  currentTime = now

  // para evitar errores al inicio
  if (asteroideGArray.length != 0 && spaceShip != null) {
    collisionWithAsteroides(deltat)
  }

  // solo si balas existen
  if (bullet.length != 0){
    bulletUpdate();
    KF.update();
    deleteBullet();
  }
    
}

// revisa desde los asteroides que no choquen con ellos las balas, ni la nave
function collisionWithAsteroides(deltat){

  for (const object of asteroideGArray){
    object.translateZ(speed*deltat)
    let shipBox = new THREE.Box3().setFromObject(spaceShip)
    let astBox = new THREE.Box3().setFromObject(object)
    if (astBox.intersectsBox(shipBox)){
      if(collS.isPlaying){
        collS.stop()
      }
      collS.play();
      
      //console.log("Collision")
      remScore(object)
    }
    for (const bull of bullet){
      let bulletBox = new THREE.Box3().setFromObject(bull)
      if (astBox.intersectsBox(bulletBox)){
        if(astS.isPlaying){
          astS.stop();
        }
        astS.play();
        addScore(object)
      }
    }
  }

}

// agrega a score y elimina asteroide de arreglo y escena
function addScore(asteroid) {
  let mySize = asteroid.tamanio
  score += scores[mySize]
  //console.log(mySize)
  document.getElementById("scoreText").innerText=`Score: ${score.toString()}`;
  //console.log(score)
  
  const indx = asteroideGArray.indexOf(asteroid)
  asteroideGArray.splice(indx,1)
  scene.remove(asteroid)
}

// resta a score y elimina asteroide de arreglo y escena
function remScore(object){
  const indx = asteroideGArray.indexOf(object)
  asteroideGArray.splice(indx,1)
  scene.remove(object)
  lifesCounter -= 1
  reviewLifes()
}

// genera propuedades random de un asteroide
function getRandomProperties(asteroid){
  const sizePick = Math.floor(Math.random() * 3)
  const mySize = Object.keys(tamanios)[sizePick]
  //console.log(tamanios[mySize])
  setVectorValue(asteroid.scale, tamanios, mySize)
  asteroid["tamanio"] = mySize
  let shipPos = shipGroup.position
  const minimo = 20;
  const maximo = 60;
  let posY = Math.random() * (maximo - (minimo)) + minimo
  let posX = Math.random() * (maximo - (minimo)) + minimo
  let posZ = Math.random() * (maximo - (minimo)) + minimo
  const sx = Math.floor(Math.random() * 2)
  const sy = Math.floor(Math.random() * 2)
  const sz = Math.floor(Math.random() * 2)
  sx ? posX : posX *= -1
  sy ? posY : posY *= -1
  sz ? posZ : posZ *= -1
  posX = posX + shipPos.x
  posY = posY + shipPos.y
  posZ = posZ + shipPos.z
  asteroid.position.set(posX,posY,posZ)
  asteroid.rotation.set(posX,posY,posZ)
  //console.log(asteroid.scale)
  return asteroid;
}

// elimina las balas que llegan a su destino maximo
function deleteBullet(){
  for(let i = 0; i < bullet.length; i++){
    if (Math.abs(bullet[i].position.x - bulletEnd[i].x) < 1 && 
    Math.abs(bullet[i].position.y == bulletEnd[i].y) < 1 &&
    Math.abs(bullet[i].position.z == bulletEnd[i].z) < 1 ){
        bullet[0].parent.remove(bullet[0])
        //console.log("delete bullet")
        bullet.shift();
        bulletEnd.shift();
      }
  }
}

// mostrar o eliminar los coreazones de vida
function reviewLifes(){
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

// funcion que actualiza
function update(){

  requestAnimationFrame(function() { update(); });

  renderer.render( scene, camera );
  
  mouseMovement();

  animate();
    
}

function mouseMovement(){

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
  window.location.replace("http://127.0.0.1:5500/scenes/gameOver.html");
  localStorage.setItem("score", score);
}

// cargar todos los objetos a la escena, falta descomentar los asteroides
async function loadObjects () {
  loadGLTF('../../models/gltf/spaceShip.glb', { position: new THREE.Vector3(0, 0, 0), scale: new THREE.Vector3(0.015, 0.015, 0.015),  rotation: new THREE.Vector3((Math.PI * 1.5), (Math.PI * 1), 0)})   
  asteroidG = await load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(40, 10, -30), scale: new THREE.Vector3(3,3,3), rotation: new THREE.Vector3(0, 0, 0) })
  create_bullet_base()
  //console.log(asteroidG)
}
function timeOutAsteroid(){
  let asteroid = asteroideGArray.shift();
  scene.remove(asteroid)
}


function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    setInterval(createAsteroids, 500)
    setInterval(timeOutAsteroid, 2000)
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


    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 2000 );
    camera.position.set(0.01, 10, 100);
    camera.rotation.x -= 0.1;

    // Audios
    ambientListener = new THREE.AudioListener();
    camera.add(ambientListener)
    sound = new THREE.Audio(ambientListener)
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(ambientSound, function(buffer){
      sound.setBuffer(buffer)
      sound.setLoop(true)
      sound.setVolume(0.5)
      sound.play()
    })

    shotS = new THREE.Audio(ambientListener);
    audioLoader.load(shotSound, function(buffer){
      shotS.setBuffer(buffer)
      shotS.setLoop(false)
      shotS.setVolume(0.3)
    })

    collS = new THREE.Audio(ambientListener);
    audioLoader.load(collSound, function(buffer){
      collS.setBuffer(buffer)
      collS.setLoop(false)
      collS.setVolume(0.6)
    })
    astS = new THREE.Audio(ambientListener);
    audioLoader.load(astSound, function(buffer){
      astS.setBuffer(buffer)
      astS.setLoop(false)
      astS.setVolume(0.2)
    })
    


    cameraGroup = new THREE.Object3D;
    cameraGroup.position.set(0,0,0);
    cameraGroup.add(camera) 

    create_gun_sight();

    //orbitControls = new OrbitControls(camera, renderer.domElement)
    //eliminar en algun momento

    ambientLight = new THREE.AmbientLight ( 0xffffff, 10);

    scene.add( ambientLight );

    shipGroup = new THREE.Object3D;
    shipGroup.add(cameraGroup)
    shipGroup.position.set(0, 0, 0)
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
  let targetVector = new THREE.Vector3();
  cross.getWorldPosition( targetVector );
  bulletNew.name = bullet.length;
  bulletNew.position.set(shipGroup.position.x, shipGroup.position.y, shipGroup.position.z);
  bulletNew.rotation.set(shipGroup.rotation.x, shipGroup.rotation.y, shipGroup.rotation.z);

  bulletEnd.push( targetVector )

  scene.add(bulletNew)
  bullet.push(bulletNew)
}

function bulletUpdate(){
  let counter = 0;
  for (const oneBullet of bullet) {
    let bulletAnimator = new KF.KeyFrameAnimator;
    bulletAnimator.init({
      interps:
      [
        {
          keys:[0, 1],
          values:[
            { x: oneBullet.position.x, y: oneBullet.position.y ,z: oneBullet.position.z },
            bulletEnd[counter]
          ],
          target:oneBullet.position
        }
      ],
      loop: loopAnimation,
      duration: bulletDuration,
    })
    bulletAnimator.start();
    counter ++;
  }
}

function create_gun_sight(){
  const geometry = new THREE.OctahedronGeometry(4, 0)
  cross = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xFF0000 } ) );
  cross.position.set(0, 0, -500);
  cameraGroup.add(cross)
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
      //console.log(shotS)
      if (shotS.isPlaying){
        shotS.stop()
      }
      shotS.play();
      
      throwBullet()
    }
};

const onDocumentPointerDown = (event) =>{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //console.log(mouse.x); 
}
