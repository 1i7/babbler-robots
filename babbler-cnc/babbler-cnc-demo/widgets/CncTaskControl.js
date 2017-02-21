// RraptorControlPanel.js
var React = require('react');

import Babbler from 'babbler-js';

const {Raphael,Paper,Set,Circle,Ellipse,Image,Rect,Text,Path,Line} = require('react-raphael');

var CncTaskControl = React.createClass({
// https://github.com/liuhong1happy/react-raphael
// http://stackoverflow.com/questions/10940316/how-to-use-attrs-stroke-dasharray-stroke-linecap-stroke-linejoin-in-raphaeljs

    getInitialState: function() {
        return {
            deviceStatus: this.props.babbler.deviceStatus,
            pos: "0 0 0",
            err: ''
        };
    },
    
    componentDidMount: function() {
        // задержка между опросами устройства
        // по умолчанию получаем текущую позицию с устройства пять раз в секунду
        var pollDelay = this.props.pollDelay ? this.props.pollDelay : 200;
        
        // слушаем статус устройства
        this.deviceStatusListener = function(status) {
            this.setState({deviceStatus: status});
            
            // получаем текущую позицию с устройства если подключены
            if(status === Babbler.Status.CONNECTED) {
                var getPos = function() {
                    this.props.babbler.sendCmd("pos", [],
                        // onResult
                        function(err, reply, cmd, params) {
                            if(err) {
                                this.setState({err: err.message});
                                //console.warn(cmd + (params.length > 0 ? " " + params : "") + ": " + err);
                            } else {
                                this.setState({
                                    pos: reply,
                                    err: ''
                                });
                            }
                            
                            if(this.props.babbler.deviceStatus === Babbler.Status.CONNECTED) {
                                setTimeout(getPos, pollDelay);
                            }
                        }.bind(this)
                    );
                }.bind(this);
                getPos();
            }
        }.bind(this);
        this.props.babbler.on(Babbler.Event.STATUS, this.deviceStatusListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
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

