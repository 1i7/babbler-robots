// QueueStatus.js

var React = require('react');

import Babbler from 'babbler-js';

// Управление моторами
var QueueStatus = React.createClass({
// https://facebook.github.io/react/docs/events.html

    getInitialState: function() {
        return {
            queueLength: this.props.babbler.queueLength,
            queueLimit: this.props.babbler.queueLimit
        };
    },
    
    componentDidMount: function() {
        // слушаем события очереди команд
        this.dataListener = function(data, dir) {
            // команда добавлена или удалена из очереди
            if(dir === Babbler.DataFlow.QUEUE) {
                this.setState({
                    queueLength: this.props.babbler.queueLength,
                    queueLimit: this.props.babbler.queueLimit
                });
            }
        }.bind(this);
        this.dataErrorListener = function(data, dir, err) {
            // команда добавлена или удалена из очереди
            if(dir === Babbler.DataFlow.QUEUE) {
                this.setState({
                    queueLength: this.props.babbler.queueLength,
                    queueLimit: this.props.babbler.queueLimit
                });
            }
        }.bind(this);
        this.props.babbler.on(Babbler.Event.DATA, this.dataListener);
        this.props.babbler.on(Babbler.Event.DATA_ERROR, this.dataErrorListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.babbler.removeListener(Babbler.Event.DATA, this.dataListener);
        this.props.babbler.removeListener(Babbler.Event.DATA_ERROR, this.dataErrorListener);
    },
    
    render: function() {
        return (
            <span style={this.props.style}>
                {this.state.queueLength} {(this.state.queueLimit > 0 ? "/ " + this.state.queueLimit : "")}
            </span>
        );
    },
    
});

// отправляем компонент на публику
module.exports = QueueStatus;

