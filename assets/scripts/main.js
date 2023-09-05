import * as THREE from 'three';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from 'gsap';

const size = {w : window.innerWidth, h: window.innerHeight}
const menus_content = ["assets/img/burger.png", "assets/img/grill.png", "assets/img/boissons.png", "assets/img/fondue.png", "assets/img/salade.png", "assets/img/flam.png"]
const links = ["/burger/index.html", "/grill/index.html", "/boissons/index.html", "/foundue/index.html", "/salade/index.html", "/flam/index.html"]

function load() {
	gsap.from(canvas,{
		onStart: function() {
			canvas.style.display = "block";
		  },
		y:-size.h,
		duration: 1
	});
}

function change(url) {
	gsap.to(canvas,{
    y: -size.h,
    duration: 1,
    onComplete() {
		document.location.href=url;
}})}

let prevMousePos = {x: 0, y: 0}
const menus = []

var pos_cube = 0

const texture = {
	matcap: "../assets/textures/matcap.avif",
	skin: "../assets/textures/skin.avif",
	env: "../assets/textures/env.avif"
};

const config = {
	scene: {
		speed: 0.0
	},
	object: {
		speed: 0.2
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
		this.geometry(props.scene, props.angle, props.radius, props.i);
		
	}

	geometry(scene, angle, radius, i) {
		
		const L_Mat = new THREE.MeshStandardMaterial({
			map: new THREE.TextureLoader().load(menus_content[i])
		  });
		const L_Geo = new RoundedBoxGeometry(2, 2, 0.1, 1, 0.05, 1);
		this.L_Object = new THREE.Mesh(L_Geo, L_Mat);
		menus.push(this.L_Object);

		this.L_Object.position.x = Math.cos(angle) * radius;
		this.L_Object.position.z = Math.sin(angle) * radius;

		scene.add(this.L_Object);
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
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
		this.control = new Control({ camera: this.camera, canvas: this.canvas });
		this.renderer.shadowMap.enabled = true;
		
		this.menu(6);
		this.createObject();
		
		this.canvas.addEventListener("mousedown", this.onCanvasMouseDown.bind(this));
		this.canvas.addEventListener("mouseup", this.onCanvasMouseUp.bind(this));
		
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
				i
			});
		}
	}
	
	createObject() {
		const o_Geo = new RoundedBoxGeometry(1, 1, 1, 5, 0.05);
		const o_Mat = new THREE.MeshMatcapMaterial({
			color: 0xffffff,
			matcap: new THREE.TextureLoader().load(texture.matcap),
			map: new THREE.TextureLoader().load(texture.env)
		});
		
		this.Object = new THREE.Mesh(o_Geo, o_Mat);
		this.scene.add(this.Object);
	}
	
	onCanvasMouseDown(event) {
		event.preventDefault();
		prevMousePos = { x: event.clientX, y: event.clientY };
	}
	
	onCanvasMouseUp(event) {
		event.preventDefault();
		const deltaX = Math.abs(event.clientX - prevMousePos.x);
		const deltaY = Math.abs(event.clientY - prevMousePos.y);
		
		if (deltaX <= window.innerWidth * 0.03 && deltaY <= window.innerHeight * 0.03) {
			this.onCanvasClick(event);
		}
	}

	onCanvasClick() {
        // Convertir les coordonnées de la souris en coordonnées normalisées
        this.mouse = new THREE.Vector2(prevMousePos.x / window.innerWidth * 2 - 1, -prevMousePos.y / window.innerHeight * 2 + 1);

        // Mettre à jour le rayon du raycaster en fonction de la position de la caméra et de la souris
        this.raycaster = new THREE.Raycaster();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Trouver tous les objets intersectés par le rayon
        const intersects = this.raycaster.intersectObjects(menus);

        if (intersects.length > 0) {
			const clickedObject = intersects[0].object; // Objet 3D cliqué
			const objectIndex = menus.indexOf(clickedObject); // Index de l'objet dans le tableau menus
			if (objectIndex !== -1) {
				const linkToRedirect = links[objectIndex];
				
				change(linkToRedirect)
			}
    	}
	}
	
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	render() {
		this.scene.rotation.y = this.clock.getElapsedTime() * config.scene.speed;
		this.Object.rotation.y = -this.clock.getElapsedTime() * config.scene.speed;
		this.Object.rotation.z = this.clock.getElapsedTime() * config.scene.speed;
		this.Object.rotation.x = this.clock.getElapsedTime() * config.scene.speed;
		
		this.Object.position.y = pos_cube;

		for (let plat of menus) {
			plat.lookAt(this.camera.position);
		}

		this.renderer.render(this.scene, this.camera);
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