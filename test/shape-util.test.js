const {test} = require('tap')
const {shapeUtil} = require('../lib')

test('shapeUtil validate shape', async t => {
    const optionsSchema = {
        orgName: 'string',
        name: '?string',
        useYarn: 'boolean',
        noLock: '?boolean',
        retryWaitTimeMs: 'number',
        maxRetrys: '?number',
        randomBools: '?[]boolean'
    }

    /*
		good options with all fields and mixed valid parse
	*/
    const goodOptionsV1 = {
        orgName: 'Test Org',
        name: 'test_name',
        useYarn: false,
        noLock: 'true',
        retryWaitTimeMs: 1000,
        maxRetrys: '3'
    }

    const validationGoodV1 = shapeUtil.validateAndParse(
        optionsSchema,
        goodOptionsV1
    )

    t.ok(validationGoodV1.isValid, 'validationGoodV1 is valid')
    t.equal(validationGoodV1.errors.length, 0, 'validationGoodV1 has no errors')

    // assert noLock was explicity parsed to the boolean value of true
    t.equal(
        validationGoodV1.result.noLock,
        true,
        'validationGoodV1 noLock value is boolean true'
    )
    // assert maxRetrys was explicity parsed to the number value of 3
    t.equal(
        validationGoodV1.result.maxRetrys,
        3,
        'validationGoodV1 maxRetrys is the number 3'
    )

    /*
		bad options with all fields and mixed valid & invalid parse values
	*/
    const badOptionsV1 = {
        orgName: 'Test Org',
        name: undefined,
        useYarn: 234,
        retryWaitTimeMs: true,
        maxRetrys: 'Try it'
    }

    const validationBadV1 = shapeUtil.validateAndParse(
        optionsSchema,
        badOptionsV1
    )

    t.false(validationBadV1.isValid, 'validationBadV1 is not valid')
    t.equal(validationBadV1.errors.length, 2, 'validationBadV1 has no errors')

    // assert name was explicity parsed to null
    t.equal(
        validationBadV1.result.name,
        null,
        'validationBadV1 name is null value'
    )

    /*
		good options with all fields and mixed parse values and excluded optionals
	*/
    const goodOptionsV2 = {
        orgName: 'Test Org 2',
        name: null,
        useYarn: false,
        retryWaitTimeMs: '1000',
        randomBools: 'true,false,false,true,false,true,true'
    }

    const validationGoodV2 = shapeUtil.validateAndParse(
        optionsSchema,
        goodOptionsV2
    )

    t.true(validationGoodV2.isValid, 'validationGoodV2 is valid')
    t.equal(validationGoodV2.errors.length, 0, 'validationGoodV2 has no errors')

    // assert noLock was explicity parsed to nil
    t.ok(
        shapeUtil.isNil(validationGoodV2.result.noLock),
        'validationGoodV2 noLock is nil'
    )
    // assert maxRetrys was explicity parsed to nil
    t.ok(
        shapeUtil.isNil(validationGoodV2.result.maxRetrys),
        'validationGoodV2 maxRetrys is nil'
    )
    // assert retryWaitTimeMs was explicity parsed to the number value of 1000
    t.equal(
        validationGoodV2.result.retryWaitTimeMs,
        1000,
        'validationGoodV2 retryWaitTimeMs is the number 1000'
    )
    // assert randomBools was explicity parsed to an array
    t.ok(
        Array.isArray(validationGoodV2.result.randomBools),
        'validationGoodV2 randomBools is an array type'
    )

    // assert randomBools was explicity parsed to expected array of boolean
    t.same(
        validationGoodV2.result.randomBools,
        [true, false, false, true, false, true, true],
        'validationGoodV2 randomBools is expected array of boolean'
    )

    t.end()
})
