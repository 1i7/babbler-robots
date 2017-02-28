// CncTaskControl.js
var React = require('react');

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

const {Raphael,Paper,Set,Circle,Ellipse,Image,Rect,Text,Path,Line} = require('react-raphael');

var CncTaskControl = React.createClass({
// https://github.com/liuhong1happy/react-raphael
// http://stackoverflow.com/questions/10940316/how-to-use-attrs-stroke-dasharray-stroke-linecap-stroke-linejoin-in-raphaeljs

    getInitialState: function() {
        return {
            deviceStatus: this.props.babblerCnc.babbler.deviceStatus,
            pos: this.props.babblerCnc.pos,
            err: this.props.babblerCnc.posErr
        };
    },
    
    componentDidMount: function() {
        // слушаем статус устройства
        this.deviceStatusListener = function(status) {
            this.setState({deviceStatus: status});
        }.bind(this);
        
        // слушаем текущую позицию рабочего инструмента
        this.cncPosListener = function(pos, err) {
            if(err) {
                this.setState({err: err.message});
            } else {
                this.setState({
                    pos: pos,
                    err: ''
                });
            }
        }.bind(this);
        
        this.props.babblerCnc.babbler.on(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.on(BabblerCnc.Event.POSITION, this.cncPosListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.babblerCnc.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.removeListener(BabblerCnc.Event.POSITION, this.cncPosListener);
    },
    
    render: function() {
        var tableWidth = 300*2; // mm
        var tableLength = 216*2; // mm
        var tableHeight = 100*2; // mm
        
        var posArr = this.state.pos.split(" ");
        
        var posX = parseInt(posArr[0], 10)/1000000*2;
        var posY = parseInt(posArr[1], 10)/1000000*2;
        var posZ = parseInt(posArr[2], 10)/1000000*2;
        
        return (
            <Paper width={800} height={500}>
                <Rect x={30} y={30} width={tableWidth} height={tableLength} 
                    attr={{"fill":"none", "stroke":"black", "stroke-width":1, "stroke-dasharray":"--"}}/>
                <Line x1={30+tableWidth+40} y1={30} x2={30+tableWidth+40} y2={30+tableLength} 
                    attr={{"fill":"none", "stroke":"black", "stroke-width":1, "stroke-dasharray":"--"}}/>
                    
                <Text x={20} y={20} text={"y"}
                    attr={{"font-size": 12}}/>
                <Text x={20} y={tableLength+20+20} text={"0"}
                    attr={{"font-size": 12}}/>
                <Text x={tableWidth+20+20} y={tableLength+20+20} text={"x"}
                    attr={{"font-size": 12}}/>
                    
                <Text x={tableWidth+20+60} y={tableLength+20+20} text={"0"}
                    attr={{"font-size": 12}}/>
                <Text x={tableWidth+20+60} y={20} text={"z"}
                    attr={{"font-size": 12}}/>
                    
                <Circle x={posX} y={posY} r={2}/>
                
            </Paper>
        );
    }
});

// отправляем компонент на публику
module.exports = CncTaskControl;

