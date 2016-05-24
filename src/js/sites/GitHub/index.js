import {
    addBtnToToolbars,
    onPartialRender,
    addBtnToNewInlineComments,
    onGiphyBtnClick,
    insertTextAtCursor
} from './page';
import widget from '../../widget';
import { startSearch, listenForGiphyResponse } from '../../events';
import { toMarkdownImage } from '../../utils';
import { bypassCSPForImages } from './api';
import debounce from 'lodash.debounce';

// HACK: GitHub removed their jQuery global.
// Short term fix: restore the global
// Better fix (when time permits) just use direct DOM APIs
window.$ = window.require('jquery');

addBtnToToolbars();
onPartialRender(addBtnToToolbars);
addBtnToNewInlineComments();

onGiphyBtnClick(({ form, button, input }) => {
    const onSelection = function onSelection(data) {
        const textarea = $(form).find('textarea').get(0);
        insertTextAtCursor(textarea, toMarkdownImage(data));
    };

    const onImageData = function onImageData({ res: images }) {
        if (!giphyWidget) return;

        if (!images.length) {
            giphyWidget
                .toggleLoading(false)
                .toggleMessage(true, 'No Results Found :(');
            return;
        }

        bypassCSPForImages(images)
            .then(imgList => {
                giphyWidget.toggleLoading(false);
                giphyWidget.updateImageList(imgList);
            }).catch(err => {
                console.error(err);
                giphyWidget.toggleLoading(false);
            });
    };

    const onDispose = function onDispose() {
        giphyWidget = null;
        unbindListener();
    };

    let unbindListener = listenForGiphyResponse(onImageData);

    const { top, left } = $(button).offset();
    let giphyWidget = widget.create({
        onSelection,
        onDispose,
        onTextChange: debounce(startSearch, 1000)
    }).appendToDOM().showAt(top + 28, left - 124);
});
