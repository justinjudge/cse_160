import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

/**
 * Sources:
 * Car Model: https://sketchfab.com/3d-models/mercury-grand-marquis-free-0f9e6281fd6b4c7a8c5c9de957ccf5a5
 * Skybox: https://www.google.com/url?sa=i&url=https%3A%2F%2Fnoirlab.edu%2Fpublic%2Fimages%2Farchive%2Fcategory%2F360pano%2F&psig=AOvVaw2GSPkEAMPQF0TQ3fcnU2pv&ust=1742012086514000&source=images&cd=vfe&opi=89978449&ved=0CBcQjhxqFwoTCIjc1vDaiIwDFQAAAAAdAAAAABAJ
 * Road: https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fstraight-road&psig=AOvVaw2USsxMhn6oQ2FcHk6LxiM_&ust=1742016556804000&source=images&cd=vfe&opi=89978449&ved=0CBcQjhxqFwoTCPixvsHriIwDFQAAAAAdAAAAABAE
 * 
 */

function main() {

  // Draw into Canvas
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  renderer.shadowMap.enabled = true;
  const gui = new GUI();

  // Create a PerspectiveCamera
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 500;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set( 0, 10, 20 );

  // Orbit Controls
  const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

  // Make a Scene
  const scene = new THREE.Scene();

  // Texture Loader
  const loader = new THREE.TextureLoader();

  // SkyBox
  {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      'resources/images/skybox/px.jpg',
      'resources/images/skybox/nx.jpg',
      'resources/images/skybox/py.jpg',
      'resources/images/skybox/ny.jpg',
      'resources/images/skybox/pz.jpg',
      'resources/images/skybox/nz.jpg',
    ]);
    scene.background = texture;
  }

  // Create Plane
  {
    const planeSize = 10;
    const planeHeight = 150;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('resources/images/road.jpg'); // Use the road.jpg texture
    texture.magFilter = THREE.NearestFilter;  // Optional: adjust filtering to avoid blur
    texture.colorSpace = THREE.SRGBColorSpace;

    const planeGeo = new THREE.PlaneGeometry(planeHeight, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -0.5;
    mesh.rotation.z = Math.PI / 2;
    mesh.position.z = 50;
    scene.add(mesh);
}

// Create Plane
{
  const planeSize = 150;
  const planeHeight = 150;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/road.jpg'); // Use the road.jpg texture
  texture.magFilter = THREE.NearestFilter;  // Optional: adjust filtering to avoid blur
  texture.colorSpace = THREE.SRGBColorSpace;

  const planeGeo = new THREE.PlaneGeometry(planeHeight, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI * -0.5;
  mesh.rotation.z = Math.PI / 2;
  mesh.position.z = 50;
  mesh.position.y = -.1;
  scene.add(mesh);
}

  // Directional Light
  const DIR_color = 0xFFFFFF;
  const DIR_intensity = 2;
  const DIR_light = new THREE.DirectionalLight(DIR_color, DIR_intensity);
  DIR_light.position.set(10, 20, 40);
  DIR_light.castShadow = true;
  DIR_light.shadow.camera['near'] = 0.1
  DIR_light.shadow.camera['far'] = 100
  DIR_light.shadow.camera['left'] = 100
  DIR_light.shadow.camera['right'] = -100
  DIR_light.shadow.camera['top'] = -100
  DIR_light.shadow.camera['bottom'] = 100
  DIR_light.target.position.set(0, 0, 0);
  scene.add(DIR_light);

  const helper = new THREE.DirectionalLightHelper( DIR_light );
	//scene.add( helper );

  // Ambient Light
  const AMB_color = 0xFFFFFF;
  const AMB_intensity = .1;
  const AMB_light = new THREE.AmbientLight(AMB_color, AMB_intensity);
  scene.add(AMB_light);

  // Spot Light
  const SPOT1_color = 0xFFFFFF;
  const SPOT1_intensity = 150;
  const SPOT1_light = new THREE.SpotLight(SPOT1_color, SPOT1_intensity);
  SPOT1_light.position.set(2.75, 1, -1);
  //SPOT_light.position.set( 0, 10, 0 );
	SPOT1_light.target.position.set(3, 0, 100 );
  SPOT1_light['angle'] = THREE.MathUtils.degToRad(30);
  SPOT1_light.castShadow = true;
  scene.add(SPOT1_light);
  scene.add(SPOT1_light.target);

  // Spot Light
  const SPOT2_color = 0xFFFFFF;
  const SPOT2_intensity = 100;
  const SPOT2_light = new THREE.SpotLight(SPOT2_color, SPOT2_intensity);
  SPOT2_light.position.set(0.75, 1, -1);
  //SPOT_light.position.set( 0, 10, 0 );
	SPOT2_light.target.position.set(0.75, 0, 100 );
  SPOT2_light['angle'] = THREE.MathUtils.degToRad(30);
  scene.add(SPOT2_light);
  scene.add(SPOT2_light.target);

  {

		const mtlLoader = new MTLLoader();
		mtlLoader.load( 'resources/models/car/untitled.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( 'resources/models/car/untitled.obj', ( root ) => {
        //root.rotation.y = Math.PI;
        //root.position.x = 3.7;
        //root.position.x = 3.7;
        document.addEventListener('keydown', function(event) {
          if (event.key === 'w' || event.key === 'W') {
              // Do something when 'W' is pressed
              console.log("W key was pressed");
              
              root.position.z += .1;
              SPOT2_light.position.z += .1;
              SPOT2_light.target.position.z += .1;
              SPOT1_light.position.z += .1;
              SPOT1_light.target.position.z += .1;
          }
          if (event.key === 's' || event.key === 'W') {
            // Do something when 'W' is pressed
            console.log("W key was pressed");
            
            root.position.z -= .1;
            SPOT2_light.position.z -= .1;
              SPOT2_light.target.position.z -= .1;
              SPOT1_light.position.z -= .1;
              SPOT1_light.target.position.z -= .1;
        }
        });

        root.castShadow = true;
        root.receiveShadow = true;

				scene.add( root );

			} );

		} );

	}

  // BoxGeometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const geometry2 = new THREE.BoxGeometry(10, 20, 10);

  // Array of textures for all sides
  const materials = [
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),
  ];

  // Array of textures for all sides
  const materials2 = [
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')}),
  ];

  // Array of textures for all sides
  const materials3 = [
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/px.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/nx.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/py.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/ny.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/pz.jpg')}),
    new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/skybox/nz.jpg')}),
  ];

  function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // function to make instance of cube given geometry, color and position?
  function makeInstance(geometry, materials, color, x, y, z) {
    
    //const material = new THREE.MeshPhongMaterial({color});
    //const material = new THREE.MeshBasicMaterial( {
    //  map: texture
    //} );

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
   
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
   
    return cube;
  }

  // create list of instances of cubes
  const cubes = [
    //makeInstance(geometry, materials, 0x44aa88,  0, 0, 0),
    //makeInstance(geometry, materials, 0x8844aa, -2, 0, 0),
    //makeInstance(geometry, materials, 0xaa8844,  2, 0, 0),
  ];

  const buildings = [
    //makeInstance(geometry2, materials2, 0xaa8844,  10, 10, -5),
  ]

  {
    const cubeWidth = 10;
    const cubeHeight = 20;
    const cubeDepth = 10;
    const cubeGeo = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDepth);
    const cubeMat = new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building1.jpg')});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set( cubeWidth + 2, cubeHeight / 2, -5 );
		scene.add( mesh );
  }

  {
    const cubeWidth = 7;
    const cubeHeight = 20;
    const cubeDepth = 10;
    const cubeGeo = new THREE.CylinderGeometry(cubeWidth, cubeWidth, cubeHeight);
    const cubeMat = new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building2.jpg')});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set( - cubeWidth - 7, cubeHeight / 2, 20 );
		scene.add( mesh );
  }

  {
    const cubeWidth = 10;
    const cubeHeight = 20;
    const cubeDepth = 10;
    const cubeGeo = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDepth);
    const cubeMat = new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/building3.jpg')});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set( cubeWidth + 2, cubeHeight / 2, 20 );
		scene.add( mesh );
  }

  {
    const sphereRadius = 0.5;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({color: '#fffb00'});

    for (let i = 0; i < 28; i++) {
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(5, sphereRadius, (i - 3) * 5);
        scene.add(mesh);
    }
    for (let i = 0; i < 28; i++) {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(-5, sphereRadius, (i - 3) * 5);
      scene.add(mesh);
  }
  }

  canvas.addEventListener('click', () => {
    if (SPOT1_light.intensity > 0) {
      SPOT1_light.intensity = 0;
      SPOT2_light.intensity = 0;
    } else {
      SPOT1_light.intensity = 100;
      SPOT2_light.intensity = 100;
    }
  });

  // BillBoard Sign Interstate
  const bodyRadiusTop = .4;
	const bodyRadiusBottom = .4;
	const bodyHeight = 8;
	const bodyRadialSegments = 6;
	const bodyGeometry = new THREE.CylinderGeometry(
		bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments );

	const headRadius = bodyRadiusTop * 0.8;
	const headLonSegments = 12;
	const headLatSegments = 5;
	const headGeometry = new THREE.SphereGeometry(
		headRadius, headLonSegments, headLatSegments );

	function makeLabelCanvas( baseWidth, size, name ) {

		const borderSize = 70;
		const ctx = document.createElement( 'canvas' ).getContext( '2d' );
		const font = `${size}px bold sans-serif`;
		ctx.font = font;
		// measure how long the name will be
		const textWidth = ctx.measureText( name ).width;

		const doubleBorderSize = borderSize * 2;
		const width = baseWidth + doubleBorderSize;
		const height = size + doubleBorderSize;
		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// need to set font again after resizing canvas
		ctx.font = font;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';

		ctx.fillStyle = 'green';
		ctx.fillRect( 0, 0, width, height );

		// scale to fit but don't stretch
		const scaleFactor = Math.min( 1, baseWidth / textWidth );
		ctx.translate( width / 2, height / 2 );
		ctx.scale( scaleFactor, 1 );
		ctx.fillStyle = 'white';
		ctx.fillText( name, 0, 0 );

		return ctx.canvas;

	}

	function makePerson( x, y, z, labelWidth, size, name, color ) {

		const canvas = makeLabelCanvas( labelWidth, size, name );
		const texture = new THREE.CanvasTexture( canvas );
		// because our canvas is likely not a power of 2
		// in both dimensions set the filtering appropriately.
		texture.minFilter = THREE.LinearFilter;
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;

		const labelMaterial = new THREE.SpriteMaterial( {
			map: texture,
			transparent: true,
		} );
		const bodyMaterial = new THREE.MeshPhongMaterial( {
			color,
			flatShading: true,
		} );

		const root = new THREE.Object3D();
		root.position.x = x;
    root.position.y = y;
    root.position.z = z;

		const body = new THREE.Mesh( bodyGeometry, bodyMaterial );
		root.add( body );
		body.position.y = bodyHeight / 2;

		// if units are meters then 0.01 here makes size
		// of the label into centimeters.
		const labelBaseScale = 0.01;
		const label = new THREE.Sprite( labelMaterial );
		root.add( label );
		label.position.y = body.position.y * 2.1 + size * labelBaseScale;
    label.position.x -= 2;

		label.scale.x = canvas.width * labelBaseScale;
		label.scale.y = canvas.height * labelBaseScale;

		scene.add( root );
		return root;

	}

	makePerson( 4.75, 0, -20, 500, 100, 'Interstate - 5', 'gray' );
  makePerson( 4.75, 0, 30, 500, 100, 'Interstate - 5', 'gray' );

  function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

  // render function
  function render(time) {
    time *= 0.001;  // convert time to seconds

    if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });
    
    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();