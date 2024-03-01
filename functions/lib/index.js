export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

export const getWrapedText = (font, fontSize, textAreaSize, text) => {
    const words = text.split(' ');

    let lineBreaks = [];
    let currentLineWidth = 0
    
    for (let loop = 0; loop < words.length; loop++) {
        const currentWordLength = getTextWidth(font, fontSize, (words[loop] + ' '));

        if (currentWordLength + currentLineWidth > textAreaSize) {
            lineBreaks.push(loop - 1);
            currentLineWidth = 0;
        };
        
        if (currentWordLength + currentLineWidth <= textAreaSize) {
            currentLineWidth += currentWordLength
        };
    }

    // console.log('lineBreaks:', lineBreaks);

    //build an array of text that is each line
    const lines = []
    if(lineBreaks.length === 0){
        const joinedText = words.join(' ');
        lines.push(joinedText)
    } else {
        lineBreaks.forEach((lineIndex, index) => {
            
            if(index === 0) {
                const text = words.slice(0,lineIndex);
                const joinedText = text.join(" ");
                lines.push(joinedText);
            };
    
            if(index > 0) {
                const text = words.slice(lineBreaks[index - 1],lineIndex);
                const joinedText = text.join(" ");
                lines.push(joinedText);
            }
    
            if(index === lineBreaks.length - 1) {
                const lastText = words.slice(lineIndex);
                const lastJoinedText = lastText.join(" ");
                lines.push(lastJoinedText);
            }
        })
    }


    return lines;
}