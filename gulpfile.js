var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

var BUILD = 'src/main/webapp/';
var SRC = 'src/main/frontend/';

var sources = {
	assets: SRC + 'assets/**',
	html: SRC + '*.html',
	libs: SRC + '/libs/**',
	scripts: SRC + 'scripts/**/*.js',
	styles: SRC + 'styles/**/*.css',
	views: [SRC + '**/*.html', '!' + SRC + '*.html']
};

gulp.task('assets', function() {
	return gulp.src(sources.assets, { base: SRC })
		.pipe(gulp.dest(BUILD));
});

gulp.task('html', function() {
	return gulp.src(sources.html)
		.pipe(gulp.dest(BUILD));
});

gulp.task('libs', function() {
	return gulp.src(sources.libs, { base: SRC })
		.pipe(gulp.dest(BUILD));
});

gulp.task('scripts', function() {
	return gulp.src(sources.scripts)
		.pipe($.concat('app.min.js'))
		.pipe($.ngAnnotate())
		.pipe($.uglify())
		.pipe(gulp.dest(BUILD));
});

gulp.task('styles', function() {
	return gulp.src(sources.styles)
		.pipe($.concat('app.min.css'))
		.pipe($.autoprefixer())
		.pipe($.minifyCss())
		.pipe(gulp.dest(BUILD));
});

gulp.task('templates', function() {
	return gulp.src(sources.views)
		.pipe($.angularTemplatecache('templates.min.js', {
			standalone: true
		}))
		.pipe(gulp.dest(BUILD));
});

gulp.task('build', ['assets', 'html', 'scripts', 'styles', 'templates']);

gulp.task('default', ['build']);