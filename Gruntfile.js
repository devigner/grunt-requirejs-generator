/*
 * grunt-requirejs-config
 * http://gitlab.bluedevelop.nl/devigner/grunt-plugin-generate-requirejs
 *
 * Copyright (c) 2014 Martijn van Beek <martijn.vanbeek@gmail.com>
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
          config:    'config/paths.json',
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
            config: 'config/paths-minify.json',
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

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-yuidoc');
  grunt.loadNpmTasks('grunt-requirejs-generator');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['requirejs_generator']);

};
