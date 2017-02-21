// CncControlBar.js

var React = require('react');

import {Button, Glyph} from 'elemental';

import Babbler from 'babbler-js';

const btnStyle = {
  margin: 12
};

// Управление моторами
var RraptorControlPanel = React.createClass({
// https://facebook.github.io/react/docs/events.html
// http://elemental-ui.com/buttons
// http://elemental-ui.com/glyphs

    getInitialState: function() {
        return {
            deviceStatus: this.props.babbler.deviceStatus,
            err: ''
        };
    },
    
    componentDidMount: function() {
        // слушаем статус устройства
        this.deviceStatusListener = function(status) {
            this.setState({deviceStatus: status});
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
            <div style={{textAlign: "center"}}>
                <div>
                    <Button size="lg" type="primary"
                        onClick={this.cmd_pause}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="quote"/></Button>
                    <Button size="lg" type="primary"
                        onClick={this.cmd_resume}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="triangle-right"/></Button>
                    <Button size="lg" type="danger"
                        onClick={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="primitive-square"/></Button>
                </div>
            </div>
        );
    },
    
    // onResult
    onResult: function(err, reply, cmd, params) {
        if(err) {
            this.setState({err: err.message});
        } else if(reply != 'ok') {
            this.setState({err: reply});
        } else { // reply == 'ok'
            this.setState({err: ''});
        }
    },
    
    cmd_pause: function() {
        this.props.babbler.sendCmd("pause", [], this.onResult);
    },
    
    cmd_resume: function() {
        this.props.babbler.sendCmd("resume", [], this.onResult);
    },
    
    cmd_stop: function() {
        this.props.babbler.sendCmd("stop", [], this.onResult);
    }
});

// отправляем компонент на публику
module.exports = RraptorControlPanel;

