import { tableColumnWidths, spaceColumns, getMinColumnWidth, getWrapedText } from "../functions/lib";

export class Data {
    constructor
    (
        data, 
        columns,
        startingX,
        startingY,
        headerHeight, 
        headerFont, 
        headerTextSize, 
        headerLineHeight,
        headerWrapText,
        cellFont, 
        cellTextSize, 
        cellLineHeight, 
        maxTableWidth,
        additionalWrapCharacters, 
        pageWidth,
        pageDimensions
    ){
        this.data = data,
        this.columns = columns,
        this.columnHeaders = columns.map(({ columnId }) => columnId),
        this.headerHeight = headerHeight,
        this.headerFont = headerFont,        
        this.headerTextSize = headerTextSize,   
        this.headerLineHeight = headerLineHeight;     
        this.headerWrapText = headerWrapText,            
        this.startingX = startingX,
        this.startingY  = startingY,
        this.cellFont  = cellFont,
        this.cellTextSize  = cellTextSize,
        this.cellLineHeight  = cellLineHeight,
        this.maxTableWidth = maxTableWidth,
        this.additionalWrapCharacters  = additionalWrapCharacters,
        this.pageWidth = pageWidth,
        this.pageDimensions = pageDimensions
    }

    docPages() {
        const rowHeights = this.tableRows();

        const pages = rowHeights.reduce((acc, row, i) => {
            const currentPageHeight = acc.pages === 0 ? this.startingY : this.pageDimensions[1];
            if (row.rowHeight + acc.tableHeight < currentPageHeight) {
                acc.tableHeight += row.rowHeight;
            } else {
                acc.pages++;
                acc.tableHeight = 0;
            }
            return acc;
        }, { pages: 0, tableHeight: 0 }).pages;


        return pages;
    }

    tableHeader() {
        if(this.headerHeight) return this.headerHeight;

        const columnWidths = this.tableColumnWidths();

        const longestItem = this.columnHeaders.reduce((longest, col) => {
            const columnWidth = columnWidths[col];
            const wrappedText = getWrapedText(this.headerFont, this.headerTextSize, columnWidth, col, this.additionalWrapCharacters);
            return wrappedText.length > longest.length ? wrappedText : longest;
        }, []);

        const headerCalcHeight =  longestItem.length * this.cellLineHeight
        
        return headerCalcHeight;
    }

    tableRows() {
        const columnWidths = this.tableColumnWidths();
        
        let newData = [...this.data];
        let availPageheight = this.tableHeader() - this.startingY;
    
        newData.forEach((row, index) => {
            const longestItem = Object.keys(row).reduce((longest, col) => {
                const columnWidth = columnWidths[col];
                const wrappedText = getWrapedText(this.cellFont, this.cellTextSize, columnWidth, row[col], this.additionalWrapCharacters);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
    
            let rowSpaceAbove = 0;
            if (index !== 0) {
                for (let loop = 0; loop < index; loop ++) {
                    rowSpaceAbove += newData[loop].rowHeight
                };
            } else {
                availPageheight -= longestItem.length * this.cellLineHeight
            }
    
            newData[index] = {
                //...newData[index], 
                // rowStartingY: startingY - rowSpaceAbove,
                // rowsAbove: index,
                // rowSpaceAbove,
                rowHeight: longestItem.length * this.cellLineHeight
            }
        });
        return newData;
    }

    tableColumnWidths() {
        //this should be the min column width by column
        const minColumnWidth = getMinColumnWidth(this.data, this.columns, this.cellFont, this.cellTextSize, this.additionalWrapCharacters);
        const tableWidth = this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
        const finalSizing = spaceColumns(minColumnWidth, this.columns, tableWidth);
        return finalSizing;
    };

    tableCells() {
        const columnWidths = this.tableColumnWidths();
        const rowMaster = [];
    
        this.data.forEach((row, index) => {
            let newRow = []
    
            Object.keys(row).forEach((col) => {
                const cellValues = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[row], row[col], this.additionalWrapCharacters);
                newRow = [
                    ... newRow, 
                    {
                        colID: col, 
                        rowId: index,
                        startingX: this.startingX, //can probably get this later in from the column class
                        startingY: this.startingX, //couls mabe get this later from the row class
                        font: this.cellFont, 
                        textHeight: this.cellTextSize, 
                        lineHeight: this.cellLineHeight,
                        CellHeight: this.cellLineHeight * cellValues.length,
                        values: cellValues
                    }
                ]
            });
            
            rowMaster.push(newRow)
        })
    
        return rowMaster
    }
}


export class Document {
    constructor
    (
        page,
        pdfDoc,
        //StandardFonts,
        pageDimensions,
    ){
        this.page = page,
        this.pdfDoc = pdfDoc,
        this.pages = [new Page(page)],
        //this.StandardFonts = StandardFonts
        this.pageDimensions = pageDimensions
    }

