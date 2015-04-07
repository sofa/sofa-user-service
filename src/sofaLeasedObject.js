'use strict';
/* global sofa */
/**
 * @name LeasedObject
 * @namespace sofa.LeasedObject
 *
 * @description
 * The `LeasedObject` is used to wrap any object with a time stamp and only provide access to it within a given lease time.
 */
sofa.define('sofa.LeasedObject', function (data, timestamp) {

    var self = {},
        then = timestamp || new Date().getTime();

    /**
     * @method unwrap
     * @memberof sofa.LeasedObject
     *
     * @description
     * Returns the underlying data if it's still within the specified lease time
     *
     * @param {maxAgeMinutes} The maximum age of the data in minutes. Infinite if not specified.
     * @return {object} The data object
     */
    self.unwrap = function (maxAgeMinutes) {
        if (sofa.Util.isUndefined(maxAgeMinutes)) {
            return data;
        }

        return isMaxMinutesOld(then, maxAgeMinutes) ? data : null;
    };

    /**
     * @method serialize
     * @memberof sofa.LeasedObject
     *
     * @description
     * Returns a representation that can be stored as a string and later be deserialized into a `sofa.LeaseObject` again.
     *
     * @return {object} the serialized object
     */
    self.serialize = function () {
        return {
            data: data,
            timestamp: then
        };
    };

    var toMinutes = function (timestamp) {
        return Math.floor(timestamp / 1000 / 60);
    };

    var isMaxMinutesOld = function (timestamp, maxMinutes) {
        var dateInMinutes = toMinutes(timestamp),
            nowInMinutes  = toMinutes(new Date().getTime());

        return nowInMinutes - dateInMinutes <= maxMinutes;
    };

    return self;
});


/**
 * @method deserialize
 * @memberof sofa.LeasedObject
 *
 * @description
 * Static method that deserializes a serialized leased object into a proper `sofa.LeasedObject` instance again
 *
 * @return {object} the sofa.LeasedObject instance
 */
sofa.LeasedObject.deserialize = function (wrapper) {
    return new sofa.LeasedObject(wrapper.data, wrapper.timestamp);
};