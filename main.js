const NBulbs = 50;
var camera, scene, renderer;
var geometry, material, sphere;
var controls;
var url = "http://192.168.0.101:43333";

var method = "POST";
var postData = "";

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
var async = true;

var ledIndexes = [34, 4, 38, 5, 20,
	28, 11, 33, 45, 14, //10
	44, 15, 1, 39, 21,
	32, 27, 10, 49, 6, //20
	43, 35, 3, 37, 22,
	19, 29, 16, 48, 40, //30
	0, 30, 12, 9, 46,
	13, 31, 7, 2, 36,//40
	23, 42, 26, 18, 47,
	17, 24, 41, 8, 25
];
const textWidth = ctx.width;
const textHeight = ctx.height;
var ballIndex = 0;
const BulbRadius = 0.17
const SphereRadius = 0.85
class Bulb {
	constructor(y, r, phi) {
		this.r = r;
		this.phi = phi;
		this.y = y;
		this.x = Math.cos(phi) * r;
		this.z = Math.sin(phi) * r;
		this.value = 1;
		// console.log('x ' + this.x +', y ' + this.y +', z ' + this.z )
		this.group = new THREE.Object3D();//create an empty container
		this.rgb = [0, 0, 0];
		var g = new THREE.SphereBufferGeometry(BulbRadius, 32, 32)
		var m = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.BackSide });
		var s = new THREE.Mesh(g, m);
		this.light = new THREE.PointLight(0x000000, 2, 0.3);
		this.light.position.set(this.x, this.y, this.z);
		s.position.set(this.x, this.y, this.z);
		this.group.add(s);//add a mesh with geometry to it
		this.group.add(this.light);//add a mesh with geometry to it
	}
	set val(v) {
		this.value = v;
	}
	get val() {
		return this.value;
	}
	get model() {
		return this.group;
	}
	get color() {
		return this.rgb;
	}
	set color(rgb) {
		this.rgb = rgb;
		this.light.color = new THREE.Color("rgb(" + Math.ceil(this.rgb[0]) + "," + Math.ceil(this.rgb[1]) + "," + Math.ceil(this.rgb[2]) + ")");
	}
	get location() {
		return [this.x, this.y, this.z, this.r, this.phi];
	}
};
var bulbs = {};

function getLight() {
	var ambientLight = new THREE.AmbientLight(0x555555)
	scene.add(ambientLight)

	var dirLight = new THREE.DirectionalLight(0xffffff, 0.1);
	var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
	dirLight.position.set(0, 1, 0);
	dirLight2.position.set(2, 1, 0);
	camera.add(dirLight);
	// camera.add(dirLight2);
}

function getSphere() {
	geometry = new THREE.SphereGeometry(SphereRadius, 32, 32);
	material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: false, opacity: 0.5 });
	sphere = new THREE.Mesh(geometry, material);
	scene.add(sphere);
	var middle = new THREE.Mesh(new THREE.CylinderGeometry(SphereRadius + .01, SphereRadius + .01, 0.02, 32), material);
	middle.rotateX(Math.PI / 2);
	middle.rotateZ(Math.PI / 4);
	scene.add(middle);
	var hole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2 * SphereRadius, 16), material);
	hole.rotateZ(.2);
	hole.position.y = 0.01;
	scene.add(hole);
}

function getBulbs() {
	var offset = 2. / NBulbs;
	var increment = Math.PI * (3. - Math.sqrt(5.));
	for (let i = 0; i < NBulbs; ++i) {
		var y = ((i * offset) - 1) + (offset / 2)
		var r = Math.sqrt(1 - Math.pow(y, 2))
		var phi = (i % NBulbs) * increment;
		var bulb = new Bulb(y, r, phi);
		// 		console.log('phi: ' + (phi/(2* Math.PI)) + ', real phi: ' + phi + ', r: ' + r+ ', y: ' + y);
		bulbs[ledIndexes[i]] = bulb
		scene.add(bulb.model);
	}
}


