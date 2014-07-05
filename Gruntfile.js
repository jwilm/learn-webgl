var fs = require('fs');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);

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
          'vendor/js/gl-matrix.js',
          'app/js/before.js',
          'app/js/shaders.js',
          'app/js/main.js',
          'app/js/after.js'
        ],
        dest: 'public/js/app.js'
      }
    },
    compile: {
      shaders: {
        src: 'app/shaders/**/*.glsl',
        trim: 'app/shaders/',
        global: 'App',
        dest: 'app/js/shaders.js'
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
      },
      shaders: {
        files: 'app/shaders/**/*.glsl',
        tasks: ['compile:shaders']
      }
    },
    express: {
      serve: {
        options: {
          script: 'server.js'
        }
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
        },
        ignores: ['app/js/before.js', 'app/js/after.js'],
      },
      all: ['Gruntfile.js', 'app/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-express-server');

  // Default task(s).
  grunt.registerTask('build',
                     ['compile', 'sass:dist', 'jshint', 'concat:dist']);
  grunt.registerTask('default', ['express:serve', 'compile', 'build', 'watch']);

  /**
   * compile:shaders - turn shaders into strings and save them into
   * App.shaders. Files are discovered using the `src` option, and the `trim`
   * option enables removing part of the path for easier referencing in the
   * application.
   */
  grunt.registerMultiTask('compile', 'Compile Things', function () {
    if(this.target !== 'shaders') {
      return;
    }

    var done = this.async();
    return glob(this.data.src).bind(this).then(function(files) {
      return Promise.map(files, function(file) {
        return readFile(file, 'utf8').then(function(contents) {
          return {filename: file, contents: contents};
        });
      });
    }).reduce(function(shaderCollection, shader) {
      var name =
        shader.filename.replace(this.data.trim, '').replace('.glsl', '');

      shaderCollection[name] =
        shader.contents.replace(/ +/g, ' ', 'g').replace(/\n/g, '', 'g');

      return shaderCollection;
    }, {}).then(function(shaders) {
      var JS = 'var shaders = ' + JSON.stringify(shaders, null, '  ') + ';';
      return writeFile(this.data.dest, JS, 'utf8');
    }).then(function () {
      return done();
    }).catch(function (err) {
      return done(err);
    });
  });
};

