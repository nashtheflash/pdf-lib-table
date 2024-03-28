import { breakWord } from "./getColumnWidth";
import { getTextWidth } from ".";


//[{colID, startingX, startingY, font, rowHeight, textHeight, values: [line1 of text, line 2 of text]}]
//TODO: Pickup here
export const tableCells = (data, columns, columnWidths, startingX, startingY, maxTableWidth, pageWidth, cellFont, cellTextSize, cellLineHeight, additionalWrapCharacters) => {
    const rowMaster = [];

    data.forEach((row, index) => {
        let newRow = []

        Object.keys(row).forEach((col) => {
            const cellValues = getWrapedText(cellFont, cellTextSize, columnWidths[row], row[col], additionalWrapCharacters);
            newRow = [
                ... newRow, 
                {
                    colID: col, 
                    rowId: index,
                    startingX, //can probably get this later in from the column class
                    startingY, //couls mabe get this later from the row class
                    font: cellFont, 
                    textHeight: cellTextSize, 
                    lineHeight: cellLineHeight,
                    CellHeight: cellLineHeight * cellValues.length,
                    values: cellValues
                }
            ]
        });
        
        rowMaster.push(newRow)
    })
}


// const getWrapedText = (font, fontSize, textAreaSize, text, additionalWrapCharacters) => { //TODO removee
//     const words = breakWord(text.toString(), additionalWrapCharacters)



//     let lineBreaks = [];
//     let currentLineWidth = 0

//     for (let loop = 0; loop < words.length; loop++) {
//         const currentWordLength = words.length > 1 ? getTextWidth(font, fontSize, (words[loop] + ' ')) : getTextWidth(font, fontSize, words[loop]);

//         if (currentWordLength + currentLineWidth >= textAreaSize && words.length !== 0) {
//             // loop === 0 ? lineBreaks.push(loop - 1) : lineBreaks.push(loop - 1);
//             lineBreaks.push(loop)
//             currentLineWidth = 0;
//         };
        
//         if (currentWordLength + currentLineWidth < textAreaSize && words.length !== 0) {
//             currentLineWidth += currentWordLength
//         };
//     }

//     //build an array of text that is each line
//     const lines = []

//     //if there are no line breaks push the words
//     if(lineBreaks.length === 0) lines.push(words.join(' '));
//     lineBreaks.forEach((lb, i) => {
//         //console.log(lb, i, lineBreaks, lineBreaks.length, words.length, textAreaSize, words);
//         if(lb === 0 && lineBreaks.length === 2)                                 lines.push(words.slice(1).join(' '));
//         if(lb === 0)                                                            lines.push(words[0]);
//         if(lb !== 0 && i === 0)                                                 lines.push(words.slice(i, lb).join(' '));
//         if(lb !== 0 && i !== 0 && lineBreaks[i-1] !==0)                         lines.push(words.slice(lineBreaks[i-1], lb).join(' '));
//         if(lb !== 0 && i === lineBreaks.length - 1 && lineBreaks[i-1] !== 0)    lines.push(words.slice(lineBreaks[i]).join(' '));
//     });

//     return lines;
// };