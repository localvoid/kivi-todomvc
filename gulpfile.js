const gulp = require('gulp');

const CLOSURE_OPTS = {
  compilation_level: 'ADVANCED',
  entry_point: 'goog:main',
  language_in: 'ECMASCRIPT6_STRICT',
  language_out: 'ECMASCRIPT5_STRICT',
  use_types_for_optimization: true,
  assume_function_wrapper: true,
  output_wrapper: '(function(){%output%}).call();',
  summary_detail_level: 3,
  warning_level: 'QUIET',
};

function clean() {
  const del = require('del');

  return del(['dist', 'build']);
}

function compileTS() {
  const ts = require('gulp-typescript');

  return gulp.src('web/**/*.ts')
    .pipe(ts(Object.assign(require('./tsconfig.json').compilerOptions, {
      typescript: require('typescript'),
    })))
    .pipe(gulp.dest('build/es6'));
}

function bundleJS() {
  const rollup = require('rollup');

  return rollup.rollup({
    format: 'es6',
    entry: 'build/es6/main.js',
    plugins: [
      require('rollup-plugin-replace')({
        delimiters: ['<@', '@>'],
        values: {
          KIVI_DEBUG: 'DEBUG_DISABLED'
        }
      }),
      require('rollup-plugin-node-resolve')()
    ]
  }).then(function(bundle) {
    return bundle.write({
      format: 'es',
      dest: 'build/main.es6.js',
      intro: 'goog.module("main");',
      sourceMap: 'inline',
    });
  });
}

function compileJS() {
  const closureCompiler = require('google-closure-compiler').gulp();

  return gulp.src(['build/main.es6.js'])
      .pipe(closureCompiler(Object.assign({}, CLOSURE_OPTS, {
        js_output_file: 'main.js',
      })))
      .pipe(gulp.dest('dist'));
}

function statics() {
  return gulp.src(['./web/*.html', './web/*.css'])
    .pipe(gulp.dest('dist'));
}

function deploy() {
  const ghPages = require('gulp-gh-pages');

  return gulp.src('dist/**/*')
    .pipe(ghPages());
}

exports.default = gulp.series(clean, compileTS, bundleJS, compileJS, statics);
exports.deploy = deploy;
