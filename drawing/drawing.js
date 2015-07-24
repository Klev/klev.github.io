"use strict";
	
var canvas;
var gl;

var bufferSize = 1000000;
var isDrawing;
var line;
var color;
var colors;
var colorOptions = [
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0)
];

window.onload = function init() 
{
    line = [];
    color;
	isDrawing = false;
	
	canvas = document.getElementById("gl-canvas");
	
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) alert("WebGL isn't available");
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    canvas.addEventListener("mousedown", function(event) 
    	{
    		isDrawing = true;
    		var point = 
    			vec2( 2 * event.clientX / canvas.width - 1,
            	      2 * (canvas.height - event.clientY) / canvas.height - 1);
    		line.push(point);
    	});
    
    canvas.addEventListener("mousemove", function(event)
    	{
    		if (isDrawing)
    		{
    			var point = 
    				vec2( 2 * event.clientX / canvas.width - 1,
            	          2 * (canvas.height - event.clientY) / canvas.height - 1);
            		line.push(point);
			    line.push(point);

			    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(line));
    		}
    	});
    
    canvas.addEventListener("mouseup", function(event)
    	{
    	    isDrawing = false;
	        line.pop();
        });

    document.getElementById("clear").onclick = function (event)
        {
            line = [];
    };

    document.getElementById("white").onclick = function (event) {
        color = colors[0];
    };

    document.getElementById("red").onclick = function (event) {
        color = colors[1];
    };

    document.getElementById("blue").onclick = function (event) {
        color = colors[2];
    };

    document.getElementById("green").onclick = function (event) {
        color = colors[3];
    };

    document.getElementById("yellow").onclick = function (event) {
        color = colors[4];
    };

    document.getElementById("cyan").onclick = function (event) {
        color = colors[5];
    };

    document.getElementById("magenta").onclick = function (event) {
        color = colors[6];
    };
    	
    render();
};

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	for (var i = 0; i < line.length - 1; i+=2)
		gl.drawArrays(gl.LINES, i, 2);
	
	window.requestAnimFrame(render);
}
