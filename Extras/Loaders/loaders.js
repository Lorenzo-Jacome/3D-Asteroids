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

let renderer = null; let scene = null; let camera = null; let root = null; let orbitControls = null; let pmremGenerator = null
let directionalLight = null; let spotLight = null; let ambientLight = null
const textureEncoding = 'sRGB'
let spaceShip = null;
const mixer = {}
let currentTime = Date.now();
let animation = null;
const mapUrl = '../../images/checker_large.gif'

const asteroideG = {
  obj: '../../models/obj/asteroid/Asteroid_1_LOW_MODEL_.obj',
  mtl: '../../models/obj/asteroid/Asteroid_1_LOW_MODEL_.mtl'

}
const asteroideM = {
  obj: '../../models/obj/asteroid/Asteroid_2_LOW_MODEL_.obj',
  mtl: '../../models/obj/asteroid/Asteroid_2_LOW_MODEL_.mtl'
  
}
const asteroideS = {
  obj: '../../models/obj/asteroid/Asteroid_3_LOW_MODEL_.obj',
  mtl: '../../models/obj/asteroid/Asteroid_3_LOW_MODEL_.mtl'
}

const objModel = {
  obj: '../../models/obj/space.obj',
   map : '../../models/fbx/spaceship/Intergalactic Spaceship_emi.jpg',
   normal : '../../models/fbx/spaceship/Intergalactic Spaceship_nmap_2_Tris.jpg',
   color : '../../models/fbx/spaceship/Intergalactic Spaceship_color_4.jpg',
   specular: '../../models/fbx/spaceship/Intergalactic Spaceship_metalness.jpg',
   ao : '../../models/fbx/spaceship/Intergalactic Spaceship Ao_Blender.jpg'
}

function onError (err) { console.error(err) };

function onProgress (xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100
    // console.log(xhr.target.responseURL, Math.round(percentComplete, 2) + '% downloaded')
  }
}

function setVectorValue (vector, configuration, property, initialValues) {
  if (configuration !== undefined) {
    if (property in configuration) {
      console.log('setting:', property, 'with', configuration[property])
      vector.set(configuration[property].x, configuration[property].y, configuration[property].z)
      return
    }
  }

  console.log('setting:', property, 'with', initialValues)
  vector.set(initialValues.x, initialValues.y, initialValues.z)
}

async function loadObj (objModelUrl, configuration) {
  try {
    const object = await new OBJLoader().loadAsync(objModelUrl.obj, onProgress, onError)
    const texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.color) : null
    const normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null
    const specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null
    const aoMap = objModelUrl.hasOwnProperty('aoMap') ? new THREE.TextureLoader().load(objModelUrl.ao) : null
    console.log(object)

    object.traverse(function (child) {
      if (child.isMesh) {
        child.material.map = texture
        child.material.normalMap = normalMap
        // child.material.specularMap = specularMap

      }
    })

    setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0, 0, 0))
    setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
    setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

    scene.add(object)
  } catch (err) {
    return onError(err)
  }
}

