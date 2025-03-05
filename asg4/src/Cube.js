class Cube {
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // var segments = this.segments;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Pass the matrix to a u_NormalMatrix attribute
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Draw
        /*
        var d = this.size/200.0; // delta

        let angleStep = 360/this.segments;
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI/180)*d, Math.sin(angle1 * Math.PI/180)*d];
            let vec2 = [Math.cos(angle2 * Math.PI/180)*d, Math.sin(angle2 * Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
        }
        */

        // Front of cube
        drawTriangle3DUVNormal( 
            [0, 0, 0,     1, 1, 0,      1, 0, 0 ], 
            [0,0, 1,1, 1,0], 
            [1,0,0,   1,0,0,  1,0,0] ); // CORRECTLY PINK???
        drawTriangle3DUVNormal( 
            [1, 0, 0,     1, 1, 1,      1, 0, 1 ], 
            [1,1, 0,0, 0,1], 
            [0,1,0,   0,1,0,  0,1,0] ); // Corretly Lime??

        // Pass the color of a point to a u_FragColor unfirom variable
        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube
        drawTriangle3DUVNormal( 
            [0, 1, 0,     0, 1, 1,      1, 1, 1 ], 
            [1,1, 1,0, 0,0],
            [0,1,0,   0,1,0,  0,1,0]); // Correctly Lime??
        drawTriangle3DUVNormal( 
            [0, 1, 0,     1, 1, 1,      1, 1, 0 ], 
            [1,1, 0,0, 0,1],
            [0,-1,0,   0,-1,0,  0,-1,0]); // Correctly Bluish??? ////////

        // Bottom of cube
        drawTriangle3DUVNormal( 
            [0, 0, 0,     0, 0, 1,      1, 0, 1 ], 
            [0,0, 1,0, 1,1], 
            [0,-1,0,   0,-1,0,  0,-1,0] ); // Correctly Bluish?? //////////
            drawTriangle3DUVNormal( 
            [0, 0, 0,     1, 0, 1,      1, 0, 0 ], 
            [0,0, 1,1, 0,1], 
            [0,0,1,   0,0,1,  0,0,1] ); // Correctly Magenta ??

        // Back of cube
        drawTriangle3DUVNormal( 
            [0, 0, 1,     1, 1, 1,      1, 0, 1 ], 
            [1,1, 0,0, 0,1], 
            [0,0,1,   0,0,1,  0,0,1] ); // Correctly Magenta ??
            drawTriangle3DUVNormal( 
            [0, 0, 1,     0, 1, 1,      1, 1, 1 ], 
            [1,1, 1,0, 0,0], 
            [-1,0,0,   -1,0,0,  -1,0,0] ); // Correctly Turqoise ??

        // Pass the color of a point to a u_FragColor unfirom variable
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Left of cube
        drawTriangle3DUVNormal( 
            [0, 0, 0,     0, 1, 0,      0, 1, 1 ], 
            [0,0, 0,1, 1,1], 
            [-1,0,0,   -1,0,0,  -1,0,0] ); // Correctly Turqoise ??
        drawTriangle3DUVNormal( 
            [0, 0, 0,     0, 1, 1,      0, 0, 1 ], 
            [0,0, 1,1, 1,0], 
            [1,0,0,   1,0,0,  1,0,0] ); // Correctly Pink

        // Right of cube
        drawTriangle3DUVNormal( 
            [1, 0, 0,     1, 1, 0,      1, 1, 1 ],
            [1,1, 1,0, 0,0], 
            [0,0,-1,   0,0,-1,  0,0,-1] ); // Correctly Mustard??
        drawTriangle3DUVNormal( 
            [0, 0, 0,     0, 1, 0,      1, 1, 0 ], 
            [0,0, 0,1, 1,1], 
            [0,0,-1,   0,0,-1,  0,0,-1] ); // Correctly Mustard??
            
        
    }

    renderfast() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // var segments = this.segments;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw
        /*
        var d = this.size/200.0; // delta

        let angleStep = 360/this.segments;
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI/180)*d, Math.sin(angle1 * Math.PI/180)*d];
            let vec2 = [Math.cos(angle2 * Math.PI/180)*d, Math.sin(angle2 * Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
        }
        */

        var allverts = [];

        // Front of Cube
        allverts=allverts.concat( [0, 0, 0,     1, 1, 0,      1, 0, 0 ] );
        allverts=allverts.concat( [0, 0, 0,     0, 1, 0,      1, 1, 0 ] );

        // Pass the color of a point to a u_FragColor unfirom variable
        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube
        allverts=allverts.concat( [0, 1, 0,     0, 1, 1,      1, 1, 1 ] );
        allverts=allverts.concat( [0, 1, 0,     1, 1, 1,      1, 1, 0 ] );

        // Bottom of cube
        allverts=allverts.concat( [0, 0, 0,     0, 0, 1,      1, 0, 1 ] );
        allverts=allverts.concat( [0, 0, 0,     1, 0, 1,      1, 0, 0 ] );

        // Back of cube
        allverts=allverts.concat( [0, 0, 1,     1, 1, 1,      1, 0, 1 ] );
        allverts=allverts.concat( [0, 0, 1,     0, 1, 1,      1, 1, 1 ] );

        // Pass the color of a point to a u_FragColor unfirom variable
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Left of cube
        allverts=allverts.concat( [0, 0, 0,     0, 1, 0,      0, 1, 1 ] );
        allverts=allverts.concat( [0, 0, 0,     0, 1, 1,      0, 0, 1 ] );

        // Right of cube
        allverts=allverts.concat( [1, 0, 0,     1, 1, 0,      1, 1, 1 ] );
        allverts=allverts.concat( [1, 0, 0,     1, 1, 1,      1, 0, 1 ] );


        var allUVs = [];

        // Front of Cube
        allUVs=allUVs.concat( [0,0, 1,1, 1,0] );
        allUVs=allUVs.concat( [0,0, 0,1, 1,1] );

        // Top of cube
        allUVs=allUVs.concat( [1,1, 1,0, 0,0] );
        allUVs=allUVs.concat( [1,1, 0,0, 0,1] );

        // Bottom of cube
        allUVs=allUVs.concat( [0,0, 1,0, 1,1] );
        allUVs=allUVs.concat( [0,0, 1,1, 0,1] );

        // Back of cube
        allUVs=allUVs.concat( [1,1, 0,0, 0,1] );
        allUVs=allUVs.concat( [1,1, 1,0, 0,0] );

        // Left of cube
        allUVs=allUVs.concat( [0,0, 0,1, 1,1] );
        allUVs=allUVs.concat( [0,0, 1,1, 1,0] );

        // Right of cube
        allUVs=allUVs.concat( [1,1, 1,0, 0,0] );
        allUVs=allUVs.concat( [1,1, 0,0, 0,1] );



        /*
        // Front of cube
        drawTriangle3DUV( [0, 0, 0,     1, 1, 0,      1, 0, 0 ], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0, 0, 0,     0, 1, 0,      1, 1, 0 ], [0,0, 0,1, 1,1] );

        // Pass the color of a point to a u_FragColor unfirom variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube
        drawTriangle3DUV( [0, 1, 0,     0, 1, 1,      1, 1, 1 ], [1,1, 1,0, 0,0] );
        drawTriangle3DUV( [0, 1, 0,     1, 1, 1,      1, 1, 0 ], [1,1, 0,0, 0,1] );

        // Bottom of cube
        drawTriangle3DUV( [0, 0, 0,     0, 0, 1,      1, 0, 1 ], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0, 0, 0,     1, 0, 1,      1, 0, 0 ], [0,0, 1,1, 0,1] );

        // Back of cube
        drawTriangle3DUV( [0, 0, 1,     1, 1, 1,      1, 0, 1 ], [1,1, 0,0, 0,1] );
        drawTriangle3DUV( [0, 0, 1,     0, 1, 1,      1, 1, 1 ], [1,1, 1,0, 0,0] );

        // Pass the color of a point to a u_FragColor unfirom variable
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Left of cube
        drawTriangle3DUV( [0, 0, 0,     0, 1, 0,      0, 1, 1 ], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0, 0, 0,     0, 1, 1,      0, 0, 1 ], [0,0, 1,1, 1,0] );

        // Right of cube
        drawTriangle3DUV( [1, 0, 0,     1, 1, 0,      1, 1, 1 ], [1,1, 1,0, 0,0] );
        drawTriangle3DUV( [1, 0, 0,     1, 1, 1,      1, 0, 1 ], [1,1, 0,0, 0,1] );
        */

        
        drawTriangle3DUV( allverts, allUVs );
    }
}