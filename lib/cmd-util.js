const {
    isArray,
    isArrayOfString,
    isArrayOfAtLeast,
    isString,
    validateAndParse
} = require('./shape-util')
const {parseArgv} = require('./argv-util')

const cmdSchema = {
    cmds: '[]string',
    optionsSchema: 'object',
    /*
		Consideration: This is a good use case to add a union of type feature.

		As an example, an object with lifecyle keys to support
		functions for each part. Examples would be "pre", "handler", "post".
		This would be a custom "AdvancedHandler" type resulting in
		handler: 'function | AdvancedHandler'
    */
    handler: 'function',
    flags: '?[]string',
    description: '?string'
}

const validateCommand = cmd => validateAndParse(cmdSchema, cmd)

const likelyCmd = cmd => {
    if (isArray(cmd)) {
        return false
    }

    if (typeof cmd === 'object' && isArrayOfString(cmd.cmds)) {
        return true
    }

    return false
}

const validateAndParseCommands = cmdOrCmds => {
    if (likelyCmd(cmdOrCmds)) {
        // it's a single object command
        return [validateCommand(cmdOrCmds)]
    } else if (isArrayOfAtLeast(cmdOrCmds, 1) && likelyCmd(cmdOrCmds[0])) {
        // it's an array of commands
        const validation = {
            isValid: true,
            errors: [],
            result: []
        }

        for (const cmd of cmdOrCmds) {
            const cmdValidation = validateCommand(cmd)
            validation.isValid = cmdValidation.isValid
            validation.errors.push(...cmdValidation.errors)
            validation.result.push(cmdValidation.result)
        }

        return validation
    }

    return {
        isValid: false,
        errors: [
            {
                type: 'Invalid cmdOrCmds Value',
                message: `typeof cmdOrCmds ${typeof cmdOrCmds} is not valid`
            }
        ],
        result: {}
    }
}

// TODO: test and examples
const makeCommandRunner = cmdOrCmds => {
    const validation = validateAndParseCommands(cmdOrCmds)

    if (!validation.isValid) {
        throw new Error(
            `CmdOptions invalid.\n${JSON.stringify(
                validation.errors,
                undefined,
                4
            )}`
        )
    }

    const {result} = validation

    return argv => {
        if (!argv) {
            throw new Error('argv must be defined')
        }

        let _argv = argv

        if (isString(argv)) {
            _argv = [argv]
        } else if (!isArrayOfString) {
            // consider other argv types down the line
            throw new Error('argv must be a string or array of string')
        }

        const {cmds} = parseArgv(['--a'], _argv)

        let matchedCmd = null

        for (const cmd of result) {
            if (matchedCmd) {
                break
            }
            for (const cmdVal of cmd.cmds) {
                for (const argCmd of cmds) {
                    if (cmdVal === argCmd) {
                        matchedCmd = cmd
                    }
                }
            }
        }

        if (!matchedCmd) {
            throw new Error(`unable to find command: ${cmds.join(',')}`)
        }

        let cmdArgsToPass = undefined

        if (matchedCmd.flags) {
            const {options} = parseArgv(matchedCmd.flags, _argv)
            const optionsValidation = validateAndParse(
                matchedCmd.optionsSchema,
                options
            )

            if (!optionsValidation.isValid) {
                throw new Error(
                    `options invalid.\n${JSON.stringify(
                        optionsValidation.errors,
                        undefined,
                        4
                    )}`
                )
            }

            cmdArgsToPass = optionsValidation.result
        }

        return matchedCmd.handler(cmdArgsToPass)
    }
}

module.exports = {
    makeCommandRunner,
    validateAndParseCommands
}
