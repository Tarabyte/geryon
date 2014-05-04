/*global require*/
var gulp = require('gulp');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var qunit = require('gulp-qunit');
var size = require('gulp-size');

//Linting this beatch!
gulp.task('lint', function() {
    return gulp.src('geryon.js')
                .pipe(jshint())
                .pipe(jshint.reporter('default'));
});

gulp.task('script', function() {
    return gulp.src('geryon.js')
                .pipe(rename('geryon.min.js'))
                .pipe(size({title: 'development'}))
                .pipe(uglify())
                .pipe(gulp.dest(''))
                .pipe(size({title: 'minified'}))
                .pipe(size({title: 'gzip', gzip: true}));   
});

gulp.task('watch', function() {
    gulp.watch('geryon.js', ['lint', 'script', 'test']);
    
    gulp.watch('test/geryon_test.js', ['test']);
});


gulp.task('test', function() {
    return gulp.src('./test/runner.html').pipe(qunit());
});

gulp.task('default', ['lint', 'test', 'script', 'watch']);