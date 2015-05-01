var fs = require('fs');

var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var bump = require('gulp-bump');
var git = require('gulp-git');


gulp.task('build', function () {
    return gulp.src('src/yadi.js')
        .pipe(babel({
            modules: 'umd',
            loose: 'all',
            sourceMaps: 'inline'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('yadi.min.js'))
        .pipe(gulp.dest('dist'));
});

function inc(type) {
    return function () {
        return gulp.src('./package.json')
            .pipe(bump({ type: type }))
            .pipe(gulp.dest('./'));
    };
}

gulp.task('bump:patch', inc('patch'));
gulp.task('bump:feature', inc('minor'));
gulp.task('bump:release', inc('major'));

gulp.task('tag', ['build'], function () {
    var pkg = JSON.parse(fs.readFileSync('./package.json'));
    var version = 'v' + pkg.version;

    return gulp.src(['./dist/*', './package.json'])
        .pipe(git.add())
        .pipe(git.commit(version))
        .pipe(git.tag(version, version));
});
