const collapseAndExpand = (event) => {

    const parentRow = event.target.closest("tr");
    // console.debug("Parent Row", parentRow);

    const parentTable = event.target.closest("table");
    // console.debug("Current Table", parentTable);

    const section = parentRow.dataset.sectionheader;
    // console.debug("Current Section", section);

    let query = null;

    if (section === "all") {
        query = "tr[data-section]";
    } else {
        query = 'tr[data-section=' + section + ']';
    }

    const sectionRows = parentTable.querySelectorAll(query);

    for (let i = 0; i < sectionRows.length; i++) {

        const currentItem = sectionRows[i];

        if (currentItem.classList.contains('is-hidden')) {

            currentItem.classList.remove('is-hidden');
            currentItem.classList.add('is-visible');
            currentItem.setAttribute('aria-hidden', 'false');
            parentRow.setAttribute('aria-expanded', 'true');

        } else {

            currentItem.classList.add('is-hidden');
            currentItem.classList.remove('is-visible');
            currentItem.setAttribute('aria-hidden', 'true');
            parentRow.setAttribute('aria-expanded', 'false');

        }

    }

    if (section === "all") {

        let subSection = document.querySelectorAll("tbody tr.collapsable");

        if (parentRow.getAttribute('aria-expanded') === "true") {

            for (let i = 0; i < subSection.length; i++) {

                const currentItem = subSection[i];

                currentItem.setAttribute('aria-hidden', 'false');
                currentItem.setAttribute('aria-expanded', 'true');

            }

        } else {

            for (let i = 0; i < subSection.length; i++) {

                const currentItem = subSection[i];

                currentItem.setAttribute('aria-hidden', 'true');
                currentItem.setAttribute('aria-expanded', 'false');

            }

        }

    }

}

const initCollapsability = () => {

    const collapseTable = document.querySelectorAll('.hoo-table.is-collapsable');
    collapseTable.forEach(table => {

        const collapseRow = table.querySelectorAll('.collapsable');

        collapseRow.forEach(tableRow => {
            tableRow.addEventListener('click', collapseAndExpand);
        })

    })

}

const position = {
    "left": "left",
    "right": "right",
    "top": "top",
    "bottom": "bottom"
};

const stickyOffsetFixup = (parent, selector, offset) => {

    const innerDefinition = parent.querySelectorAll(selector);

    for (let j = 0; j < innerDefinition.length; j++) {

        const innerElement = innerDefinition[j];

        if (offset === position.left) {
            innerElement.style[offset] = innerElement.offsetLeft + "px";
        }
        if (offset === position.right) {
            innerElement.style[offset] = innerElement.offsetRight + "px";
        }
        if (offset === position.top) {
            innerElement.style[offset] = innerElement.offsetTop + "px";
        }
        if (offset === position.bottom) {
            innerElement.style[offset] = innerElement.offsetBottom + "px";
        }

    }

}

const initSticky = () => {

    const allStickyTables = document.querySelectorAll("table.sticky");

    for (let i = 0; i < allStickyTables.length; i++) {

        const stickyTable = allStickyTables[i];

        stickyOffsetFixup(stickyTable, "tr td.is-sticky.left", position.left);
        stickyOffsetFixup(stickyTable, "tr th.is-sticky.left", position.left);

    }
}

export const initTables = () => {

    initCollapsability();
    initSticky();

}