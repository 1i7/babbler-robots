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
    // 390x240x240мм
    var _rawDim = "390000000 240000000 240000000";
    var _dim = {x: 390000000, y: 240000000, z: 240000000};
    var _dimErr;
    
    // 
    // Опрос устройства
    
    // Статус: работает/ожидает команды
    /** По умолчанию получаем текущий статус устройства два раза в секунду */
    var _statusPollDelay = options.statusPollDelay ? options.statusPollDelay : 500;
    /** Опрос текущего статуса */
    var _statusIntId = 0;
    /** Ожидаем ответ на запрос текущего статуса */
    var _statusWaitReply = false;
    
    // Текущая позиция рабочего инструмента
    /** По умолчанию получаем текущую позицию с устройства пять раз в секунду */
    var _posPollDelay = options.posPollDelay ? options.posPollDelay : 200;
    /** Опрос текущей позиции */
    var _posIntId = 0;
    /** Ожидаем ответ на запрос текущей позиции */
    var _posWaitReply = false;
    
    //
    // Опрашиватели
    
    // опрашивать текущий статус рабочего инструмента
    var _getStatus = function() {
        // отправлять новый запрос только в том случае,
        // если получили ответ на предыдущий
        if(!_statusWaitReply) {
            _statusWaitReply = true;
            _babbler.sendCmd("status", [],
                // onResult
                function(err, reply, cmd, params) {
                    _statusWaitReply = false;
                    if(err) {
                        _cncStatusErr = err;
                    } else {
                        _cncStatus = reply;
                    }
                    this.emit(BabblerCncEvent.STATUS, _cncStatus, err);
                }.bind(this)
            );
        }
    }.bind(this);
    
    // опрашивать текущее положение рабочего инструмента
    var _getPos = function() {
        // отправлять новый запрос только в том случае,
        // если получили ответ на предыдущий
        if(!_posWaitReply) {
            _posWaitReply = true;
            _babbler.sendCmd("pos", [],
                // onResult
                function(err, reply, cmd, params) {
                    _posWaitReply = false;
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
                }.bind(this)
            );
        }
    }.bind(this);
    
    // получить текущий размер рабочей области
    var _getDim = function() {
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
        _statusIntId = setInterval(_getStatus, _statusPollDelay);
        _posIntId = setInterval(_getPos, _posPollDelay);
        _getDim();
    }
    
    // опрашиваем устройство только если подключены
    _babbler.on(Babbler.Event.CONNECTED, function() {
        _statusIntId = setInterval(_getStatus, _statusPollDelay);
        _posIntId = setInterval(_getPos, _posPollDelay);
        _getDim();
    });
    
    // перестаём опрашивать устройство, если отключились
    _babbler.on(Babbler.Event.DISCONNECTED, function() {
        clearInterval(_statusIntId);
        clearInterval(_posIntId);
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

