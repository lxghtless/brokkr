const {test} = require('tap')
const {cmdUtil} = require('../lib')

const optionsSchema = {
    orgName: 'string',
    name: '?string',
    useYarn: 'boolean',
    noLock: '?boolean',
    retryWaitTimeMs: 'number',
    maxAttempts: '?number'
}

const flags = [
    '--org-name',
    '--name',
    '--use-yarn',
    '--no-lock',
    '--retry-wait-time-ms',
    '--max-attempts'
]

test('cmdUtil validate cmds', t => {
    const cmds = [
        {
            cmds: ['test-cmd', 'create'],
            optionsSchema,
            handler: options => {
                return {
                    message: 'unit-test',
                    options
                }
            }
        }
    ]
    const validation = cmdUtil.validateAndParseCommands(cmds)

    t.ok(validation.isValid, 'cmds validation is valid')
    t.equal(validation.errors.length, 0, 'cmds validation has no errors')

    // assert optionsSchema is the same
    t.same(
        validation.result[0].optionsSchema,
        optionsSchema,
        'cmds validation optionsSchema should be the same'
    )

    t.end()
})

test('cmdUtil make command runner', t => {
    const cmds = [
        {
            cmds: ['test-cmd', 'create'],
            optionsSchema,
            handler: options => {
                return {
                    message: 'unit-test',
                    options
                }
            },
            flags
        }
    ]

    const run = cmdUtil.makeCommandRunner(cmds)

    const result = run([
        'create',
        '--org-name',
        'Test Org',
        '--use-yarn',
        'false',
        '--retry-wait-time-ms',
        '123',
        '--name',
        'cmd test name'
    ])

    t.equal(result.message, 'unit-test')
    t.same(result.options, {
        orgName: 'Test Org',
        name: 'cmd test name',
        useYarn: false,
        noLock: null,
        retryWaitTimeMs: 123,
        maxAttempts: null
    })

    t.end()
})
