// https://npmjs.org/package/grunt-contrib 
module.exports = function(grunt) {  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>.\n' +
        ' * Licensed under the <%= pkg.license.name %> license.\n */ '
    },


    /**
     * CONCAT
     */
    concat: {
      options: {},

      scripts: {
        src: [
          'src/slideview.prefix',
          'src/helpers.js',
          'src/constants.js',
          'src/options.js',
          'src/slideview.js',
          'src/slideview.suffix'
        ],

        dest: 'slideview.js'
      }
    },


    /**
     * STRING REPLACE
     */
    'string-replace': {
      version: {
        files: {
          'slideview.js': ['slideview.js']
        },
        options: {
          replacements: [
            {
              pattern: '{{@VERSION}}',
              replacement: '<%= pkg.version %>'
            }
          ]
        }
      }
    },


    /** 
     * UGLIFY JS
     */
    uglify: {
      options: {
        banner: '<%= meta.banner %>',
        report: 'gzip',
        compress: true,
        drop_console: true
      },

      dist: {
        files: {
          'slideview.min.js': ['slideview.js']
        }
      }
    },

    /**
     * JSHINT
     */
    jshint: {
      options: {
        // Report JSHint errors but not fail the task
        force: true,

        // Ignore warnings
        '-W030': true, // `e && e.preventDefault()`
        '-W098': true, // is defined but never used

        globals: {
          window: true
        },

        // Enforcing
        'camelcase': true,     // Identifiers must be in camelCase
        'curly'    : true,     // Require {} for every new block or scope
        'eqeqeq'   : true,     // Require triple equals (===) for comparison
        'forin'    : true,     // Require filtering for..in loops with obj.hasOwnProperty()
        'immed'    : true,     // Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
        'indent'   : 2,        // Number of spaces to use for indentation
        'latedef'  : false,    // Require variables/functions to be defined before being used
        'newcap'   : true,     // Require capitalization of all constructor functions e.g. `new F()`
        'noempty'  : true,     // Prohibit use of empty blocks
        'plusplus' : true,     // Prohibit use of `++` & `--`
        'quotmark' : 'single', // Require single quotes
        'undef'    : true,     // Require all non-global variables to be declared (prevents global leaks)
        'unused'   : true,     // Require all defined variables be used
        'strict'   : true,     // Requires all functions run in ES5 Strict Mode
        'maxparams': 3,        // Max number of formal params allowed per function
        'maxlen'   : 100,      // Max number of characters per line

        // Relaxing
        'debug'    : true,     // Allow debugger statements e.g. browser breakpoints.
      },

      src: ['slideview.js']
    },


    /**
     * Run `grunt watch` to watch files.
     */
    watch: {
      scripts: {
        files: ['src/**/*.js', 'src/slideview.prefix', 'src/slideview.suffix'],
        tasks: ['default'],
        options: { spawn: false }
      }
    }
  });


  /**
   * Load the Grunt plugins.
   */
  [
    'grunt-contrib-concat',
    'grunt-string-replace',
    'grunt-contrib-uglify', 
    'grunt-contrib-jshint',
    'grunt-contrib-watch'
  ].forEach(grunt.loadNpmTasks);

  // The default task.
  grunt.registerTask('default', ['concat', 'string-replace', 'uglify', 'jshint']);

};
