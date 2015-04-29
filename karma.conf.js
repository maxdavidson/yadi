// karma.conf.js
module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jspm', 'mocha', 'chai'],

        jspm: {
            loadFiles: ['test/**/*.js'],
            serveFiles: ['src/**/*.js']
        },

        preprocessors: {
            'test/**/*.js': ['babel']
        },

        // Options for tests only
        'babelPreprocessor': {
            options: {
                sourceMap: 'inline',
                modules: 'system',
                moduleIds: false,
                optional: ['runtime'],
                stage: 0
            }
        },

        reporters: ['progress'],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,

        browsers: ['Chrome']
    });
};
