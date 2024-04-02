var gulp = require('gulp'),
    gs = require('glob-stream'),
    chalk = require('chalk'),
    plumber = require('gulp-plumber'),
    path = require('path'),
    handlebars = require('gulp-handlebars'),
    wrap = require('gulp-wrap'),
    declare = require('gulp-declare'),
    concat = require('gulp-concat'),
    merge = require('merge-stream');

module.exports = function (patternConfig) {
    'use strict';

    var callDir = process.cwd();

    var hbOptions = {
        handlebars: require('handlebars')
    };

    var config = require(process.cwd() + '/ssg.core.config');

    // partials stream
    var partials = gulp.src(patternConfig.partials)
        .pipe(plumber())
        // handlebars
        .pipe(handlebars(hbOptions))
        // wrap inline javascript
        .pipe(wrap('Handlebars.registerPartial(<%= imports.processPartialName(file.relative) %>,' +
            'Handlebars.template(<%= contents %>));', {}, {
                imports: {
                    processPartialName: function (fileName) {
                        
                        var patternName = path.basename(fileName, '.hbs');

                        if (patternName.indexOf("_") === 0) {
                            patternName = patternName.substr(1);
                        }

                        if (patternName.endsWith('.js')){
                            patternName = patternName.slice(0, -3);
                        }

                        return JSON.stringify(patternName);
                    }
                }
            }));

    // template stream
    var templates = gulp.src(patternConfig.templates)
        .pipe(plumber())
        // handlebars
        .pipe(handlebars(hbOptions))
        // wrap
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        // namespace
        .pipe(declare({
            namespace: patternConfig.namespace,
            noRedeclare: true
        }));

    // return merge
    return merge(partials, templates)
        // concat
        .pipe(concat(patternConfig.namespace + '.js'))
        // build
        .pipe(gulp.dest('./' + config.ssg.target + 'scripts'));

};