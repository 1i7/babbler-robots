// CncTaskControl.js
var React = require('react');
require('react.animate');

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

import DekartCanvas from './DekartCanvas';

var CncTaskControl = React.createClass({
    mixins: [React.Animate],

    getInitialState: function() {
        return {
            deviceStatus: this.props.babblerCnc.babbler.deviceStatus,
            //pos: this.props.babblerCnc.pos,
            posX: this.props.babblerCnc.pos.x,
            posY: this.props.babblerCnc.pos.y,
            posZ: this.props.babblerCnc.pos.z,
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
                this.animate({posX: pos.x, posY: pos.y, posZ: pos.z}, 500);
                this.setState({
                //    pos: pos,
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
        return (
            <DekartCanvas
                    screen={this.props.screen}
                    fold={this.props.fold}
                    posX={this.state.posX} posY={this.state.posY} posZ={this.state.posZ}/>
        );
    }
});

// отправляем компонент на публику
module.exports = CncTaskControl;

