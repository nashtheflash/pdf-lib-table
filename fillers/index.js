export const continuationSection = (page, continuesOnNextPage, continuationX, continuationY, continuationFont, continuationFontSize, continuationFillerHeight, continuationText) => {
    const getTextWidth = (continuationFont, size, text) => continuationFont.widthOfTextAtSize(text, size);

    page.drawText(continuationText, {
        x: continuationX || continuationX === 0 ? continuationX : ((page.getWidth() - getTextWidth(continuationFont, continuationFontSize, continuationText) ) / 2),
        y: continuationY,
        font: continuationFont,
        size: continuationFontSize,
    });
};