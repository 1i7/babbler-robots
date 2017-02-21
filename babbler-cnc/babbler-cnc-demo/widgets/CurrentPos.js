// CurrentPos.js

var React = require('react');

import Babbler from 'babbler-js';

// Текущая позиция X,Y,Z
var CurrentPos = React.createClass({
// https://facebook.github.io/react/docs/events.html

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
        return (
            <span style={this.props.style}>{this.state.pos}</span>
        );
    }
});

// отправляем компонент на публику
module.exports = CurrentPos;