var text;
function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, Math.min(window.innerHeight, window.innerWidth));
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x303030);

	camera = new THREE.PerspectiveCamera(15, window.innerWidth / (Math.min(window.innerHeight, window.innerWidth)), 8, 12);
	camera.position.z = 10;
	// 	camera.position.set(9.206370863377273, -2.3027256020920936, -3.1528067380391285);
	// 	camera.up = new THREE.Vector3(-1, 0, 0);
	// 	camera.position.set(0.597728145187679,-9.83405564014189, -0.890968986120698);
	camera.up = new THREE.Vector3(0, -1, 0);
	// camera = new THREE.OrthographicCamera(-10, 10, -10, 10, -10, 20);
	scene.add(camera);

	getLight();
	getSphere();
	getBulbs();

	controls = new THREE.TrackballControls(camera);
	text = textToPixels('rio');
}

var connected = false;
var nPacketsWaiting = 0;
var previusTime = 0;
var packetRejected = false;
var firstTime = true;
var request = new XMLHttpRequest();
request.onload = function () {
	// console.log(new Date().getTime() - previusTime);
	previusTime = new Date().getTime();
	var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
	var data = request.responseText; // Returned data, e.g., an HTML document.
	connected = true;
	// 	setLeds();
	--nPacketsWaiting;
	if (packetRejected) {
		nPacketsWaiting = 0;
		packetRejected = false;
		// connected = false;
	}
}
var frequency = 60;
var nPackets = 8;
function setLeds() {
	if (connected && nPacketsWaiting > 0) {
		packetRejected = true;
		if (++nPacketsWaiting > 100) {
			firstTime = true;
			console.log('retrying... ')
			nPacketsWaiting = 0;
		}
		return;
	}
	if (firstTime) {
		firstTime = false;
		var delay = new Uint8Array(1);
		delay[0] = Math.ceil(1000 / frequency);
		request.open(method, url, async);
		request.send(delay);
		++nPacketsWaiting;
		return;
	}
	var byteArray = new Uint8Array(nPackets * NBulbs * 3);
	var counter = 0;
	for (let n = 0; n < nPackets; ++n) {
		sweep(1);
// 		sweepCanvas()
		if (!connected) {
			return;
		}
		for (let i = 0; i < NBulbs; ++i) {
			for (let j = 0; j < 3; ++j) {
				byteArray[counter++] = bulbs[i].color[j];
			}
		}
	}
	request.open(method, url, async);
	request.send(byteArray);
	++nPacketsWaiting;
}



function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
document.addEventListener('mouseup', onDocumentMouseUp, false);

var vector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var dir = new THREE.Vector3();


var running = false;
var refreshIntervalId;
function onDocumentMouseUp(event) {
	event.preventDefault();

	vector.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5); // z = 0.5 important!
	vector.unproject(camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(scene.children, false);


	if (event.button == 2) {
		running = !running;
		if (running) {
			refreshIntervalId = setInterval(function () {
				// lightNextBulb();
				setLeds();
				// sweep(1);
			}, (nPackets * 1000) / frequency);
		}
		else {
			clearInterval(refreshIntervalId);
		}
	}
	if (event.button == 0) {
		setLeds();
		if (text != null) {
			for (let row = 0; row < textHeight; ++row) {
				let test = ''
				for (let col = 0; col < textWidth; ++col) {
					let found = false
					for (let i = 0; i < addedPixels.length; ++i) {
						if (addedPixels[i][0] == row && addedPixels[i][1] == col) {
							// test += '(' + Math.round(10 * addedPixels[i][2]) + ')';
							test += Math.round(10 * addedPixels[i][2])
							found = true;
							break;
						}
					}
					if (found) {
						continue;
					}

					if (text[row][col] != 0) {
						// test += text[row][col] >> 5;
						test += '.';
					}
					else {
						test += ' ';
					}

				}
				console.log(test)
			}
			console.log(' ')
		}
	}
}
init();
animate();