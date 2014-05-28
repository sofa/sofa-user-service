/**
 * sofa-user-service - v0.2.1 - 2014-05-28
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
     * @return {object} address Address object.
     */
    self.getInvoiceAddress = function () {
        var address = storageService.get(STORE_INVOICE_ADDRESS_KEY);

        if (!address) {
            address = {
                country: configService.getDefaultCountry()
            };

            self.updateInvoiceAddress(address);
        }

        return address;
    };

    /**
     * @method updateInvoiceAddress
     * @memberof sofa.Updates
     *
     * @description
     * Creates/Updates the invoice address for the user.
     *
     * @param {object} invoiceAddress Invoice address object.
     */
    self.updateInvoiceAddress = function (invoiceAddress) {
        return storageService.set(STORE_INVOICE_ADDRESS_KEY, invoiceAddress);
    };

    /**
     * @method getShippingAddress
     * @memberof sofa.UserService
     *
     * @description
     * Gets the shipping address for the user.
     *
     * @return {object} shipping address object.
     */
    self.getShippingAddress = function () {
        var address = storageService.get(STORE_SHIPPING_ADDRESS_KEY);

        if (!address) {
            address = {
                country: configService.getDefaultCountry()
            };
            self.updateInvoiceAddress(address);
        }

        return address;
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
        return storageService.set(STORE_SHIPPING_ADDRESS_KEY, invoiceAddress);
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
