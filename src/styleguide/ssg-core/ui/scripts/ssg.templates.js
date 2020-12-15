this["ssg"] = this["ssg"] || {};
this["ssg"]["templates"] = this["ssg"]["templates"] || {};
this["ssg"]["templates"]["asdasdasd"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\""
    + alias4(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"href","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "This is just a simple and stupid test pattern\n";
  stack1 = ((helper = (helper = helpers.navigation || (depth0 != null ? depth0.navigation : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"navigation","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.navigation) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "Hello World\n\n";
},"useData":true});
Handlebars.registerPartial("asdasdasd",Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\""
    + alias4(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"href","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "This is just a simple and stupid test pattern\n";
  stack1 = ((helper = (helper = helpers.navigation || (depth0 != null ? depth0.navigation : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"navigation","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.navigation) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "Hello World\n\n";
},"useData":true}));
Handlebars.registerPartial("color",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "asdj adjklasd\n\n<a href=\"d\nasd\n\"></a>";
},"useData":true}));
this["ssg"]["templates"]["color"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "asdj adjklasd\n\n<a href=\"d\nasd\n\"></a>";
},"useData":true});
this["ssg"]["templates"]["moses"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World\n\n\nsd";
},"useData":true});
Handlebars.registerPartial("moses",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World\n\n\nsd";
},"useData":true}));
Handlebars.registerPartial("molecule",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World\n\n\n\nsad";
},"useData":true}));
this["ssg"]["templates"]["molecule"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World\n\n\n\nsad";
},"useData":true});
Handlebars.registerPartial("organism-02",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "This is just another organism\n"
    + ((stack1 = container.invokePartial(partials.organism,depth0,{"name":"organism","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true}));
this["ssg"]["templates"]["organism-02"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "This is just another organism\n"
    + ((stack1 = container.invokePartial(partials.organism,depth0,{"name":"organism","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true});
Handlebars.registerPartial("organism",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "asdasdasd\n\nasd\nasd\n\n\nasd\n\n\nasdkalösdk öasdk\n\n\n\nWOW this really works great";
},"useData":true}));
this["ssg"]["templates"]["organism"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "asdasdasd\n\nasd\nasd\n\n\nasd\n\n\nasdkalösdk öasdk\n\n\n\nWOW this really works great";
},"useData":true});
Handlebars.registerPartial("first-template",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World....\n\nmammamam\n\nasdasdasd\n\nasd";
},"useData":true}));
this["ssg"]["templates"]["first-template"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World....\n\nmammamam\n\nasdasdasd\n\nasd";
},"useData":true});
Handlebars.registerPartial("second-template",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World";
},"useData":true}));
this["ssg"]["templates"]["second-template"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Hello World";
},"useData":true});
Handlebars.registerPartial("third-template",Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "hello World";
},"useData":true}));
this["ssg"]["templates"]["third-template"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "hello World";
},"useData":true});