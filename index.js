/**
 * 
 * 
 */
import { rgb } from 'pdf-lib';
import { getLongestColumnItem, getColumnManualWidths, getHeaderItemLengths, getColumnWidths, getColumnIds, getNumberOfRows, getNumberOfSubHeadings } from './functions/dataProcessing';
import { draw2WayTable, drawHorizontalTable, drawVerticalTable } from './functions/table';
import { getHeaderRows } from './functions/header/headerFuncitons';
import { getTotalRowHeight } from './functions/row/rowFunctions';

//default colors
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);
const blue = rgb(.21, .24, .85);
const grey = rgb(.03, .03, .03);

//default fonts
// const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
// const timesRomanFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)



export async function drawTable({
    data,
    page, //page provided by pdf-lib
    pdfDoc,
    columns='colunms', //column definitions
    //TABLE SETTINGS
    startingX=0, //the starting x coordinate
    startingY=0, //the starting y coordinate
    tableType='vertical', //vertical || horizontal || 2way
    dividedX=true,
    dividedY=true,
    dividedXColor='#000000', //#000000 || Hex Color Value
    dividedYColor='#000000', //#000000 || Hex Color Value
    maxTableWidth=false,
    maxTableHeight=false,
    rowHeightSizing='auto', //auto || 100px
    tableBoarder=true,
    tableBoarderThickness=false,
    tableBoarderColor=black,
    rounded=false, //sets if the table corners are rounded
    customContinuesOnNextPage=false, //can pass a function for what to draw
    smPageFiller=false, //can pass a function for what to draw
    mdPageFiller=false, //can pass a function for what to draw
    lgPageFiller=false, //can pass a function for what to draw
    //SUB HEADINGS
    subHeadingBackgroundColor='#8a8584', //#8a8584 || Hex Color Value
    subHeadingHeight=12, //table header text size
    subHeadingFont='timesnewroman', // timesnewroman || any pdflib standard font
    subHeadingTextColor=black, //#000000 || Hex Color Value
    subHeadingTextSize='10', //table header text size
    //HEADER SETTINGS
    headerFont, // timesnewroman || any pdflib standard font
    headerDividedX=true,
    headerDividedY=true,
    headerDividedXColor=black, //#000000 || Hex Color Value
    headerDividedYColor=black, //#000000 || Hex Color Value
    headerDividedXThickness=1,
    headerDividedYThickness=1,
    headerBackgroundColor=blue, //#8a8584 || Hex Color Value
    headerHeight=10, //height of the table header
    headerTextColor=false, //#000000 || Hex Color Value
    headerTextSize=10, //table header text size
    headerTextAlignment='left', //left/right/center 
    headerWrapText=false,
    //CELL SETTINGS
    cellFont, // timesnewroman || any pdflib standard font
    cellBackgroundColor=white, //#ffffff || Hex Color Value
    alternateRowColor=true, //true || false 
    alternateCellColor=grey, //#c9c2c1 || Hex Color Value
    cellTextSize=10, //cell text size
    cellTextColor=black, //#000000 || Hex Color Value
    cellHeight=10,

} = {}) {

    page.drawText('...', {
        x: startingX,
        y: startingY,
        size: 10,
        // headerTextColor: headerTextColor,
        // font: timesRomanFontBold
    });

    // process data
    const pageHeight = page.getHeight();
    const pageWidth = page.getWidth();
    const numberOfRows = getNumberOfRows(data);
    const numberOfSubHeadings = getNumberOfSubHeadings(data);
    const columnIds = getColumnIds(columns); 
    const headerLengths = getHeaderItemLengths(columns, headerFont, headerTextSize);
    const longestRowItem = getLongestColumnItem(data, cellFont, cellTextSize);
    const manualColumnWidths = getColumnManualWidths(columns);
    const availableTableWidth = !maxTableWidth ? (pageWidth - startingX) : Math.min(pageWidth, maxTableWidth);
    const columnWidths = getColumnWidths({
        page,
        columnIds,
        startingX,
        pageHeight,
        pageWidth,
        maxTableWidth,
        maxTableHeight,
        manualColumnWidths,
        headerLengths,
        longestRowItem,
        availableTableWidth
    });
    
    //Heeder Measurments
    const headerTextRows = getHeaderRows({ headerWrapText, columns, headerFont, headerTextSize, columnWidths });
    const headerFullTextHeight = headerTextRows * headerTextSize;
    const totalHeaderHeight = Math.max(headerHeight, headerFullTextHeight);
    const rowStartingY =  totalHeaderHeight + cellHeight;
    const TotalRowHeight = getTotalRowHeight(data, cellFont, cellHeight, cellTextSize, columnWidths);
    const availableTableHeight = totalHeaderHeight + TotalRowHeight + (numberOfSubHeadings * subHeadingHeight);
    
    // build table
    const tableProps = {
        data,
        page,
        pdfDoc,
        columns,
        columnIds,
        //TABLE SETTINGS
        startingX,
        startingY,
        tableType,
        dividedX,
        dividedY,
        dividedXColor,
        dividedYColor,
        maxTableWidth,
        maxTableHeight,
        rowHeightSizing,
        alternateRowColor,
        alternateCellColor,
        tableBoarder,
        tableBoarderThickness,
        tableBoarderColor,
        rounded,
        customContinuesOnNextPage,
        smPageFiller,
        mdPageFiller,
        lgPageFiller,
        //SUB HEADINGS
        subHeadingBackgroundColor,
        subHeadingHeight,
        subHeadingFont,
        subHeadingTextColor,
        subHeadingTextSize,
        //HEADER SETTINGS
        headerFont,
        headerDividedX,
        headerDividedY,
        headerDividedXColor,
        headerDividedYColor,
        headerDividedXThickness,
        headerDividedYThickness,
        headerBackgroundColor,
        headerHeight,
        headerTextColor,
        headerTextSize,
        headerTextAlignment,
        headerWrapText,
        //CELL SETTINGS
        cellFont,
        cellBackgroundColor,
        cellTextSize,
        cellTextColor,
        cellHeight,
        //DERIVED
        pageHeight,
        pageWidth,
        numberOfRows,
        numberOfSubHeadings,
        availableTableWidth,
        availableTableHeight,
        headerLengths,
        longestRowItem,
        manualColumnWidths,
        columnWidths,
        headerTextRows,
        headerFullTextHeight,
        rowStartingY
    };

    if(tableType === 'vertical') drawVerticalTable(tableProps);
    // if(tableType === 'horizontal') drawHorizontalTable(tableProps);
    // if(tableType === '2way') draw2WayTable(tableProps);

    return tableType;
};