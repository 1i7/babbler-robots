// react-app-ui.js

var React = require('react');
var ReactDOM = require('react-dom');

// виджеты MaterialUI
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';
import Divider from 'material-ui/Divider';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import FontIcon from 'material-ui/FontIcon';
import {red200, green200} from 'material-ui/styles/colors';

import Subheader from 'material-ui/Subheader';

// виджеты Babbler MaterialUI
//var BabblerConnectionStatusIcon = require('babbler-js-material-ui').BabblerConnectionStatusIcon;
//var BabblerConnectionErrorSnackbar = require('babbler-js-material-ui').BabblerConnectionErrorSnackbar;
//var BabblerConnectionPanel = require('babbler-js-material-ui').BabblerConnectionPanel;
//var BabblerDataFlow = require('babbler-js-material-ui').BabblerDataFlow;

import BabblerConnectionStatusIcon from 'babbler-js-material-ui/lib/BabblerConnectionStatusIcon';
import BabblerConnectionErrorSnackbar from 'babbler-js-material-ui/lib/BabblerConnectionErrorSnackbar';
import BabblerConnectionPanel from 'babbler-js-material-ui/lib/BabblerConnectionPanel';
import BabblerDataFlow from 'babbler-js-material-ui/lib/BabblerDataFlow';
import BabblerDebugPanel from 'babbler-js-material-ui/lib/BabblerDebugPanel';

import QueueStatus from './widgets/QueueStatus';

import CncStatus from './widgets/CncStatus';
import CurrentPos from './widgets/CurrentPos';
import CncControlBar from './widgets/CncControlBar';
import CncCalibrate from './widgets/CncCalibrate';
import CncXYZControl from './widgets/CncXYZControl';

import CncTaskControl from './widgets/CncTaskControl';
//import DekartCanvas from './widgets/DekartCanvas';

// Babbler.js
import Babbler from 'babbler-js';
//import Babbler from '../../../babbler-js/src/babbler';
import BabblerCnc from '../babbler-cnc-js/src/babbler-cnc';

const btnStyle = {
  margin: 12
};


// Устройство Babbler, подключенное к последовательному порту
var babbler1 = new Babbler();
var babblerCnc1 = new BabblerCnc(babbler1, {posPollDelay: 200});

// Т.к. добавляем много слушателей, получаем предупреждение:
// (node) warning: possible EventEmitter memory leak detected. 11 listeners added. 
// Use emitter.setMaxListeners() to increase limit.
babbler1.setMaxListeners(20);

// babbler1.on(Babbler.Event.STATUS, function(){});
 
// Контент приложения
ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <div>
        <Paper style={{textAlign: "right"}}>
            <CncControlBar babblerCnc={babblerCnc1}
                style={{position: "absolute", left: 0, marginLeft: 14}}/>
            <BabblerConnectionPanel babbler={babbler1}/>
            <BabblerConnectionStatusIcon
                babbler={babbler1}
                iconSize={50}
                style={{marginRight: 4, marginLeft: 10}} />
        </Paper>
        
        <Tabs style={{marginTop: 10, marginBottom: 15}}>
            <Tab label="Станок" >
                <CncTaskControl babblerCnc={babblerCnc1}
                    dekartStyle={{width: "100%", height: "calc(100vh - 250px)", minHeight:350}}/>
            </Tab>
            <Tab label="Моторы" >
                <div style={{padding: 30, paddingTop: 40, textAlign: "center"}}>
                    <Paper style={{textAlign: "center", display: "inline-block", padding: 20}}>
                        <CncXYZControl babbler={babbler1}/>
                    </Paper>
                </div>
            </Tab>
            <Tab label="Калибровка" >
                <div style={{padding: 30, paddingTop: 40, textAlign: "center"}}>
                    <Paper style={{textAlign: "center", display: "inline-block", padding: 20}}>
                        <CncCalibrate babbler={babbler1}/>
                    </Paper>
                </div>
            </Tab>
            <Tab label="Отладка" >
                <BabblerDebugPanel babbler={babbler1}
                    filter={{ data: {content: ['"cmd":"status"', '"cmd":"pos"']} }}/>
            </Tab>
            <Tab label="Лог" >
                <BabblerDataFlow 
                    babbler={babbler1} 
                    reverseOrder={true}
                    maxItems={100}
                    timestamp={true}
//                    filter={{ err: false, data: false }}
//                    filter={{ data: {queue: false} }}
//                    filter={{ err: {in: false, out: false, queue: false}, data: {in: false, out: false, queue: false} }}
                    filter={{ data: {content: ['"cmd":"status"', '"cmd":"pos"']} }}
                    style={{margin: 20}}/>
            </Tab>
        </Tabs>
        
        <Paper style={{
                position: "fixed", bottom: 0, 
                width: "100%", textAlign: "right"}}>
            <Divider style={{width: "100%"}}/>
            <CurrentPos babblerCnc={babblerCnc1} style={{marginRight: 10}}/>
            <CncStatus babblerCnc={babblerCnc1} style={{marginRight: 10}}/>
            <QueueStatus babbler={babbler1} style={{marginRight: 10}}/> 
        </Paper>
        
        <BabblerConnectionErrorSnackbar babbler={babbler1}/>
      </div>
    </MuiThemeProvider>,
    document.getElementById('app-content')
);

