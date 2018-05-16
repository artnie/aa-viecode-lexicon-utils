// ==UserScript==
// @name         AA Lexicon Utils
// @namespace    https://bibliothek.aventurische-allianz.de/entry/*
// @version      0.1
// @description  Some utils functions when traversing the VieCode lexicon
// @author       Arthur Niedzwiecki
// @match        https://bibliothek.aventurische-allianz.de/entry/*
// @grant        none
// ==/UserScript==

/*
  Add listener on left/right key, to get previous/next page.
*/
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            var prev = $('.lexiconPreviousEntryButton a')[0];
            if (prev) prev.click();
            break;
        case 39:
            var next = $('.lexiconNextEntryButton a')[0];
            if (next) next.click();
            break;
    }
};
