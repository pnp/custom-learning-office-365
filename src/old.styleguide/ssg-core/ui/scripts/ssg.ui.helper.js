"use strict";
Handlebars.registerHelper('description', function (block) {
    var description = '', markdownKey = block.data.root.baseFilter + '_' + block.data.root.filename;
    if (ssgDoc[markdownKey] !== undefined) {
        description = ssgDoc[markdownKey].body;
        return new Handlebars.SafeString(description);
    }
    else {
        // description = block.data.root.description;
        return block.data.root.description;
    }
});
