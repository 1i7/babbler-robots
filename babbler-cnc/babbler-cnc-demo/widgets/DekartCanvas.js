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
        
        // при больших абсолютных значениях размеров рабочей области
        // (например, если базовая единица измерения - нанометры)
        // движку SVG начинает сносить крышу, поэтому нужно понижать масштаб
        // всех координат
        var scaleFactor = 1000000;
        
        // рабочая область станка
        var foldMM = this.props.fold ? {
            dimX: this.props.fold.dimX/scaleFactor,
            dimY: this.props.fold.dimY/scaleFactor,
            dimZ: this.props.fold.dimZ/scaleFactor
        } : {dimX: 0, dimY: 0, dimZ: 0};
            
        var toolMM = this.props.tool ? {
            x: this.props.tool.x/scaleFactor,
            y: this.props.tool.y/scaleFactor,
            z: this.props.tool.z/scaleFactor
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
        var minRadius = 5, maxRadius = 10;
        // прибавляем к z единичку, чтобы не уходить в отрицательные значения
        toolMM.z_radius = minRadius + (maxRadius - minRadius) * 
            Math.log(toolMM.z + 1) / Math.log(foldMM.dimZ);
        
        var lab_txt_size = 12;
        
        window.onresize = function() {
            // Размеры некоторых элементов (метки на осях, рабочий инструмент, отступы)
            // не должны зависеть от масштаба - пересчитаем их вручную.
            // Многие из этих вычислений можно было бы заменить на атрибут элемента
            // vector-effect="non-scaling-size" (по аналогии с
            // vector-effect="non-scaling-stroke" для немасштабируемой толщины линии),
            // но он пока не принят в стандарт SVG2, тем более нигде не реализован
            // https://github.com/1i7/babbler-robots/issues/8
            
            var matrix = document.getElementById('dekart').getCTM();
            
            // видимая область
            document.getElementById('dekart').setAttribute("viewBox", "" +
                (-20 / matrix.a) + " " +
                (-20 / matrix.a) + " " +
                (foldMM.dimX + ((40 + 30)/ matrix.a)) + " " +
                (foldMM.dimY + (40 / matrix.a)) 
            );
            
            // рабочий инструмент на плоскости xy - кружочек с крестиком
            document.getElementById('tool_x_y').r.baseVal.value = toolMM.z_radius / matrix.a;
            document.getElementById('tool_x_y_l1').x1.baseVal.value = toolMM.x - (2 / matrix.a);
            document.getElementById('tool_x_y_l1').x2.baseVal.value = toolMM.x + (2 / matrix.a);
            document.getElementById('tool_x_y_l2').y1.baseVal.value = toolMM.y - (2 / matrix.a);
            document.getElementById('tool_x_y_l2').y2.baseVal.value = toolMM.y + (2 / matrix.a);
            
            // рабочий инструмент на оси z - горизонтальная полосочка
            document.getElementById('tool_z').x1.baseVal.value = foldMM.dimX + (20 / matrix.a);
            document.getElementById('tool_z').x2.baseVal.value = foldMM.dimX + ((20 + 10) / matrix.a);
            
            // ось z
            document.getElementById('axis_z').x1.baseVal.value = foldMM.dimX + (20 / matrix.a);
            document.getElementById('axis_z').x2.baseVal.value = foldMM.dimX + (20 / matrix.a);
            
            // метки на осях
            document.getElementById('lab_xy_0').x.baseVal[0].value = -10 / matrix.a;
            document.getElementById('lab_xy_0').y.baseVal[0].value = 10 / matrix.a;
            document.getElementById('lab_xy_0').style.fontSize = lab_txt_size / matrix.a;
            
            document.getElementById('lab_x').y.baseVal[0].value = 10 / matrix.a;
            document.getElementById('lab_x').style.fontSize = lab_txt_size / matrix.a;
            
            document.getElementById('lab_y').x.baseVal[0].value = -10 / matrix.a;
            document.getElementById('lab_y').style.fontSize = lab_txt_size / matrix.a;
            
            // z
            document.getElementById('lab_z_0').x.baseVal[0].value = foldMM.dimX + ((20 + 10) / matrix.a);
            document.getElementById('lab_z_0').y.baseVal[0].value = 10 / matrix.a;
            document.getElementById('lab_z_0').style.fontSize = lab_txt_size / matrix.a;
            
            document.getElementById('lab_z').x.baseVal[0].value = foldMM.dimX + ((20 + 10) / matrix.a);
            document.getElementById('lab_z').style.fontSize = lab_txt_size / matrix.a;
        }
        
        return (
            <svg id="dekart" version="1.0"
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
                    style={{fill: "none", stroke: "gray", strokeWidth: 1, strokeDasharray: "3 3",
                    vectorEffect: "non-scaling-stroke"}}/>
                
                <text id="lab_xy_0"
                    x={-10} y={10}
                    style={{stroke:"gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                
                <text id="lab_x"
                    x={foldMM.dimX} y={10}
                    style={{stroke: "gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>x</text>
                <text id="lab_y"
                    x={-10} y={-foldMM.dimY}
                    style={{stroke: "gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>y</text>
                        
                {/* Ось Z справа отдельно */}
                <line id="axis_z"
                    x1={foldMM.dimX+20} y1={0}
                    x2={foldMM.dimX+20} y1={foldMM.dimY}
                    style={{fill: "none", stroke: "gray", 
                    strokeWidth: 1, strokeDasharray: "3 3",
                    vectorEffect: "non-scaling-stroke"}}/>
                    
                <text id="lab_z_0"
                    x={foldMM.dimX+20+10} y={10}
                    style={{stroke: "gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>0</text>
                <text id="lab_z"
                    x={foldMM.dimX+20+10} y={-foldMM.dimY}
                    style={{stroke: "gray", fontSize: "12px", 
                        transform: "scale(1, -1)"}}>z</text>
                 
                {/* Рабочий инструмент в плоскости X,Y:
                    - кружок перемещается по полю
                    - посередине крестик */}
                <circle id="tool_x_y" cx={toolMM.x} cy={toolMM.y} r={toolMM.z_radius} 
                    style={{fill: "orange", opacity:0.6, stroke: "none"}}/>
                <line id="tool_x_y_l1"
                    x1={toolMM.x-2} y1={toolMM.y}
                    x2={toolMM.x+2} y2={toolMM.y}
                    style={{fill: "none", stroke: "blue",
                        strokeWidth: 1,
                        vectorEffect: "non-scaling-stroke"}}/>
                <line id="tool_x_y_l2"
                    x1={toolMM.x} y1={toolMM.y-2}
                    x2={toolMM.x} y2={toolMM.y+2}
                    style={{fill: "none", stroke: "blue", 
                        strokeWidth: 1,
                        vectorEffect: "non-scaling-stroke"}}/>
                        
                {/* Рабочий инструмент на оси Z - черточка катается вверх-вниз */}
                <line id="tool_z"
                    x1={foldMM.dimX+20} y1={toolMM.z_y}
                    x2={foldMM.dimX+20+10} y2={toolMM.z_y}
                    style={{fill: "none", stroke: "orange", 
                        strokeWidth: 2,
                        vectorEffect: "non-scaling-stroke"}}/>
            </g>
            </svg>
        );
    },
    componentDidMount: function() {
        window.onresize();
    },
    componentDidUpdate: function() {
        window.onresize();
    }
});

// отправляем компонент на публику
module.exports = DekartCanvas;

