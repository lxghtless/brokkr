const isNull = value => value === null
const isUndefined = value => typeof value === 'undefined'
const isNil = value => isNull(value) || isUndefined(value)
const isString = value => typeof value === 'string'
const isBoolean = value => typeof value === 'boolean'
const isNumber = value => typeof value === 'number'
const isObject = value => typeof value === 'object'
const isFunction = value => typeof value === 'function'
const isArray = value => Array.isArray(value)
const isArrayOfString = value => isArray(value) && isString(value[0])
const isEmptyArray = value => isArray(value) && value.length === 0
const isArrayOfAtLeast = (value, atleast) =>
    isArray(value) && value.length >= atleast
const isArrayOfAtMost = (value, atmost) =>
    isArray(value) && value.length <= atmost
const isPromise = value => !isNil(value) && isFunction(value.then)

/*
	Types Lists & Augments
*/
const falseyTypes = [null, 'null', undefined, 'undefined']
const shapeTypes = [
    ...falseyTypes,
    'string',
    'boolean',
    'number',
    'object',
    'function'
    // 'type:*' for custom types
]
const typeAugments = ['?', '[]']

// custom type model example
// {
// 	type: '<any-shape-type>',
// 	name: '<optional-unless-object-type>',
// 	description: '<optional-description-of-field>'
// }

/*
	Helpers
*/

// removes augments and normalizes falsey primitive values
const getShapeTypeName = value => {
    let name = value

    if (name === null) {
        return 'null'
    }

    if (name === undefined) {
        return 'undefined'
    }

    for (const augment of typeAugments) {
        name = name.replace(augment, '')
    }
    return name
}

const isFalseyType = value => falseyTypes.includes(value)

const shapeParser = {
    toNull: value => {
        if (!isFalseyType(value)) {
            throw new TypeError(`Unable to convert value to null: ${value}`)
        }

        return null
    },
    toString: value => `${value}`,
    toBoolean: value => (isBoolean(value) ? value : value === 'true'),
    toNumber: value => {
        if (isNumber(value)) {
            return value
        }

        const parsedNumber = parseFloat(value)

        if (isNaN(parsedNumber)) {
            throw new TypeError(`Unable to convert value to number: ${value}`)
        }

        return parsedNumber
    },
    toObject: value => {
        if (isString(value)) {
            try {
                return JSON.parse(value)
            } catch (error) {
                // console.warn('error parsing string to object', error)
                // CONSIDERATION: make this configurably throw an error
                return {}
            }
        } else if (isObject(value)) {
            return value
        } else {
            // idk what to do here yet...
            return value || {}
        }
    },
    toFunction: value => {
        if (isFunction(value) || isPromise(value)) {
            return value
        }

        // ummm... hmmm... thinking
    }
}

const shapeTypeIsOptional = shapeType =>
    shapeType[0] === '?' ||
    shapeType === 'nil' ||
    shapeType === 'null' ||
    shapeType === 'undefined'
// an array can also be optional, so we check for both scenarios
const shapeTypeIsArray = shapeType =>
    shapeType.substring(0, 2) === '[]' || shapeTypeIsOptionalArray(shapeType)
const shapeTypeIsOptionalArray = shapeType =>
    shapeType[0] === '?' && shapeType.substring(1, 3) === '[]'

const shapeTypeUtil = {
    shapeTypeIsOptional,
    shapeTypeIsArray,
    shapeTypeIsOptionalArray
}

const applyParser = (result, shapeName, schemaKey, valueToParse) => {
    switch (shapeName) {
        case 'boolean':
            result[schemaKey] = shapeParser.toBoolean(valueToParse)
            break
        case 'object':
            result[schemaKey] = shapeParser.toObject(valueToParse)
            break
        case 'function':
            result[schemaKey] = shapeParser.toFunction(valueToParse)
            break
        case 'number':
            result[schemaKey] = shapeParser.toNumber(valueToParse)
            break
        case 'string':
            result[schemaKey] = shapeParser.toString(valueToParse)
            break
        case 'undefined':
        case 'null':
            result[schemaKey] = shapeParser.toNull(valueToParse)
            break
        default:
            break
    }

    return result[schemaKey]
}

/*
	This layer of shape parsing / validation is currently designed around flat validation.
	This allows objects to be defined as the value of keys, but not their shape.
*/
const validateAndParse = (schema, options) => {
    if (isNil(schema)) {
        throw new TypeError('schema must be defined')
    }

    if (isNil(options)) {
        throw new TypeError('options must be defined')
    }

    let isValid = true
    const errors = []
    const result = {}

    const schemaKeys = Object.keys(schema)

    for (const schemaKey of schemaKeys) {
        // example: '?number' or 'string'
        const shapeType = schema[schemaKey]

        // example: 'number' or 'string'
        const shapeName = getShapeTypeName(shapeType)

        if (!shapeTypes.includes(shapeName)) {
            isValid = false
            errors.push({
                type: 'Invalid Type',
                message: `Invalid type for key ${schemaKey}: ${shapeName}`
            })
            continue
        }

        const valueToParse = options[schemaKey]
        const keyIsOptional = shapeTypeIsOptional(shapeType)

        if (keyIsOptional && isNil(valueToParse)) {
            result[schemaKey] = shapeParser.toNull(valueToParse)
            continue
        } else if (!keyIsOptional && isNil(valueToParse)) {
            isValid = false
            errors.push({
                type: 'Missing Required',
                message: `Missing required value for ${schemaKey}: ${shapeName}`
            })
            continue
        }

        /*
        	Considerations for nested object graph support and custom types:
        	- use a URN like pattern for custom types (i.e. type:MyMail)
        		* custom type names must be a value that _can_ be a JSON key
        	- if type is 'object' in string form, keep current flow
        	- create a type registry to support reuse of custom types and cycle checks
        	- if type is 'type:<custom-type-name>', parse custom type and get from type registry
        	- if type is an object literal {} , assume it's a custom type definition and attempt to validate and parse
        */

        try {
            if (shapeTypeIsArray(shapeType)) {
                if (isArray(valueToParse)) {
                    result[schemaKey] = valueToParse
                    continue
                } else {
                    if (isString(valueToParse)) {
                        const valuesToParse = valueToParse.split(',')
                        const parsedValues = []
                        for (const pv of valuesToParse) {
                            const pvResult = {}
                            parsedValues.push(
                                applyParser(
                                    pvResult,
                                    shapeName,
                                    schemaKey,
                                    pv,
                                    false
                                )
                            )
                        }
                        result[schemaKey] = parsedValues
                        continue
                    } else {
                        isValid = false
                        errors.push({
                            type: 'Unable to parse',
                            message: `Unable to parse typeof ${typeof valueToParse} to an array from ${schemaKey}: ${shapeName}`
                        })
                        continue
                    }
                }
            }

            applyParser(result, shapeName, schemaKey, valueToParse)
        } catch (error) {
            isValid = false
            errors.push({
                type: 'Parser Error',
                message: `Unable to parse value as type for key ${schemaKey}: ${shapeName}`,
                stack: error.stack
            })
        }
    }

    return {
        isValid,
        errors,
        result
    }
}

module.exports = {
    shapeParser,
    shapeTypeUtil,
    validateAndParse,
    isNull,
    isUndefined,
    isNil,
    isString,
    isBoolean,
    isNumber,
    isObject,
    isFunction,
    isArray,
    isArrayOfString,
    isEmptyArray,
    isArrayOfAtLeast,
    isArrayOfAtMost,
    isFalseyType,
    isPromise
}
