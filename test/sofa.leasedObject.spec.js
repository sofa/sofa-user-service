'use strict';
/* global sofa */
 // global AsyncSpec 

describe('sofa.leasedObject', function () {

    it('should expose access to wrapped object', function () {

        var called = false;
        var someObject = {
            doSomething: function () {
                called = true;
            }
        };
        var leasedObject = new sofa.LeasedObject(someObject);
        leasedObject.unwrap().doSomething();
        expect(called).toBeTruthy();
    });

    it('should not expose access to wrapped object', function () {

        var someObject = {};
        var fiveMinutesOld = new Date().getTime() - (5 * 60 * 1000);
        var leasedObject = new sofa.LeasedObject(someObject, fiveMinutesOld);
        // access object with infinite life time
        expect(leasedObject.unwrap()).toEqual({});
        //access object not older than 3 minutes shouldn't be possible
        expect(leasedObject.unwrap(3)).toEqual(null);
        //access object not older than 10 minutes should work
        expect(leasedObject.unwrap(10)).toEqual({});
    });


    it('should be able to serialize/deserialize leased objects', function () {

        var someObject = {
            someProperty: 5
        };
        var fiveMinutesOld = new Date().getTime() - (5 * 60 * 1000);
        var leasedObject = new sofa.LeasedObject(someObject, fiveMinutesOld);

        var serialized = leasedObject.serialize();

        var desialized = sofa.LeasedObject.deserialize(serialized);

        // access object with infinite life time
        expect(desialized.unwrap().someProperty).toEqual(5);
        //access object not older than 3 minutes shouldn't be possible
        expect(desialized.unwrap(3)).toEqual(null);
        //access object not older than 10 minutes should work
        expect(desialized.unwrap(10).someProperty).toEqual(5);
    });
});
