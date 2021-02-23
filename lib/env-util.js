const {isNil} = require('./shape-util')
const kSettings = Symbol('__brokkr__settings__')
const virtualEnv = {}

const get = (envKey, orDefault) => {
    const {virtualEnvOnly} = virtualEnv[kSettings]

    if (virtualEnvOnly) {
        if (isNil(virtualEnv[envKey])) {
            return orDefault
        } else {
            return virtualEnv[envKey]
        }
    }

    if (process) {
        if (isNil(process.env[envKey])) {
            return orDefault
        } else {
            return process.env[envKey]
        }
    }

    if (isNil(virtualEnv[envKey])) {
        return orDefault
    } else {
        return virtualEnv[envKey]
    }
}

const set = (envKey, envVal) => {
    const {copyToVirtualEnv, virtualEnvOnly} = virtualEnv[kSettings]

    if (virtualEnvOnly) {
        virtualEnv[envKey] = envVal
        return
    }

    if (process) {
        process.env[envKey] = envVal
        if (!copyToVirtualEnv) {
            return
        }
    }

    virtualEnv[envKey] = envVal
}

virtualEnv[kSettings] = {
    virtualEnvOnly: false,
    copyToVirtualEnv: false
}

module.exports = {
    get,
    set,
    kSettings,
    virtualEnv
}
