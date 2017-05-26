#include "babbler_cmd_cnc.h"

#include "babbler.h"

#include "stepper.h"

#include "stdio.h"
#include "string.h"
#include "stdlib.h"

// Шаговые моторы
// Stepper motors
static stepper *_sm_x, *_sm_y, *_sm_z;


/**
 * Получить шаговый двигатель по уникальному имени.
 * @param id - имя мотора, состоит из одной буквы, регистр не учитывается.
 */
static stepper* stepper_by_id(char id) {
    if(id == 'x' || id == 'X') {
        return _sm_x;
    } else if(id == 'y' || id == 'Y') {
        return _sm_y;
    } else if(id == 'z' || id == 'Z') {
        return _sm_z;
    } else {
        return NULL;
    }
}

void init_babbler_cnc(stepper* sm_x, stepper* sm_y, stepper* sm_z) {
    _sm_x = sm_x;
    _sm_y = sm_y;
    _sm_z = sm_z;
}


extern const babbler_cmd_t CMD_STEP = {
    /* имя команды */ 
    /* command name */
    "step",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_step
};

extern const babbler_man_t MAN_STEP = {
    /* имя команды */ 
    /* command name */
    "step",
    /* краткое описание */ 
    /* short description */
    "make steps",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    step M1 steps delay [M2 steps delay [...]]\n"
    "DESCRIPTION\n"
    "Make steps.\n"
    "  M     - motor name\n"
    "  steps - number of steps; steps > 0 - step forward, steps < 0 - backward\n"
    "  delay - step delay, microseconds"
};

extern const babbler_cmd_t CMD_WHIRL = {
    /* имя команды */ 
    /* command name */
    "whirl",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_whirl
};

extern const babbler_man_t MAN_WHIRL = {
    /* имя команды */ 
    /* command name */
    "whirl",
    /* краткое описание */ 
    /* short description */
    "start motor for endless rotation",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    whirl M dir delay\n"
    "DESCRIPTION\n"
    "Start motor for endless rotation.\n"
    "  M     - motor name\n"
    "  dir   - direction: 1 - forward, -1 - backward\n"
    "  delay - step delay, microseconds"
};

extern const babbler_cmd_t CMD_CALIBRATE = {
    /* имя команды */ 
    /* command name */
    "calibrate",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_calibrate
};

extern const babbler_man_t MAN_CALIBRATE = {
    /* имя команды */ 
    /* command name */
    "calibrate",
    /* краткое описание */ 
    /* short description */
    "calibrate motor",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    calibrate M dir mode\n"
    "DESCRIPTION\n"
    "Calibrate motor bounds.\n"
    "  M     - motor name\n"
    "  dir   - direction: 1 - forward, -1 - backward\n"
    "  mode  - start: calibrate start pos; bounds: calibrate bounds"
};

extern const babbler_cmd_t CMD_PAUSE = {
    /* имя команды */ 
    /* command name */
    "pause",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_pause
};

extern const babbler_man_t MAN_PAUSE = {
    /* имя команды */ 
    /* command name */
    "pause",
    /* краткое описание */ 
    /* short description */
    "pause stepper cycle",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    pause\n"
    "DESCRIPTION\n"
    "Pause stepper cycle."
};

extern const babbler_cmd_t CMD_RESUME = {
    /* имя команды */ 
    /* command name */
    "resume",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_resume
};

extern const babbler_man_t MAN_RESUME = {
    /* имя команды */ 
    /* command name */
    "resume",
    /* краткое описание */ 
    /* short description */
    "resume stepper cycle",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    resume\n"
    "DESCRIPTION\n"
    "Resume stepper cycle if paused."
};

extern const babbler_cmd_t CMD_STOP = {
    /* имя команды */ 
    /* command name */
    "stop",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_stop
};

extern const babbler_man_t MAN_STOP = {
    /* имя команды */ 
    /* command name */
    "stop",
    /* краткое описание */ 
    /* short description */
    "stop stepper cycle",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    stop\n"
    "DESCRIPTION\n"
    "Stop stepper cycle."
};


extern const babbler_cmd_t CMD_STATUS = {
    /* имя команды */ 
    /* command name */
    "status",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_status
};

