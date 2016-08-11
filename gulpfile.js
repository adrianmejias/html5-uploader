var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build', function() {
	gulp.src('src/html5-uploader.js')
		.pipe(uglify())
		.pipe(rename('html5-uploader.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);