// ==UserScript==
// @name         Export library
// @namespace    https://bibliothek.aventurische-allianz.de/*
// @version      0.1
// @description  Export the library into tex format
// @author       Arthur Niedzwiecki
// @match        https://bibliothek.aventurische-allianz.de/*
// @grant        none
// @require      file://C:\Users\arthu\Downloads\Stuk-jszip-v3.1.5-1-g9fb481a\Stuk-jszip-9fb481a\dist\jszip.js
// @require      file://C:\Users\arthu\Downloads\Stuk-jszip-v3.1.5-1-g9fb481a\Stuk-jszip-9fb481a\vendor\FileSaver.js
// ==/UserScript==

/*
    Adjust the @require paths to match your machine's path to the respective files.
    
    Usage:
    - Download JZip. 
    - Register the functions with TamperMonkey and change the @require path, as well as the @match URL to your lexicon.
    - Go to a VieCode Lexicon page, listing all (or a subset) of the lexicon entries.
    - In your browser dev-console run 'downloadAsZip()' to download all enries compressed in a .zip.
    - Or run 'getEntriesFromOverview()' if you only want to see what entries are extracted, and how they're structured.
    
    Tested with VieCode Lexicon 5.1 on Woltlab Forum 3
*/

getEntriesFromOverview = function () {
    var entriesList = $(".lexiconIndexEntryList .lexiconEntryLink").toArray().map(function(link){return link.href;});
    var articles = entriesList.map(getArticleData);
    return articles;
};

getArticleData = function (url){
    var title = "";
    var short = "";
    var text = "";
    $.ajax({
        async: false,
        type: 'GET',
        url: url,
        success: function ( data ) {
            title = $(data).find("h1 span:last")[0].innerText.trim();
            short = $(data).find(".lexiconTeaser")[0].innerText.trim();
            // Extract and format long text
            var newlineCounter = 0;
            var itemizeSequence = false;
            forEach($(data).find(".messageText p, .messageText ul li"), function (paragraph) {
                // Encapsulate bullet points in TeX itemize.
                if($(paragraph).is("li")) {
                    if(!itemizeSequence) {
                        text = text.substr(0,text.length-3) + "\n"; // no newline before itemize
                        text += "\\begin{itemize}\n\\end{itemize}\n";
                        itemizeSequence = true;
                    }
                    text = text.splice(text.lastIndexOf("\\end{itemize}"), 0, "\\item " + paragraph.innerText.trim() + "\n");
                    newlineCounter = 1; // prevent newline after itemize
                } else {
                    itemizeSequence = false;
                    // allow only one newline between text
                    if (paragraph.innerText.trim().length > 0) {
                        newlineCounter = 0;
                        text += paragraph.innerText.trim() + "\\\\\n";
                    } else {
                        if(newlineCounter++ < 1){
                            text += "\\\\\n";
                        }
                    }
                }
            });
        }
    });
    forEach([[/&/g,"\\&"], [/„/g, "\""], [/“/g, "\""], [/´/g, "\'"]], function (replacement) {
            title = title.replace(replacement[0], replacement[1]);
            short = short.replace(replacement[0], replacement[1]);
            text = text.replace(replacement[0], replacement[1]);
        });
    return [title, short, text];
};

texify = function (textArray) {
    forEach(textArray, function (entry) {
        entry[0] = "\\lettrine[lines=1]{\\frakfamily " + entry[0].replace(/&/g, "\&") + "}{}\\\\\n";
        entry[1] = "\\textbf{" + entry[1].replace(/&/g, "\&") + "}\\\\\n";
        entry[2] = entry[2].replace(/&/g, "\&");
    });
    return textArray;
};

downloadAsZip = function () {
    var entries = getEntriesFromOverview ();

    var titles = entries.map(function (entry) {return entry[0];});
    texify(entries);

    var zip = new JSZip();
    for (i = 0; i < entries.length; i++){
        zip.file(i + ".tex", entries[i][0] + "\\\\\n" + entries[i][1] + "\\\\\n" + entries[i][2]);
    }
    //forEach(entries, function (entry) {
    //    zip.file(entry[0] + ".tex", entry[1] + "\n" + entry[2]);
    //});
    //var img = zip.folder("images");
    //img.file("smile.gif", imgData, {base64: true});
    zip.generateAsync({type:"blob"})
        .then(function(content) {
        // see FileSaver.js
        saveAs(content, "example.zip");
    });
};

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
