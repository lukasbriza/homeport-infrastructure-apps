import { LogLevel } from '@nestjs/common'

/**
 * @returns LogLevel array based on enviroment.
 */
export const getLoggerLevels = (): LogLevel[] => ['log', 'error', 'warn', 'debug', 'verbose', 'fatal']
