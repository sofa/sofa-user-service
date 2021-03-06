'use strict';
/* global sofa */

describe('sofa.userService', function () {

    var userService, configService, storageService, q;

    var createHttpService = function () {
        return new sofa.mocks.httpService(new sofa.QService());
    };

    beforeEach(function () {
        storageService = new sofa.MemoryStorageService();
        configService = new sofa.ConfigService();
        q = new sofa.QService();
        userService = new sofa.UserService(storageService, configService, createHttpService(), q);
    });

    it('should be defined', function () {
        expect(userService).toBeDefined();
    });

    it('should have a method getInvoiceAddress', function () {
        expect(userService.getInvoiceAddress).toBeDefined();
    });

    it('should have a method updateInvoiceAddress', function () {
        expect(userService.updateInvoiceAddress).toBeDefined();
    });

    it('should have a method getShippingAddress', function () {
        expect(userService.getShippingAddress).toBeDefined();
    });

    it('should have a method updateShippingAddress', function () {
        expect(userService.updateShippingAddress).toBeDefined();
    });

    it('should have a method login', function () {
        expect(userService.login).toBeDefined();
    });

    it('should have a method isLoggedIn', function () {
        expect(userService.isLoggedIn).toBeDefined();
    });

    it('should have a method logout', function () {
        expect(userService.logout).toBeDefined();
    });

    it('should have a method getEmail', function () {
        expect(userService.getEmail).toBeDefined();
    });

    it('should have a method hasExistingAddress', function () {
        expect(userService.hasExistingAddress).toBeDefined();
    });

    it('should have a method hasExistingShippingAddress', function () {
        expect(userService.hasExistingShippingAddress).toBeDefined();
    });

    it('should have a method hasExistingInvoiceAddress', function () {
        expect(userService.hasExistingInvoiceAddress).toBeDefined();
    });

    describe('sofa.UserService#getEmail', function () {

        it('should be a function', function () {
            expect(typeof userService.getEmail).toBe('function');
        });

        it('should return throw exception if user is not logged in', function () {
            expect(function () {
                userService.getEmail();
            }).toThrowError('Can\'t access email address, user is not logged in!');
        });
    });

    describe('sofa.UserService#isLoggedIn', function () {

        var configService = new sofa.ConfigService(),
            storageService = new sofa.MemoryStorageService(),
            httpService = createHttpService(),
            userService = new sofa.UserService(storageService, configService, httpService, new sofa.QService());

        it('should be a function', function () {
            expect(typeof userService.isLoggedIn).toBe('function');
        });

        it('should return a boolean', function () {
            expect(typeof userService.isLoggedIn()).toBe('boolean');
        });

        it('should return email of logged in user', function (done) {

            var loginEndpoint = configService.get('apiEndpoint') + 'customers/login';

            var user = {
                name: 'foo',
                password: 'bar'
            };

            httpService.when('POST', loginEndpoint).respond({
                token: 'token',
                customer: {
                    id: 61,
                    active: true,
                    email: 'foo@bar.com'
                }
            });

            userService.login(user.name, user.password).then(function () {
                expect(userService.getEmail()).toEqual('foo@bar.com');
                done();
            });
        });
    });

    describe('sofa.UserService#login', function () {

        var configService = new sofa.ConfigService(),
            storageService = new sofa.MemoryStorageService(),
            httpService = createHttpService(),
            userService = new sofa.UserService(storageService, configService, httpService, new sofa.QService());

        it('should be a function', function () {
            expect(typeof userService.login).toBe('function');
        });

        it('should return a promise', function () {
            expect(userService.login().then).toBeDefined();
        });

        it('should login a user', function (done) {
            storageService.clear();

            var loginEndpoint = configService.get('apiEndpoint') + 'customers/login';
            // var storeCode = configService.get('storeCode');

            var user = {
                name: 'foo',
                password: 'bar'
            };

            httpService.when('POST', loginEndpoint).respond({
                token: 'token',
                customer: {
                    id: 61,
                    active: true,
                    email: 'foo@bar.com',
                }
            });

            userService.login(user.name, user.password).then(function (response) {
                expect(response).toBeDefined();
                expect(response.token).toBeDefined();
                expect(response.customer).toBeDefined();
                expect(userService.isLoggedIn()).toBe(true);
                done();
            });
        });
    });

    describe('sofa.UserService#logout', function () {

        var configService = new sofa.ConfigService(),
            httpService = createHttpService(),
            storageService = new sofa.MemoryStorageService(),
            userService = new sofa.UserService(storageService, configService, httpService, new sofa.QService());

        it('should be a function', function () {
            expect(typeof userService.logout).toBe('function');
        });

        it('should logout a user', function (done) {

            var loginEndpoint = configService.get('apiEndpoint') + 'customers/login';

            var user = {
                name: 'foo',
                password: 'bar'
            };

            httpService.when('POST', loginEndpoint).respond({
                token: 'token',
                customer: {
                    id: 61,
                    active: true,
                    email: 'foo@bar.com'
                }
            });

            userService.login(user.name, user.password).then(function () {
                userService.logout();
                expect(userService.isLoggedIn()).toBe(false);
                done();
            });
        });
    });

    describe('sofa.UserService#hasExistingAddress', function () {

        it('should be a function', function () {
            expect(typeof userService.hasExistingAddress).toBe('function');
        });

        it('should return a boolean', function () {
            expect(typeof userService.hasExistingAddress()).toBe('boolean');
        });
    });

    describe('sofa.UserService#getInvoiceAddress', function () {

        it('should be a function', function () {
            expect(typeof userService.getInvoiceAddress).toBe('function');
        });

        it('should return an object', function () {
            expect(typeof userService.getInvoiceAddress()).toBe('object');
        });

        it('should return address object', function () {
            var address = userService.getInvoiceAddress();
            expect(address.country).toBeDefined();
            expect(address.country).toEqual(configService.getDefaultCountry());
        });
    });

    describe('sofa.UserService#getAddresses', function () {

        it('should be a function', function () {
            expect(typeof userService.getAddresses).toBe('function');
        });

        it('should throw an arrow when user is not logged in', function () {
            expect(function () {
                userService.getAddresses();
            }).toThrowError('Can\'t access addresses, user is not logged in!');
        });

        var configService = new sofa.ConfigService(),
            httpService = createHttpService(),
            storageService = new sofa.MemoryStorageService(),
            userService = new sofa.UserService(storageService, configService, httpService, new sofa.QService());


        it('should return an array', function (done) {
            var loginEndpoint = configService.get('apiEndpoint') + 'customers/login';

            var user = {
                name: 'foo',
                password: 'bar'
            };

            httpService.when('POST', loginEndpoint).respond({
                token: 'token',
                customer: {
                    id: 61,
                    active: true,
                    email: 'foo@bar.com',
                    addresses: []
                }
            });

            userService.login(user.name, user.password).then(function () {
                expect(userService.getAddresses().length).toBeDefined();
                done();
            });
        });
    });

    describe('sofa.UserService#updateInvoiceAddress', function () {

        afterEach(function () {
            storageService.clear();
        });

        it('should be a function', function () {
            expect(typeof userService.updateInvoiceAddress).toBe('function');
        });

        it('should update invoice address', function () {
            userService.updateInvoiceAddress({
                country: 'foo'
            });
            var updatedInvoiceAddress = userService.getInvoiceAddress();
            expect(updatedInvoiceAddress).toBeDefined();
            expect(updatedInvoiceAddress.country).toEqual('foo');

            userService.updateInvoiceAddress();
            updatedInvoiceAddress = userService.getInvoiceAddress();
            expect(updatedInvoiceAddress).toEqual({});
        });
    });

    describe('sofa.UserService#getShippingAddress', function () {

        it('should be a function', function () {
            expect(typeof userService.getShippingAddress).toBe('function');
        });

        it('should return an object', function () {
            expect(typeof userService.getShippingAddress()).toBe('object');
        });

        it('should return shipping address', function () {
            var address = userService.getShippingAddress();
            expect(address).toBeDefined();
        });
    });

    describe('sofa.UserService#updateShippingAddress', function () {

        afterEach(function () {
            storageService.clear();
        });

        it('should be a function', function () {
            expect(typeof userService.updateShippingAddress).toBe('function');
        });

        it('should update shipping address', function () {
            userService.updateShippingAddress({
                country: 'foo'
            });
            var updatedShippingAddress = userService.getShippingAddress();
            expect(updatedShippingAddress).toBeDefined();
            expect(updatedShippingAddress.country).toEqual('foo');

            userService.updateShippingAddress();
            updatedShippingAddress = userService.getShippingAddress();
            expect(updatedShippingAddress).toEqual({});
        });
    });
});
