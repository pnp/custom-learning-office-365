class pnpSelect extends HTMLUListElement{
    constructor(){
        super();
    }
};

let customElement = window.customElements.define("pnp-select", pnpSelect, {extends: "li"});