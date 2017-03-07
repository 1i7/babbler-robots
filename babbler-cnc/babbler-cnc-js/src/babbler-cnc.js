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
    POSITION: "pos"
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
    var _pos = {x:0, y:0, z:0};
    var _posErr;
    
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
         * Ошибка получения текущая позиция рабочего блока
         */
        posErr: {
            get: function() {
                return _posErr;
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

