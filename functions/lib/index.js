export { tableColumnWidths, spaceColumns, getMinColumnWidth } from "./getColumnWidth";
export { tableCells } from "./getcells";
export { getWrapedText } from "./getRows";
export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);