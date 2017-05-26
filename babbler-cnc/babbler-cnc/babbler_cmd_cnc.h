#ifndef BABBLER_CMD_CNC_H
#define BABBLER_CMD_CNC_H

#include "babbler.h"
#include "stepper.h"

void init_babbler_cnc(stepper* sm_x, stepper* sm_y, stepper* sm_z);

/**************************************/
// Команды

extern const babbler_cmd_t CMD_STEP;
extern const babbler_man_t MAN_STEP;

extern const babbler_cmd_t CMD_WHIRL;
extern const babbler_man_t MAN_WHIRL;

extern const babbler_cmd_t CMD_CALIBRATE;
extern const babbler_man_t MAN_CALIBRATE;

extern const babbler_cmd_t CMD_PAUSE;
extern const babbler_man_t MAN_PAUSE;

extern const babbler_cmd_t CMD_RESUME;
extern const babbler_man_t MAN_RESUME;

extern const babbler_cmd_t CMD_STOP;
extern const babbler_man_t MAN_STOP;

extern const babbler_cmd_t CMD_STATUS;
extern const babbler_man_t MAN_STATUS;

extern const babbler_cmd_t CMD_POS;
extern const babbler_man_t MAN_POS;

extern const babbler_cmd_t CMD_DIM;
extern const babbler_man_t MAN_DIM;

/**************************************/
// Обработчики команд

int cmd_step(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_whirl(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_calibrate(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_pause(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_resume(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_stop(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_status(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

int cmd_pos(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);


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
int cmd_dim(char* reply_buffer, int reply_buf_size, int argc=0, char *argv[]=NULL);

#endif // BABBLER_CMD_CNC_H

