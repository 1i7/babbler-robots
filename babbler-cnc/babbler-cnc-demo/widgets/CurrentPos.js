// CurrentPos.js

var React = require('react');

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

// Текущая позиция X,Y,Z
var CurrentPos = React.createClass({
// https://facebook.github.io/react/docs/events.html

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
        var connected = this.state.deviceStatus === Babbler.Status.CONNECTED ? true : false;
        return (
            <span
                style={(connected ? this.props.style : {...this.props.style, color: "gray"})}
            >{this.state.pos}</span>
        );
    }
});

// отправляем компонент на публику
module.exports = CurrentPos;

