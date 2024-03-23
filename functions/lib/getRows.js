import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { breakWord } from "./getColumnWidth";
import { getTextWidth } from ".";


//[{colID, startingX, startingY, font, rowHeight, textHeight, values: [line1 of text, line 2 of text]}]
//TODO: the header hight needs to be known and passed in!!!
export const tableRows = (data, columns, columnWidths, startingX, startingY, maxTableWidth, pageWidth, cellFont, cellTextSize, cellLineHeight, additionalWrapCharacters, headerHeight) => {
    let newData = [...data];
    let availPageheight = headerHeight - startingY;

    newData.forEach((row, index) => {
        const longestItem = Object.keys(row).reduce((longest, col) => {
            const columnWidth = columnWidths[col];
            const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidth, row[col], additionalWrapCharacters);
            return wrappedText.length > longest.length ? wrappedText : longest;
        }, []);

        let rowSpaceAbove = 0;
        if (index !== 0) {
            for (let loop = 0; loop < index; loop ++) {
                rowSpaceAbove += newData[loop].rowHeight
            };
        } else {
            availPageheight -= longestItem.length * cellLineHeight
        }

        newData[index] = {
            //...newData[index], 
            // rowStartingY: startingY - rowSpaceAbove,
            // rowsAbove: index,
            // rowSpaceAbove,
            rowHeight: longestItem.length * cellLineHeight
        }
    });
    return newData;
}


export const getWrapedText = (font, fontSize, textAreaSize, text, additionalWrapCharacters, testFont) => {
    const words = breakWord(text.toString(), additionalWrapCharacters)

    let lineBreaks = [];
    let currentLineWidth = 0
    const wordsLength = words.length

    for (let loop = 0; loop < wordsLength; loop++) {
        //TODO: PDF-libs text calc does not work. I need to probably fix it. According to this issue,
        //pdf-lib des not print kerning but the text measure uses kerning. Its really stupid
        //
        const currentWordLength = getTextWidth(font, fontSize, words[loop]+' ') + .19;

        if (currentWordLength + currentLineWidth >= textAreaSize && words.length !== 0) {
            lineBreaks.push(loop)
            currentLineWidth = 0;
        };
        
        if (currentWordLength + currentLineWidth < textAreaSize && words.length !== 0) {
            currentLineWidth += (currentWordLength)
        };
    }

    //build an array of text that is each line
    const lines = []

    //if there are no line breaks push the words
    if(lineBreaks.length === 0) lines.push(words.join(' '));
    lineBreaks.forEach((lb, i) => {
        //(lb, i, lineBreaks, lineBreaks.length, words.length, textAreaSize, words);
        if(lb === 0)                                                            lines.push(words[0]);
        if(lb === 0 && lineBreaks.length === 1)                                 lines.push(words.slice(1).join(' '));
        if(lb !== 0 && i === 0)                                                 lines.push(words.slice(i, lb).join(' '));
        if(lb !== 0 && i !== 0 && lineBreaks[i-1] !==0)                         lines.push(words.slice(lineBreaks[i-1], lb).join(' '));
        if(lb !== 0 && i === lineBreaks.length - 1 && lineBreaks[i-1] !== 0)    lines.push(words.slice(lineBreaks[i]).join(' '));
    });

    return lines;
};