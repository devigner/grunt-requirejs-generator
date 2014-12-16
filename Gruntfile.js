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

    // Configuration to be run (and then tested).
    requirejs_generator:{
      config: {
        options: {
          yuidoc_dir:'build/apidocs',
          build_dir: 'build',
          debug:     true,
          config:    grunt.file.readJSON("config/paths.json"),
          output:    'html/assets/js/source/<%= pkg.main %>.js',
          replace:{
            that:'html/assets/',
            with:'/assets/editor/'
          },
          ignore:[

          ],
          jshint:[

          ],
          minify:{
            config:  grunt.file.readJSON("config/paths-minify.json"),
            output: 'html/assets/js/min/<%= pkg.main %>.js',
            app:    'html/assets/js/min/App-<%= pkg.main %>.js',
            ignore:[
              "Handlebars"
            ]
          }
        }
      }
    }
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
