"use strict";
	
var canvas;
var gl;

var bufferSize = 10000000;
var isDrawing;
var line;
var color;
var cIndex;
var colors = [
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
    cIndex = 0;
    color = [];
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
    gl.bufferData(gl.ARRAY_BUFFER, 2 * bufferSize, gl.STATIC_DRAW);

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
    		color.push(colors[cIndex]);
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
				
				gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(line));
			    
			    color.push(colors[cIndex]);
			    color.push(colors[cIndex]);
			    
			    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(color));
    		}
    	});
    
    canvas.addEventListener("mouseup", function(event)
    	{
    	    isDrawing = false;
	        line.pop();
	        color.pop();
        });

    document.getElementById("clear").onclick = function (event)
        {
            line = [];
            color = [];
    };

    document.getElementById("white").onclick = function (event) {
        cIndex = 0;
    };

    document.getElementById("red").onclick = function (event) {
        cIndex = 1;
    };

    document.getElementById("blue").onclick = function (event) {
        cIndex = 2;
    };

    document.getElementById("green").onclick = function (event) {
        cIndex = 3;
    };

    document.getElementById("yellow").onclick = function (event) {
        cIndex = 4;
    };

    document.getElementById("cyan").onclick = function (event) {
        cIndex = 5;
    };

    document.getElementById("magenta").onclick = function (event) {
        cIndex = 6;
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
