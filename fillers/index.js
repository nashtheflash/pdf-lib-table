export const continuationSection = (page, continuesOnNextPage, continuationX, continuationY, continuationFont, continuationFontSize, continuationFillerHeight, continuationText) => {
    const getTextWidth = (continuationFont, size, text) => continuationFont.widthOfTextAtSize(text, size);

    page.drawText(continuationText, {
        x: continuationX || ((page.getWidth() - getTextWidth(continuationFont, 18, continuationText) )/ 2),
        y: continuationY,
        font: continuationFont,
        size: continuationFontSize,
    });
};

// const mdFillerFunction = (page, x, y, font) => {
//     const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

//     //DRAW TOP LINE
//     page.drawLine({
//         start: { x: 5, y: 0 },
//         end: { x: 5, y: page.getHeight() },
//         thickness: 8,
//         color: rgb(0,1,0),
//         opacity: 0.75,
//     })

//     //Logo
//     page.drawImage(logo, {
//         x: 75,
//         y: 10,
//         width: logoDims.width,
//         height: logoDims.height,
//         rotate: degrees(90),
//     });

//     //TITLE
//     const { address1, city, state, zip } = PCDInfo
    
//     page.drawText('Certification of Recycling', {
//         x: 80,
//         y: 275,
//         size: 50,
//         font: timesRomanFontBold,
//         rotate: degrees(90)
//     });
    
//     //ADDRESS LINE 1
//     page.drawText(address1, {
//         x: 90,
//         y: 10,
//         size: SubHeadingfontSize,
//         font: timesRomanFont,
//         rotate: degrees(90)
//     });
    
//     //ADDRESS LINE 2
//     page.drawText(`${city}, ${state} ${zip}`, {
//         x: 105,
//         y: 10,
//         size: SubHeadingfontSize,
//         font: timesRomanFont,
//         rotate: degrees(90)
//     });

//     //DRAW DIVIDER
//     page.drawLine({
//         start: { x: 110, y: 0 },
//         end: { x: 110, y: page.getHeight() },
//         thickness: 2,
//         color: rgb(0,0,0),
//         opacity: 1,
//     })
// }