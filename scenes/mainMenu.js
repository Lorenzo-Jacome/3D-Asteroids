import * as THREE from '../libs/three.module.js'

let renderer = null, scene = null, camera = null, root = null;

let directionalLight = null, spotLight = null, ambientLight = null;

let cubes = [];
const badCubes = [];
let score = 0;
let errors = 0;

const mapUrl = "../../images/checker_large.gif";
let currentTime = Date.now();

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
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setSize(canvas.width, canvas.height);
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 15, 125);
    scene.add(camera);
    
    root = new THREE.Object3D;
    
    // directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 1);
    // directionalLight.position.set(0, 5, 100);

    // root.add(directionalLight);
    
    // spotLight = new THREE.SpotLight (0xffffff);
    // spotLight.position.set(0, 8, 100);
    // root.add(spotLight);

    // ambientLight = new THREE.AmbientLight ( 0xffffff, 0.3);
    // root.add(ambientLight);

    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(10, 10);

    let geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4;
    scene.add( mesh );

    scene.add( root );
}


function main()
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

function resize()
{
    const canvas = document.getElementById("webglcanvas");

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
