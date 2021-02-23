const {test} = require('tap')
const brokkr = require('../lib')

test('base module should export expected shape', t => {
    // util modules
    t.ok(brokkr.argvUtil)
    t.ok(brokkr.caseUtil)
    t.ok(brokkr.cmdUtil)
    t.ok(brokkr.envUtil)
    t.ok(brokkr.logUtil)
    t.ok(brokkr.shapeUtil)
    // aliases
    t.ok(brokkr.makeLogger)
    t.ok(brokkr.makeCommandRunner)
    t.end()
})
