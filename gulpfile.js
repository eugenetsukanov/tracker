'use strict';

var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var rev = require('gulp-rev-append');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var jscs = require('gulp-jscs');
var gzip = require('gulp-gzip');
var minimist = require('minimist');

var opts = {
    minify: true
};

opts = minimist(process.argv.slice(2), {default: opts, boolean: ['minify']});

gulp.task('icons', function() {

    if(!opts.minify) return gulp.src([]);

    return gulp.src('./public/lib/components-font-awesome/fonts/**.*')
        .pipe(gulp.dest('./public/dist/fonts'));
});

gulp.task('useref', ['icons'], function () {
    var assets = useref.assets({searchPath: './public'});
    var pipe = gulp
        .src('./public/index.tml.html');

    if (opts.minify) {
        pipe = pipe
            .pipe(assets)
            .pipe(assets.restore())
            .pipe(useref())
            .pipe(gulpif('**/*.js?rev*', rename(function (path) {
                path.extname = '.js';
            })))
            .pipe(gulpif('**/*.css?rev*', rename(function (path) {
                path.extname = '.css';
            })))
            .pipe(gulpif('*.js', sourcemaps.init()))
            .pipe(gulpif('*.js', uglify({mangle: false})))
            .pipe(gulpif('*.js', sourcemaps.write('./')))
            .pipe(gulpif('*.css', minifyCss({
                relativeTo: 'dist/dist'
            })))
        ;
    }

    pipe = pipe.pipe(gulpif('**/index.tml.html', rename('index.html')))
        .pipe(size({showFiles: true}))
        .pipe(gulp.dest('./public/'))
        .on('end', function () {
            var pipe = gulp.src('./public/index.html');
            pipe
                .pipe(rev())
                .pipe(gulp.dest('./public/'));
        });

    return pipe;
});

gulp.task('gzip', function () {
    return gulp.src([
        './public/dist/**/*.js',
        './public/dist/**/*.css',
        './public/dist/**/*.map'
    ])
        .pipe(gzip())
        .pipe(size({showFiles: true}))
        .pipe(gulp.dest('./public/dist'));
});

gulp.task('doNotMinify', function () {
    opts.minify = false;
});

gulp.task('minify', ['useref', 'gzip']);
gulp.task('postinstall', ['minify'], function () {
});

gulp.task('default', ['minify'], function () {
});
gulp.task('dev', ['doNotMinify', 'useref']);