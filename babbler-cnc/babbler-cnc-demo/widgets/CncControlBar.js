// CncControlBar.js

var React = require('react');

import {Button} from 'elemental';

import Babbler from 'babbler-js';
import BabblerCnc from '../../babbler-cnc-js/src/babbler-cnc';

const btnStyle = {
  margin: 12,
  paddingLeft: "0.6em",
  paddingRight: "0.6em"
};

const iconStyle = {
  fill: "white",
  stroke: "none"
}

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
                    style={btnStyle}>
                        <svg version="1.0"
                                width="20" height="20"
                                viewBox="0 0 265 265">
                            {/* Unicode Character 'BLACK SQUARE FOR STOP' (U+23F9)
                              * http://www.fileformat.info/info/unicode/char/23f9/index.htm */}
                            <path d="M196.875 287.1562 L34.875 287.1562 L34.875 125.1562 L196.875 125.1562 L196.875 287.1562 Z"
                                style={iconStyle}/>
                        </svg>
                    </Button>
                {(this.state.cncStatus === BabblerCnc.Status.PAUSED) ?
                    <Button size="lg" type="primary"
                            onClick={this.cmd_resume}
                            disabled={!connected}
                            style={btnStyle}>
                        <svg version="1.0"
                                width="20" height="20"
                                viewBox="0 40 250 250">
                            {/* Unicode Character 'BLACK MEDIUM RIGHT-POINTING TRIANGLE' (U+23F5)
                              * http://www.fileformat.info/info/unicode/char/23f5/index.htm */}
                            <path d="M160.875 202.5 L70.875 292.5 L70.875 112.5 L160.875 202.5 Z"
                                style={iconStyle}/>
                        </svg>
                    </Button> :
                    <Button size="lg" type="primary"
                            onClick={this.cmd_pause}
                            disabled={!connected || this.state.cncStatus !== BabblerCnc.Status.WORKING}
                            style={{...btnStyle, paddingLeft: "0.6em", paddingRight: "0.6em"}}>
                        <svg version="1.0"
                                width="20" height="20"
                                viewBox="0 0 265 265">
                            {/* Unicode Character 'DOUBLE VERTICAL BAR' (U+23F8)
                              * http://www.fileformat.info/info/unicode/char/23f8/index.htm */}
                            <path d="M169.875 301.5 L133.875 301.5 L133.875 121.5 L169.875 121.5 L169.875 301.5 ZM97.875 301.5 L61.875 301.5 L61.875 121.5 L97.875 121.5 L97.875 301.5 Z"
                                style={iconStyle}/>
                        </svg>
                    </Button>
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

