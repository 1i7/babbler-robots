// DekartCanvas2.js
var React = require('react');

/**
 * Декартова плоскость с линейкой
 * 
 * mm
 * fold {
 *     x0, y0, z0, dimX, dimY, dimZ
 * }
 * 
 * mm
 * tool "x y z"
 */
var DekartCanvas2 = React.createClass({
// https://www.w3.org/TR/SVG/coords#TransformAttribute
// http://fcode.ninja/2015/11/11/svg-i-react-js-bez-boli/

    getInitialState: function() {
        return {
            rulerX: [],
            rulerY: [],
            rulerZ: []
        };
    },

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
        var indent_x = 40;
        var indent_y = 30;
        var z_gap = 30;
        
        var createRulers = function() {
            // линейки
            var rulerX = [];
            var rulerY = [];
            var rulerZ = [];
            
            var tick1_h = 10;
            var tick2_h = 6;
            var tick_font_size = 8;
            
            // реальный размер рабочей области на экране
            var matrix = document.getElementById('dekart').getCTM();
            var width = foldMM.dimX * matrix.a;
            
            var k = 1;
            while((foldMM.dimX / width) / k  > 0.3) {
                k *= 10;
            }
            
            var i;
            for (i = 0; i <= foldMM.dimX; i+=k) {
                rulerX.push(
                    <line key={i}
                        x1={i} y1={foldMM.dimY + ((i/k)%10 == 0 ? tick1_h : tick2_h)/matrix.a}
                        x2={i} y2={foldMM.dimY}
                        style={{fill: "none", stroke: "black", 
                            strokeWidth: 1,
                            vectorEffect: "non-scaling-stroke"}}/>
                );
                // метки на штрихах каждые 10 шрихов
                if((i/k)%10 == 0) {
                    rulerX.push(
                        <text key={"tick"+i}
                            x={i + 2/matrix.a} y={-(foldMM.dimY + 2/matrix.a)}
                            style={{stroke:"gray", fontSize: tick_font_size/matrix.a,
                                strokeWidth: 0.1,
                                transform: "scale(1, -1)"}}>{i}</text>
                    );
                }
            }
            
            for (i = 0; i <= foldMM.dimY; i+=k) {
                rulerY.push(
                    <line key={i}
                        x1={-((i/k)%10 == 0 ? tick1_h : tick2_h)/matrix.a} y1={i}
                        x2={0} y2={i}
                        style={{fill: "none", stroke: "black", 
                            strokeWidth: 1,
                            vectorEffect: "non-scaling-stroke"}}/>
                );
                // метки на штрихах каждые 10 шрихов
                if((i/k)%10 == 0) {
                    rulerY.push(
                        <text key={"tick"+i}
                            x={-15/matrix.a} y={-(i + 2/matrix.a)}
                            style={{stroke:"gray", fontSize: tick_font_size/matrix.a,
                                strokeWidth: 0.1,
                                transform: "scale(1, -1)"}}>{i}</text>
                    );
                }
            }
            
            // Ось Z дополнительно масштабирована под высоту Y
            var k_z2y = foldMM.dimY/foldMM.dimZ;
            for (i = 0; i <= foldMM.dimZ; i+=k) {
                rulerZ.push(
                    <line key={i}
                        x1={foldMM.dimX + (z_gap + ((i/k)%10 == 0 ? tick1_h : tick2_h))/matrix.a} y1={i*k_z2y}
                        x2={foldMM.dimX + z_gap/matrix.a} y2={i*k_z2y}
                        style={{fill: "none", stroke: "black", 
                            strokeWidth: 1,
                            vectorEffect: "non-scaling-stroke"}}/>
                );
                // метки на штрихах каждые 10 шрихов
                if((i/k)%10 == 0) {
                    rulerZ.push(
                        <text key={"tick"+i}
                            x={foldMM.dimX + (z_gap+2)/matrix.a} y={-(i*k_z2y + 2/matrix.a)}
                            style={{stroke:"gray", fontSize: tick_font_size/matrix.a,
                                strokeWidth: 0.1,
                                transform: "scale(1, -1)"}}>{i}</text>
                    );
                }
            }
            
            this.setState({rulerX: rulerX, rulerY: rulerY, rulerZ: rulerZ});
        }.bind(this);
        
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
                (-indent_x / matrix.a) + " " +
                (-indent_y / matrix.a) + " " +
                (foldMM.dimX + ((indent_x*2 + z_gap)/ matrix.a)) + " " +
                (foldMM.dimY + (indent_y*2 / matrix.a)) 
            );
            
            // ось z
            document.getElementById('axis_z').x1.baseVal.value = foldMM.dimX + (z_gap / matrix.a);
            document.getElementById('axis_z').x2.baseVal.value = foldMM.dimX + (z_gap / matrix.a);
            
            // метки на осях
            document.getElementById('lab_x').y.baseVal[0].value = 10 / matrix.a;
            document.getElementById('lab_x').style.fontSize = lab_txt_size / matrix.a;
            
            document.getElementById('lab_y').x.baseVal[0].value = -30 / matrix.a;
            document.getElementById('lab_y').style.fontSize = lab_txt_size / matrix.a;
            
            // z
            document.getElementById('lab_z').x.baseVal[0].value = foldMM.dimX + ((z_gap+20) / matrix.a);
            document.getElementById('lab_z').style.fontSize = lab_txt_size / matrix.a;
            
            // рабочий инструмент на плоскости xy - кружочек с крестиком
            document.getElementById('tool_x_y').r.baseVal.value = toolMM.z_radius / matrix.a;
            document.getElementById('tool_x_y_l1').x1.baseVal.value = toolMM.x - (2 / matrix.a);
            document.getElementById('tool_x_y_l1').x2.baseVal.value = toolMM.x + (2 / matrix.a);
            document.getElementById('tool_x_y_l2').y1.baseVal.value = toolMM.y - (2 / matrix.a);
            document.getElementById('tool_x_y_l2').y2.baseVal.value = toolMM.y + (2 / matrix.a);
            
            // рабочий инструмент на оси z - горизонтальная полосочка
            document.getElementById('tool_z').x1.baseVal.value = foldMM.dimX + (z_gap / matrix.a);
            document.getElementById('tool_z').x2.baseVal.value = foldMM.dimX + ((z_gap - 10) / matrix.a);
            
            // пересоздадим линейки с учетом нового масштаба
            // внутри createRulers будет вызван setState, что не очень хорошо,
            // т.к. после него будет вызван componentDidUpdate, внутри которого
            // будет опять вызван текущий window.onresize, внутри которого
            // будет вызван createRulers и т.п.
            // Чтобы не вызвать бесконечную рекурсию вставим хак с флагом fromRulers:
            // не самый красивый вариант, но пока другое не приходит в голову.
            if(!this.fromRulerz) {
                this.fromRulerz = true;
                createRulers();
            } else {
                this.fromRulerz = false;
            }
        }.bind(this);
        
        return (
            <svg id="dekart" version="1.0"
                viewBox={"" +
                    -indent_x + " " +
                    -indent_y + " " +
                    (foldMM.dimX + indent_x*2 + z_gap) + " " +
                    (foldMM.dimY + indent_y*2)}
                style={this.props.style}
                shapeRendering="crispEdges">
                
         
            <g id="layer1"
                transform={
                    "scale(1, -1)" + 
                    " translate(0, -" + foldMM.dimY + ")"}>
                    
                /* Линейки по X и Y */
                {this.state.rulerX}
                {this.state.rulerY}
                {this.state.rulerZ}
                                
                {/* Оси X, Y - рабочаая область - координатная плоскость */}
                <rect x={0} y={0} width={foldMM.dimX} height={foldMM.dimY}
                    style={{fill: "none", stroke: "gray", strokeWidth: 1, /*strokeDasharray: "3 3",*/
                    vectorEffect: "non-scaling-stroke"}}/>
                
                <text id="lab_x"
                    x={foldMM.dimX} y={10}
                    style={{stroke: "gray", fontSize: "12px", strokeWidth: 0.1,
                        transform: "scale(1, -1)"}}>x</text>
                <text id="lab_y"
                    x={-30} y={-foldMM.dimY}
                    style={{stroke: "gray", fontSize: "12px", strokeWidth: 0.1,
                        transform: "scale(1, -1)"}}>y</text>
                        
                {/* Ось Z справа отдельно */}
                <line id="axis_z"
                    x1={foldMM.dimX+20} y1={0}
                    x2={foldMM.dimX+20} y1={foldMM.dimY}
                    style={{fill: "none", stroke: "gray",
                    strokeWidth: 1, /*strokeDasharray: "3 3",*/
                    vectorEffect: "non-scaling-stroke"}}/>
                
                <text id="lab_z"
                    x={foldMM.dimX+z_gap+20} y={-foldMM.dimY}
                    style={{stroke: "gray", fontSize: "12px", strokeWidth: 0.1,
                        transform: "scale(1, -1)"}}>z</text>
                 
                {/* Рабочий инструмент в плоскости X,Y:
                    - кружок перемещается по полю
                    - посередине крестик */}
                <circle id="tool_x_y" cx={toolMM.x} cy={toolMM.y} r={toolMM.z_radius} 
                    style={{fill: "orange", opacity:0.6, stroke: "none"}}
                    shapeRendering="auto"/>
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
                        
                <line
                    x1={toolMM.x} y1={0}
                    x2={toolMM.x} y2={foldMM.dimY}
                    style={{fill: "none", stroke: "blue",
                        strokeWidth: 1, opacity: 0.6,
                        vectorEffect: "non-scaling-stroke"}}/>
                <line
                    x1={0} y1={toolMM.y}
                    x2={foldMM.dimX} y2={toolMM.y}
                    style={{fill: "none", stroke: "blue",
                        strokeWidth: 1, opacity: 0.6,
                        vectorEffect: "non-scaling-stroke"}}/>
                        
                {/* Рабочий инструмент на оси Z - черточка катается вверх-вниз */}
                <line id="tool_z"
                    x1={foldMM.dimX+z_gap} y1={toolMM.z_y}
                    x2={foldMM.dimX+z_gap-10} y2={toolMM.z_y}
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
module.exports = DekartCanvas2;

