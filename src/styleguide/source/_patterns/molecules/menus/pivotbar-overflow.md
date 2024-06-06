---
title: Pivot Bar with Overflow
---

To make this overflow work. Add the class `.has-overflow` on the pivot container. Also make sure you wrap all buttons in a `.hoo-overflow` container and add an overflow button.

The overflow handling happen in the file [overflow.js](../../js/js/overflow.js).
The menu of that contains all overflow items will be cloned when the right CSS classing in place directly in the [pivot.js](../../js/pivot.js)

### Links:

* [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) on MDN

### Accessibility:

* ```role="menubar"``` .... gives the user a clear indication on how many buttons are in the current menu
* ```aria-hidden``` ....... items that are hidden also have beside the CSS class `.is-overflow-item` the aria-hidden attribute set


 