    get totalPages() {
        return this.pages.length;
    }

    get document() {
        return this.pdfDoc;
    }
    
    get documentPages() {
        return this.pages;
    }

    addPage() {
        const pg = new Page(this.pdfDoc.addPage(this.pageDimensions))
        this.pages.push(pg);
        return pg;
    }

    // async addFont(font) {
    //     await this.pdfDoc.embedFont(this.StandardFonts[font])
    // }
}

export class Page {
    constructor(pdfPage){
        this.pdfPage = pdfPage
    }

    get page() {
        return this.pdfPage
    }

    get pageWidth() {
        return this.pdfPage.getWidth();
    };

    get pageHeight() {
        return this.pdfPage.getHeight();
    };
}

export class Table extends Page {
    constructor(
        page,
        data,
        columns,
        startingX,
        startingY,
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
        customContinuesOnNextPage,
        //continuationFiller=(page, x, y, font) => continuationSection(page, x, y, font),
        continuationFillerHeight,
    ){
        super(page)
        this.data = data,
        this.columns = columns,
        this.startingX = startingX,
        this.startingY = startingY,
        this.tableType = tableType,
        this.dividedX = dividedX,
        this.dividedY = dividedY,
        this.dividedXColor = dividedXColor,
        this.dividedYColor = dividedYColor,
        this.dividedXThickness = dividedXThickness,
        this.dividedYThickness = dividedYThickness,
        this.maxTableWidth = maxTableWidth,
        this.maxTableHeight = maxTableHeight,
        this.rowHeightSizing = rowHeightSizing,
        this.tableBoarder = tableBoarder,
        this.tableBoarderThickness = tableBoarderThickness,
        this.tableBoarderColor = tableBoarderColor,
        this.rounded = rounded,
        this.customContinuesOnNextPage = customContinuesOnNextPage,
        //this.continuationFiller = (page, x, y, font) => continuationSection(page, x, y, font),
        this.continuationFillerHeight = continuationFillerHeight
    }

    get docPage() {
        return this.page
    }

    get columnInfo() {
        return this.columns
    }

    get columnIds() {
        return this.columns.map(({ columnId }) => columnId)
    }
    
    get headers() {
        return this.columns.map(({ header }) => header)
    }
    
    get tableWidth() {
        return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - startingX) ? this.maxTableWidth : (this.pageWidth - startingX);
    }

    get tableHeight() {
        return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - startingX) ? this.maxTableWidth : (this.pageWidth - startingX);
    }
        

    getPageHeight() {
        return this.pageHeight;
    }
    
    getPageWidth() {
        return this.pageWidth;
    }
};

export class Header {
    constructor(
        page, 
        columns,
        columenIds, 
        headers,
        columnWidths, 
        startingX, 
        startingY,
        headerFont, 
        headerTextSize, 
        headerLineHeight,
        headerWrapText
    ){
        this.tablePage = page,
        this.columns = columns,
        this.columenIds = columenIds,
        this.headers = headers,
        this.columnWidths = columnWidths,
        this.startingX = startingX,
        this.startingY = startingY,
        this.headerFont = headerFont,
        this.headerTextSize = headerTextSize,
        this.headerLineHeight = headerLineHeight,
        this.headerWrapText = headerWrapText
    }

