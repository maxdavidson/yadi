var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

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
