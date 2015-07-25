"use strict";
	
var canvas;
var gl;

var bufferSize = 10000000;
var isDrawing;
var line;
var color;
var colors;

window.onload = function init() 
{
    line = [];
    colors = [];
    color = vec4(1.0, 1.0, 1.0, 1.0);
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
    		colors.push(color);
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
			    
			    colors.push(color);
			    colors.push(color);
			    
			    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
    		}
    	});
    
    canvas.addEventListener("mouseup", function(event)
    	{
    	    isDrawing = false;
	        line.pop();
	        colors.pop();
        });

    document.getElementById("clear").onclick = function (event)
        {
            line = [];
            colors = [];
    };
    
    document.getElementById("brush_color").onchange = function (event)
    	{
    		var target = event.target || event.srcElement;
    		var rgb = hexToRgb(target.value);
    		
    		if (rgb != null)
    		{
    			color = vec4( rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0, 1.0);
    			console.log(color)
    		}
    	};

    render();
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
    	[parseInt(result[1], 16),
         parseInt(result[2], 16),
         parseInt(result[3], 16)] : null;
}

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	for (var i = 0; i < line.length - 1; i+=2)
		gl.drawArrays(gl.LINES, i, 2);
	
	window.requestAnimFrame(render);
}
