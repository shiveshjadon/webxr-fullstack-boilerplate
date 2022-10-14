import React, { Component } from 'react'
import { extend } from '@react-three/fiber'
import ThreeMeshUI from 'three-mesh-ui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import VRControl from 'three-mesh-ui/examples/utils/VRControl'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import * as THREE from 'three'
import { io } from 'socket.io-client'
import newButton from './Button'

extend(ThreeMeshUI)

let socket = io('localhost:4000')
socket.on("connect", () => {
    console.log(`connected with server ${socket.id}`);
});   
socket.on("disconnect", () => {
    console.log("connection lost with the server!");
}); 

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let scene, camera, renderer, controls, vrControl;
const activeObjs = [];

window.addEventListener( 'load', Init );
window.addEventListener( 'resize', onWindowResize );

//#region mouse interaction setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;
let selectState = false;

let keywords = {};
let posX = -2
let posY = 2

window.addEventListener( 'pointermove', ( event ) => {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'pointerdown', () => {
	selectState = true;
} );

window.addEventListener( 'pointerup', () => {
	selectState = false;
} );

window.addEventListener( 'touchstart', ( event ) => {
	selectState = true;
	mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'touchend', () => {
	selectState = false;
	mouse.x = null;
	mouse.y = null;
} );
//#endregion

class App extends Component{
    constructor(props){
        super(props)
        window.App = this
        this.state = {
        };
    }
    
    componentDidMount() {
        socket.on('hello', (args) => {
          console.log(args);
        })
    }

    render(){
        return(
            <div></div>
        )
    }
}

function Init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x505050 );

    camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 0.02, 100 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT );
    renderer.xr.enabled = true;
    document.body.appendChild( VRButton.createButton( renderer ) );
    document.body.appendChild( renderer.domElement );

    //#region ORBIT CONTROLS
    controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set( 0, 1.6, 0 );
    controls.target = new THREE.Vector3( 0, 1, -1.8 );
    controls.update();
    //#endregion

    //#region ROOM
    const room = new THREE.LineSegments(
        new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
        new THREE.LineBasicMaterial( { color: 0x808080 } )
    );
    const roomMesh = new THREE.Mesh(
      new THREE.BoxGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
      new THREE.MeshBasicMaterial( { side: THREE.BackSide } )
    );
    scene.add( room );
    activeObjs.push(roomMesh);
    //#endregion

    //#region LIGHT
    const hemLight = new THREE.HemisphereLight( 0x808080, 0x606060 );
    scene.add(hemLight);
    //#endregion

    //#region CONTROLLERS
    vrControl = VRControl( renderer, camera, scene );
    scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );
    vrControl.controllers[ 0 ].addEventListener( 'selectstart', () => {
      selectState = true;
    } );
    vrControl.controllers[ 0 ].addEventListener( 'selectend', () => {
      selectState = false;
    } );
    //#endregion

    //#region CONTENT
    activeObjs.push(newButton("Hello World", scene, socket, [0,1.5,-1.8]));
    //#endregion

    renderer.setAnimationLoop(loop);
}

function updateButtons(){
    let intersect;

	if ( renderer.xr.isPresenting ) {
		vrControl.setFromController( 0, raycaster.ray );
		intersect = raycast();
		// Position the little white dot at the end of the controller pointing ray
		if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
	} else if ( mouse.x !== null && mouse.y !== null ) {
		raycaster.setFromCamera( mouse, camera );
		intersect = raycast();
	}
	if ( intersect && intersect.object.isUI ) {
		if ( selectState ) {
            intersect.object.setState( 'selected' );
		} else {
			intersect.object.setState( 'hovered' );
		}
	}

    activeObjs.forEach( ( obj ) => {
		if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {
			obj.setState( 'idle' );
		}
	} );
}

function raycast() {
	return activeObjs.reduce( ( closestIntersection, obj ) => {
		const intersection = raycaster.intersectObject( obj, true );
		if ( !intersection[ 0 ] ) return closestIntersection;
		if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {
			intersection[ 0 ].object = obj;
			return intersection[ 0 ];
		}
		return closestIntersection;
	}, null );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loop() {
    ThreeMeshUI.update();
    controls.update();
    renderer.render(scene,camera);
    updateButtons();
}

export default App