extern const babbler_man_t MAN_STATUS = {
    /* имя команды */ 
    /* command name */
    "status",
    /* краткое описание */ 
    /* short description */
    "get stepper cycle status",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    status\n"
    "DESCRIPTION\n"
    "Get stepper cycle status: working/paused/stopped."
};


extern const babbler_cmd_t CMD_POS = {
    /* имя команды */ 
    /* command name */
    "pos",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_pos
};

extern const babbler_man_t MAN_POS = {
    /* имя команды */ 
    /* command name */
    "pos",
    /* краткое описание */ 
    /* short description */
    "get motor(s) position",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    pos [M]\n"
    "DESCRIPTION\n"
    "Get position of one or all motors."
};

extern const babbler_cmd_t CMD_DIM = {
    /* имя команды */ 
    /* command name */
    "dim",
    /* указатель на функцию с реализацией команды */ 
    /* pointer to function with command implementation*/ 
    &cmd_dim
};

extern const babbler_man_t MAN_DIM = {
    /* имя команды */ 
    /* command name */
    "dim",
    /* краткое описание */ 
    /* short description */
    "get working area dimensions",
    /* руководство */ 
    /* manual */
    "SYNOPSIS\n"
    "    dim\n"
    "DESCRIPTION\n"
    "Get working area dimensions."
};


int cmd_step(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    if(stepper_is_cycle_running()) {
        // устройство занято
        strcpy(reply_buffer, REPLY_BUSY);
    } else if(argc > 3) {
        bool params_ok = true;
        for(int i = 1; i+2 < argc && params_ok; i+=3) {
            char motor_name = argv[i][0];
            char* steps_str = argv[i+1];
            char* delay_str = argv[i+2];
    
            stepper* motor = stepper_by_id(motor_name);
            if(motor == NULL) {
                // некорректные параметры: нет такого мотора
                params_ok = false;
            } else {
                long steps = atol(steps_str);
                if(steps == 0 && strcmp("0", steps_str) != 0) {
                    // получили 0, а строка не "0" =>
                    // некорректные параметры: некорректно задано количество шагов
                    params_ok = false;
                } else {
                    unsigned long step_delay = atol(delay_str);
                    if(step_delay == 0 && strcmp("0", delay_str) != 0) {
                        // получили 0, а строка не "0" =>
                        // некорректные параметры: некорректно задана задержка
                        params_ok = false;
                    } else {
                        // всё ок - добавляем шаги для мотора
                        prepare_steps(motor, steps, step_delay);
                    }
                }
            }
        }
        if(params_ok) {
            // все ок - делаем шаги
            stepper_start_cycle();
            
            // команда выполнена
            strcpy(reply_buffer, REPLY_OK);
        } else {
            // проблема с параметрами
            stepper_finish_cycle();
            
            strcpy(reply_buffer, REPLY_BAD_PARAMS);
        }
    } else {
        // некорректные параметры
        strcpy(reply_buffer, REPLY_BAD_PARAMS);
    }
    
    return strlen(reply_buffer);
}

int cmd_whirl(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    if(stepper_is_cycle_running()) {
        // устройство занято
        strcpy(reply_buffer, REPLY_BUSY);
    } else if(argc > 3) {
        bool params_ok = true;
        for(int i = 1; i+2 < argc && params_ok; i+=3) {
            char motor_name = argv[i][0];
            char* dir_str = argv[i+1];
            char* delay_str = argv[i+2];
    
            stepper* motor = stepper_by_id(motor_name);
            if(motor == NULL) {
                // некорректные параметры: нет такого мотора
                params_ok = false;
            } else {
                int dir = atoi(dir_str);
                if(dir == 0 && strcmp("0", dir_str) != 0) {
                    // получили 0, а строка не "0" =>
                    // некорректные параметры: некорректно задано направление
                    params_ok = false;
                } else {
                    unsigned long step_delay = atoi(delay_str);
                    if(step_delay == 0 && strcmp("0", delay_str) != 0) {
                        // получили 0, а строка не "0" =>
                        // некорректные параметры: некорректно задана задержка
                        params_ok = false;
                    } else {
                        // всё ок - добавляем шаги для мотора
                        prepare_whirl(motor, dir, step_delay);
                    }
                }
            }
        }
        if(params_ok) {
            // все ок - делаем шаги
            stepper_start_cycle();
                        
            // команда выполнена
            strcpy(reply_buffer, REPLY_OK); 
        } else {
            // проблема с параметрами
            stepper_finish_cycle();
            
            strcpy(reply_buffer, REPLY_BAD_PARAMS);
        }
    } else {
        // некорректные параметры
        strcpy(reply_buffer, REPLY_BAD_PARAMS);
    }
    
    return strlen(reply_buffer);
}

