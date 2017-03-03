// DekartCanvas.js
var React = require('react');

/**
 * pixels
 * screen {
 *     width, height
 * }
 * 
 * mm
 * fold {
 *     x0, y0, dimX, dimY
 * }
 * 
 * mm
 * pos "x y z"
 */
var DekartCanvas = React.createClass({
// https://www.w3.org/TR/SVG/coords#TransformAttribute
// http://fcode.ninja/2015/11/11/svg-i-react-js-bez-boli/

    render: function() {
        //var grid = false;
        //var gridSpacing;
        //var unit;
        
        var pos = this.props.pos ? this.props.pos : "0 0 0";
        
        var posArr = pos.split(" ");
        var posX = parseInt(posArr[0], 10)/1000000;
        var posY = parseInt(posArr[1], 10)/1000000;
        var posZ = parseInt(posArr[2], 10)/1000000;
        
        return (
            <svg
                id="svg2"
                version="1.0"
                x="0.00000000"
                y="0.00000000"
                width={this.props.screen.width}
                height={this.props.screen.height}
                viewBox={"" + 
                    -30 + " " + 
                    -30 + " " + 
                    (this.props.fold.dimX + 60) + " " + 
                    (this.props.fold.dimY + 60)}>
         
            <g id="layer1"
                transform={
                    "scale(1, -1)" + 
                    " translate(0, -" + this.props.fold.dimY + ")"}>
                    
                <rect x="0" y="0" width={this.props.fold.dimX} height={this.props.fold.dimY}
                    style={{fill:"none", stroke:"gray", strokeWidth:1, strokeDasharray:"3 3",
                    vectorEffect:"non-scaling-stroke"}}/>
                    
                <text
                    x={-10} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                <text
                    x={this.props.fold.dimX} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>x</text>
                <text
                    x={-10} y={-this.props.fold.dimY}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>y</text>
                        
                 <circle cx={posX} cy={posY} r={2} 
                     style={{fill:"orange", stroke:"none"}}/>
            </g>
            </svg>
        );
    }
});

// отправляем компонент на публику
module.exports = DekartCanvas;

