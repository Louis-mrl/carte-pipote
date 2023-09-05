import * as THREE from 'three';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from 'gsap';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
const size = {
    w: window.innerWidth,
    h: window.innerHeight
}


function load() {
	gsap.from(canvas,{
		onStart: function() {
			canvas.style.display = "block";
		  },
		y:-size.h,
		duration: 1
	});
}

function change() {
	gsap.to(canvas,{
    y: -size.h,
    duration: 1,
    onComplete() {
		document.location.href="../index.html";
}})}

const menus = []

const config = {
	scene: {
		speed: 0.2
	},
	object: {
		speed: 0.5
	}
};

class Control {
	constructor(props) {
		this.controls = new OrbitControls(props.camera, props.canvas);
		this.init();
	}
	init() {
		this.controls.target.set(0, 0, 0);
		this.controls.rotateSpeed = 0.9;
		this.controls.enableZoom = false;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.02;
		this.update();
	}
	update() {
		this.controls.update();
	}
}


class Menu {
	constructor(props) {
		this.geometry(props.scene, props.angle, props.radius);
	}

	geometry(scene, angle, radius) {
		const L_Mat = new THREE.MeshNormalMaterial();
		const L_Geo = new RoundedBoxGeometry(2, 2, 0.1, 1, 0.05, 1);
		this.L_Object = new THREE.Mesh(L_Geo, L_Mat);
		menus.push(this.L_Object);

		this.L_Object.position.x = Math.cos(angle) * radius;
		this.L_Object.position.z = Math.sin(angle) * radius;

		scene.add(this.L_Object);
	}
}


class Space {
	constructor(props) {
		this.name = props.name || "Null";
		this.canvas = props.canvas || null;
		this.init();
	}
	
	init() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true
		});
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight);
		this.camera.position.set(0, 0, 15);
		this.scene.background = new THREE.Color(0x000a0b);
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(2, 2, 5)
        this.scene.add(light)
		this.control = new Control({ camera: this.camera, canvas: this.canvas });
		this.renderer.shadowMap.enabled = true;
		
		this.menu(6);
		this.createObject();

		
		this.loop();
	}
	
	menu(numObjects) {
		for (let i = 0; i < numObjects; i++) {
			const angle = (i / numObjects) * Math.PI * 2;
			const radius = 5;
			new Menu({
				scene: this.scene,
				angle,
				radius,
			});
		}
	}
	
    createObject() {
        this.loader = new GLTFLoader();
        this.loader.load('../assets/models/viande.glb', (glb) => {
            console.log(glb);
            this.object = glb.scene;
            this.object.scale.set(0.1, 0.1, 0.1);
            this.scene.add(this.object);
            
            
        }, undefined, (error) => {
            console.error('Erreur lors du chargement du modèle 3D', error);
          });
        
    }
    

	
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	render() {
        
        
		this.scene.rotation.y = this.clock.getElapsedTime() * config.scene.speed;
        if(this.object){
            this.object.rotateY(-0.005)
            this.object.rotateZ(0.005)
            this.object.rotateX(0.005)
        }

		for (let plat of menus) {
			plat.lookAt(this.camera.position);
		}

		this.renderer.render(this.scene, this.camera);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.control.update();
	}
	
	loop() {
		this.render();
		requestAnimationFrame(this.loop.bind(this));
	}
}

const canvas = document.querySelector("canvas");
const world = new Space({ canvas });

window.addEventListener("resize", () => world.onWindowResize());
window.addEventListener("load", () => load());
world.onWindowResize();

