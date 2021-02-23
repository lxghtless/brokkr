const brokkr = {
    argvUtil: require('./argv-util.js'),
    caseUtil: require('./case-util.js'),
    cmdUtil: require('./cmd-util.js'),
    envUtil: require('./env-util.js'),
    logUtil: require('./log-util.js'),
    shapeUtil: require('./shape-util.js')
}

// add aliases
brokkr.makeLogger = brokkr.logUtil.makeLogger
brokkr.makeCommandRunner = brokkr.cmdUtil.makeCommandRunner

module.exports = brokkr