async function loadFBX (fbxModelUrl, configuration) {
  try {
    const map = '../../models/fbx/spaceship/Intergalactic Spaceship_emi.jpg'
    const normal = '../../models/fbx/spaceship/Intergalactic Spaceship_nmap_2_Tris.jpg'
    const color = '../../models/fbx/spaceship/Intergalactic Spaceship_color_4.jpg'
    const specular = '../../models/fbx/spaceship/Intergalactic Spaceship_metalness.jpg'
    const ao = '../../models/fbx/spaceship/Intergalactic Spaceship Ao_Blender.jpg'
    const met = '../../models/fbx/spaceship/Intergalactic Spaceship_metalness.jpg'
    const rough = '../../models/fbx/spaceship/Intergalactic Spaceship_rough.jpg'
    const object = await new FBXLoader().loadAsync(fbxModelUrl)
    const emessive = new THREE.TextureLoader().load(map)
    const nmap = new THREE.TextureLoader().load(normal)
    const cmap = new THREE.TextureLoader().load(color)
    const specmap = new THREE.TextureLoader().load(specular)
    const aomap = new THREE.TextureLoader().load(ao)
    const metal = new THREE.TextureLoader().load(met)
    const roughmap = new THREE.TextureLoader().load(rough)
    let result = object
    spaceShip = result.children[0]
    setVectorValue(spaceShip.position, configuration, 'position', new THREE.Vector3(0, 0, 0))
    setVectorValue(spaceShip.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
    setVectorValue(spaceShip.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

  //   result.animations.forEach(element =>{
  //     mixer[element.name] = new THREE.AnimationMixer(scene).clipAction(element, spaceShip)
  // })
  spaceShip.traverse(function (child) {
    if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial
        child.material.emissiveMap = emessive
        child.material.normalMap = nmap
        child.material.map = cmap
        child.material.emissiveIntensity = 3
        child.material.metalnessMap = metal
        child.material.metalness = 2
        child.material.emissive = {r:1, g:1, b:1}
        child.material.aoMap = aomap
        child.material.roughnessMap = roughmap

        // child.material.specularMap = specmap

    }
  })
  console.log(spaceShip)
  scene.add(spaceShip)
    // animation = 'Intergalactic Spaceship|RetopoGroup2Action.002'
    // mixer[animation].play();
    // console.log(mixer[animation])
    console.log(mixer)
  } catch (err) {
    console.error(err)
  }
}
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


async function loadGLTF (gltfModelUrl, configuration) {
  try {
    const gltfLoader = new GLTFLoader(MANAGER).setDRACOLoader(DRACO_LOADER).setKTX2Loader(KTX2_LOADER.detectSupport(renderer)).setMeshoptDecoder(MeshoptDecoder)
    const result = await gltfLoader.loadAsync(gltfModelUrl)

    let object = result.scene || result.scenes[0]
    object = object.children[0]
    console.log(object)

    console.log(result)

    // setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0, 0, 10))
    // setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1))
    // setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0, 0, 0))

    updateTextureEncoding(object)
    scene.add(object)

  } catch (err) {
    console.error(err)
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
function animate () {
  const now = Date.now()
  const deltat = now - currentTime
  currentTime = now

  if (mixer[animation] && spaceShip) {
    // mixer.update(deltat * 0.001)
    mixer[animation].getMixer().update(deltat * 0.00002)
  }
}

function update () {
  requestAnimationFrame(function () { update() })
  animate()
  // Render the scene
  renderer.render(scene, camera)

  // Update the camera controller
  orbitControls.update()
}

function createScene (canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })

  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height)

  renderer.outputEncoding = THREE.sRGBEncoding
  // renderer.setClearColor(0xffffff)
  renderer.setPixelRatio(window.devicePixelRatio)
  // Create a new Three.js scene
  scene = new THREE.Scene()

  scene.background = new THREE.Color('black')
  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000)
  camera.position.set(0, 5, 50)
  scene.add(camera)

  pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.target.set(0, 0, 0)

  // Create a group to hold all the objects
  root = new THREE.Object3D()

  // Add a directional light to show off the object
  directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(0, 5, 100)

  root.add(directionalLight)

  spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 8, 100)
  root.add(spotLight)

  ambientLight = new THREE.AmbientLight(0xffffff, 1)
  root.add(ambientLight)


  

  scene.add(root)
}

function loadObjects () {
  // load3dModel(asteroideG.obj,asteroideG.mtl,{ position: new THREE.Vector3(-8, 0, 0), scale: new THREE.Vector3(6,6,6), rotation: new THREE.Vector3(0, 1.58, 0) })
  // load3dModel(asteroideM.obj,asteroideM.mtl,{ position: new THREE.Vector3(4, 0, 0), scale: new THREE.Vector3(3, 3, 3), rotation: new THREE.Vector3(0, 1.58, 0) })
  // load3dModel(asteroideS.obj,asteroideS.mtl,{ position: new THREE.Vector3(13, 0, 0), scale: new THREE.Vector3(1, 1, 1), rotation: new THREE.Vector3(0, 1.58, 0) })

  //loadGLTF('../../models/gltf/SpaceShip/ship.glb', { position: new THREE.Vector3(-10, 10, 0), scale: new THREE.Vector3(1, 1, 1), rotation: new THREE.Vector3(0, 3.1415, 0) })

  // loadGLTF('../../models/gltf/chalequito.glb', { position: new THREE.Vector3(10, -4, 0), scale: new THREE.Vector3(5, 5, 5), rotation: new THREE.Vector3(0, 3.1415, 0) })

//   loadFBX('../../models/fbx/Robot/robot_idle.fbx', { position: new THREE.Vector3(0, -4, -20), scale: new THREE.Vector3(0.05, 0.05, 0.05) })
  loadGLTF('../../models/gltf/spaceShip.glb', { position: new THREE.Vector3(0, 2, 30), scale: new THREE.Vector3(1, 1, 1) })
  // loadFBX('../../models/fbx/spaceship/Intergalactic_Spaceship-(FBX 7.4 binary).fbx', { position: new THREE.Vector3(0, 10, -20), scale: new THREE.Vector3(1, 1, 1) })
  // loadObj(objModel,{ position: new THREE.Vector3(0, 10, -20), scale: new THREE.Vector3(1, 1, 1) })
}

function main () {
  const canvas = document.getElementById('webglcanvas')

  createScene(canvas)

  loadObjects()

  update()
}

function resize () {
  const canvas = document.getElementById('webglcanvas')

  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight

  camera.aspect = canvas.width / canvas.height

  camera.updateProjectionMatrix()
  renderer.setSize(canvas.width, canvas.height)
}

window.onload = () => {
  main()
  resize()
}

window.addEventListener('resize', resize, false)
