"use strict";

module.exports = function (Handlebars) {

  let lastId = ``;

  Handlebars.registerHelper('test', function () {
    return 'This is a test helper';
  });
  Handlebars.registerHelper('getJsonContext', function (data, options) {
    // console.debug(data, options)
    return options.fn(JSON.parse(data));
  });
  Handlebars.registerHelper('json', function (context) {
    // console.debug(context)
    return JSON.stringify(context);
  });
  Handlebars.registerHelper('isdefined', function (value) {
    return value !== undefined;
  });
  Handlebars.registerHelper('getId', function (value) {
    this.lastId = `${value}-${Math.floor(Math.random(100) * 100)}`;
    return this.lastId;
  });
  Handlebars.registerHelper('getLastId', function (value) {
    return this.lastId;
  });
  Handlebars.registerHelper('seoTitle', function (value) {

    if (value) {

      let seoJunks = value.split('-');
      let seoTitle = "";

      if (seoJunks.length > 1) {
        
        let firstEntry = seoJunks.shift();
        
        let seoTitle = firstEntry.charAt(0).toUpperCase() + firstEntry.slice(1)+' - ';
        
        seoJunks.forEach(element => {

          seoTitle += ' '+element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();

        });
        
        return seoTitle + " - ";

      }
      // let seoTitle = value.split('-');
      return seoTitle;
    }
  });

  Handlebars.registerHelper('h1Title', function (value) {

    if (value) {

      if(value.indexOf('pages') !== -1){
        return "";
      }

      let seoJunks = value.split('-');
      let seoTitle = "";

      if (seoJunks.length > 1) {
        
        let firstEntry = seoJunks.shift();
        
        let seoTitle = firstEntry.charAt(0).toUpperCase() + firstEntry.slice(1)+' - ';
        
        seoJunks.forEach(element => {

          seoTitle += ' '+element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();

        });
        
        return `<h1>${seoTitle}</h1>`;

      }
      // let seoTitle = value.split('-');
      return seoTitle;
    }
  });

  Handlebars.registerHelper('seoKeyword', function (value) {

    if (value) {

      let seoJunks = value.split('-');
      let seoTitle = "";

      if (seoJunks.length > 1) {
        
        let firstEntry = seoJunks.shift();
        
        let seoTitle = firstEntry.charAt(0).toUpperCase() + firstEntry.slice(1)+', ';
        
        seoJunks.forEach(element => {

          seoTitle += element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();

        });
        
        return seoTitle;

      }
      // let seoTitle = value.split('-');
      return seoTitle;
    }
  });

};