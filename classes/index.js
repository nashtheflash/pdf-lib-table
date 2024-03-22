import { tableColumnWidths, spaceColumns, getMinColumnWidth, getWrapedText } from "../functions/lib";

export class Data {
    constructor
    (
        data, 
        columns,
        startingX,
        startingY,
        appendedPageStartX,
        appendedPageStartY,
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
        this.appendedPageStartX = appendedPageStartX,
        this.appendedPageStartY = appendedPageStartY,
        this.cellFont  = cellFont,
        this.cellTextSize  = cellTextSize,
        this.cellLineHeight  = cellLineHeight,
        this.maxTableWidth = maxTableWidth,
        this.additionalWrapCharacters  = additionalWrapCharacters,
        this.pageWidth = pageWidth,
        this.pageDimensions = pageDimensions
    }

    tableHeader(columnWidths) {
        if(this.headerHeight) return this.headerHeight;

        const longestItem = this.columnHeaders.reduce((longest, col) => {
            const columnWidth = columnWidths[col];
            const wrappedText = getWrapedText(this.headerFont, this.headerTextSize, columnWidth, col, this.additionalWrapCharacters);
            return wrappedText.length > longest.length ? wrappedText : longest;
        }, []);

        const headerCalcHeight =  longestItem.length * this.headerLineHeight
        
        return headerCalcHeight;
    }

    dataWithHeaders() {
        const fulldata = [...this.data];

        const headerRow = this.columns.reduce((acc, { columnId }) => {
            return { ...acc, [columnId]: columnId };
        }, {});
        
        fulldata.unshift(headerRow);

        return fulldata;
    }


    tableColumnWidths() {
        //this should be the min column width by column
        const minColumnWidth = getMinColumnWidth(this.data, this.columns, this.cellFont, this.cellTextSize, this.headerFont, this.headerTextSize, this.additionalWrapCharacters);
        const tableWidth = this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
        const finalSizing = spaceColumns(minColumnWidth, this.columns, tableWidth);
        return finalSizing;
    };

    // tableCells() {
    //     const columnWidths = this.tableColumnWidths();
    //     const rowMaster = [];
    
    //     this.data.forEach((row, index) => {
    //         let newRow = []
    //         let xCounter = this.startingX
    //         Object.keys(row).forEach((col) => {
    //             const cellValues = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters);
               
    //             newRow = [
    //                 ... newRow, 
    //                 {
    //                     colID: col, 
    //                     rowId: index,
    //                     startingX: xCounter, //can probably get this later in from the column class
    //                     //startingY: this.startingY, //couls mabe get this later from the row class
    //                     font: this.cellFont, 
    //                     textHeight: this.cellTextSize, 
    //                     lineHeight: this.cellLineHeight,
    //                     CellHeight: this.cellLineHeight * cellValues.length,
    //                     values: [...cellValues]
    //                 }
    //             ]
    //             xCounter += columnWidths[col];
    //         });
            
    //         rowMaster.push(newRow);
    //         xCounter = 0;
    //     })
    
    //     return rowMaster
    // }

    // tableRows() {
    //     const columnWidths = this.tableColumnWidths();
        
    //     let newData = [...this.data];
    
    //     newData.forEach((row, index) => {
    //         const longestItem = Object.keys(row).reduce((longest, col) => {
    //             const wrappedText = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters);
    //             return wrappedText.length > longest.length ? wrappedText : longest;
    //         }, []);
    
    //         newData[index] = {
    //             rowHeight: longestItem.length * this.cellLineHeight
    //         }
    //     });
    //     return newData;
    // }

    

