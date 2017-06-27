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
 *     BabblerCnc.on(event, callback);
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
    // получаем текущий размер рабочей области один раз при подключении
    _babbler.stickProp("dim", "dim", []);
    
    // Статус: работает/ожидает команды
    // получаем текущий статус устройства два раза в секунду
    _babbler.stickProp("status", "status", [], 500);
    
    // Текущая позиция рабочего инструмента
    // получаем текущую позицию с устройства пять раз в секунду
    _babbler.stickProp("pos", "pos", [], options.posPollDelay);
    
    //
    // События - новые значения свойств
    _babbler.on(Babbler.Event.PROP, function(prop, err, val) {
        if(prop === "dim") {
            // получили текущий размер рабочей области
            if(err) {
                _dimErr = err;
                this.emit(BabblerCncEvent.DIMENSIONS, undefined, err);
            } else if(_rawDim !== val) {
                _rawDim = val;
                
                var dimArr = _rawDim.split(" ");
                _dim.x = parseInt(dimArr[0], 10);
                _dim.y = parseInt(dimArr[1], 10);
                _dim.z = parseInt(dimArr[2], 10);
                
                this.emit(BabblerCncEvent.DIMENSIONS, _dim, undefined);
            }
        } else if(prop === "status") {
            // получили текущий статус рабочего инструмента
            if(err) {
                _cncStatusErr = err;
            } else {
                _cncStatus = val;
            }
            this.emit(BabblerCncEvent.STATUS, _cncStatus, err);
        } else if(prop === "pos") {
           // получили текущее положение рабочего инструмента
            if(err) {
                _posErr = err;
                this.emit(BabblerCncEvent.POSITION, undefined, err);
            } else if(_rawPos !== val) {
                _rawPos = val;
                
                var posArr = _rawPos.split(" ");
                _pos.x = parseInt(posArr[0], 10);
                _pos.y = parseInt(posArr[1], 10);
                _pos.z = parseInt(posArr[2], 10);
                
                this.emit(BabblerCncEvent.POSITION, _pos, undefined);
            }
        }
    }.bind(this));
    
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

