export function checkUserInputs(parameters) {
    const {
        data, // Required - No Default - data t be printed
        page, // Required - No Default - page provided by pdf-lib
        pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
        fonts,
        columns, // Required - No Default - column definitions
        pageDimensions,
        //TABLE SETTINGS
        startingX,
        startingY,
        appendedPageStartX,
        appendedPageStartY,
        appendedMaxTableWidth,
        tableType,
        dividedX,
        dividedY,
        dividedXColor,
        dividedYColor,
        dividedXThickness,
        dividedYThickness,
        maxTableWidth,
        maxTableHeight,
        rowHeightSizing,
        tableBoarder,
        tableBoarderThickness,
        tableBoarderColor,
        rounded,
        //CONTINUES
        continuesOnNextPage,
        continuationFiller,
        continuationTextX ,
        continuationTextY,
        continuationFont,
        continuationFontSize,
        continuationFillerHeight,
        continuationText,
        //SUB HEADINGS
        subheadingColumns,
        subHeadingBackgroundColor,
        subHeadingHeight,
        subHeadingFont,
        subHeadingTextColor,
        subHeadingTextSize,
        subHeadingLineHeight,
        subHeadingDividedX,
        subHeadingDividedXThickness,
        subHeadingDividedXColor,
        subHeadingDividedY,
        subHeadingDividedYThickness,
        subHeadingDividedYColor,
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
        headerLineHeight,
        headerTextAlignment,
        headerTextJustification,
        headerWrapText,
        //ROWSETTINGS
        rowBackgroundColor,
        alternateRowColor,
        alternateRowColorValue,
        
        //CELL SETTINGS
        cellFont,
        cellTextSize,
        cellHeight,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
    } = parameters;

    if(!data) {
        throw new Error('Data was not provided to the table.');
    }
    
    if(!page) {
        throw new Error('An initioal page was not provided. You must provide an initial page.');
    }
    
    if(!pdfDoc) {
        throw new Error('An PFF Document was not provided. You must provide an PFF Document.');
    }
    
    if(!fonts) {
        throw new Error('Fonts were not provided. You must provide the pdf lib standard fonts.');
    }
    
    if(!columns) {
        throw new Error('Column definitions were not provided. You must provide column definitions.');
    }
   
}