// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39
const fs = require('fs');
const widgetTemplate = fs.readFileSync('src/giphy-widget.html', 'utf8');
const hiddenClass = 'giphy-hidden';
const noResultsMsg = 'No GIFs Found :(';

export default {
    create(...args) {
        return Object.create(this).init(...args);
    },

    init({ onSelection, onDispose, onTextChange }) {
        const $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
        this.$message = $widget.find('.js-giphy-message');
        this.onSelection = onSelection;
        this.onTextChange = onTextChange;
        this.onDispose = onDispose;
        return this.setupListeners();
    },

    appendToDOM(selector = 'body') {
        $(selector).append(this.$widget);
        return this;
    },

    setupListeners() {
        this.$input.on('keyup', e => {
            this.onSearchStart();
            this.onTextChange(e.currentTarget.value);
        });

        this.$widget.on('click', 'img', e => this.imageSelected(e.currentTarget));

        $(document).on('click.giphy', e => {
            if (this.$widget.get(0).contains(e.target)) return;
            this.dispose();
        });

        $(document).on('keyup.giphy', ({ keyCode }) => {
            if (keyCode === 27) this.dispose();
        });

        return this;
    },

    onSearchStart() {
        this.$imgList.empty();
        this.toggleLoading(true);
        this.toggleMessage(false);
    },

    imageSelected(img) {
        this.onSelection({
            uri: img.getAttribute('data-full-uri'),
            name: img.title
        });
        this.dispose();
    },

    showAt(top = 0, left = 0) {
        this.$widget.removeClass(hiddenClass).css({ top, left });
        this.$input.focus();
        return this;
    },

    dispose() {
        $(document).off('click.giphy');
        $(document).off('keyup.giphy');
        this.$widget.remove();
        this.disposed = true;
        this.onDispose && this.onDispose();
    },

    toggleLoading(show) {
        const action = show ? 'removeClass' : 'addClass';
        this.$widget.find('.js-giphy-loading')[action](hiddenClass);
        return this;
    },

    toggleMessage(show, message) {
        this.$message.text(message)[show ? 'removeClass' : 'addClass'](hiddenClass);
        return this;
    },

    updateImageList(images = []) {
        const imageDOM = images.map(image => {
            return `<li>
                <img src="${image.downsizedUri}" title="${image.name}" data-full-uri="${image.uri}>"
            </li>`;
        }).join('');

        this.$imgList.html(imageDOM);
        return this;
    }
};