int cmd_calibrate(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    if(stepper_is_cycle_running()) {
        // устройство занято
        strcpy(reply_buffer, REPLY_BUSY);
    } else if(argc > 3) {
        bool params_ok = true;
        
        char motor_name = argv[1][0];
        char* dir_str = argv[2];
        char* mode = argv[3];
        // будем калибровать на максимальной скорости
        int step_delay = 0;

        stepper* motor = stepper_by_id(motor_name);
        if(motor == NULL) {
            // некорректные параметры: нет такого мотора
            params_ok = false;
        } else {
            int dir = atoi(dir_str);
            if(dir == 0 && strcmp("0", dir_str) != 0) {
                // получили 0, а строка не "0" =>
                // некорректные параметры: некорректно задано направление
                params_ok = false;
            } else {
                if(strcmp("start", mode) == 0) {
                    // калибровка начальной позиции
                    prepare_whirl(motor, dir, step_delay, CALIBRATE_START_MIN_POS);
                } else if (strcmp("bounds", mode) == 0) {
                    // калибровка размеров рабочей области
                    prepare_whirl(motor, dir, step_delay, CALIBRATE_BOUNDS_MAX_POS);
                } else {
                    // некорректные параметры: неправильный режим калибровки
                    params_ok = false;
                }
            }
        }
        
        if(params_ok) {
            // все ок - делаем шаги
            stepper_start_cycle();
                        
            // команда выполнена
            strcpy(reply_buffer, REPLY_OK); 
        } else {
            // проблема с параметрами
            strcpy(reply_buffer, REPLY_BAD_PARAMS);
        }
    } else {
        // некорректные параметры
        strcpy(reply_buffer, REPLY_BAD_PARAMS);
    }
    
    return strlen(reply_buffer);
}

int cmd_pause(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    stepper_pause_cycle();
    
    // команда выполнена
    strcpy(reply_buffer, REPLY_OK);
    return strlen(reply_buffer);
}

int cmd_resume(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    stepper_resume_cycle();
    
    // команда выполнена
    strcpy(reply_buffer, REPLY_OK);
    return strlen(reply_buffer);
}

int cmd_stop(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    stepper_finish_cycle();
    
    // команда выполнена
    strcpy(reply_buffer, REPLY_OK);
    return strlen(reply_buffer);
}

int cmd_status(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    if(stepper_is_cycle_running()) {
        if(!stepper_is_cycle_paused()) {
            strcpy(reply_buffer, "working");
        } else {
            strcpy(reply_buffer, "paused");
        }
    } else {
        strcpy(reply_buffer, "stopped");
    }
    
    return strlen(reply_buffer);
}

int cmd_pos(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    if(argc > 1) {
        // координата указанного мотора
        char motor_name = argv[1][0];

        stepper* motor = stepper_by_id(motor_name);
        if(motor == NULL) {
            // некорректные параметры: нет такого мотора
            strcpy(reply_buffer, REPLY_BAD_PARAMS);
        } else {
            sprintf(reply_buffer, "%ld", motor->current_pos);
        }
    } else {
        // координаты всех моторов
        sprintf(reply_buffer, "%ld %ld %ld", _sm_x->current_pos, _sm_y->current_pos, _sm_z->current_pos);
    }
    return strlen(reply_buffer);
}


/**
 * Получить размеры рабочей области, нанометры
 * запрос
 *   dim
 * ответ
 *   dim_x dim_y dim_z
 */
/**
 * Get working area dimensions, nanometers
 * request
 *   dim
 * reply
 *   dim_x dim_y dim_z
 */
int cmd_dim(char* reply_buffer, int reply_buf_size, int argc, char *argv[]) {
    
    unsigned long dim_x = _sm_x->max_pos - _sm_x->min_pos;
    unsigned long dim_y = _sm_y->max_pos - _sm_y->min_pos;
    unsigned long dim_z = _sm_z->max_pos - _sm_z->min_pos;
    
    sprintf(reply_buffer, "%d %d %d", dim_x, dim_y, dim_z);
    return strlen(reply_buffer);
}

