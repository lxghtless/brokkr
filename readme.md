<p align="center">
  <h2 align="center">brokkr</h2>
</p>

<p align="center">
	A util module.
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/@lxghtless/brokkr">
		<img src="https://img.shields.io/npm/v/@lxghtless/brokkr?color=blue" />
	</a>
	<a href="https://www.typescriptlang.org/">
		<img src="https://aleen42.github.io/badges/src/javascript.svg" />
	</a>
	<a href="https://eslint.org/">
		<img src="https://aleen42.github.io/badges/src/eslint.svg" />
	</a>
</p>

>  *parseArgv Example*

```ts
import {argvUtil} from '@lxghtless/brokkr'

const {parseArgv} = argvUtil

const flags = [
    '--org-name',
    '--repo-name',
    '--gh-user',
    '--use-yarn',
    '--no-lock',
    '--name'
]

const parsed = parseArgv(flags, [
    '--org-name',
    'lxghtless',
    '--use-yarn',
    '--repo-name',
    'bokkr',
    '--name',
    'nolxght'
])

console.log(parsed)

// output =>
// {
//   orgName: 'lxghtless',
//   useYarn: true,
//   repoName: 'bokkr',
//   name: 'nolxght'
// }
```


>  *validateAndParse Example*

```ts
import {shapeUtil} from '@lxghtless/brokkr'

const {validateAndParse} = shapeUtil

const dataSchema = {
    orgs: '[]boolean',
    name: 'string',
    names: '[]number',
    bt: '?string',
    timestamp: 'number',
    acts: '?[]string'
}

const data = {
    orgs: 'true,false,true,true,false',
    name: 'test data',
    names: [123, 345, 656],
    timestamp: Date.now(),
    acts: 'one,two,three'
}

const validation = validateAndParse(
    dataSchema,
    data
)

console.log(validation)
// output =>
// {
//   isValid: true,
//   errors: [],
//   result: {
//     orgs: [ true, false, true, true, false ],
//     name: 'test data',
//     names: [ 123, 345, 656 ],
//     bt: null,
//     timestamp: 1614049237763,
//     acts: [ 'one', 'two', 'three' ]
//   }
// }
```


>  *validateAndParseCommands Example*


```ts
import {cmdUtil} from '@lxghtless/brokkr'

const {validateAndParseCommands} = cmdUtil

const optionsSchema = {
    orgName: 'string',
    name: '?string',
    useYarn: 'boolean',
    noLock: '?boolean',
    retryWaitTimeMs: 'number',
    maxRetrys: '?number'
}

const cmds = [
    {
        cmds: ['test-cmd', 'create'],
        optionsSchema,
        handler: (cmd, options) => {
            return {
                cmd,
                options
            }
        }
    }
]


const validation = cmdUtil.validateAndParseCommands(cmds)

console.log(validation)
// output =>
// {
//   isValid: true,
//   errors: [],
//   result: [
//     {
//       cmds: [Array],
//       optionsSchema: [Object],
//       handler: [Function: handler]
//     }
//   ]
// }
```


>  *makeCommandRunner Example*


```ts
import {cmdUtil} from '@lxghtless/brokkr'

const {makeCommandRunner} = cmdUtil

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

const cmds = [
    {
        cmds: ['test-cmd', 'create'],
        optionsSchema,
        handler: options => {
            return {
                message: 'hello',
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

console.log(result)
// output =>
// {
//   message: 'hello',
//   options: {
//     orgName: 'Test Org',
//     name: 'cmd test name',
//     useYarn: false,
//     noLock: null,
//     retryWaitTimeMs: 123,
//     maxAttempts: null
//   }
// }
```



>  *envUtil Example*


```ts
import {envUtil} from '@lxghtless/brokkr'

// get an environmental variable by key
const myEndpoint = envUtil.get('MY_ENDPOINT')

// set an environmental variable by key
envUtil.set('MY_OTHER_ENDPOINT', myEndpoint)
```


>  *makeLogger Example*


```ts
import {logUtil} from '@lxghtless/brokkr'

const {makeLogger} = logUtil

const log = makeLogger({
    logLevel: 'debug'
})

log.trace('some trace log stuff') // not logged
log.debug('cool stuff') // logged
log.info('more stuff') // logged
```
