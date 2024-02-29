/**
 * 
 * 
 */
import { getLongestColumnItem, getColumnManualWidths, getHeaderItemLengths, getColumnWidths, getColumnIds, getNumberOfRows, getNumberOfSubHeadings } from './functions/dataProcessing';
import { draw2WayTable, drawHorizontalTable, drawVerticalTable } from './functions/table';


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
    alternateRowColor=false, //true || false 
    alternateCellColor='#c9c2c1', //#c9c2c1 || Hex Color Value
    tableBoarder=true,
    tableBoarderThickness=false,
    tableBoarderColor=false,
    rounded=false, //sets if the table corners are rounded
    customContinuesOnNextPage=false, //can pass a function for what to draw
    smPageFiller=false, //can pass a function for what to draw
    mdPageFiller=false, //can pass a function for what to draw
    lgPageFiller=false, //can pass a function for what to draw
    //SUB HEADINGS
    subHeadingBackgroundColor='#8a8584', //#8a8584 || Hex Color Value
    subHeadingHeight=12, //table header text size
    subHeadingFont='timesnewroman', // timesnewroman || any pdflib standard font
    subHeadingTextColor='black', //#000000 || Hex Color Value
    subHeadingTextSize='10', //table header text size
    //HEADER SETTINGS
    headerFont, // timesnewroman || any pdflib standard font
    headerDividedX=true,
    headerDividedY=true,
    headerDividedXColor='#000000', //#000000 || Hex Color Value
    headerDividedYColor='#000000', //#000000 || Hex Color Value
    headerBackgroundColor=false, //#8a8584 || Hex Color Value
    headerHeight=10, //height of the table header
    headerTextColor=false, //#000000 || Hex Color Value
    headerTextSize=10, //table header text size
    headerTextAlignment='left', //left/right/center 
    headerWrapText=false,
    //CELL SETTINGS
    cellFont, // timesnewroman || any pdflib standard font
    cellBackgroundColor='#ffffff', //#ffffff || Hex Color Value
    cellTextSize=10, //cell text size
    cellTextColor='black', //#000000 || Hex Color Value
    cellHeight=12,

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
    const availableTableWidth = !maxTableWidth ? (pageWidth - startingX) : Math.min(pageWidth, maxTableWidth);
    const availableTableHeight = headerHeight + (numberOfRows * cellHeight) + (numberOfSubHeadings * subHeadingHeight);
    const columnIds = getColumnIds(columns); 
    const headerLengths = getHeaderItemLengths(columns, headerFont, headerTextSize);
    const longestRowItem = getLongestColumnItem(data, cellFont, cellTextSize);
    const manualColumnWidths = getColumnManualWidths(columns);
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


    // build table
    const tableProps = {
        data,
        page,
        pdfDoc,
        columns,
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
        columnIds,
        headerLengths,
        longestRowItem,
        manualColumnWidths,
        columnWidths,
    }

    if(tableType === 'vertical') drawVerticalTable(tableProps);
    // if(tableType === 'horizontal') drawHorizontalTable(tableProps);
    // if(tableType === '2way') draw2WayTable(tableProps);

    return tableType
};