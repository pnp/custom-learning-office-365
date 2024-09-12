export class HOODialog {

    #launcher;
    #dialog;
    #dialogType;
    #closer;
    #options = {
        closer: null,
        backdropCloser: true,
        escCloser: true
    };

    /** Options for modal dialog */
    static options = {
        closer: null,
        backdropCloser: true,
        escCloser: true
    }

    /**
     * Enum of available dialog types
     */
    static dialogType = {
        DIALOG: 'dialog',
        MODAL: 'modal'
    }

    /**
     * Open the dialog
     */
    #showDialog = () => {

        console.debug('-> Fired showDialog -- ', this.#dialog);

        if (this.#dialogType === HOODialog.dialogType.DIALOG) {

            this.#dialog.show();

        } else if (this.#dialogType === HOODialog.dialogType.MODAL) {

            this.#dialog.showModal();
            // FIX: Make backdrop click optional
            // Capture click on backdrop
            this.#dialog.addEventListener('click', this.#backdropClick);
        } else {
            throw new Error(`Invalid dialog type specified for ${this.#dialog}`);
        }

        if (this.#closer) {
            this.#closer.addEventListener('click', this.#closeDialog);
        }

        const autofocus = this.#dialog.querySelector('[autofocus]');

        if (autofocus) {
            console.debug('No Autofocus');
            dialogElement.focus();
        }

        // Capture close on ESC click
        this.#dialog.addEventListener('keydown', this.#keyboardClose);

    }

    #backdropClick = (event) => {

        var rect = this.#dialog.getBoundingClientRect();

        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);

        // console.debug('Event Target', event.target);
        // console.debug(
        //     'Rect Top', rect.top,'\n',
        //     'Rect Height', rect.height,'\n',
        //     'Client Top', event.clientY,'\n',
        //     'Rect Left', rect.left,'\n',
        //     'Rect Width', rect.width,'\n',
        //     'Client Left', event.clientX,'\n',
        // )
        // 
        // console.debug(
        //     'Rect Top', rect.top, event.clientY, rect.top+rect.height,'\n',
        //     'Rect left', rect.left, event.clientX, rect.left+rect.width,'\n',
        // )
        

        if (!isInDialog && event.target === this.#dialog) {

            this.#dialog.close();

        }

    }

    /**
     * Close the dialog on keyCode ESC
     */
    #keyboardClose = (event) => {

        if (event.keyCode === 27) {
            this.#dialog.close();
        }

    }

    /**
     * Close the dialog used for custom event or close button
     */
    #closeDialog = (event) => {
        console.debug('closing dialog');
        this.#dialog.close();
    }

    constructor(launcher, dialog, dialogType = HOODialog.dialogType.DIALOG,
        options = HOODialog.options) {

        console.debug("Register dialog", dialogType);

        // query DOM elements
        const launchElement = document.querySelector(launcher),
            dialogElement = document.querySelector(dialog);


        if (!launchElement) {
            throw new Error(`Launcher '${launcher}' Element cannot be found`);
        }

        this.#launcher = launchElement;

        if (!dialogElement) {
            throw new Error(`Dialog '${dialog}' Element not found`);
        }

        this.#dialog = dialogElement;

        this.#launcher.addEventListener('click', this.#showDialog);

        this.#dialogType = dialogType;

        options.closer === undefined? this.#options.closer = null : options.closer;
        options.backdropCloser === undefined? this.#options.backdropCloser = true : options.backdropCloser;
        options.escCloser === undefined? this.#options.escCloser = true : options.escCloser;

        this.#options = options;

        // in case a close button is defined fo the dialog
        if (options.closer !== null) {

            const closerElement = dialogElement.querySelector(options.closer);
            
            this.#options.closer = options.closer;

            if (closerElement) {
                this.#closer = closerElement;
            }
        }

        console.debug('AFTER LAUNCH ::: ', this.#dialogType, this.#launcher, this.#dialog, this.#closer);

    }

}