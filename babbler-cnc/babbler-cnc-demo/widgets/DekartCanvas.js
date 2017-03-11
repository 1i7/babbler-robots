// DekartCanvas.js
var React = require('react');

/**
 * mm
 * fold {
 *     x0, y0, z0, dimX, dimY, dimZ
 * }
 * 
 * mm
 * tool "x y z"
 */
var DekartCanvas = React.createClass({
// https://www.w3.org/TR/SVG/coords#TransformAttribute
// http://fcode.ninja/2015/11/11/svg-i-react-js-bez-boli/

    render: function() {
        //var grid = false;
        //var gridSpacing;
        //var unit;
        
        var foldMM = this.props.fold ? {
            dimX: this.props.fold.dimX/1000000,
            dimY: this.props.fold.dimY/1000000,
            dimZ: this.props.fold.dimZ/1000000
        } : {dimX: 0, dimY: 0, dimZ: 0};
            
        var toolMM = this.props.tool ? {
            x: this.props.tool.x/1000000,
            y: this.props.tool.y/1000000,
            z: this.props.tool.z/1000000
        } : {x: 0, y: 0, z: 0};
        
        // масштабируем реальную высоту по Z в экранную высоту по Y
        toolMM.z_y = (toolMM.z/foldMM.dimZ)*foldMM.dimY;
        
        // Посчитать радиус рабочего блока с учетом его "близости" к наблюдателю - 
        // чем выше блок по оси z, тем больше радиус.
        // Вариант с логорифмическим масштабом - чем ниже блок по оси z, тем быстрее
        // меняется радиус (приятнее для визуализации работы двумерного плоттера,
        // т.к. у него рабочий блок гуляет не по всей оси z, а меняет два
        // положения, оба близкие к поверхности стола).
        // https://github.com/1i7/rraptor/blob/master/RraptorPult/src/com/rraptor/pult/view/PlotterAreaView.java#L81
        var minRadius = 3, maxRadius = 8;
        // прибавляем к z единичку, чтобы не уходить в отрицательные значения
        toolMM.z_radius = minRadius + (maxRadius - minRadius) * 
            Math.log(toolMM.z + 1) / Math.log(foldMM.dimZ);
        
        return (
            <svg id="svg2" version="1.0"
                viewBox={"" +
                    -20 + " " +
                    -20 + " " +
                    (foldMM.dimX + 40 + 30) + " " +
                    (foldMM.dimY + 40)}
                style={this.props.style}>
         
            <g id="layer1"
                transform={
                    "scale(1, -1)" + 
                    " translate(0, -" + foldMM.dimY + ")"}>
                
                {/* Оси X, Y - рабочаая область - координатная плоскость */}
                <rect x={0} y={0} width={foldMM.dimX} height={foldMM.dimY}
                    style={{fill:"none", stroke:"gray", strokeWidth:1, strokeDasharray:"3 3",
                    vectorEffect:"non-scaling-stroke"}}/>
                
                <text
                    x={-10} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                <text
                    x={foldMM.dimX} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>x</text>
                <text
                    x={-10} y={-foldMM.dimY}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>y</text>
                        
                {/* Ось Z справа отдельно */}
                <line
                    x1={foldMM.dimX+20} y1={0}
                    x2={foldMM.dimX+20} y1={foldMM.dimY}
                    style={{fill:"none", stroke:"gray", 
                    strokeWidth:1, strokeDasharray:"3 3",
                    vectorEffect:"non-scaling-stroke"}}/>
                    
                <text
                    x={foldMM.dimX+20+10} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                <text
                    x={foldMM.dimX+20+10} y={-foldMM.dimY}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>z</text>
                 
                {/* Рабочий инструмент в плоскости X,Y:
                    - кружок перемещается по полю
                    - посередине крестик */}
                <circle cx={toolMM.x} cy={toolMM.y} r={toolMM.z_radius} 
                    style={{fill:"orange", opacity:0.6, stroke:"none"}}/>
                <line 
                    x1={toolMM.x-2} y1={toolMM.y}
                    x2={toolMM.x+2} y2={toolMM.y}
                    style={{fill:"none", stroke:"blue", 
                        strokeWidth:1,
                        vectorEffect:"non-scaling-stroke"}}/>
                <line 
                    x1={toolMM.x} y1={toolMM.y-2}
                    x2={toolMM.x} y2={toolMM.y+2}
                    style={{fill:"none", stroke:"blue", 
                        strokeWidth:1,
                        vectorEffect:"non-scaling-stroke"}}/>
                        
                {/* Рабочий инструмент на оси Z - черточка катается вверх-вниз */}
                <line 
                    x1={foldMM.dimX+20} y1={toolMM.z_y}
                    x2={foldMM.dimX+20+5} y2={toolMM.z_y}
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

