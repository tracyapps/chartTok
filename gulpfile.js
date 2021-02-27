var gulp = require('gulp'),
	gutil = require( 'gulp-util' ),
	sass = require( 'gulp-sass' ),
	cssnano = require( 'gulp-cssnano' ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	jshint = require( 'gulp-jshint' ),
	stylish = require( 'jshint-stylish' ),
	uglify = require( 'gulp-uglify' ),
	concat = require( 'gulp-concat' ),
	rename = require( 'gulp-rename' ),
	plumber = require( 'gulp-plumber' ),
	svgSprite = require('gulp-svg-sprite'),
	browserSync = require( 'browser-sync' ).create();
var gls = require('gulp-live-server');

gulp.task('static', function() {
	var server = gls.static('public', 8000);
	server.start();
	gulp.watch(['public/**/*.css', 'public/**/*.html'], function(file) {
		server.notify.apply(server, [file]);
	});
});

// Compile Sass, Autoprefix and minify
gulp.task( 'styles', function () {
	return gulp.src( 'public/scss/**/*.scss' )
		.pipe( plumber( function ( error ) {
			gutil.log( gutil.colors.red( error.message ) );
			this.emit( 'end' );
		} ) )
		.pipe( sourcemaps.init() ) // Start Sourcemaps
		.pipe( sass() )
		.pipe( autoprefixer( {
			browsers: ['last 2 versions'],
			cascade: false
		} ) )
		.pipe( gulp.dest( 'public/css/' ) )
		.pipe( rename( {suffix: '.min'} ) )
		.pipe( cssnano() )
		.pipe( sourcemaps.write( '.' ) ) // Creates sourcemaps for minified styles
		.pipe( gulp.dest( 'public/css/' ) )
} );

// JSHint, concat, and minify JavaScript
gulp.task( 'site-js', function () {
	return gulp.src( [

		// Grab your custom scripts
		'public/js/scripts/*.js'

	] )
		.pipe( plumber() )
		.pipe( sourcemaps.init() )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( concat( 'scripts.js' ) )
		.pipe( gulp.dest( 'public/js' ) )
		.pipe( rename( {suffix: '.min'} ) )
		.pipe( uglify() )
		.pipe( sourcemaps.write( '.' ) ) // Creates sourcemap for minified JS
		.pipe( gulp.dest( 'public/js' ) )
} );

// SVG SPRITEs & compression
gulp.task( 'svgSprite', function() {

	var config = {
		mode: {
			symbol: { // symbol mode to build the SVG
				render: {
					css: false, // CSS output option for icon sizing
					scss: true // SCSS output option for icon sizing
				},
				dest: 'output', // destination folder
				prefix: '.icon-%s', // BEM-style prefix if styles rendered
				sprite: 'icons.svg', //generated sprite name
				example: true, // Build a sample page, please!
				svg:{
					xmlDeclaration: false,
				}
			}
		}
	};

	return gulp.src('public/svg/originals/*.svg')

		.pipe(svgSprite(config))
		.pipe(gulp.dest('public/svg'));

});

// Browser-Sync watch files and inject changes
gulp.task( 'browsersync', function () {
	// Watch files
	var files = [
		'public/css/*.css',
		'public/js/*.js',
		'public/*.html',
		'public/images/**/*.{png,jpg,gif,svg,webp}'
	];

	browserSync.init( files, {
		// Replace with URL of your local site
		proxy: "http://localhost:8000",
	} );

	gulp.watch( 'public/scss/**/*.scss', ['styles'] );
	gulp.watch( 'public/js/scripts/*.js', ['site-js'] ).on( 'change', browserSync.reload );

} );

gulp.task( 'watch', function () {
	var server = gls.static('public', 8000);
	server.start();
	// Watch .scss files
	gulp.watch( 'public/scss/**/*.scss', ['styles'] );

	// Watch css variable import files
//	gulp.watch( 'public/css/css-theme-var-imports/*.php' );

	// Watch svg files
	gulp.watch( '.public/svg/originals/*.svg', ['svgSprite'] );

	// Watch site-js files
	gulp.watch( 'public/js/scripts/*.js', ['site-js'] );

	gulp.watch(['public/**/*.css', 'public/**/*.html'], function(file) {
		server.notify.apply(server, [file]);
	});

	gulp.start( ['browsersync'] );
} );

gulp.task('custom', function() {
	var server = gls('server.js');
	server.start().then(function(result) {
		console.log('Server exited with result:', result);
		process.exit(result.code);
	});
	gulp.watch(['public/**/*.css', 'public/**/*.html'], function(file) {
		server.notify.apply(server, [file]);
	});
	gulp.watch('server.js', server.start);
});