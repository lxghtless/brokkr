const {test} = require('tap')
const {argvUtil} = require('../lib')

test('basparseArgv should parse argv input based on flags to expected shape', async t => {
    const {parseArgv} = argvUtil

    const flags = [
        '--org-name',
        '--repo-name',
        '--gh-user',
        '--use-yarn',
        '--no-lock',
        '--name'
    ]

    const {cmds, options} = parseArgv(flags, [
        'test-util',
        'test',
        '--org-name',
        'lxghtless',
        '--use-yarn',
        '--repo-name',
        'bokkr',
        '--name-of-something',
        'nolxght'
    ])

    t.same(options, {
        orgName: 'lxghtless',
        useYarn: true,
        repoName: 'bokkr',
        nameOfSomething: 'nolxght'
    })

    t.same(cmds, ['test-util', 'test'])

    t.end()
})
