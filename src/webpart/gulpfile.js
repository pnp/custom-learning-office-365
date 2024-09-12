'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(/Warning - \[sass\] The local CSS class/gi);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));