// CncTaskControl.js
var React = require('react');
require('react.animate');

import {Button, ButtonGroup, Glyph} from 'elemental';
import Paper from 'material-ui/Paper';

import DekartCanvas from './DekartCanvas';

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';


const btnStyle = {
  margin: 12,
  width: 50
};

const btnStyle1 = {
  marginTop: 12,
  marginBottom: 12,
  width: 50
};

const btnStyle2 = {
  marginLeft: 12,
  marginRight: 12,
  width: 50
};


var CncTaskControl = React.createClass({
    mixins: [React.Animate],

    getInitialState: function() {
        return {
            deviceStatus: this.props.babblerCnc.babbler.deviceStatus,
            dimX: this.props.babblerCnc.dim.x,
            dimY: this.props.babblerCnc.dim.y,
            dimZ: this.props.babblerCnc.dim.z,
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
                    err: ''
                });
            }
        }.bind(this);
        
        // слушаем текущую позицию рабочего инструмента
        this.cncDimListener = function(dim, err) {
            if(err) {
                this.setState({err: err.message});
            } else {
                this.animate({dimX: dim.x, dimY: dim.y, dimZ: dim.z}, 500);
                this.setState({
                    err: ''
                });
            }
        }.bind(this);
        
        this.props.babblerCnc.babbler.on(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.on(BabblerCnc.Event.POSITION, this.cncPosListener);
        this.props.babblerCnc.on(BabblerCnc.Event.DIMENSIONS, this.cncDimListener);
    },
    
    componentWillUnmount: function() {
        // почистим слушателей
        this.props.babblerCnc.babbler.removeListener(Babbler.Event.STATUS, this.deviceStatusListener);
        this.props.babblerCnc.removeListener(BabblerCnc.Event.POSITION, this.cncPosListener);
        this.props.babblerCnc.removeListener(BabblerCnc.Event.DIMENSIONS, this.cncDimListener);
    },
    
    render: function() {
        var connected = this.state.deviceStatus === Babbler.Status.CONNECTED ? true : false;
        return (
            <div style={{display: "flex", flexFlow: "row"}}>
                <div style={{flexBasis: "0px",
                        verticalAlign:"top", textAlign: "right",
                        paddingTop: 60, marginLeft: 60}}>
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_whirl_y_forward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle}><Glyph icon="chevron-up"/></Button>
                        
                    <Button size="lg" type="warning"
                        onClick={this.cmd_whirl_y_forward}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0}}><Glyph icon="triangle-up"/></Button>
                    <Button size="lg" type="danger"
                        onClick={this.cmd_stop}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderRadius: 0}}><Glyph icon="primitive-square"/></Button>
                    <Button size="lg" type="warning"
                        onClick={this.cmd_whirl_y_backward}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0}}><Glyph icon="triangle-down"/></Button>
                    
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_whirl_y_backward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-down"/></Button>
                </div>
                <div style={{flexBasis: "100%", textAlign: "center"}}>
                    <Paper zDepth={3} style={{margin:10}}>
                        <DekartCanvas
                            style={this.props.dekartStyle}
                            fold={{dimX: this.state.dimX, dimY: this.state.dimY, dimZ: this.state.dimZ}}
                            tool={{x: this.state.posX, y: this.state.posY, z: this.state.posZ}}/>
                    </Paper>
                    <div>
                        <Button size="lg" type="primary"
                            onMouseDown={this.cmd_whirl_x_backward}
                            onMouseUp={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle} ><Glyph icon="chevron-left"/></Button>
                        <ButtonGroup>
                            <Button size="lg" type="warning"
                                onClick={this.cmd_whirl_x_backward}
                                disabled={!connected}
                                style={btnStyle1} ><Glyph icon="triangle-left"/></Button>
                            <Button size="lg" type="danger"
                                onClick={this.cmd_stop}
                                disabled={!connected}
                                style={btnStyle1} ><Glyph icon="primitive-square"/></Button>
                            <Button size="lg" type="warning"
                                onClick={this.cmd_whirl_x_forward}
                                disabled={!connected}
                                style={btnStyle1} ><Glyph icon="triangle-right"/></Button>
                        </ButtonGroup>
                        <Button size="lg" type="primary"
                            onMouseDown={this.cmd_whirl_x_forward}
                            onMouseUp={this.cmd_stop}
                            disabled={!connected}
                            style={btnStyle} ><Glyph icon="chevron-right"/></Button>
                    </div>
                </div>
                <div style={{flexBasis:"0px",
                       verticalAlign:"top", textAlign: "left",
                       paddingTop: 60, marginRight: 60}}>
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_whirl_z_forward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle}><Glyph icon="chevron-up"/></Button>
                    
                    <Button size="lg" type="warning"
                        onClick={this.cmd_whirl_z_forward}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0}}><Glyph icon="triangle-up"/></Button>
                    <Button size="lg" type="danger"
                        onClick={this.cmd_stop}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderRadius: 0}}><Glyph icon="primitive-square"/></Button>
                    <Button size="lg" type="warning"
                        onClick={this.cmd_whirl_z_backward}
                        disabled={!connected}
                        style={{...btnStyle2,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0}}><Glyph icon="triangle-down"/></Button>
                    
                    <Button size="lg" type="primary"
                        onMouseDown={this.cmd_whirl_z_backward}
                        onMouseUp={this.cmd_stop}
                        disabled={!connected}
                        style={btnStyle} ><Glyph icon="chevron-down"/></Button>
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
    
    cmd_whirl_x_forward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["x", "1", "1000"], this.onResult);
    },
    
    cmd_whirl_x_backward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["x", "-1", "1000"], this.onResult);
    },
    
    cmd_whirl_y_forward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["y", "1", "1000"], this.onResult);
    },
    
    cmd_whirl_y_backward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["y", "-1", "1000"], this.onResult);
    },
    
    cmd_whirl_z_forward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["z", "1", "1000"], this.onResult);
    },
    
    cmd_whirl_z_backward: function() {
        this.props.babblerCnc.babbler.sendCmd("whirl", ["z", "-1", "1000"], this.onResult);
    },
    
    cmd_stop: function() {
        this.props.babblerCnc.babbler.sendCmd("stop", [], this.onResult);
    }
});

// отправляем компонент на публику
module.exports = CncTaskControl;

