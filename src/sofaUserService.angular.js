/* global store */
'use strict';
angular.module('sofa.userService', [
    'sofa.core',
    store.enabled ? 'sofa.storages.localStorageService' : 'sofa.storages.memoryStorageService'
])
.factory('userService', function (storageService, configService, $http, $q) {
    return new sofa.UserService(storageService, configService, $http, $q);
});
