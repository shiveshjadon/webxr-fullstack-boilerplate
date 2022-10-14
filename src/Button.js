import * as THREE from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from './Roboto-msdf.json'
import FontImage from './Roboto-msdf.png'

export default function newButton(text, scene, socket, position=[0,1.5,-1.8]) {
    const container = new ThreeMeshUI.Block( {
		justifyContent: 'center',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.045,
		borderRadius: 0.08
	} );

	container.position.set(position[0], position[1], position[2]);
	container.rotation.x = -0.1;
	scene.add(container);

	const buttonOptions = {
		width: 0.4,
		height: 0.11,
		justifyContent: 'center',
		offset: 0.03,
		margin: 0.02,
		borderRadius: 0.065,
        bestFit: 'auto'
	};
    
    const hoveredStateAttributes = {
		state: 'hovered',
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x999999 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	const idleStateAttributes = {
		state: 'idle',
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x666666 ),
			backgroundOpacity: 0.3,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

    const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

    const keywordbutton = new ThreeMeshUI.Block( buttonOptions );
	keywordbutton.add(
		new ThreeMeshUI.Text( { content: text} )
	);

    keywordbutton.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {
            socket.emit('button', text)
            console.log(`~${text} clicked`);
		}
	} );
	keywordbutton.setupState(hoveredStateAttributes);
	keywordbutton.setupState(idleStateAttributes);
    container.add(keywordbutton);

    return keywordbutton;
}