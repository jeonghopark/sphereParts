var scene, camera, renderer, controls;
var stats;
var wireMeshS = new Array();
var objectS = new Array();;

var parameters;

init();
animate();


//-----------------------------------------------------------------------------
function init() {

    if (!Detector.webgl) Detector.addGetWebGLMessage();

    parameters = {
        StripWidth: 1.0,
        Speed: 0.0,
        RotationY: 45,
        RotationZ: 25
    }

    var clock = new THREE.Clock();
    clock.start();

    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0xFFEAB0 );
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.01 ); 

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.domElement.style.position = "relative";
    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;
    renderer.setClearColor(0x000000, 0.0);

    window.addEventListener( 'resize', onWindowResize, false );

    stats = new Stats();

    var _container = document.getElementById('container');
    document.body.appendChild(renderer.domElement);
    _container.appendChild(stats.dom);

    lightSetting();
    controlsSetting();

    geoMeshSetting();

    guiSetting();

}


//-----------------------------------------------------------------------------
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


//-----------------------------------------------------------------------------
function geoMeshSetting() {
    this._gNum = 1;
    var _wireMatE = new THREE.MeshBasicMaterial({
        color: 0x33aa33,
        opacity: 0.3,
        wireframe: true,
        transparent: true,
        overdraw: true
    });

    var _norMatS = new Array();
    for (var i = 0; i < _gNum; i += 1) {
        _norMatS[i] = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            opacity: 1.0,
            transparent: true,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide
        });
    }

    var _pointMat = new Array();
    for (var i = 0; i < _gNum; i += 1) {
        _pointMat[i] = new THREE.PointsMaterial({
            // color: 0x00ff00,
            vertexColors: THREE.VertexColors,
            size: 1
        });
    }


    var _geomS = new Array();
    for (var i = 0; i < _gNum; i += 1) {
        scene.remove(objectS[i]);
        _geomS[i] = geom(100);
        objectS[i] = new THREE.Mesh(_geomS[i], _norMatS[i]);
        wireMeshS[i] = new THREE.Mesh(_geomS[i], _wireMatE);
        scene.add(objectS[i]);
        // scene.add(wireMeshS[i]);
    }

}


//-----------------------------------------------------------------------------
function geoMeshUpdate() {
    var _delta = Math.PI * counter() * 0.05 / 180.0;
    var _followIndex = 20;
    for (var i = 0; i < objectS.length; i += 1) {
        objectS[i].rotation.x = Math.PI * 0 / 180.0;
        objectS[i].rotation.y = _delta * (i + _followIndex);
        objectS[i].rotation.z = Math.PI * 0.25 * 0;
        wireMeshS[i].rotation.x = objectS[i].rotation.x;
        wireMeshS[i].rotation.y = objectS[i].rotation.y;
        wireMeshS[i].rotation.z = objectS[i].rotation.z;
    }
}


//-----------------------------------------------------------------------------
function geom(_size) {
    this._geom = new THREE.Geometry();
    this._step = 36;
    this._size = _size;
    this._ySize = parameters.StripWidth;

    this.yStep = 18;

    for (var j = 0; j <= 17; j += 1) {
        var _radius1 = Math.sin(THREE.Math.degToRad(j * 180.0 / 18)) * _size;
        // var _radius2 = Math.sin(THREE.Math.degToRad((j+1) * 180.0 / 18)) * _size;
        for (var i = 0; i <= _step; i += 1) {            
            var _y1 = Math.cos(THREE.Math.degToRad(j * 180.0 / 18.0)) * _size;
            var _x1 = Math.cos(THREE.Math.degToRad(i * 360 / _step)) * _radius1;
            var _z1 = Math.sin(THREE.Math.degToRad(i * 360 / _step)) * _radius1;
            var v0 = new THREE.Vector3(_x1, _y1, _z1);
            _geom.vertices.push(v0);
        }
    }

    for (var i = 0; i < _geom.vertices.length-this._step-2; i += 1) {
        _geom.faces.push(new THREE.Face3(i + 0, i + 1, i + this._step+1));
        _geom.faces.push(new THREE.Face3(i + 1, i + this._step + 1 + 1, i + this._step + 1));
        _geom.computeFaceNormals();
    }

    return _geom
}


//-----------------------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    render();
    controls.update();
    stats.update();
}



//-----------------------------------------------------------------------------
function render() {
    geoMeshUpdate();
    renderer.render(scene, camera);
}


//-----------------------------------------------------------------------------
function counter() {
    counter.count = counter.count + (1.0 * parameters.Speed) || 1;
    return counter.count;
}


//-----------------------------------------------------------------------------
function lightSetting() {
    var light = new THREE.PointLight(0xffffff, 1, 2000);
    var _vLight = new THREE.Vector3(0, 0, 600);
    light.position.set(_vLight.x, _vLight.y, _vLight.z);
    light.intensity = 1;

    var lightIn = new THREE.PointLight(0xFEF8D1, 1, 10);
    var _vLightIn = new THREE.Vector3(0, 2, 15);
    lightIn.position.set(_vLightIn.x, _vLightIn.y, _vLightIn.z);
    lightIn.intensity = 1;

    scene.add(light);
    scene.add(lightIn);
    scene.add(new THREE.AmbientLight(0x333355));
}


//-----------------------------------------------------------------------------
function controlsSetting() {
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 3.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
}


//-----------------------------------------------------------------------------
function guiSetting() {
    var gui = new dat.GUI();

    gui.add(parameters, 'Speed').min(0.0).max(1.0).step(0.1).listen();

    var _stripWidth = gui.add(parameters, 'StripWidth').min(0.2).max(3.0).step(0.1).listen();
    _stripWidth.onChange(function() {
        geoMeshSetting();
    });
}
