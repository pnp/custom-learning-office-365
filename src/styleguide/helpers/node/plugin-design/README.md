![license](https://img.shields.io/github/license/bmuenzenmeyer/plugin-node-uiextension.svg)
[![npm](https://img.shields.io/npm/v/plugin-node-uiextension.svg)](https://www.npmjs.com/package/plugin-node-uiextension)
[![Gitter](https://img.shields.io/gitter/room/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# UI Extension Plugin for Pattern Lab Node

The UI Extension plugin allows users to customize the Pattern Lab frontend style guide without having to fork [styleguide-assets-default](https://github.com/pattern-lab/styleguidekit-assets-default). It is intended for styling overrides and navigation additions. If you need anything further, it's suggested that you fork the `styleguide-assets-default` repo and consume your own custom frontend.

![](https://cloud.githubusercontent.com/assets/298435/23539989/2fa47a5c-ffa4-11e6-9eee-ffb43d24dede.png)

## Installation

To add the UI Extension Plugin to your project using [npm](http://npmjs.com/) type:

    npm install plugin-node-uiextension --save

Or add it directly to your project's `package.json` file and run `npm install`

During installation, the plugin is added as a key to the `plugins` object in your main Pattern Lab project's `patternlab-config.json` file

> If you don't see this object, try running `npm run postinstall` within the root of your project.

## Configuration

Post-installation, you will see the following in your `patternlab-config.json`:

Example:

```
"plugins": {
  "plugin-node-uiextension": {
    "enabled": true,
    "initialized": false,
    "options": {
      "stylesheets": [
        "../../../css/pattern-scaffolding.css"
      ],
      "navLinks": {
        "before": [],
        "after": []
      },
      "gearLinks": {
        "before": [],
        "beforeSearch": []
      }
    }
  }
}
```

### CSS

Note the defaulted `pattern-scaffolding.css` file, which is relative to the installation location within the `/public/` output.

> At this time, loading external CSS is not supported.

This file is already responsible for meta-styling of your patterns, and is usually only scoped to the viewer `<iframe/>`. With this default, you now have a useful CSS file for altering both the Pattern Lab UI inside the ish `<iframe/>` as well as the main frontend.  You can use a [mockup of Pattern Lab on Codepen](http://codepen.io/bmuenzenmeyer/pen/791da488b2a73909a58eacf801af83d4) to alter the look and feel, and then export or append the **compiled css** back into `pattern-scaffolding.css`.

Here's a [Pattern Lab light theme](http://codepen.io/bmuenzenmeyer/pen/813a628ae7185fed6137cc2498e74df5) quickly created using the CodePen above.

This is also a good way to build [custom pattern states](http://patternlab.io/docs/pattern-states.html#node) and have their colors represented on the UI.

#### Adding Links

A `navLinks` and `gearLinks` object are also initialized post-installation, and allow you to add arbitrary anchor tags to the front end in various locations.

For example, adding the following snippet:

```
...
"navLinks": {
  "before": [
    { "text": "Voice and Tone", "url": "http://example.com/writing-guide", "class": ""}
  ],
  "after": [
    { "text": "Contribute", "url": "http://example.com/contribute", "class": ""},
    { "text": "Downloads", "url": "http://example.com/resources", "class": ""}
  ]
},
...
```

would add a link to the `Voice and Tone` before the main navigation, with a `Contribute` and `Downloads` link to follow.

## Enabling / Disabling the Plugin

After install, you may manually enable or disable the plugin by finding the `plugin-node-uiextension` key within your main Pattern Lab project's `patternlab-config.json` file and setting the `enabled` flag. In the future this will be possible via CLI.
