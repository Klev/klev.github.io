"use strict";

var canvas;
var gl;
var program;

var rotation_matrix = rotationMatrixSetup();
var vertices = [];
// legacy - to remove
//var colors = [];
var normals = [];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var modelView, projection;
var viewerPos;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];
var thetaLoc;

var shapes = [cone, cylinder, sphere];
var shape_id = 0;

window.onload = function init() {
    glCanvasSetup();

    shapes[shape_id]();

    shaderProgramSetup();

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
    }
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
    };
    document.getElementById("shapes").onclick = function () {
        shape_id = (shape_id + 1) % shapes.length;
        shapes[shape_id]();
    }

    render();
};

function glCanvasSetup() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
}

function shaderProgramSetup()
{
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0);
    projection = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        materialShininess);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),
        false, flatten(projection));
}

function rotationMatrixSetup() {
    rotation_matrix = {};

    rotation_matrix["x"] = function (angle) {
        return [
            vec4(1.0, 0.0, 0.0, 0.0),
            vec4(0.0, Math.cos(angle), -Math.sin(angle), 0.0),
            vec4(0.0, Math.sin(angle),  Math.cos(angle), 0.0),
            vec4(0.0, 0.0, 0.0, 1.0)
        ];
    };

    rotation_matrix["y"] = function (angle) {
        return [
            vec4(Math.cos(angle), 0.0, Math.sin(angle), 0.0),
            vec4(0.0, 1.0, 0.0, 0.0),
            vec4(-Math.sin(angle), 0.0, Math.cos(angle), 0.0),
            vec4(0.0, 0.0, 0.0, 1.0)
        ];
    };

    rotation_matrix["z"] = function(angle) {
        return [
            vec4(Math.cos(angle), -Math.sin(angle), 0.0, 0.0),
            vec4(Math.sin(angle), Math.cos(angle), 0.0, 0.0),
            vec4(0.0, 0.0, 1.0, 0.0),
            vec4(0.0, 0.0, 0.0, 1.0)
        ];
    };

    return rotation_matrix;
}

function generatePolygon(firstVertice, numberOfVertices, axis) {
    function toRadius(angle) {
        return angle * Math.PI / 180;
    }

    function rotateVertice(radius) {
        function multiplyLineColumn(line, column) {
            return line[0] * column[0] + line[1] * column[1] +
                line[2] * column[2] + line[3] * column[3];
        }
        var matrix = rotation_matrix[axis](radius);
        
        return vec4(
            multiplyLineColumn(matrix[0], firstVertice),
            multiplyLineColumn(matrix[1], firstVertice),
            multiplyLineColumn(matrix[2], firstVertice),
            multiplyLineColumn(matrix[3], firstVertice)
            );
    }

    var vertices = [];
    var angle = 360.0 / numberOfVertices;

    for (var i = 0; i < numberOfVertices; i++) {
        var radius = toRadius(angle * i);
        
        var vertice = rotateVertice(radius);
        vertices.push(vertice);
    }

    return vertices;
}

