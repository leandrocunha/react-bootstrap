var babelify    = require('babelify'),
    browserify  = require('browserify'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util');
    jeet        = require('jeet'),
    livereload  = require('gulp-livereload'),
    nib         = require('nib'),
    notify      = require('gulp-notify'),
    plumber     = require('plumber'),
    rupture     = require('rupture'),
    source      = require('vinyl-source-stream'),
    sourcemaps  = require('gulp-sourcemaps'),
    stylus      = require('gulp-stylus'),
    uglify      = require('gulp-uglify'),
    watchify    = require('watchify');

var vendors = [
    'react',
    'react-dom',
    'react-page',
    'react-tap-event-plugin',
    'jquery'
  ];

var paths = {
  css: 'assets/css/',
  js: {
    dest: 'assets/js/',
    src: 'src/js/*.js'
  },
  stylus: {
    files: 'src/stylus/**/*.styl',
    src: 'src/stylus/app.styl'
  }
};

var sourceMapper = function (sourceMapPath) {
  return function (err, src, map) {
    var fs = require('fs');
    fs.open(sourceMapPath, 'w', function (err, fd) {
      if (err) {
        return;
      }
      fs.write(fd, map, function (err) {
        if (err) {
          return;
        }
      });
    });
  }
};

// Functions
function buildVendors(options) {
  var b = browserify({ fullPaths: false, debug: true });  
  var sourceFName = 'vendors.js.map';

  options.uglify &&
    b.plugin('minifyify', {
      map: sourceFName,
      output: paths.js.dest + sourceFName,
      uglify: {
          keep_fnames: true,
          mangle: false
        }
      });

  return b.require(vendors)
    .bundle(options.uglify && sourceMapper(paths.js.dest + sourceFName))
    .on('error', gutil.log)
    .pipe(source('vendors.js'))
    .pipe(gulp.dest('assets/js'));
}

function buildApp(options) {
  var b = browserify({
    transform: [babelify],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: false
  })
    .require(require.resolve('./src/js/app.js'), {entry: true})
    .external(vendors);

  var sourceFName = 'app.js.map';

  options.uglify &&
    b.plugin('minifyify', {
      map: sourceFName,
      output: paths.js.dest + sourceFName,
      uglify: {
          keep_fnames: true,
          mangle: false
        }
      });

  var rebundle = function () {
    var start = Date.now();
    b.bundle(options.uglify && sourceMapper(paths.js.dest + sourceFName))
      .on('error', gutil.log)
      .pipe(source('app.js'))
      .pipe(gulp.dest('assets/js'))
      .pipe(notify(function () {
        console.log('Built in ' + (Date.now() - start) + 'ms');
      }));
  };

  if (options.watch) {
    b = watchify(b);
    b.on('update', rebundle);
  }

  return rebundle();
}

function buildStylus(options) {
  var build = function() {
    gulp
     .src(options.src)
     .pipe(sourcemaps.init())
     .pipe(stylus({
        compress: options.uglify,
        use: [nib(), jeet(), rupture()],
        "include css": options.includeCss
      }))
     .pipe(sourcemaps.write('.'))
     .pipe(gulp.dest(options.dest))
     .pipe(livereload());
  }

  return build();
}

// Setup Tasks
gulp.task('vendors-dev', function () {
  return buildVendors({uglify: false});
});

gulp.task('vendors', function () {
  process.env.NODE_ENV = 'production';
  return buildVendors({uglify: true});
});

gulp.task('app-dev', function () {
  return buildApp({
    watch: true,
    dest: './assets/js',
    uglify: false
  });
});

gulp.task('app', function () {
  return buildApp({
    watch: false,
    dest: './assets/js',
    uglify: true
  });
});

gulp.task('stylus-dev', function() {
  return buildStylus({
    includeCss: true,
    dest: paths.css,
    src: paths.stylus.src,
    uglify: false,
    watch: true
  });
});

gulp.task('stylus', function() {
  return buildStylus({
    includeCss: true,
    dest: paths.css,
    src: paths.stylus.src,
    uglify: true,
    watch: false
  });
});

gulp.task( 'watch', function() {
  livereload.listen();
  gulp.watch('src/stylus/**/*.styl', ['stylus-dev']);
})

gulp.task('default', ['vendors-dev', 'app-dev', 'stylus-dev', 'watch']);
gulp.task('build', ['vendors', 'app', 'stylus']);
