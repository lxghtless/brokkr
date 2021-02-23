/*
	This assumes argvKey follows a --<alpha-numeric>-<alpha-numeric>-** (repeating) pattern.
	example: --repo-name -> repoName
*/
const toCamelFromFlag = argvKey => {
    const argvKeyRef = argvKey.replace('--', '')

    let camelArgvKey = ''
    let upperNext = false
    for (let i = 0; i < argvKeyRef.length; i++) {
        const argvKeyChar = argvKeyRef[i]

        if (argvKeyChar === '-') {
            upperNext = true
        } else {
            camelArgvKey += upperNext ? argvKeyChar.toUpperCase() : argvKeyChar
            upperNext = false
        }
    }

    return camelArgvKey
}

module.exports = {
    toCamelFromFlag
}
