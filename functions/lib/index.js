export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

export const getWrapedText = (font, fontSize, textAreaSize, text) => {
    const words = text.split(' ');

    let lineBreaks = [];
    let currentLineWidth = 0
    
    for (let loop = 0; loop < words.length; loop++) {
        const currentWordLength = words.length > 1 ? getTextWidth(font, fontSize, (words[loop] + ' ')) : getTextWidth(font, fontSize, words[loop]);

        if (currentWordLength + currentLineWidth >= textAreaSize && words.length !== 0) {
            // loop === 0 ? lineBreaks.push(loop - 1) : lineBreaks.push(loop - 1);
            lineBreaks.push(loop)
            currentLineWidth = 0;
        };
        
        if (currentWordLength + currentLineWidth < textAreaSize && words.length !== 0) {
            currentLineWidth += currentWordLength
        };
    }

    //build an array of text that is each line
    const lines = []

    //if there are no line breaks push the words
    if(lineBreaks.length === 0) lines.push(words.join(' '));
    lineBreaks.forEach((lb, i) => {
        // console.log(lb, i, lineBreaks, lineBreaks.length, words.length, textAreaSize, words)
        if(lb === 0)                                                            lines.push(words[0]);
        if(lb === 0 && lineBreaks.length === 2)                                 lines.push(words.slice(1).join(' '));
        if(lb !== 0 && i !== 0 && lineBreaks[i-1] === 0)                        lines.push(words.slice(1, lb).join(' '));
        if(lb !== 0 && i === lineBreaks.length - 1 && lineBreaks[i-1] === 0)    lines.push(words.slice(1).join(' '));
        if(lb !== 0 && i === 0)                                                 lines.push(words.slice(i, lb).join(' '));
        if(lb !== 0 && i !== 0 && lineBreaks[i-1] !==0)                         lines.push(words.slice(lineBreaks[i-1], lb).join(' '));
        if(lb !== 0 && i === lineBreaks.length - 1 && lineBreaks[i-1] !== 0)    lines.push(words.slice(lineBreaks[i]).join(' '));
    });

    // console.log(lines);
    return lines;
}