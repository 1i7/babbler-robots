// CncXYZControl.js

var React = require('react');

import TextField from 'material-ui/TextField';
import {Button, ButtonGroup, Glyph} from 'elemental';

import Babbler from 'babbler-js';

const btnStyle = {
  margin: 12
};

const btnStyle1 = {
  marginTop: 12,
  marginBottom: 12
};


const txtStyle = {
  marginLeft: 12,
  marginRight: 12
}

// Управление моторами
var CncXYZControl = React.createClass({
// https://facebook.github.io/react/docs/events.html
// http://elemental-ui.com/buttons
// http://elemental-ui.com/glyphs

    getInitialState: function() {
        return {
            deviceStatus: this.props.babbler.deviceStatus,
            err: '',
            stepCountX: "10000",
            stepDelayX: "1000",
            stepCountY: "10000",
            stepDelayY: "1000",
            stepCountZ: "10000",
            stepDelayZ: "1000"
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
                    <ButtonGroup style={btnStyle}>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_x_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_x_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    
                    <TextField 
                        floatingLabelText="количество шагов"
                        hintText={"10000"}
                        value={this.state.stepCountX}
                        onChange={function(event) {
                            this.setState({stepCountX: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
                    <TextField 
                        floatingLabelText="задержка, мкс"
                        hintText={"1000"}
                        value={this.state.stepDelayX}
                        onChange={function(event) {
                            this.setState({stepDelayX: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
                </div>
                <div>
                    Y:
                    <ButtonGroup style={btnStyle}>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_y_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_y_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    
                    <TextField 
                        floatingLabelText="количество шагов"
                        hintText={"10000"}
                        value={this.state.stepCountY}
                        onChange={function(event) {
                            this.setState({stepCountY: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
                    <TextField 
                        floatingLabelText="задержка, мкс"
                        hintText={"1000"}
                        value={this.state.stepDelayY}
                        onChange={function(event) {
                            this.setState({stepDelayY: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
                </div>
                <div>
                    Z:
                    <ButtonGroup style={btnStyle}>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_z_backward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                        <Button size="lg" type="danger"
                            onClick={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                        <Button size="lg" type="warning"
                            onClick={this.cmd_step_z_forward}
                            disabled={!connected}
                            style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                    </ButtonGroup>
                    
                    <TextField 
                        floatingLabelText="количество шагов"
                        hintText={"10000"}
                        value={this.state.stepCountZ}
                        onChange={function(event) {
                            this.setState({stepCountZ: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
                    <TextField 
                        floatingLabelText="задержка, мкс"
                        hintText={"1000"}
                        value={this.state.stepDelayZ}
                        onChange={function(event) {
                            this.setState({stepDelayZ: event.target.value});
                        }.bind(this)}
                        disabled={!connected}
                        style={txtStyle}/>
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
    
    cmd_step_x_forward: function() {
        this.props.babbler.sendCmd("step", ["x", this.state.stepCountX, this.state.stepDelayX], this.onResult);
    },
    
    cmd_step_x_backward: function() {
        this.props.babbler.sendCmd("step", ["x", "-"+this.state.stepCountX, this.state.stepDelayX], this.onResult);
    },
    
    cmd_step_y_forward: function() {
        this.props.babbler.sendCmd("step", ["y", this.state.stepCountY, this.state.stepDelayY], this.onResult);
    },
    
    cmd_step_y_backward: function() {
        this.props.babbler.sendCmd("step", ["y", "-"+this.state.stepCountY, this.state.stepDelayY], this.onResult);
    },
    
    cmd_step_z_forward: function() {
        this.props.babbler.sendCmd("step", ["z", this.state.stepCountZ, this.state.stepDelayZ], this.onResult);
    },
    
    cmd_step_z_backward: function() {
        this.props.babbler.sendCmd("step", ["z", "-"+this.state.stepCountZ, this.state.stepDelayZ], this.onResult);
    },
    
    cmd_stop: function() {
        this.props.babbler.sendCmd("stop", [], this.onResult);
    }
});

// отправляем компонент на публику
module.exports = CncXYZControl;

