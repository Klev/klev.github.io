"use strict";
	
var canvas;
var gl;

var bufferSize = 6000;
var isDrawing;
var lines;
var line;

window.onload = function init() 
{
	lines = [];
	line = [];
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
    
    canvas.addEventListener("mousedown", function(event) 
    	{
    		isDrawing = true;
    		line = [];
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
            	
            	var index = 0;
            	for (var i = 0; i < lines.length; i++)
            	{
            		gl.bufferSubData(gl.ARRAY_BUFFER, index, flatten(lines[i]));
            		index += lines[i].length;
            	}
            	
            	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(line));
    		}
    	});
    
    canvas.addEventListener("mouseup", function(event)
    	{
    		isDrawing = false;
            lines.push(line);
            
            var index = 0;
            for (var i = 0; i < lines.length; i++)
            {
            	gl.bufferSubData(gl.ARRAY_BUFFER, index, flatten(lines[i]));
            	index += lines[i].length;
            }
    	});
    	
    render();
};

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	for (var i = 0; i < lines.length; i++)
		for (var j = 0; j < lines[i].length; j++)
			gl.drawArrays(gl.LINE_STRIP, j, lines[i].length);
	
	window.requestAnimFrame(render);
}