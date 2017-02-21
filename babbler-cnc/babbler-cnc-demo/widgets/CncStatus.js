// CncStatus.js

var React = require('react');

import Babbler from 'babbler-js';

// Статус станка: работает, остановлен, на паузе
// (working, stopped, paused)
var CncStatus = React.createClass({
// https://facebook.github.io/react/docs/events.html

    getInitialState: function() {
        return {
            deviceStatus: this.props.babbler.deviceStatus,
            cncStatus: "N/A"
        };
    },
    
    componentDidMount: function() {
        // задержка между опросами устройства
        // по умолчанию получаем статус устройства два раза в секунду
        var pollDelay = this.props.pollDelay ? this.props.pollDelay : 500;
        
        // слушаем статус устройства
        this.deviceStatusListener = function(status) {
            this.setState({deviceStatus: status});
            
            // получаем текущий статус активности устройства, если подключены
            if(status === Babbler.Status.CONNECTED) {
                var getCncStatus = function() {
                    this.props.babbler.sendCmd("status", [],
                        // onResult
                        function(err, reply, cmd, params) {
                            if(err) {
                                this.setState({err: err.message});
                                //console.warn(cmd + (params.length > 0 ? " " + params : "") + ": " + err);
                            } else {
                                this.setState({
                                    cncStatus: reply,
                                    err: ''
                                });
                            }
                            
                            if(this.props.babbler.deviceStatus === Babbler.Status.CONNECTED) {
                                setTimeout(getCncStatus, pollDelay);
                            }
                        }.bind(this)
                    );
                }.bind(this);
                getCncStatus();
            }
        }.bind(this);
        this.props.babbler.on(Babbler.Event.STATUS, this.deviceStatusListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
    },
    
    render: function() {
        var connected = this.state.deviceStatus === Babbler.Status.CONNECTED ? true : false;
        return (
            <span style={this.props.style}>{connected ? this.state.cncStatus : "N/A"}</span>
        );
    }
});

// отправляем компонент на публику
module.exports = CncStatus;

