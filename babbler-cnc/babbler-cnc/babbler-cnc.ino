#include "babbler.h"
#include "babbler_cmd_core.h"
#include "babbler_simple.h"
#include "babbler_json.h"
#include "babbler_serial.h"

#include "stepper.h"

#include "babbler_cmd_cnc.h"


// отключить руководства, если мало места на чипе
// disable manuals to save space on chip
//#define MANUALS_OFF

// Размеры буферов для чтения команд и записи ответов
// Read and write buffer size for communication modules
#define SERIAL_READ_BUFFER_SIZE 128
//#define SERIAL_WRITE_BUFFER_SIZE 512
#define SERIAL_WRITE_BUFFER_SIZE 128


// Буферы для обмена данными с компьютером через последовательный порт.
// +1 байт в конце для завершающего нуля
// Data exchange buffers to communicate with computer via serial port.
// +1 extra byte at the end for terminating zero
char serial_read_buffer[SERIAL_READ_BUFFER_SIZE+1];
char serial_write_buffer[SERIAL_WRITE_BUFFER_SIZE];

// Шаговые моторы
// Stepper motors
static stepper _sm_x, _sm_y, _sm_z;

/** Зарегистрированные команды */
/** Registered commands */
extern const babbler_cmd_t BABBLER_COMMANDS[] = {
    // команды из babbler_cmd_core.h
    // commands from babbler_cmd.core.h
    CMD_HELP,
    CMD_PING,
    
    // пользовательские команды
    // custom commands
    CMD_STEP,
    CMD_WHIRL,
    CMD_CALIBRATE,
    CMD_PAUSE,
    CMD_RESUME,
    CMD_STOP,
    CMD_STATUS,
    CMD_POS,
    CMD_DIM
};

/** Количество зарегистрированных команд */
/** Number of registered commands*/
extern const int BABBLER_COMMANDS_COUNT = sizeof(BABBLER_COMMANDS)/sizeof(babbler_cmd_t);


/** Руководства для зарегистрированных команд */
/** Manuals for registered commands */
extern const babbler_man_t BABBLER_MANUALS[] = {
#ifndef MANUALS_OFF
    // команды из babbler_cmd_core.h
    // commands from babbler_cmd.core.h
    MAN_HELP,
    MAN_PING,
    
    // пользовательские команды
    // custom commands
    MAN_STEP,
    MAN_WHIRL,
    MAN_CALIBRATE,
    MAN_PAUSE,
    MAN_RESUME,
    MAN_STOP,
    MAN_STATUS,
    MAN_POS,
    MAN_DIM
#endif // MANUALS_OFF
};

/** Количество руководств для зарегистрированных команд */
/** Number of manuals for registered commands */
extern const int BABBLER_MANUALS_COUNT = sizeof(BABBLER_MANUALS)/sizeof(babbler_man_t);


void setup() {
    Serial.begin(9600);
    Serial.println("Starting babbler-powered device, type help for list of commands");
    // попробуйте отправить через монитор последовательного порта
    // try to send via Serial Monitor
    // {"cmd": "help", "id": "34", "params":[]}
    
    babbler_serial_set_packet_filter(packet_filter_newline);
    babbler_serial_set_input_handler(handle_input_json);
    //babbler_serial_set_input_handler(handle_input_simple);
    //babbler_serial_setup(
    //    serial_read_buffer, SERIAL_READ_BUFFER_SIZE,
    //    serial_write_buffer, SERIAL_WRITE_BUFFER_SIZE,
    //    9600);
    babbler_serial_setup(
        serial_read_buffer, SERIAL_READ_BUFFER_SIZE,
        serial_write_buffer, SERIAL_WRITE_BUFFER_SIZE,
        BABBLER_SERIAL_SKIP_PORT_INIT);
        

    // подключаем шаговые моторы
    // connected stepper motors
    // init_stepper(stepper* smotor,  char name, 
    //     int pin_step, int pin_dir, int pin_en,
    //     bool invert_dir, int pulse_delay,
    //     int distance_per_step)
    // init_stepper_ends(stepper* smotor,
    //     end_strategy min_end_strategy, end_strategy max_end_strategy,
    //     long min_pos, long max_pos);
    
//    // Драйвер1
//    init_stepper(&_sm_x, 'x', 36, 37, NO_PIN, false, 1000, 7500); 
//    init_stepper_ends(&_sm_x, NO_PIN, NO_PIN, CONST, CONST, 0, 300000000);
//    //init_stepper_ends(&_sm_x, 3, 4, CONST, CONST, 0, 300000);
//    // Драйвер2
//    init_stepper(&_sm_y, 'y', 38, 39, NO_PIN, false, 1000, 7500);
//    init_stepper_ends(&_sm_y, NO_PIN, NO_PIN, CONST, CONST, 0, 216000000);
//    // Драйвер3
//    init_stepper(&_sm_z, 'z', 40, 41, NO_PIN, false, 1000, 7500);
//    init_stepper_ends(&_sm_z, NO_PIN, NO_PIN, CONST, CONST, 0, 100000000);

    // CNC-шилд

    // Драйвер1
    init_stepper(&_sm_x, 'x', 2, 5, 8, false, 1000, 7500); 
    init_stepper_ends(&_sm_x, NO_PIN, NO_PIN, CONST, CONST, 0, 300000000);
    //init_stepper_ends(&_sm_x, 3, 4, CONST, CONST, 0, 300000);
    // Драйвер2
    init_stepper(&_sm_y, 'y', 3, 6, 8, false, 1000, 7500);
    init_stepper_ends(&_sm_y, NO_PIN, NO_PIN, CONST, CONST, 0, 216000000);
    // Драйвер3
    init_stepper(&_sm_z, 'z', 4, 7, 8, false, 1000, 7500);
    init_stepper_ends(&_sm_z, NO_PIN, NO_PIN, CONST, CONST, 0, 100000000);

    //
    init_babbler_cnc(&_sm_x, &_sm_y, &_sm_z);
}

void loop() {
    // постоянно следим за последовательным портом, ждем входные данные
    // monitor serial port for input data
    babbler_serial_tasks();
}

