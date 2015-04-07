require('shared-sofa-component-tasks')(require('gulp'), {
    pkg: require('./package.json'),
    baseDir: __dirname,
    testDependencyFiles: [
        'node_modules/sofa-http-service/dist/sofa.httpService.js',
        'node_modules/sofa-q-service/dist/sofa.qService.js',
        'node_modules/sofa-storages/dist/sofaStorages.js',
        'node_modules/sofa-testing/mocks/*.js',
        'node_modules/sofa-testing/helpers/*.js'
    ]
});
