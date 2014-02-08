module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'public/css/app.css': 'app/scss/app.scss'
        }
      }
    },
    concat: {
      dist: {
        src: [
          'app/js/before.js',
          'app/js/app.js'
        ],
        dest: 'public/app.js'
      }
    },
    watch: {
      javascript: {
        files: 'app/js/**/*.js',
        tasks: ['jshint','concat:dist']
      },
      scss: {
        files: 'app/scss/**/*.scss',
        tasks: ['sass:dist']
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          App: true
        }
      },
      all: ['Gruntfile.js', 'app/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('build', ['sass:dist', 'jshint', 'concat:dist']);
  grunt.registerTask('default', ['build', 'watch']);
};