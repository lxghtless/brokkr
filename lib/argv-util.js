const {isArrayOfString} = require('./shape-util')
const {toCamelFromFlag} = require('./case-util')

const parseArgvString = (argvString, flags) => {
    let splitPoints = [argvString.length]

    flags.forEach(flag => {
        const point = argvString.indexOf(flag)
        if (point > 0) {
            splitPoints.push(point)
        }
    })

    splitPoints = splitPoints.sort((a, b) => a - b)

    const chunksRecord = {}

    let lastPoint = 0

    splitPoints.forEach(point => {
        const chunk = argvString.substring(lastPoint, point).trim()
        const key = chunk.split(' ')[0]
        const value = chunk.replace(key, '')
        chunksRecord[`${toCamelFromFlag(key)}`] =
            value === '' ? true : value.trim()
        lastPoint = point
    })

    return chunksRecord
}

const sliceIntoCmdsAndFlags = argv => {
    const cmdOnlyArgs = []
    const flagOnlyArgs = []
    let foundFirstArg = false
    for (const arg of argv) {
        if (arg.startsWith('--')) {
            foundFirstArg = true
        }

        if (foundFirstArg) {
            flagOnlyArgs.push(arg)
        } else {
            cmdOnlyArgs.push(arg)
        }
    }
    return {cmdOnlyArgs, flagOnlyArgs}
}

const makeArgvParser = flags => {
    if (!isArrayOfString(flags)) {
        throw new TypeError('flags must be an Array of string')
    }
    const argvSeparator = ' '
    return argv => {
        if (!isArrayOfString(argv)) {
            throw new TypeError('argv must be an Array of string')
        }

        const {cmdOnlyArgs, flagOnlyArgs} = sliceIntoCmdsAndFlags(argv)
        const options = parseArgvString(flagOnlyArgs.join(argvSeparator), flags)

        return {
            cmds: cmdOnlyArgs,
            options
        }
    }
}

const parseArgv = (flags, argv) => makeArgvParser(flags)(argv)

module.exports = {
    makeArgvParser,
    parseArgv
}