function cylinder() {
    var center_base = vec4(0.0, -0.5, 0.0, 1.0);
    var base_first_vertex = vec4(0.0, -0.5, -0.5, 1.0);
    var center_top = vec4(0.0, 0.5, 0.0, 1.0);
    var top_first_vertex = vec4(0.0, 0.5, -0.5, 1.0);

    var vertices_base = generatePolygon(base_first_vertex, 20, "y");
    var vertices_top = generatePolygon(top_first_vertex, 20, "y");

    for (var i = 0; i < vertices_base.length; i++) {
        vertices.push(center_base);
        vertices.push(vertices_base[(i + 1) % vertices_base.length]);
        vertices.push(vertices_base[i]);

        //colors.push([0.0, 0.0, 1.0, 1.0]);
        //colors.push([0.0, 0.0, 1.0, 1.0]);
        //colors.push([0.0, 0.0, 1.0, 1.0]);
    }

    for (var i = 0; i < vertices_top.length; i++) {
        vertices.push(center_top);
        vertices.push(vertices_top[(i + 1) % vertices_top.length]);
        vertices.push(vertices_top[i]);

        //colors.push([0.0, 0.0, 1.0, 1.0]);
        //colors.push([0.0, 0.0, 1.0, 1.0]);
        //colors.push([0.0, 0.0, 1.0, 1.0]);
    }

    for (var i = 0; i < vertices_top.length; i++) {
        vertices.push(vertices_top[i]);
        vertices.push(vertices_base[(i + 1) % vertices_base.length]);
        vertices.push(vertices_base[i]);

        //colors.push([1.0, 0.0, 0.0, 1.0]);
        //colors.push([1.0, 0.0, 0.0, 1.0]);
        //colors.push([1.0, 0.0, 0.0, 1.0]);

        vertices.push(vertices_top[i]);
        vertices.push(vertices_top[(i + 1) % vertices_top.length]);
        vertices.push(vertices_base[(i + 1) % vertices_base.length]);

        //colors.push([1.0, 0.0, 0.0, 1.0]);
        //colors.push([1.0, 0.0, 0.0, 1.0]);
        //colors.push([1.0, 0.0, 0.0, 1.0]);
    }
}

function cone() {
    var center_base = vec4(0.0, -0.5, 0.0, 1.0);
    var first_vertex = vec4(0.0, -0.5, -0.5, 1.0);
    var top_vertex = vec4(0.0, 0.5, 0.0, 1.0);

    var vertices_base = generatePolygon(first_vertex, 20, "y");
    
    // generate the cone's base
    for (var i = 0; i < vertices_base.length; i++) {
        vertices.push(center_base);
        vertices.push(vertices_base[(i + 1) % vertices_base.length]);
        vertices.push(vertices_base[i]);

        var t1 = subtract(vertices_base[(i + 1) % vertices_base.length], center_base);
        var t2 = subtract(vertices_base[i], center_base);
        var normal = normalize(vec3(cross(t1, t2)));

        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }

    // really generates the cone
    for (var i = 0; i < vertices_base.length; i++) {
        vertices.push(top_vertex);
        vertices.push(vertices_base[(i + 1) % vertices_base.length]);
        vertices.push(vertices_base[i]);

        var t1 = subtract(vertices_base[(i + 1) % vertices_base.length], top_vertex);
        var t2 = subtract(vertices_base[i], top_vertex);
        var normal = normalize(vec3(cross(t2, t1)));

        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }
}

function sphere() {
    function triangle(a, b, c) {
        vertices.push(vec4(a[0], a[1], a[2], 1.0));
        vertices.push(vec4(b[0], b[1], b[2], 1.0));
        vertices.push(vec4(c[0], c[1], c[2], 1.0));

        //colors.push([0.0, 1.0, 0.0, 1.0]);
        //colors.push([0.0, 1.0, 0.0, 1.0]);
        //colors.push([0.0, 1.0, 0.0, 1.0]);
    }

    function divideTriangle(a, b, c, count) {
        if (count > 0) {

            var ab = mix(a, b, 0.5);
            var ac = mix(a, c, 0.5);
            var bc = mix(b, c, 0.5);

            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }
        else {
            triangle(a, b, c);
        }
    }

    var a = vec4(0.0, 0.0, -1.0/2, 1);
    var b = vec4(0.0, 0.942809/2, 0.333333/2, 1);
    var c = vec4(-0.816497/2, -0.471405/2, 0.333333/2, 1);
    var d = vec4(0.816497/2, -0.471405/2, 0.333333/2, 1);

    divideTriangle(a, b, c, 5);
    divideTriangle(d, c, b, 5);
    divideTriangle(a, d, b, 5);
    divideTriangle(a, c, d, 5);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    //gl.uniform3fv(thetaLoc, theta);
    
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"),
        false, flatten(modelView));

    //gl.drawArrays(gl.TRIANGLES, 0, 120);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    requestAnimFrame(render);
}
