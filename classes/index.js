import { rgb, rotateAndSkewTextDegreesAndTranslate } from 'pdf-lib';
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib';
import { tableColumnWidths, spaceColumns, getMinColumnWidth, getWrapedText, getTextWidth } from "../functions/lib";

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
        this.columnHeaders = columns.map(({ header }) => header),
        this.columnIds = columns.map(({ columnId }) => columnId),
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
        return Math.max(...this.tableHeaders(columnWidths).map(({ headerHeight }) => headerHeight));
    }

    dataWithHeaders() {
        // const fulldata = [...this.data];

        // const headerRow = this.columns.reduce((acc, { columnId }) => {
        //     return { ...acc, [columnId]: columnId };
        // }, {});
        
        // fulldata.unshift(headerRow);

        // return fulldata;
    }


    tableColumnWidths() {
        //this should be the min column width by column
        const minColumnWidth = getMinColumnWidth(this.data, this.columns, this.cellFont, this.cellTextSize, this.headerFont, this.headerTextSize, this.additionalWrapCharacters);
        const tableWidth = this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
        const finalSizing = spaceColumns(minColumnWidth, this.columns, tableWidth);
        return finalSizing;
    };

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
    
    tableHeaders(columnWidths) {
        return this.columnIds.map((headerID) => {
            const col = this.columns.find(obj => obj.columnId === headerID)
            const headerValues = getWrapedText(this.headerFont, this.headerTextSize, columnWidths[headerID], col.header, this.additionalWrapCharacters);

            const header = {
                colID: headerID,
                //rowId: colIndex,
                //startingX: xCounter,
                font: this.headerFont,
                textHeight: this.headerTextSize,
                lineHeight: this.headerLineHeight,
                headerHeight: this.headerLineHeight * headerValues.length,
                values: [...headerValues]
            };
            return header;
        });
    }
    
    tableRows(columnWidths, testFont) {
        const data = this.data.map(row => {
            const longestItem = Object.keys(row).reduce((longest, col) => {
                const wrappedText = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters, testFont);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
            return {
                rowHeight: longestItem.length * this.cellLineHeight
            };
        });
        
        return data;
    }

    dataProcessor (columnWidths, testFont) {
        const rHeight = this.tableRows(columnWidths, testFont);
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

    async addFont() {
        console.log(await this.pdfDoc.embedStandardFont(StandardFonts.TimesRoman).widthOfTextAtSize('h', 8))
        return ;
    }
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

    drawRuler() {
        const loopLength = this.pdfPage.getWidth();
        for (let loop = 25; loop <= loopLength; loop += 25) {

            this.pdfPage.drawLine({
                start: { x: loop, y: 792 },
                end: { x: loop, y: 590},
                thickness: 1,
                color: rgb(.21, .24, .85),
                opacity: 1,
            });

            this.pdfPage.drawText(loop.toString(), {
                x: loop - 9,
                y: 580,
                size: 10,
                color: rgb(.21, .24, .85),
            });

        }

       const height = this.pdfPage.getHeight();
        for (let loop = 0; loop < height; loop += 25) {
    
            this.pdfPage.drawLine({
                start: { x: 0, y: loop },
                end: { x: 20, y: loop},
                thickness: 1,
                color: rgb(.21, .24, .85),
                opacity: 1,
            });
    
            this.pdfPage.drawText(loop.toString(), {
                x: 25,
                y: loop,
                size: 10,
                color: rgb(.21, .24, .85),
            });
        }
    }
}

export class Table {
    constructor(
        page,
        data,
        columns,
        columnWidths,
        //tABLE
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
        //ROW
        rowBackgroundColor,
        alternateRowColor,
        alternateCellColorValue,
        
        cellTextSize,
        cellHeight,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
        headerHeight,
        autoHeaderHeight,
    ){
        //super(page)
        this.page = page.page,
        this.pageWidth = page.page.getWidth()
        this.data = data,
        this.columns = columns,
        this.columnWidths = columnWidths,
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
        this.continuationFillerHeight = continuationFillerHeight,
        this.rowBackgroundColor = rowBackgroundColor,
        this.alternateRowColor = alternateRowColor,
        this.alternateCellColorValue = alternateCellColorValue
        this.cellTextSize = cellTextSize,
        this.cellHeight = cellHeight,
        this.cellLineHeight = cellLineHeight,
        this.cellTextColor = cellTextColor,
        this.additionalWrapCharacters = additionalWrapCharacters
        this.headerSectionHeight = headerHeight ? headerHeight : autoHeaderHeight
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
        return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
    }

    get tableHeight() {
        return this.maxTableWidth && this.maxTableWidth < (this.pageHeight - this.startingY) ? this.maxTableWidth : (this.pageWidth - this.startingX);
    }

    get docStartingY() {
        return this.startingY
    }

    get rows() {
        const rows = [];

        this.data.forEach(row => rows.push(new Row(this.page, row,  this.startingX, this.tableWidth, this.rowBackgroundColor, this.alternateRowColor, this.alternateCellColorValue, this.cellLineHeight)))
        
        return rows
    }
     
        

    getPageHeight() {
        return this.pageHeight;
    }
    
    getPageWidth() {
        return this.pageWidth;
    }

    // drawDividerX() {
    //     this.tablePage.drawLine({
    //         start: { x: this.startingX, y: this.startingY - this.tableHeight}, //- Math.max(headerHeight, headerFullTextHeight) },
    //         end: { x: this.startingX + this.tableWidth, y: this.startingY - this.tableHeight}, // - Math.max(headerHeight, headerFullTextHeight) },
    //         thickness: this.headerDividedXThickness,
    //         color: this.headerDividedXColor,
    //         opacity: 1,
    //     });
    // }
    
    drawDividerY() {
        console.log(this.startingY, this.additionalWrapCharacters);
        
        let counter = 0
        Object.keys(this.columnWidths).forEach((col, i) => {
            const dividerX = i == 0 ? this.columnWidths[col] : this.columnWidths[col] + counter;

            this.docPage.drawLine({
                start: { x: dividerX, y: this.startingY - this.headerSectionHeight},
                end: { x: dividerX, y: this.startingY - this.tableHeight}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this.dividedYThickness,
                color: this.dividedYColor,
                opacity: 0.75,
            });

            counter += this.columnWidths[col];
        })
    }
};

export class Header {
    constructor(
        page, 
        columns,
        headerData,
        columenIds, 
        headers,
        columnWidths, 
        startingX, 
        startingY,
        headerHeight,
        autoHeaderHeight,
        headerBackgroundColor,
        headerWrapText,
        headerFont,
        headerTextSize,
        headerLineHeight,
        headerTextColor,
        headerTextAlignment,
        headerTextJustification,
        headerDividedX,
        headerDividedY,
        headerDividedXColor,
        headerDividedYColor,
        headerDividedXThickness,
        headerDividedYThickness
    ){
        this.tablePage = page,
        this.columns = columns,
        this.headerData = headerData,
        this.columenIds = columenIds,
        this.headers = headers,
        this.columnWidths = columnWidths,
        this.startingX = startingX,
        this.startingY = startingY,
        this.headerSectionHeight = headerHeight ? headerHeight : autoHeaderHeight,
        //this.autoHeaderHeight = autoHeaderHeight,
        this.headerBackgroundColor = headerBackgroundColor,
        this.headerWrapText = headerWrapText,
        this.headerFont = headerFont,
        this.headerTextSize = headerTextSize,
        this.headerLineHeight = headerLineHeight,
        this.headerTextColor = headerTextColor,
        this.headerTextAlignment = headerTextAlignment,
        this.headerTextJustification = headerTextJustification,
        this.headerDividedX = headerDividedX,
        this.headerDividedY = headerDividedY,
        this.headerDividedXColor = headerDividedXColor,
        this.headerDividedYColor = headerDividedYColor,
        this.headerDividedXThickness = headerDividedXThickness,
        this.headerDividedYThickness = headerDividedYThickness
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

    drawHeader(tableWidth) {
        this.drawHeadings();
        this.drawFill(tableWidth);
        this.drawDividerX(tableWidth);
        this.drawDividerY();
    };

    drawHeadings() {
        let horizontalCursor = 0;
        this.headerData.forEach((header) => {
            const textHeight = header.values.length * this.headerLineHeight;
            
            const justification = this.headerTextJustification === 'center' ? 
            (this.headerSectionHeight - textHeight) / 2 :
            this.headerTextJustification === 'bottom' ? 
            this.headerSectionHeight - textHeight :
            0;

            header.values.forEach((textLines, i) => {
                
                const alignment = this.headerTextAlignment === 'center' ? 
                (this.columnWidths[header.colID] - getTextWidth(this.headerFont, this.headerTextSize, textLines)) / 2 : 
                this.headerTextAlignment === 'right' ?  this.columnWidths[header.colID] - getTextWidth(this.headerFont, this.headerTextSize, textLines) : 
                0

                this.tablePage.drawText(textLines, {
                    x: this.startingX + alignment + horizontalCursor,
                    y: this.startingY - justification - this.headerLineHeight - (this.headerLineHeight * i),
                    size: this.headerTextSize,
                    font: this.headerFont,
                    color: this.headerTextColor,
                    lineHeight: this.headerLineHeight
                });
            })
            horizontalCursor += this.columnWidths[header.colID];
        });
    }

    drawFill(tableWidth) {
        this.tablePage.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.headerSectionHeight, //Math.max(headerHeight, headerFullTextHeight),
            width: tableWidth,
            height: this.headerSectionHeight, //Math.max(headerHeight, headerFullTextHeight),
            borderWidth: 0,
            color: this.headerBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX(tableWidth) {
        this.tablePage.drawLine({
            start: { x: this.startingX, y: this.startingY - this.headerSectionHeight}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this.startingX + tableWidth, y: this.startingY - this.headerSectionHeight}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this.headerDividedXThickness,
            color: this.headerDividedXColor,
            opacity: 1,
        });
    }
    
    drawDividerY() {
        let counter = 0
        Object.keys(this.columnWidths).forEach((col, i) => {
            const dividerX = i == 0 ? this.columnWidths[col] : this.columnWidths[col] + counter;

            this.tablePage.drawLine({
                start: { x: dividerX, y: this.startingY },
                end: { x: dividerX, y: this.startingY - this.headerSectionHeight}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this.headerDividedYThickness,
                color: this.headerDividedYColor,
                opacity: 0.75,
            });

            counter += this.columnWidths[col];
        })
    }

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
        rowData,
        startingX,
        tableWidth,
        rowBackgroundColor, 
        alternateRowColor,
        alternateCellColorValue,
        cellLineHeight
    ){  
        this.page = page,
        this.rowData = rowData
        this.startingX = startingX,
        this.tableWidth = tableWidth,
        this.rowBackgroundColor = rowBackgroundColor,
        this.alternateRowColor = alternateRowColor,
        this.alternateCellColorValue = alternateCellColorValue
        this.height = rowData[0].rowHeight,
        this.startingY = rowData[0].startingY,
        this.cellLineHeight = cellLineHeight
    }

    get cells() {
        const cells = [];
        this.rowData.forEach(cell => cells.push(new Cell(cell)))
        
        return cells
    }

    drawRowBackground(index) {

        this.page.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.height + this.cellLineHeight -1.25,
            width: this.tableWidth,
            height: this.height,
            borderWidth: 0,
            color: index % 2 !== 0 &&  this.alternateRowColor ? this.alternateCellColorValue : this.rowBackgroundColor,
            opacity: 0.25
        });


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
        this.drawCellText(page);
    }
    
    
    drawCellText(page) {

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