    get page() {
        return this.pdfPage
    }

    get pageWidth() {
        return this.pdfPage.getWidth();
    };

    get pageHeight() {
        return this.pdfPage.getHeight();
    };

    drawHeader() {
        
        let horizontalCursor = 0;
        this.columns.forEach((header) => {
            
            this.tablePage.page.drawText(header.header, {
                x: this.startingX + horizontalCursor,
                y: this.startingY - this.headerTextSize,
                size: this.headerTextSize,
                font: this.headerFont,
                color: this.headerTextColor,
                lineHeight: this.headerTextSize
            });

            horizontalCursor += this.columnWidths[header.columnId];
        });
    };
};

export class Column {
    constructor(columnId, columnsInfo, columnWidth){
        this.columnId = columnId,
        this.columnInfo = columnsInfo.find((col) => col.columnId = columnId),
        this.columnWidth = columnWidth
    }

    get id() {
        return this.columnId
    }
    
    get header() {
        return columnInfo.header;
    }
    
    get type() {
        return columnInfo.type;
    }
    
    get header() {
        return columnInfo.wrapText;
    }
    
    get width() {
        return this.columnWidth;
    };
}

export class Row {
    constructor(
        page, 
        columns,
        columenIds, 
        headers,
        columnWidths, 
        startingX, 
        startingY,
        cellFont, 
        cellTextSize, 
        cellLineHeight,
        headerWrapText,
        tableCells,
        rows
    ){
        this.page = page,
        this.columns = columns,
        this.columenIds = columenIds,
        this.headers = headers,
        this.columnWidths = columnWidths,
        this.startingX = startingX,
        this.startingY = startingY,
        this.cellFont = cellFont,
        this.cellTextSize = cellTextSize,
        this.cellLineHeight = cellLineHeight,
        this.headerWrapText = headerWrapText,
        this.tableCells = tableCells,
        this.rows = rows
    }
    
    drawRow() {
        
        let horizontalCursor = 0;

        console.log(this.rows);

        this.tableCells.forEach((row, i) => {
            if(i === 0) return;//skip the header row

           row.forEach((cell) => {
                console.log(cell)
                cell.values.forEach((text) => {
                    this.page.page.drawText(text, {
                        x: this.startingX + horizontalCursor,
                        // y: this.startingY - this.headerTextSize,
                        y: 590,
                        size: this.cellTextSize,
                        font: this.cellFont,
                        color: this.headerTextColor,
                        lineHeight: this.cellTextSize
                    });
                })
                horizontalCursor += this.columnWidths[cell.colID];
           })
           //horizontalCursor = 0;
        })

        // this.columns.forEach((header) => {
            
        //     this.page.page.drawText(header.header, {
        //         x: this.startingX + horizontalCursor,
        //         // y: this.startingY - this.headerTextSize,
        //         y: 200,
        //         size: this.cellTextSize,
        //         font: this.cellFont,
        //         color: this.headerTextColor,
        //         lineHeight: this.cellTextSize
        //     });

        //     horizontalCursor += this.columnWidths[header.columnId];
        // });
    };
}

export class Cells extends Column {
    // constructor(pdfPage){
    //     this.pdfPage = pdfPage
    // }

    // get page() {
    //     return this.pdfPage
    // }

    // get width() {
    //     return this.pdfPage.getWidth();
    // };

    // get height() {
    //     return this.pdfPage.getHeight();
    // };
}


















// //DERIVED
// totalPages,
// allPages,
// pageHeight,
// pageWidth,
// numberOfRows,
// numberOfSubHeadings,
// availableTableWidth,
// availableTableHeight,
// headerLengths,
// longestRowItem,
// manualColumnWidths,
// columnWidths,
// headerTextRows,
// headerFullTextHeight,
// rowSectionStartingY,
// rowMeasurments