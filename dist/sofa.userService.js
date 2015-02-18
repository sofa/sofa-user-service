/**
 * sofa-user-service - v0.6.0 - 2015-02-18
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO).
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (sofa, undefined) {

'use strict';
/* global sofa */
/**
 * @name LeasedData
 * @namespace sofa.LeasedData
 *
 * @description
 * The `LeasedData` is used to wrap any object with a time stamp and only provide access to it within a given lease time.
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
'use strict';
/* global sofa */
/**
 * @name UserService
 * @namespace sofa.UserService
 *
 * @description
 * User related service that let's you access things like billing addresses, shipping
 * addresses and similar things.
 */
sofa.define('sofa.UserService', function (storageService, configService, httpService, $q) {

    var self = {},
        FORM_DATA_HEADERS = {'Content-Type': 'application/x-www-form-urlencoded'},
        STORE_PREFIX = 'basketService_',
        STORE_INVOICE_ADDRESS_KEY = STORE_PREFIX + 'invoiceAddress',
        STORE_SHIPPING_ADDRESS_KEY = STORE_PREFIX + 'shippingAddress',
        STORE_LOGGED_IN_USER_KEY = STORE_PREFIX + 'loggedInUser',
        loginEndpoint = configService.get('apiEndpoint') + 'customers/login',
        storeCode = configService.get('storeCode'),
        loggedInUser = null;

    /**
     * @method getInvoiceAddress
     * @memberof sofa.UserService
     *
     * @description
     * Gets the invoice address for the user.
     *
     * @param {Number} maxAge optionally parameter to specify accepted max age of user data
     * @return {object} address Address object.
     */
    self.getInvoiceAddress = function (maxAge) {
        var address = storageService.get(STORE_INVOICE_ADDRESS_KEY);

        if (!address) {
            address = {
                country: configService.getDefaultCountry()
            };

            self.updateInvoiceAddress(address);

            return address;
        }

        return sofa.LeasedObject.deserialize(address).unwrap(maxAge) || {};
    };

    /**
     * @method updateInvoiceAddress
     * @memberof sofa.UserService
     *
     * @description
     * Creates/Updates the invoice address for the user.
     *
     * @param {object} invoiceAddress Invoice address object.
     */
    self.updateInvoiceAddress = function (invoiceAddress) {
        return storageService.set(STORE_INVOICE_ADDRESS_KEY, new sofa.LeasedObject(invoiceAddress).serialize());
    };

    /**
     * @method hasExistingAddress
     * @memberof sofa.UserService
     *
     * @description
     * Checks if a given address by `type` exists in used storage.
     * A.k.a. Did the user already buy something so we have an address
     * we can propose for the next buy?
     *
     * @param {string} type Storage key for either invoice or shipping address
     * @returns {bool}
     */
    self.hasExistingAddress = function (type) {
        return !!(storageService.get(type));
    };

    /**
     * @method hasExistingShippingAddress
     * @memberof sofa.UserService
     *
     * @description
     * Wraps `hasExistingAddress`. Syntactic sugar method
     * to check for existing shipping address.
     *
     * @returns {bool} True if there's an existing shipping address
     */
    self.hasExistingShippingAddress = function () {
        return self.hasExistingAddress(STORE_SHIPPING_ADDRESS_KEY);
    };

    /**
     * @method hasExistingInvoiceAddress
     * @memberof sofa.UserService
     *
     * @description
     * Wraps `hasExistingAddress`. Syntactic sugar method
     * to check for existing invoice address.
     *
     * @returns {bool} True if there's an existing invoice address
     */
    self.hasExistingInvoiceAddress = function () {
        return self.hasExistingAddress(STORE_INVOICE_ADDRESS_KEY);
    };

    /**
     * @method getShippingAddress
     * @memberof sofa.UserService
     *
     * @description
     * Gets the shipping address for the user.
     *
     * @param {Number} maxAge optionally parameter to specify accepted max age of user data
     * @return {object} shipping address object.
     */
    self.getShippingAddress = function (maxAge) {
        var lease = storageService.get(STORE_SHIPPING_ADDRESS_KEY);

        return lease ? sofa.LeasedObject.deserialize(lease).unwrap(maxAge) || {} : {};
    };

    /**
     * @method updateShippingAddress
     * @memberof sofa.UserService
     *
     * @description
     * Creates/Updates the shipping address for the user.
     *
     * @param {object} invoiceAddress
     */
    self.updateShippingAddress = function (invoiceAddress) {
        return storageService.set(STORE_SHIPPING_ADDRESS_KEY, new sofa.LeasedObject(invoiceAddress).serialize());
    };

    /**
     * @sofadoc method
     * @name sofa.UserService#login
     * @memberof sofa.UserService
     *
     * @description
     * Performs a login for the current user with given credentials for the shop.
     *
     * @param {string} user Username or email address.
     * @param {string} password Password.
     * @returns {Promise} A promise that either resolved or rejected.
     */
    self.login = function (user, password) {
        var deferred = $q.defer();

        httpService({
            method: 'POST',
            url: loginEndpoint,
            headers: FORM_DATA_HEADERS,
            transformRequest: sofa.Util.toFormData,
            data: {
                storeCode: storeCode,
                user: user,
                password: password
            }
        }).then(function (response) {
            loggedInUser = response.data;
            storageService.set(STORE_LOGGED_IN_USER_KEY, loggedInUser);
            deferred.resolve(loggedInUser);
        }, function () {
            self.logout();
            deferred.reject();
        });

        return deferred.promise;
    };

    /**
     * @sofadoc method
     * @name sofa.UserService#isLoggedIn
     * @memberof sofa.UserService
     *
     * @description
     * Checks if a user is logged in or not and retuns a boolean.
     *
     * @returns {boolean} True if logged in, false if not.
     */
    self.isLoggedIn = function () {
        if (!loggedInUser) {
            loggedInUser = storageService.get(STORE_LOGGED_IN_USER_KEY);
        }
        return !!loggedInUser;
    };

    /**
     * @sofadoc method
     * @name sofa.UserService#logout
     * @memberof sofa.UserService
     *
     * @description
     * Logs out user.
     */
    self.logout = function () {
        storageService.remove(STORE_LOGGED_IN_USER_KEY);
        loggedInUser = null;
    };

    /**
     * @sofadoc method
     * @name sofa.UserService#getEmail
     * @memberof sofa.UserService
     *
     * @description
     * Returns the email address of a user.
     *
     * @return {string} email Email address of logged in user.
     */
    self.getEmail = function () {
        if (!self.isLoggedIn()) {
            throw new Error('Can\'t access email address, user is not logged in!');
        }
        var user = loggedInUser || storageService.get(STORE_LOGGED_IN_USER_KEY);
        return user.customer.email;
    };

    /**
     * @sofadoc method
     * @name sofa.UserService#getAddresses
     * @memberof sofa.UserService
     *
     * @description
     * Returns all addresses of a logged in user.
     *
     * @return {array} addresses Set of email addresses of logged in user.
     */
    self.getAddresses = function () {
        if (!self.isLoggedIn()) {
            throw new Error('Can\'t access addresses, user is not logged in!');
        }
        var user = loggedInUser || storageService.get(STORE_LOGGED_IN_USER_KEY);
        return user.customer.addresses;
    };

    return self;
});

} (sofa));
