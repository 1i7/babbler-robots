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
 *     x0, y0, z0, dimX, dimY, dimZ
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
        
        //var pos = this.props.pos ? this.props.pos : {x:0, y:0, z:0};
        var tool = {
            x: this.props.posX ? this.props.posX/1000000 : 0,
            y: this.props.posY ? this.props.posY/1000000 : 0,
            z: this.props.posZ ? this.props.posZ/1000000 : 0};
        
        // масштабируем реальную высоту по Z в экранную высоту по Y
        tool.z_y = (tool.z/this.props.fold.dimZ)*this.props.fold.dimY;
        
        // Посчитать радиус рабочего блока с учетом его "близости" к - чем выше блок
        // по оси z, тем больше радиус.
        // Вариант с логорифмическим масштабом - чем ниже блок по оси z, тем быстрее
        // меняется радиус (приятнее для визуализации работы двумерного плоттера,
        // т.к. у него рабочий блок гуляет не по всей оси z, а в меняет два
        // положения, оба близкие к поверхности стола).
        // https://github.com/1i7/rraptor/blob/master/RraptorPult/src/com/rraptor/pult/view/PlotterAreaView.java#L81
        var minRadius = 3, maxRadius = 8;
        // прибавляем к z единичку, чтобы не уходить в отрицательные значения
        tool.z_radius = minRadius + (maxRadius - minRadius) * 
            Math.log(tool.z + 1) / Math.log(this.props.fold.dimZ);
        
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
                    (this.props.fold.dimX + 60 + 30) + " " + 
                    (this.props.fold.dimY + 60 + 30)}>
         
            <g id="layer1"
                transform={
                    "scale(1, -1)" + 
                    " translate(0, -" + this.props.fold.dimY + ")"}>
                
                {/* Оси X, Y - рабочаая область - координатная плоскость */}
                <rect x={0} y={0} width={this.props.fold.dimX} height={this.props.fold.dimY}
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
                        
                {/* Ось Z справа отдельно */}
                <line
                    x1={this.props.fold.dimX+20} y1={0}
                    x2={this.props.fold.dimX+20} y1={this.props.fold.dimY}
                    style={{fill:"none", stroke:"gray", 
                    strokeWidth:1, strokeDasharray:"3 3",
                    vectorEffect:"non-scaling-stroke"}}/>
                    
                <text
                    x={this.props.fold.dimX+20+10} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                <text
                    x={this.props.fold.dimX+20+10} y={-this.props.fold.dimY}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>z</text>
                 
                {/* Рабочий инструмент в плоскости X,Y:
                    - кружок перемещается по полю
                    - посередине крестик */}
                <circle cx={tool.x} cy={tool.y} r={tool.z_radius} 
                    style={{fill:"orange", stroke:"none"}}/>
                <line 
                    x1={tool.x-2} y1={tool.y}
                    x2={tool.x+2} y2={tool.y}
                    style={{fill:"none", stroke:"blue", 
                        strokeWidth:1,
                        vectorEffect:"non-scaling-stroke"}}/>
                <line 
                    x1={tool.x} y1={tool.y-2}
                    x2={tool.x} y2={tool.y+2}
                    style={{fill:"none", stroke:"blue", 
                        strokeWidth:1,
                        vectorEffect:"non-scaling-stroke"}}/>
                        
                {/* Рабочий инструмент на оси Z - черточка катается вверх-вниз */}
                <line 
                    x1={this.props.fold.dimX+20} y1={tool.z_y}
                    x2={this.props.fold.dimX+20+5} y2={tool.z_y}
                    style={{fill:"none", stroke:"orange", 
                        strokeWidth:2,
                        vectorEffect:"non-scaling-stroke"}}/>
            </g>
            </svg>
        );
    }
});

// отправляем компонент на публику
module.exports = DekartCanvas;

