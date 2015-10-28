module.exports = function(grunt) {
  "use strict";



  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    // This line makes your node configurations available for use
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      myFiles: ['Gruntfile.js',
                //'js/*.js',
                'codeflow-app/js/*js']
    },


    connect: {
      server: {
        options: {
          port: 3030,
          livereload: true,
          open: "http://localhost:3030/codeflow-app/index-dev.html"
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'js/cors-server.js'
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: {
          'codeflow-app/css/app.css': 'codeflow-app/scss/app.scss'
        }
      }
    },

    watch: {
      set1: {
        files: ['*.js',
                'js/*.js',
                'codeflow-app/js/*.js'],
        tasks: ['dev']
      },
      set3: {
        files: [ 'codeflow-app/scss/*.scss'],
        tasks: ['sass']
      },
      set4: {
        files: [ 'codeflow-app/css/*.css'],
        tasks: [],
        options: {
          livereload: true,
        }
      },
      express: {
        files: ['js/cors-server.js'],
        tasks:  [ 'express:dev' ]
      }
    },

    copy: {
      devsetup: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['node_modules/ionic-sdk/release/js/ionic.bundle.min.js'],
            dest: 'codeflow-app/lib/js',
            filter: 'isFile'
          },
          // Ionic scss
          {
            expand: true,
            cwd: 'node_modules/ionic-sdk/scss/',
            src: ['**'],
            dest: 'codeflow-app/scss/ionic'
          },
          // Ionic fonts
          {
            expand: true,
            cwd: 'node_modules/ionic-sdk/release/fonts/',
            src: ['**'],
            dest: 'codeflow-app/fonts'
          },
          {
            src: ['node_modules/forcejs/oauthcallback.html'],
            dest: 'oauthcallback.html'
          }
        ]
      }
    },

    karma: {
      unit: {
        configFile: 'codeflow-app/tests/my.conf.js'
      }
    }


  });
  // Each plugin must be loaded following this pattern
  grunt.registerTask('devsetup', ['copy:devsetup', 'sass']);
  grunt.registerTask('serve', ['connect', 'express:dev', 'watch']);
  grunt.registerTask('dev', ['jshint:myFiles']);
  grunt.registerTask('unit-test', ['karma']);
  grunt.registerTask('prod', ['jshint:myFiles', 'uglify', 'compress:prod']);
};
