"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;
var theta = 0.0;
var vertex = 3;
var gasket = false;

var bufferId;

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 100 * 8 * Math.pow(3, 6), gl.STATIC_DRAW);



    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("tessec_slider").onchange = function () {
        numTimesToSubdivide = parseInt(event.srcElement.value);
        render();
        document.getElementById("tessec_text").value = event.srcElement.value;
    };

    document.getElementById("twist_slider").onchange = function () {
        theta = parseFloat(event.srcElement.value);
        render();
        document.getElementById("twist_text").value = event.srcElement.value;
    }

    document.getElementById("vertex_slider").onchange = function () {
        vertex = parseInt(event.srcElement.value);
        render();
        document.getElementById("vertex_text").value = event.srcElement.value;
    }
    
    document.getElementById("filled_radio").onchange = function () {
    	gasket = !event.srcElement.checked;
    	render();
    }
    
    document.getElementById("gasket_radio").onchange = function () {
    	gasket = event.srcElement.checked;
    	render();
    }

    render();
};

function triangle(a, b, c) {
    var twist = function (vertex) {
        var d = Math.sqrt(vertex[0] * vertex[0] + vertex[1] * vertex[1]);
        var radius = theta * Math.PI / 180;
        var x = vertex[0] * Math.cos(d * radius) - vertex[1] * Math.sin(d * radius);
        var y = vertex[0] * Math.sin(d * radius) + vertex[1] * Math.cos(d * radius);

        return vec2(x, y);
    };

    points.push(twist(a), twist(b), twist(c));
}

function divideTriangle(a, b, c, count) {

    // check for end of recursion

    if (count === 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        
        if (!gasket) divideTriangle(ac, ab, bc, count);
    }
}

function generatePolygon(firstVertice, numberOfVertices) {
    var vertices = [];
    var angle = 360 / numberOfVertices;

    for (var i = 0; i < numberOfVertices; ++i) {
        var radius = angle * i * Math.PI / 180;

        var x = firstVertice[0] * Math.cos(radius) - firstVertice[1] * Math.sin(radius);
        var y = firstVertice[0] * Math.sin(radius) + firstVertice[1] * Math.cos(radius);
        vertices.push(vec2(x, y));
    }

    return vertices;
}

function generateMeshFromBasis(vertices, subdivision) {
    for (var i = 0; i < vertices.length; ++i) {
        //divideTriangle(vertices[0], vertices[1 + i], vertices[2 + i], subdivision);
        divideTriangle(vec2(0.0, 0.0), vertices[i], vertices[(i + 1) % vertices.length], subdivision);
    }
}

window.onload = init;

function render() {
    var vertices = generatePolygon(vec2(0, 0.5), vertex);
    points = [];
    generateMeshFromBasis(vertices, numTimesToSubdivide);
    //divideTriangle(vertices[0], vertices[1], vertices[2],
    //                numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArray(gl.POINTS, 0, points.length);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    //for (i = 0; i < points.length; i += 3)
    //    gl.drawArrays(gl.LINE_LOOP, i, 3);

    points = [];
    //requestAnimFrame(render);
}
