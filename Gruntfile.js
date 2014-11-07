/*
 * grunt-requirejs-config
 * http://gitlab.bluedevelop.nl/blueberry/grunt-plugin-generate-requirejs
 *
 * Copyright (c) 2014 Martijn van Beek
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    'requirejs_generator':{
      config: {
        options: {
          yuidoc_dir:'build/apidocs',
          build_dir: 'build',
          output: 'assets/js/source/App.js',
          replace:{
            prefix: '/',
            that:'assets/',
            with:'app-assets/editor/'
          },
          thirdParty: grunt.file.readJSON("js-config/paths.json"),
        //  ready: "$(document).trigger('app-ready');",
          ignore:[
            "StandaloneMediaManager"
          ],
          ignoreForMinify:[
            "Plexer"
          ],
          jshint:[
            'requirejs',
            'require',
            'requestAnimationFrame',
            'CKEDITOR',
            "Mousetrap"
          ]
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-requirejs-config');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'requirejs_generator', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
