/**
 * sofa-user-service - v0.7.0 - Wed Apr 08 2015 13:40:54 GMT+0200 (CEST)
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO)
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (angular) {
/* global store */
'use strict';
angular.module('sofa.userService', [
    'sofa.core',
    store.enabled ? 'sofa.storages.localStorageService' : 'sofa.storages.memoryStorageService'
])
.factory('userService', ["storageService", "configService", "$http", "$q", function (storageService, configService, $http, $q) {
    return new sofa.UserService(storageService, configService, $http, $q);
}]);
}(angular));
