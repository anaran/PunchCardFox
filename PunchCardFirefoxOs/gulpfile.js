// Include gulp
var gulp = require('gulp');

var spock = require('spock');

gulp.task('build-html', function () {
  gulp.src('./*.html').pipe(spock({
    verbose: true,
    outputDir: './build'
  })).pipe(gulp.dest('./build'));
});
