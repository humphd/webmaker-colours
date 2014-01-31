module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      jsDist: {
        src: [
          'app/bower_components/lodash/dist/lodash.js',
          'app/bower_components/angular/angular.js',
          'app/directives.js',
          'app/collector.js'
        ],
        dest: 'data/app.js'
      },
      cssDist: {
        src: [
          'app/bower_components/font-awesome/css/font-awesome.css',
          'app/bower_components/makerstrap/makerstrap.complete.min.css',
          'app/collector.compiled.css'
        ],
        dest: 'data/app.css'
      }
    },
    less: {
      dist: {
        options: {
          compress: true
        },
        files: {
          'app/collector.compiled.css': 'app/collector.less'
        }
      }
    },
    copy: {
      dist: {
        src: 'app/partial.html',
        dest: 'data/app.html'
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [{
            match: 'include',
            replacement: '<%= grunt.file.read("app/collector.html") %>'
          }]
        },
        files: [{
          src: ['app/wrapper.html'],
          dest: 'app/index.compiled.html'
        }, {
          src: ['app/wrapper.dist.html'],
          dest: 'app/index.dist.compiled.html'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', ['less', 'concat', 'replace', 'copy']);

};