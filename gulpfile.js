var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', () => {
    gulp.src('./src/css/index.scss')
        .pipe(sass())
        .pipe(gulp.dest('./src/renderer/'))
});

gulp.task('default', () => {
    gulp.watch('./src/renderer/*.scss', ['sass']);
})