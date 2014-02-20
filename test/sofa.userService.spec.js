'use strict';
/* global sofa */

describe('sofa.userService', function () {

    var userService, configService, storageService;

    beforeEach(function () {
        storageService = new sofa.MemoryStorageService();
        configService = new sofa.ConfigService();

        userService = new sofa.UserService(storageService, configService);
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
            var updatedInvoiceAddress = storageService.get('basketService_invoiceAddress');
            expect(updatedInvoiceAddress).toBeDefined();
            expect(updatedInvoiceAddress.country).toEqual('foo');
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
            expect(address.country).toBeDefined();
            expect(address.country).toEqual(configService.getDefaultCountry());
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
            var updatedShippingAddress = storageService.get('basketService_shippingAddress');
            expect(updatedShippingAddress).toBeDefined();
            expect(updatedShippingAddress.country).toEqual('foo');
        });
    });
});
