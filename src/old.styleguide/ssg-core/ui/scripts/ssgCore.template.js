/// <reference path="../../typings/globals/handlebars/index.d.ts" />
Handlebars.registerPartial("buttons",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<button id=\"ssg-btn"
    + alias4(((helper = (helper = helpers.action || (depth0 != null ? depth0.action : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"action","hash":{},"data":data}) : helper)))
    + "\" class=\"ssg-btn "
    + alias4(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"class","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</button>";
},"useData":true}));
this["ssgCore"] = this["ssgCore"] || {};
this["ssgCore"]["templates"] = this["ssgCore"]["templates"] || {};
this["ssgCore"]["templates"]["addTools"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"ssg-add-tools\">\n</div>";
},"useData":true});
this["ssgCore"]["templates"]["itemselector"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\"ssg-items\" data-item-index=\""
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n	<button class=\"ssg-btn prev\" "
    + alias4(((helper = (helper = helpers.prevEnabled || (depth0 != null ? depth0.prevEnabled : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prevEnabled","hash":{},"data":data}) : helper)))
    + " >&lt;</button>\n	<span class=\"item-title\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\n	<button class=\"ssg-btn next\" "
    + alias4(((helper = (helper = helpers.nextEnabled || (depth0 != null ? depth0.nextEnabled : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nextEnabled","hash":{},"data":data}) : helper)))
    + " >&gt;</button>\n</div>";
},"useData":true});
this["ssgCore"]["templates"]["patternItem"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ssg-item\" data-cat=\""
    + alias4(((helper = (helper = helpers.baseFilter || (depth0 != null ? depth0.baseFilter : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"baseFilter","hash":{},"data":data}) : helper)))
    + "\" title=\""
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\" data-file=\""
    + alias4(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data}) : helper)))
    + "\">\n	<div class=\"ssg-item-header\">\n		<div class=\"ssg-item-title\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</div>\n		<div class=\"ssg-item-description\">"
    + alias4(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "&nbsp;<br><b class=\"ssg-pattern-label\">Pattern name:</b><span class=\"ssg-pattern-name\">"
    + alias4(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data}) : helper)))
    + "</span></div>\n	</div>\n	<div class=\"sample\">"
    + ((stack1 = ((helper = (helper = helpers.sample || (depth0 != null ? depth0.sample : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sample","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n	<pre class=\"ssg-item-code\"><code class='language-markup'>"
    + alias4(((helper = (helper = helpers.sample || (depth0 != null ? depth0.sample : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sample","hash":{},"data":data}) : helper)))
    + "</code></pre>\n</div>";
},"useData":true});
this["ssgCore"]["templates"]["test"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"ello\"></div>";
},"useData":true});
this["ssgCore"]["templates"]["vpresizer"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "\n	<input type=\"numeric\" id=\"ssg-vp-w\" class=\"ssg-input-s\" value=\""
    + alias4(((helper = (helper = helpers.width || (depth0 != null ? depth0.width : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"width","hash":{},"data":data}) : helper)))
    + "\">\n	<span id=\"ssg-vp-by\">x</span>\n	<input type=\"numeric\" id=\"ssg-vp-h\" class=\"ssg-input-s\" value=\""
    + alias4(((helper = (helper = helpers.height || (depth0 != null ? depth0.height : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"height","hash":{},"data":data}) : helper)))
    + "\">\n	<button id=\"ssg-btn-disco\" class=\"ssg-btn\">Disco</button>\n";
},"useData":true});