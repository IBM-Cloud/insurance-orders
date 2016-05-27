'use strict';

var _ = require('lodash');

var desireds = require('./desireds');

var gruntConfig = {
        env: {
            // dynamically filled
        },
        simplemocha: {
            sauce: {
                options: {
                    timeout: 60000,
                    reporter: 'spec-xunit-file',
                },
                src: ['tests/sauce_actual/test-cases.js']
            },
            sauce_node: {
                options: {
                    timeout: 60000,
                    reporter: 'spec-xunit-file',
                },
                src: ['tests/sauce/test-cases.js']
            }
        },    
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },                
                src: ['test/*.js']
            },
        },
        concurrent: {
            'test-sauce': [], // dynamically filled
        },  
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            },
        },
    };

_.forIn(desireds,function(desired, key) {
    gruntConfig.env[key] = { 
        DESIRED: JSON.stringify(desired)
    };
    //gruntConfig.concurrent['test-sauce'].push('test:sauce:' + key);
});

//console.log(gruntConfig);

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig(gruntConfig);

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test_real', ['env:chrome', 'simplemocha:sauce:' + _(desireds).keys().first()]);
    grunt.registerTask('test_fake', ['env:chrome', 'simplemocha:sauce_node:' + _(desireds).keys().first()]);

    // _.forIn(desireds,function(desired, key) {
    //         grunt.registerTask('test:sauce:' + key, ['env:' + key, 'simplemocha:sauce']);
    // });

    // grunt.registerTask('test', ['concurrent:test-sauce']);
};
