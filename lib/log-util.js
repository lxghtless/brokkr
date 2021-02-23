const envUtil = require('./env-util')

const LogLevel = {
    ALL: 'all',
    NONE: 'none',
    ERROR: 'error',
    WARNING: 'warn',
    DEBUG: 'debug',
    INFO: 'info'
}

const LevelValue = {
    all: 5,
    debug: 4,
    info: 3,
    warning: 2,
    error: 1,
    none: 0
}

const tryJsonElseToString = obj => {
    try {
        return JSON.stringify(obj, undefined, 4)
    } catch (_) {
        if (obj instanceof Error) {
            return JSON.stringify(
                {
                    message: obj.message,
                    stack: obj.stack
                },
                undefined,
                4
            )
        }

        return obj.toString ? obj.toString() : obj
    }
}

const formatArgs = (...args) =>
    `${args
        .map(arg => (typeof arg === 'object' ? tryJsonElseToString(arg) : arg))
        .join('\n')}\n`

const log = (...args) => {
    if (process && process.stdout) {
        process.stdout.write(formatArgs(...args))
        return
    }
}

const makeLogger = (options = {}) => {
    // set to normalized logLevel
    options.logLevel =
        options.logLevel || envUtil.get('BROKKR_LOG_LEVEL') || LogLevel.NONE
    options.levelValue = LevelValue[options.logLevel]

    const logWithLevel = lvl => (...args) => {
        if (LevelValue[lvl] <= options.levelValue) {
            if (typeof window !== 'undefined') {
                console[lvl](...args)
                return
            }

            log(...args)
        }
    }

    return {
        info: logWithLevel(LogLevel.INFO),
        debug: logWithLevel(LogLevel.debug),
        warn: logWithLevel(LogLevel.WARNING),
        error: logWithLevel(LogLevel.ERROR)
    }
}

module.exports = {
    makeLogger
}
