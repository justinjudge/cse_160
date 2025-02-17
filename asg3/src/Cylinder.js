class Cylinder {
    constructor() {
        this.type = 'cylinder';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5;
        // this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // var segments = this.segments;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);



        // Circle Copy from
        var xy = [0.5, 0.5, 0.0];
        var size = 1/2;
        var segments = 12;

        // Draw
        var d = size; // delta

        let angleStep = 360/segments;
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI/180)*d, Math.sin(angle1 * Math.PI/180)*d];
            let vec2 = [Math.cos(angle2 * Math.PI/180)*d, Math.sin(angle2 * Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            // Top
            drawTriangle3D( [xy[0], xy[1], 0,       pt1[0], pt1[1], 0,      pt2[0], pt2[1], 0] );
            // Base
            drawTriangle3D( [xy[0], xy[1], 1,       pt1[0], pt1[1], 1,      pt2[0], pt2[1], 1] );

            // Sides
            gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
            drawTriangle3D( [pt1[0], pt1[1], 0,      pt2[0], pt2[1], 0,      pt2[0], pt2[1], 1] );
            drawTriangle3D( [pt1[0], pt1[1], 1,      pt2[0], pt2[1], 1,      pt1[0], pt1[1], 0] );
        }

    }
}