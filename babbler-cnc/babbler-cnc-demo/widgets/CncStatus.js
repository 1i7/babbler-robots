// CncStatus.js

var React = require('react');

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

// Статус станка: работает, остановлен, на паузе
// (working, stopped, paused)
var CncStatus = React.createClass({
// https://facebook.github.io/react/docs/events.html

    getInitialState: function() {
        return {
            deviceStatus: this.props.babblerCnc.babbler.deviceStatus,
            cncStatus: this.props.babblerCnc.status
        };
    },
    
    componentDidMount: function() {
        // слушаем статус устройства
        this.deviceStatusListener = function(status) {
            this.setState({deviceStatus: status});
        }.bind(this);
        
        // и статус рабочего блока устройства
        // слушаем текущую позицию рабочего инструмента
        this.cncStatusListener = function(status) {
            this.setState({
                cncStatus: status,
            });
        }.bind(this);
        
        this.props.babblerCnc.babbler.on(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.on(BabblerCnc.Event.STATUS, this.cncStatusListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.bablerCnc.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babbler.removeListener(BabblerCnc.Event.STATUS, this.cncStatusListener);
    },
    
    render: function() {
        var connected = this.state.deviceStatus === Babbler.Status.CONNECTED ? true : false;
        return (
            <span
                style={(connected ? this.props.style : {...this.props.style, color: "gray"})}
            >{this.state.cncStatus}</span>
        );
    }
});

// отправляем компонент на публику
module.exports = CncStatus;

