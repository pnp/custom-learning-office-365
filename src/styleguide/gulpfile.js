const {
    src,
    dest,
    watch,
    series,
    parallel
} = require('gulp');
const dartSass = require('sass');
const gulpSass = require('gulp-sass');
const sass = gulpSass(dartSass);

const sassDefInclude = [...require.main.paths, '.'];

var isProd = false;

const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();
const autoprefixer = require('autoprefixer');

console.log('SASS IMPORTER:::', sass.NodePackageImporter);

// const sass = require('gulp-sass')(require('sass'));


const baseWatch = async (cb) => {

    watch(['./source/scss/**/*.scss'], styles);
    watch(['./source/_plugins/**/*.scss'], pluginCSSOverride);
    watch(['./source/_plugins/**/*.js'], pluginJSOverride);

    cb();

}

const docs = (cb) => {

    isProd = true;
    styles();
    cb()

}

const styles = () => {

    return src('./source/scss/*.scss')
        .pipe($.plumber())
        .pipe($.if(!isProd, $.sourcemaps.init()))
        // .pipe($.sourcemaps.init())
        .pipe(
            $.if(!isProd, sass({
                outputStyle: 'expanded',
                precision: 6,
                includePaths: sassDefInclude,
                loadPaths: sassDefInclude
            }))
                .on('error', sass.logError))
        .pipe(
            $.if(isProd, sass({
                outputStyle: 'compressed',
                precision: 6,
                includePaths: sassDefInclude,
                loadPaths: sassDefInclude
            }))
                .on('error', sass.logError))
        .pipe($.postcss([
            autoprefixer()
        ]))
        .pipe($.if(!isProd, $.sourcemaps.write()))
        // .pipe($.sourcemaps.write())
        .pipe(dest('source/css'));

};

const pluginJSOverride = () => {

    return src('./source/plugins/**/*.js')
        .pipe(dest('public/plugins'));

}

const pluginCSSOverride = () => {

    return src('./source/plugins/*.scss')
        .pipe($.plumber())
        .pipe($.if(!isProd, $.sourcemaps.init()))
        // .pipe($.sourcemaps.init())
        .pipe(sass.sync({
            outputStyle: 'expanded',
            precision: 6,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe($.postcss([
            autoprefixer()
        ]))
        .pipe($.if(!isProd, $.sourcemaps.write()))
        // .pipe($.sourcemaps.write())
        .pipe(dest('public/_plugins'));

};

const serve = parallel(styles, pluginCSSOverride, baseWatch);

exports.default = serve;
exports.styles = styles;
exports.docs = docs;
exports.pluginCSSOverride = pluginCSSOverride;