    tableCells(columnWidths) {
    
        return this.data.map((row, rowIndex) => {
            let xCounter = this.startingX;
            return Object.keys(row).map(col => {
                const cellValues = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters);
                const cell = {
                    colID: col,
                    rowId: rowIndex,
                    startingX: xCounter,
                    font: this.cellFont,
                    textHeight: this.cellTextSize,
                    lineHeight: this.cellLineHeight,
                    cellHeight: this.cellLineHeight * cellValues.length,
                    values: [...cellValues]
                };
                xCounter += columnWidths[col];
                return cell;
            });
        });
    }
    
    tableRows(columnWidths) {
        const data = this.data.map(row => {
            const longestItem = Object.keys(row).reduce((longest, col) => {
                const wrappedText = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
            return {
                rowHeight: longestItem.length * this.cellLineHeight
            };
        });
        return data;
    }
    
    // dataProcessor(page) {
    //     const rowHeights = this.tableRows();
    //     const cells = this.tableCells();
    
    //     let counter = 0;
    //     let pageCount = 0;
    //     const pageHeight = this.pageDimensions[1];
    
    //     const modifiedRows = cells.map(row => {
    //         const currentRowHeight = row[0].rowHeight;
    //         console.log(row)
    
    //         if (pageCount === 0 && counter + this.tableHeader() + currentRowHeight > this.startingY) {
    //             pageCount++;
    //             counter = 0;
    //         } else if (pageCount !== 0 && counter + this.tableHeader() + currentRowHeight > pageHeight) {
    //             pageCount++;
    //             counter = 0;
    //         }
    
    //         //console.log(this.startingY, this.tableHeader(), this.cellLineHeight, counter)
    //         const modifiedRow = row.map(cell => ({
    //             ...cell,
    //             page: pageCount,
    //             startingY: (this.startingY - this.tableHeader()) - this.cellLineHeight - counter
    //         }));
    
    //         counter += currentRowHeight;
    //         return modifiedRow;
    //     });
    
    //     return modifiedRows.filter(row => row[0].page === page);
    // }

    dataProcessor(columnWidths) {
        const rHeight = this.tableRows(columnWidths);
        const rowDetail = [...this.tableCells(columnWidths)];
        const tableHeaderHeight = this.tableHeader(columnWidths);
        
        const modifiedRows = rowDetail.map((row, index) => {
            return row.map(c => {
                return {...c, rowHeight: rHeight[c.rowId].rowHeight}
            })
        });
        
        const pageHeight = this.pageDimensions[1];

        let counter = 0;
        let pageCount = 0;

        modifiedRows.forEach((row, i) => {
            const curentRowHeight = row[0].rowHeight;
            
            if (pageCount !== 0 && counter + tableHeaderHeight + curentRowHeight > pageHeight) {
                pageCount++;
                counter = 0;
            }

            if (pageCount === 0 && counter + tableHeaderHeight + curentRowHeight > this.startingY) {
                pageCount++;
                counter = 0;
            }
            

            const mod = row.map(cell => ({
                ...cell,
                page: pageCount,
                startingY: (this.startingY - tableHeaderHeight) - this.cellLineHeight - counter
            }));

            modifiedRows[i] = mod;
            counter += curentRowHeight;
        });

        return {data: modifiedRows, pages: pageCount};
    }
        
}


export class Document {
    constructor
    (
        page,
        pdfDoc,
        startingX,
        startingY,
        //StandardFonts,
        pageDimensions,
    ){
        this.page = page,
        this.pdfDoc = pdfDoc,
        this.startingX = startingX,
        this.startingY = startingY,
        this.pages = [new Page(page, [page.getHeight(), page.getWidth()], 'original', {startingX: this.startingX, startingY: this.startingY})],
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
        const pg = new Page(this.pdfDoc.addPage(this.pageDimensions, this.pageDimensions, 'app'))
        this.pages.push(pg);
        return pg;
    }

    // async addFont(font) {
    //     await this.pdfDoc.embedFont(this.StandardFonts[font])
    // }
}

export class Page {
    constructor(pdfPage, pageDimensions, type, {startingX, startingY} = {}){
        this.pdfPage = pdfPage,
        this.pageDimensions = pageDimensions,
        this.type = type,
        this.startingX = startingX, 
        this.startingY = startingY
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

    get availTableHeight() {
        if(this.type === 'original') return this.startingY;
        return this.pageDimensions[0]
    }

    get availTableWidth() {
        if(this.type === 'original') return this.startingX;
        return this.pageDimensions[1]

    }
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

    get docStartingY() {
        return this.startingY
    }

    get rows() {
        const rows = [];

        this.data.forEach(row => rows.push(new Row(row)))
        
        return rows
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

    get headerHeight() {
        return this.headerLineHeight
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
        rowData
    ){
        this.rowData = rowData
    }

    get cells() {
        const cells = [];
        this.rowData.forEach(cell => cells.push(new Cell(cell)))
        
        return cells
    }
}

export class Cell {
    constructor(celldata){
        this.data = celldata
    }

    get cell() {
        return this.data
    }

    drawCell(page) {

        const {values, startingX, startingY, textHeight, cellFont, lineHeight } = this.data;

        values.forEach((text, i) => {
            page.page.drawText(text, {
                x: startingX,
                y: startingY - (lineHeight * i),
                size: textHeight,
                font: cellFont,
                lineHeight: lineHeight
            });
        })
    }
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