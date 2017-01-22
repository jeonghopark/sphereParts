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
        Speed: 1.0,
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
    
    this._log = 18;
    this._lad = 18;
    
    var _geoNum = this._log * this._lad;
    
    var _wireMatE = new THREE.MeshBasicMaterial({
        color: 0x33aa33,
        opacity: 0.3,
        wireframe: true,
        transparent: true,
        overdraw: true
    });

    var _norMatS = new Array();
    var _pointMat = new Array();
    var _geomS = new Array();

    for (var v = 0; v < this._lad; v++) {
        for (var h = 0; h < this._log; h++) {
            var _index = h + v * this._log;
            _norMatS[_index] = new THREE.MeshLambertMaterial({
                // color: 'hsl(' + _index * 255 / _geoNum + ', 100%, 50%)',
                opacity: 1.0,
                transparent: true,
                shading: THREE.SmoothShading,
                side: THREE.DoubleSide
            });
            
            // _norMatS[_index].color = new THREE.Color(_index / _geoNum, 1, 1);

            _pointMat[_index] = new THREE.PointsMaterial({
                // color: 0x00ff00,
                vertexColors: THREE.VertexColors,
                size: 1
            });
            
            scene.remove(objectS[_index]);
            _geomS[_index] = geom(v, h, this._log, this._lad);
            objectS[_index] = new THREE.Mesh(_geomS[_index], _norMatS[_index]);
            objectS[_index].geometry.computeBoundingSphere();
            wireMeshS[_index] = new THREE.Mesh(_geomS[_index], _wireMatE);
            scene.add(objectS[_index]);
            // scene.add(wireMeshS[i]);
        }
    }
    
}


//-----------------------------------------------------------------------------
function geoMeshUpdate() {
    var _delta = Math.PI * counter() * 0.05 / 180.0;
    var _deltaSin = (Math.sin(Math.PI * counter() * 1 / 180.0) + 1 ) * 0.2;
    var _followIndex = 20;

    // var _id = 112;
    // objectS[_id].rotation.x = 0;
    // objectS[_id].rotation.y = _delta * _followIndex;
    // objectS[_id].rotation.z = 0;

    // console.log(objectS[_id]);
    
    
    var _vector = new Array();
    for (var i = 0; i < objectS.length; i++) {
        var _getV = objectS[i].geometry.boundingSphere.center;
        _vector[i] = new THREE.Vector3(_getV.x, _getV.y, _getV.z);
        _vector[i].multiplyScalar( _deltaSin );
        objectS[i].position.x = _vector[i].x;
        objectS[i].position.y = _vector[i].y;
        objectS[i].position.z = _vector[i].z;
    }
    

    for (var i = 0; i < objectS.length; i += 1) {
        // objectS[i].rotation.x = Math.PI * 0 / 180.0;
        // objectS[i].rotation.y = _delta * (0 + _followIndex);
        // objectS[i].rotation.z = Math.PI * 0.25 * 0;
        wireMeshS[i].rotation.x = objectS[i].rotation.x;
        wireMeshS[i].rotation.y = objectS[i].rotation.y;
        wireMeshS[i].rotation.z = objectS[i].rotation.z;
    }
}


//-----------------------------------------------------------------------------
function geom(v, h, xStep, yStep) {
    this._geom = new THREE.Geometry();
    this._xStep = xStep;
    this._yStep = yStep;
    this._size = 100;
    
    for (var j = v; j <= v+1; j += 1) {
        var _radius = Math.sin(THREE.Math.degToRad(j * 180.0 / this._yStep)) * _size;
        var _y1 = Math.cos(THREE.Math.degToRad(j * 180.0 / this._yStep)) * _size;
        for (var i = h; i <= h+1; i += 1) {            
            var _x1 = Math.cos(THREE.Math.degToRad(i * 360.0 / this._xStep)) * _radius;
            var _z1 = Math.sin(THREE.Math.degToRad(i * 360.0 / this._xStep)) * _radius;
            var _v = new THREE.Vector3(_x1, _y1, _z1);
            _geom.vertices.push(_v);
        }
    }
    
    _geom.faces.push(new THREE.Face3(0, 1, 2));
    _geom.faces.push(new THREE.Face3(1, 3, 2));
    _geom.computeFaceNormals();

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
