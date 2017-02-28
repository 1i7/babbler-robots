// DekartCanvas.js
var React = require('react');

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

const {Raphael,Paper,Set,Circle,Ellipse,Image,Rect,Text,Path,Line} = require('react-raphael');

/**
 * pixels
 * screen {
 *     width, height,
 *     paddingLeft, paddingRight, paddingTop, paddingBottom
 * }
 * 
 * mm
 * fold {
 *     x0, y0, dimX, dimY
 * }
 */
function DekartFold(screen, fold, options) {
    // настоящие значения отступов - будут отличаться
    // от заданных, чтобы вписать кусок координатной плоскости 
    // в доступную облать экрана пропорционально
    var paddingLeft = screen.paddingLeft ? screen.paddingLeft : 30;
    var paddingRight = screen.paddingRight ? screen.paddingRight : 60;
    var paddingTop = screen.paddingTop ? screen.paddingTop : 30;
    var paddingBottom = screen.paddingBottom ? screen.paddingBottom : 30;
    
    var dw = screen.width - screen.height*(fold.dimX/fold.dimY);
    if(dw >= 0) {
        var halign = options && options.halign ? options.halign : "left";
        // выравнивание по горизонтали
        if(halign === "left") {
            // по левому краю
            paddingRight += dw;
        } else if(halign === "right") {
        // по правому краю
            paddingLeft += dw;
        } else { // "center"
            // по центру
            paddingRight += dw/2;
            paddingLeft += dw/2;
        }
    } else {
        var dh = screen.height - screen.width*(fold.dimY/fold.dimX);
        
        var valign = options && options.valign ? options.valign : "top";
        // выравнивание по вертикали
        if(valign === "top") {
            // по верхнему краю
            paddingBottom += dh;
        } else if(valign === "right") {
            // по нижнему краю
            paddingTop += dh;
        } else { // "center"
            // по центру
            paddingBottom += dh/2;
            paddingTop += dh/2;
        }
    }
    
    var x0 = fold.x0 ? fold.x0 : 0;
    var y0 = fold.y0 ? fold.y0 : 0;
    
    this.toScreenX = function(x) {
        if(!x) x = 0;
        return (x-x0)*(screen.width-paddingLeft-paddingRight)/fold.dimX + paddingLeft;
    }
    
    this.toScreenY = function(y) {
        if(!y) y = 0;
        return screen.height-paddingBottom-(y-y0)*(screen.height-paddingBottom-paddingTop)/fold.dimY;
    }
    
    /**
     * От координат на плоскости в координаты экрана.
     */
    this.toScreen = function(x, y) {
        if(!x) x = 0;
        if(!y) y = 0;
        return {
            sx: (x-x0)*(screen.width-paddingLeft-paddingRight)/fold.dimX + paddingLeft,
            sy: screen.height-paddingBottom-(y-y0)*(screen.height-paddingBottom-paddingTop)/fold.dimY
        }
    }
    
    /**
     * Длина отрезка на плоскости в длину отрезка на экране
     */
    this.toScreenLen = function(len) {
        if(!len) len = 0;
        // пропорции по X и Y одинаковые, для этого вычисляли dw/dh выше
        return len*(screen.width-paddingLeft-paddingRight)/fold.dimX;
    }
}

var DekartCanvas = React.createClass({
// https://github.com/liuhong1happy/react-raphael
// http://stackoverflow.com/questions/10940316/how-to-use-attrs-stroke-dasharray-stroke-linecap-stroke-linejoin-in-raphaeljs

    getInitialState: function() {
        this.dekart = new DekartFold(this.props.screen, this.props.fold);
        return {pos: "0 0 0"};
//        return {
//            deviceStatus: this.props.babblerCnc.babbler.deviceStatus,
//            pos: this.props.babblerCnc.pos,
//            err: this.props.babblerCnc.posErr
//        };
    },
    
    render: function() {
        //var grid = false;
        //var gridSpacing;
        //var unit;
        
        var posArr = this.state.pos.split(" ");
        var posX = parseInt(posArr[0], 10)/1000000*2;
        var posY = parseInt(posArr[1], 10)/1000000*2;
        var posZ = parseInt(posArr[2], 10)/1000000*2;
        
        var sx0 = this.dekart.toScreenX(this.props.fold.x0);
        var sy0 = this.dekart.toScreenY(this.props.fold.dimY);
        var swidth = this.dekart.toScreenLen(this.props.fold.dimX);
        var sheight = this.dekart.toScreenLen(this.props.fold.dimY);
        
        var sz0_x = sx0 + swidth + 40;
        var sz0_y = sy0;
        var sz_height = sheight;
        
        return (
            <Paper width={this.props.screen.width} height={this.props.screen.height}>
                <Rect
                    x={sx0}
                    y={sy0}
                    width={swidth}
                    height={sheight}
                    attr={{"fill":"none", "stroke":"black", "stroke-width":1, "stroke-dasharray":"--"}}/>
                <Line
                    x1={sz0_x}
                    y1={sz0_y}
                    x2={sz0_x}
                    y2={sz0_y + sz_height}
                    attr={{"fill":"none", "stroke":"black", "stroke-width":1, "stroke-dasharray":"--"}}/>
                    
                <Text text={"0"}
                    x={sx0-10} y={sy0+sheight+10}
                    attr={{"font-size": 12}}/>
                <Text text={"y"}
                    x={sx0-10} y={sy0-10}
                    attr={{"font-size": 12}}/>
                <Text text={"x"}
                    x={sx0+swidth+10} y={sy0+sheight+10}
                    attr={{"font-size": 12}}/>
                    
                <Text text={"0"} 
                    x={sz0_x+10} y={sz0_y+sz_height+10}
                    attr={{"font-size": 12}}/>
                <Text text={"z"}
                    x={sz0_x+10} y={sz0_y-10}
                    attr={{"font-size": 12}}/>
                    
                <Circle x={posX} y={posY} r={2}/>
                
            </Paper>
        );
    }
});

// отправляем компонент на публику
module.exports = DekartCanvas;

