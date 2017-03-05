// CncCalibrate.js

var React = require('react');

import {Button, ButtonGroup, Glyph} from 'elemental';

import Babbler from 'babbler-js';

const btnStyle = {
  margin: 12
};

const btnStyle1 = {
  marginTop: 12,
  marginBottom: 12
};

// Управление моторами
var CncCalibrate = React.createClass({
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
                    X:
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_x_backward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-left"/></Button>
                    <ButtonGroup>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_x_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_x_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_x_forward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-right"/></Button>
                </div>
                <div>
                    Y:
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_y_backward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-left"/></Button>
                    <ButtonGroup>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_y_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_y_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_y_forward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-right"/></Button>
                </div>
                <div>
                    Z:
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_z_backward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-left"/></Button>
                    <ButtonGroup>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_z_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_rr_go_z_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_rr_go_z_forward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-right"/></Button>
                </div>
                <div>
                err: {this.state.err}
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
    
    cmd_rr_go_x_forward: function() {
        this.props.babbler.sendCmd("calibrate", ["x", "1", "start"], this.onResult);
    },
    
    cmd_rr_go_x_backward: function() {
        this.props.babbler.sendCmd("calibrate", ["x", "-1", "start"], this.onResult);
    },
    
    cmd_rr_go_y_forward: function() {
        this.props.babbler.sendCmd("calibrate", ["y", "1", "start"], this.onResult);
    },
    
    cmd_rr_go_y_backward: function() {
        this.props.babbler.sendCmd("calibrate", ["y", "-1", "start"], this.onResult);
    },
    
    cmd_rr_go_z_forward: function() {
        this.props.babbler.sendCmd("calibrate", ["z", "1", "start"], this.onResult);
    },
    
    cmd_rr_go_z_backward: function() {
        this.props.babbler.sendCmd("calibrate", ["z", "-1", "start"], this.onResult);
    },
    
    cmd_stop: function() {
        this.props.babbler.sendCmd("stop", [], this.onResult);
    }
});

// отправляем компонент на публику
module.exports = CncCalibrate;

