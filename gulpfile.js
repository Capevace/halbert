const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('scss', function () {
  return gulp.src('./system/server/resources/scss/framework.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./system/server/public/css'));
});

gulp.task('scss:watch', ['scss'], function () {
  gulp.watch('./system/server/resources/scss/**/*.scss', ['scss']);
});
