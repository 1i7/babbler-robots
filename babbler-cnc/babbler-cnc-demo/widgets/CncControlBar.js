// CncControlBar.js

var React = require('react');

import {Button, Glyph} from 'elemental';

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

const btnStyle = {
  margin: 12
};

// Управление моторами
var RraptorControlPanel = React.createClass({
// https://facebook.github.io/react/docs/events.html
// http://elemental-ui.com/buttons
// http://elemental-ui.com/glyphs
// https://facebook.github.io/react/docs/jsx-in-depth.html
// https://github.com/facebook/react/issues/690

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
        this.props.babblerCnc.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.removeListener(BabblerCnc.Event.STATUS, this.cncStatusListener);
    },
    
    render: function() {
        var connected = this.state.deviceStatus === Babbler.Status.CONNECTED ? true : false;
        return (
            <span style={{...this.props.style, textAlign: "center"}}>
                <Button size="lg" type="danger"
                    onClick={this.cmd_stop}
                    disabled={!connected}
                    style={btnStyle} ><Glyph icon="primitive-square"/></Button>
                {(this.state.cncStatus === BabblerCnc.Status.PAUSED) ?
                    <Button size="lg" type="primary"
                        onClick={this.cmd_resume}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="triangle-right"/></Button> :
                    <Button size="lg" type="primary"
                        onClick={this.cmd_pause}
                        disabled={!connected || this.state.cncStatus !== BabblerCnc.Status.WORKING}
                        style={btnStyle} ><Glyph icon="quote"/></Button> 
                }
            </span>
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
        this.props.babblerCnc.babbler.sendCmd("pause", [], this.onResult);
    },
    
    cmd_resume: function() {
        this.props.babblerCnc.babbler.sendCmd("resume", [], this.onResult);
    },
    
    cmd_stop: function() {
        this.props.babblerCnc.babbler.sendCmd("stop", [], this.onResult);
    }
});

// отправляем компонент на публику
module.exports = RraptorControlPanel;

