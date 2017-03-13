// Будем генерировать события с API EventEmitter
// https://nodejs.org/api/events.html
// https://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor

// обычная нода
//var EventEmitter = require('events');
//var inherits = require('util').inherits;

// для браузера - порты без глубоких зависимостей
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var Babbler = require('babbler-js');


/** 
 * Статусы рабочего блока: остановлен, работает, на паузе, не определен
 * (stopped, working, paused, n/a)
 */
const CncStatus = {
    UNKNOWN: "n/a",
    STOPPED: "stopped",
    WORKING: "working",
    PAUSED: "paused",
};

/**
 * События, на которые можно подписываться через интерфейс EventListener:
 *     Babbler.on(event, callback);
 */
const BabblerCncEvent = {
    /** 
     * Смена статуса подключения устройства:
     *     stopped, working, paused, n/a
     */
    STATUS: "status",
    /**
     * Смена положения рабочего инструмента.
     */
    POSITION: "pos",
    /**
     * Новое значение размеров рабочей области.
     */
    DIMENSIONS: "dim"
}

function BabblerCnc(babbler, options) {
    //http://phrogz.net/js/classes/OOPinJS.html
    
    if(!options) {
        options = {};
    }
    
    var _babbler = babbler;
    
    // статус рабочего инструмента
    var _cncStatus = CncStatus.UNKNOWN;
    var _cncStatusErr;
    
    // текущая позиция рабочего инструмента
    var _rawPos = "0 0 0";
    var _pos = {x: 0, y: 0, z: 0};
    var _posErr;
    
    // размер рабочей области, по умолчанию считаем
    // 200x200x150мм
    var _rawDim = "200000000 200000000 150000000";
    var _dim = {x: 200000000, y: 200000000, z: 150000000};
    var _dimErr;
    
    // 
    // Задержки между опросами устройства
    
    /**
     * По умолчанию получаем текущую позицию с устройства два раза в секунду
     */
    var _statusPollDelay = options.statusPollDelay ? options.statusPollDelay : 500;
    
    /**
     * По умолчанию получаем текущую позицию с устройства пять раз в секунду
     */
    var _posPollDelay = options.posPollDelay ? options.posPollDelay : 200;
    
    // Опрашиватели
    
    // опрашивать текущий статус рабочего инструмента
    var getStatus = function() {
        _babbler.sendCmd("status", [],
            // onResult
            function(err, reply, cmd, params) {
                if(err) {
                    _cncStatusErr = err;
                } else {
                    _cncStatus = reply;
                }
                this.emit(BabblerCncEvent.STATUS, _cncStatus, err);
                
                if(_babbler.deviceStatus === Babbler.Status.CONNECTED) {
                    setTimeout(getStatus, _statusPollDelay);
                }
            }.bind(this)
        );
    }.bind(this);
    
    // начинаем опрашивать, если уже подключены
    if(_babbler.deviceStatus === Babbler.Status.CONNECTED) {
        getStatus();
    }
    
    // опрашивать текущее положение рабочего инструмента
    var getPos = function() {
        _babbler.sendCmd("pos", [],
            // onResult
            function(err, reply, cmd, params) {
                if(err) {
                    _posErr = err;
                    this.emit(BabblerCncEvent.POSITION, undefined, err);
                } else if(_rawPos !== reply) {
                    _rawPos = reply;
                    
                    var posArr = _rawPos.split(" ");
                    _pos.x = parseInt(posArr[0], 10);
                    _pos.y = parseInt(posArr[1], 10);
                    _pos.z = parseInt(posArr[2], 10);
                    
                    this.emit(BabblerCncEvent.POSITION, _pos, undefined);
                }
                
                if(_babbler.deviceStatus === Babbler.Status.CONNECTED) {
                    setTimeout(getPos, _posPollDelay);
                }
            }.bind(this)
        );
    }.bind(this);
    
    // получить текущий размер рабочей области
    var getDim = function() {
        _babbler.sendCmd("dim", [],
            // onResult
            function(err, reply, cmd, params) {
                if(err) {
                    _dimErr = err;
                    this.emit(BabblerCncEvent.DIMENSIONS, undefined, err);
                } else if(_rawDim !== reply) {
                    _rawDim = reply;
                    
                    var dimArr = _rawDim.split(" ");
                    _dim.x = parseInt(dimArr[0], 10);
                    _dim.y = parseInt(dimArr[1], 10);
                    _dim.z = parseInt(dimArr[2], 10);
                    
                    this.emit(BabblerCncEvent.DIMENSIONS, _dim, undefined);
                }
            }.bind(this)
        );
    }.bind(this);
    
    // начинаем опрашивать, если уже подключены
    if(_babbler.deviceStatus === Babbler.Status.CONNECTED) {
        getPos();
    }
    
    // опрашиваем устройство только если подключены
    _babbler.on(Babbler.Event.CONNECTED, function() {
        // TODO: если отключить устройство после того, как вызван setTimeout(getPos),
        // а потом опять подключить до того, как он вызовет getPos, мы 
        // получим два рекурсивных getPos (один из таймаута, еще один - отсюда)
        getStatus();
        getPos();
        getDim();
    });
    
    Object.defineProperties(this, {
        /** 
         * Устройство Babbler
         */
        babbler: {
            get: function() {
                return _babbler;
            }
        },
        /** 
         * Статус рабочего блока: остановлен, работает, на паузе, не определен
         * (stopped, working, paused, n/a)
         */
        status: {
            get: function() {
                return _cncStatus;
            }
        },
        /** 
         * Текущая позиция рабочего блока
         */
        pos: {
            get: function() {
                return _pos;
            }
        },
        /** 
         * Ошибка получения текущей позиция рабочего блока
         */
        posErr: {
            get: function() {
                return _posErr;
            }
        },
        /** 
         * Размер рабочей области
         */
        dim: {
            get: function() {
                return _dim;
            }
        },
        /** 
         * Ошибка получения размеров рабочей области
         */
        dimErr: {
            get: function() {
                return _dimErr;
            }
        }
    });
}

// наследуем Babbler от EventEmitter, чтобы
// генерировать события красиво
inherits(BabblerCnc, EventEmitter);
// Перечисления и константы для публики

/** События */
BabblerCnc.Event = BabblerCncEvent;

/** 
 * Статусы рабочего блока: остановлен, работает, на паузе, не определен
 * (stopped, working, paused, n/a)
 */
BabblerCnc.Status = CncStatus;

// отправляем компонент на публику
module.exports = BabblerCnc;

