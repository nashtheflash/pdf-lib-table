import {spaceColumns, getMinColumnWidth, getWrapedText, getTextWidth } from "../functions/lib";

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
        pageDimensions,
        continuationFillerHeight,
        subheadingColumns
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
        this.pageDimensions = pageDimensions,
        this.continuationFillerHeight = continuationFillerHeight,
        this.subheadingColumns = subheadingColumns
    }

    getData() {
        return this.data.map((rowItem) => {
            if(!rowItem.subheading) return {...rowItem, tableRowType: 'row'};
            if(rowItem.subheading) {
                
                const row = {...rowItem.subheading, tableRowType: 'subheading'};
                
                Object.keys(row).map((key) => {
                    if(key === 'tableRowType') return;
                    
                    const parent = this.subheadingColumns.find(({ columnId }) => columnId == key).parentId;
                    //console.log(parent)
                    row[parent] = row[key];
                    delete row[key];
                });
                
                let rowTemplate;
                this.columnIds.forEach((id) => rowTemplate = {...rowTemplate, [id] : ''});
                
                return {...rowTemplate, ...row};
            }
        })
    }

    tableHeader(columnWidths) {
        if(this.headerHeight) return this.headerHeight;        
        return Math.max(...this.tableHeaders(columnWidths).map(({ headerHeight }) => headerHeight));
    }

    tableColumnWidths(startingX) {
        //this should be the min column width by column
        const minColumnWidth = getMinColumnWidth(this.getData(), this.columns, this.cellFont, this.cellTextSize, this.headerFont, this.headerTextSize, this.additionalWrapCharacters);
        const tableWidth = this.maxTableWidth && this.maxTableWidth < (this.pageWidth - startingX) ? this.maxTableWidth : (this.pageWidth - startingX);
        const finalSizing = spaceColumns(minColumnWidth, this.columns, tableWidth);
        return finalSizing;
    };

    tableCells(columnWidths, loop){
    
        return this.getData().map((row, rowIndex) => {
            //console.log('this.getData', this.getData())
            let xCounter = loop === 0 ? this.startingX : this.appendedPageStartX;
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
    
    tableRows(columnWidths) {
        //console.log('this.data', this.data)
        const rowdata = this.getData().map(row => {
            const longestItem = Object.keys(row).reduce((longest, col) => {
                const wrappedText = getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
            return {
                rowHeight: longestItem.length * this.cellLineHeight
            };
        });
        
        return rowdata;
    }

    dataProcessor (columnWidths, loop) {
        const rHeight = this.tableRows(columnWidths);
        const rowDetail = [...this.tableCells(columnWidths, loop)];
        const tableHeaderHeight = this.tableHeader(columnWidths);

        // console.log(rowDetail);

        const startingY = loop === 0 ? this.startingY : this.appendedPageStartY;
        
        const modifiedRows = rowDetail.map((row, index) => {
            return row.map(c => {
                return {...c, rowHeight: rHeight[c.rowId].rowHeight}
            })
        });

        let counter = 0;
        let pageCount = 0;

        modifiedRows.forEach((row, i) => {
            const curentRowHeight = row[0].rowHeight;
            
            if (pageCount !== 0 && counter + tableHeaderHeight + curentRowHeight > this.pageDimensions[1] - this.continuationFillerHeight) {
                pageCount++;
                counter = 0;
            };
            
            if (pageCount === 0 && counter + tableHeaderHeight + curentRowHeight > startingY - this.continuationFillerHeight) {
                pageCount++;
                counter = 0;
            };
            
            if(pageCount > loop) return;

            // console.log(row)
            const rowType = row.find(({ colID }) => colID == "tableRowType").values.join('');
            const rowFiltered = row.filter(({ colID }) => colID !== "tableRowType");

            const mod = rowFiltered.map(cell => ({
                ...cell,
                page: pageCount,
                startingY: (startingY - tableHeaderHeight) - this.cellLineHeight - counter
            }));

            // console.log({values: mod, type: rowType})

            modifiedRows[i] = {values: mod, type: rowType};
            // modifiedRows[i] = mod;
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

    get documentPages() {
        return this.pages;
    }

    addPage() {
        const pg = new Page(this.pdfDoc.addPage(this.pageDimensions, this.pageDimensions, 'app'))
        this.pages.push(pg);
        return pg;
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
}

export class Table {
    constructor(
        page,
        data,
        columns,
        columnWidths,
        //TABLE
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
        //customContinuesOnNextPage,
        //continuationFiller=(page, x, y, font) => continuationSection(page, x, y, font),
        continuationFillerHeight,
        //ROW
        rowBackgroundColor,
        alternateRowColor,
        alternateRowColorValue,
        //CELL
        cellFont,
        cellTextSize,
        cellHeight,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
        headerHeight,
        autoHeaderHeight,
        tableHeight,
        //HEADER
        headerFont,
        headerTextSize,
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
    ){
        //super(page)
        this.page = page.page,
        this.pageWidth = page.page.getWidth()
        this.pageHeight = page.page.getHeight()
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
        //this.customContinuesOnNextPage = customContinuesOnNextPage,
        //this.continuationFiller = (page, x, y, font) => continuationSection(page, x, y, font),
        this.continuationFillerHeight = continuationFillerHeight,
        this.rowBackgroundColor = rowBackgroundColor,
        this.alternateRowColor = alternateRowColor,
        this.alternateRowColorValue = alternateRowColorValue

        this.cellFont = cellFont,
        this.cellTextSize = cellTextSize,
        this.cellHeight = cellHeight,
        this.cellLineHeight = cellLineHeight,
        this.cellTextColor = cellTextColor,
        this.additionalWrapCharacters = additionalWrapCharacters
        this.headerSectionHeight = headerHeight ? headerHeight : autoHeaderHeight
        this.currentTableHeight = tableHeight,
        //HEADER
        this.headerFont = headerFont,
        this.headerTextSize = headerTextSize,
        //SUBHEADERS
        this.subheadingColumns = subheadingColumns,
        this.subHeadingBackgroundColor = subHeadingBackgroundColor,
        this.subHeadingHeight = subHeadingHeight,
        this.subHeadingFont = subHeadingFont,
        this.subHeadingTextColor = subHeadingTextColor,
        this.subHeadingTextSize = subHeadingTextSize,
        this.subHeadingLineHeight = subHeadingLineHeight,
        this.subHeadingDividedX = subHeadingDividedX,
        this.subHeadingDividedXThickness = subHeadingDividedXThickness,
        this.subHeadingDividedXColor = subHeadingDividedXColor,
        this.subHeadingDividedY = subHeadingDividedY,
        this.subHeadingDividedYThickness = subHeadingDividedYThickness,
        this.subHeadingDividedYColor = subHeadingDividedYColor
    }

    get docPage() {
        return this.page
    }
    
    get tableWidth() {
        return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
    }

    get tableHeight() {
        return this.maxTableWidth && this.currentTableHeight + this.headerSectionHeight //- this.continuationFillerHeight;
    }

    get remainingTableSpace() {
        return this.pageHeight - ( this.pageHeight - this.startingY) - (this.currentTableHeight + this.headerSectionHeight)
    }

    get rows() {
        const rows = [];

        // console.log(this.data);

        this.data.forEach(row => {
                //console.log(row)
                let newRow;

                if(row.type === 'row') {
                    newRow = new Row(
                        this.page, 
                        row.values,
                        row.type,
                        this.startingX,
                        this.dividedXThickness,
                        this.dividedXColor,
                        this.tableWidth, 
                        this.rowBackgroundColor, 
                        this.alternateRowColor, 
                        this.alternateRowColorValue, 
                        //Cell
                        this.cellFont,
                        this.cellTextColor,
                        this.cellTextSize,
                        this.cellLineHeight,
                        this.dividedYThickness,
                        this.dividedYColor
                    )
                }

                if(row.type === 'subheading') {
                    newRow = new SubheaderRow(
                        this.page, 
                        row.values,
                        row.type,
                        this.startingX,
                        this.dividedXThickness,
                        this.dividedXColor,
                        this.tableWidth, 
                        this.rowBackgroundColor, 
                        this.alternateRowColor, 
                        this.alternateRowColorValue, 
                        //Cell
                        this.cellFont,
                        this.cellTextColor,
                        this.cellTextSize,
                        this.cellLineHeight,
                        this.dividedYThickness,
                        this.dividedYColor,
                        //Subheading
                        this.subheadingColumns,
                        this.subHeadingBackgroundColor,
                        this.subHeadingHeight,
                        this.subHeadingFont,
                        this.subHeadingTextColor,
                        this.subHeadingTextSize,
                        this.subHeadingLineHeight,
                        this.subHeadingDividedX,
                        this.subHeadingDividedXThickness,
                        this.subHeadingDividedXColor,
                        this.subHeadingDividedY,
                        this.subHeadingDividedYThickness,
                        this.subHeadingDividedYColor,
                    )
                }
                
                
                rows.push(newRow)
            }
        )
        
        return rows
    }
    
    drawBoarder() {
        this.docPage.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.tableHeight,
            width: this.tableWidth,
            height: this.tableHeight + this.tableBoarderThickness,
            borderWidth: this.tableBoarderThickness,
            borderColor: this.tableBoarderColor,
            opacity: 1,
            borderOpacity: 1,
        })
    };
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

    drawHeader(tableWidth) {
        this.drawHeadings();
        this.drawFill(tableWidth);
        if(this.headerDividedX) this.drawDividerX(tableWidth);
        if(this.headerDividedY) this.drawDividerY();
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
                start: { x: this.startingX + dividerX, y: this.startingY },
                end: { x: this.startingX + dividerX, y: this.startingY - this.headerSectionHeight}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this.headerDividedYThickness,
                color: this.headerDividedYColor,
                opacity: 0.75,
            });

            counter += this.columnWidths[col];
        })
    }

};

export class Row {
    constructor(
        page,
        rowData,
        type,
        startingX,
        dividedXThickness,
        dividedXColor,
        tableWidth,
        rowBackgroundColor, 
        alternateRowColor,
        alternateRowColorValue,
        //Cell
        cellFont,
        cellTextColor,
        cellTextSize,
        cellLineHeight
    ){  
        this.page = page,
        this.rowData = rowData
        this._type = type,
        this.startingX = startingX,
        this.dividedXThickness = dividedXThickness,
        this.dividedXColor = dividedXColor,
        this.tableWidth = tableWidth,
        this.rowBackgroundColor = rowBackgroundColor,
        this.alternateRowColor = alternateRowColor,
        this.alternateRowColorValue = alternateRowColorValue
        this.height = rowData[0].rowHeight,
        this.startingY = rowData[0].startingY,
        //Cell
        this.cellFont = cellFont,
        this.cellTextColor = cellTextColor,
        this.cellTextSize = cellTextSize,
        this.cellLineHeight = cellLineHeight
    }

    get type() {
        return this._type;
    }

    get cells() {
        const cells = [];
        this.rowData.forEach(cell => cells.push(
                new Cell(
                    cell,
                    this._type,
                    this.cellFont,
                    this.cellTextColor,
                    this.cellTextSize,
                    this.cellLineHeight,
                    this.dividedYThickness,
                    this.dividedYColor,
                    this.height,
                )
            )
        )
        
        return cells
    }

    drawRowBackground(index) {
        this.page.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.height + this.cellLineHeight - 1.25,
            width: this.tableWidth,
            height: this.height,
            borderWidth: 0,
            color: index % 2 !== 0 && this.alternateRowColor ? this.alternateRowColorValue : this.rowBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX() {
        this.page.drawLine({
            start: { x: this.startingX, y: this.startingY - this.height + this.cellLineHeight - 1.25}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this.startingX + this.tableWidth, y: this.startingY - this.height + this.cellLineHeight - 1.25}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this.dividedXThickness,
            color: this.dividedXColor,
            opacity: 1,
        });
    }

    

}

export class SubheaderRow {
    constructor(
        page, 
        rowData,
        type,
        startingX,
        dividedXThickness,
        dividedXColor,
        tableWidth, 
        rowBackgroundColor, 
        alternateRowColor, 
        alternateRowColorValue, 
        //Cell
        cellFont,
        cellTextColor,
        cellTextSize,
        cellLineHeight,
        dividedYThickness,
        dividedYColor,
        //Subheading
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
    ){  
        this.page = page,
        this.rowData = rowData
        this._type = type,
        this.startingX = startingX,
        this.dividedXThickness = dividedXThickness,
        this.dividedXColor = dividedXColor,
        this.tableWidth = tableWidth,
        this.rowBackgroundColor = rowBackgroundColor,
        this.alternateRowColor = alternateRowColor,
        this.alternateRowColorValue = alternateRowColorValue
        this.height = rowData[0].rowHeight,
        this.startingY = rowData[0].startingY,
        //Cell
        this.cellFont = cellFont,
        this.cellTextColor = cellTextColor,
        this.cellTextSize = cellTextSize,
        this.cellLineHeight = cellLineHeight,
        this.dividedYThickness = dividedYThickness,
        this.dividedYColor = dividedYColor,
        //Subheading
        this.subheadingColumns = subheadingColumns,
        this.subHeadingBackgroundColor = subHeadingBackgroundColor,
        this.subHeadingHeight = subHeadingHeight,
        this.subHeadingFont = subHeadingFont,
        this.subHeadingTextColor = subHeadingTextColor,
        this.subHeadingTextSize = subHeadingTextSize,
        this.subHeadingLineHeight = subHeadingLineHeight,
        this.subHeadingDividedX = subHeadingDividedX,
        this.subHeadingDividedXThickness = subHeadingDividedXThickness,
        this.subHeadingDividedXColor = subHeadingDividedXColor,
        this.subHeadingDividedY = subHeadingDividedY,
        this.subHeadingDividedYThickness = subHeadingDividedYThickness,
        this.subHeadingDividedYColor = subHeadingDividedYColor
    }

    get type() {
        return this._type;
    }

    get cells() {
        const cells = [];
        this.rowData.forEach(cell => cells.push(
                new SubheaderCell(
                    cell,
                    this._type,
                    this.cellFont,
                    this.cellTextColor,
                    this.cellTextSize,
                    this.cellLineHeight,
                    this.dividedYThickness,
                    this.dividedYColor,
                    this.height,
                    //Subheading
                    this.subheadingColumns,
                    this.subHeadingBackgroundColor,
                    this.subHeadingHeight,
                    this.subHeadingFont,
                    this.subHeadingTextColor,
                    this.subHeadingTextSize,
                    this.subHeadingLineHeight,
                    this.subHeadingDividedX,
                    this.subHeadingDividedXThickness,
                    this.subHeadingDividedXColor,
                    this.subHeadingDividedY,
                    this.subHeadingDividedYThickness,
                    this.subHeadingDividedYColor,
                )
            )
        )
        
        return cells
    }

    drawRowBackground() {
        this.page.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.height + this.subHeadingLineHeight - 1.25,
            width: this.tableWidth,
            height: this.height,
            borderWidth: 0,
            color: this.subHeadingBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX() {
        this.page.drawLine({
            start: { x: this.startingX, y: this.startingY - this.height + this.subHeadingLineHeight - 1.25}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this.startingX + this.tableWidth, y: this.startingY - this.height + this.subHeadingLineHeight - 1.25}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this.subHeadingDividedXThickness,
            color: this.subHeadingDividedXColor,
            opacity: 1,
        });
    }
}

export class Cell {
    constructor(
        celldata,
        celltype,
        cellFont,
        cellTextColor,
        cellTextSize,
        cellLineHeight,
        dividedYThickness,
        dividedYColor,
        rowHeight,
    ){
        this.data = celldata,
        this.celltype = celltype,
        this.cellFont = cellFont,
        this.cellTextColor = cellTextColor,
        this.cellTextSize = cellTextSize,
        this.cellLineHeight = cellLineHeight,
        this.dividedYThickness = dividedYThickness,
        this.dividedYColor = dividedYColor,
        this.rowHeight = rowHeight
    }

    drawCell(page, dividedY) {
        this.drawCellText(page);
        if(dividedY) this.drawDividerY(page);
    }

    drawCellText(page) {

        const {values, startingX, startingY} = this.data;

        values.forEach((text, i) => {
            page.page.drawText(text, {
                x: startingX,
                y: startingY - (this.cellLineHeight * i),
                font: this.cellFont,
                size: this.cellTextSize,
                lineHeight: this.cellLineHeight,
                color: this.cellTextColor
            });
        })
    }

    drawDividerY(page) {
        const { startingX, startingY} = this.data;
        
        page.page.drawLine({
            start: { x: startingX, y: startingY + this.cellLineHeight},
            end: { x: startingX, y: startingY - this.rowHeight + this.cellLineHeight},
            thickness: this.dividedYThickness,
            color: this.dividedYColor,
            opacity: 0.75,
        }); 
    }
}

export class SubheaderCell {
    constructor(
        celldata,
        celltype,
        cellFont,
        cellTextColor,
        cellTextSize,
        cellLineHeight,
        dividedYThickness,
        dividedYColor,
        rowHeight,
        //Subheading
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
        subHeadingDividedYColor
    ){
        this.data = celldata,
        this.celltype = celltype,
        this.cellFont = cellFont,
        this.cellTextColor = cellTextColor,
        this.cellTextSize = cellTextSize,
        this.cellLineHeight = cellLineHeight,
        this.dividedYThickness = dividedYThickness,
        this.dividedYColor = dividedYColor,
        this.rowHeight = rowHeight
        //Subheading
        this.subheadingColumns = subheadingColumns,
        this.subHeadingBackgroundColor = subHeadingBackgroundColor,
        this.subHeadingHeight = subHeadingHeight,
        this.subHeadingFont = subHeadingFont,
        this.subHeadingTextColor = subHeadingTextColor,
        this.subHeadingTextSize = subHeadingTextSize,
        this.subHeadingLineHeight = subHeadingLineHeight,
        this.subHeadingDividedX = subHeadingDividedX,
        this.subHeadingDividedXThickness = subHeadingDividedXThickness,
        this.subHeadingDividedXColor = subHeadingDividedXColor,
        this.subHeadingDividedY = subHeadingDividedY,
        this.subHeadingDividedYThickness = subHeadingDividedYThickness,
        this.subHeadingDividedYColor = subHeadingDividedYColor
    }

    drawCell(page, dividedY) {
        this.drawCellText(page);
        if(dividedY) this.drawDividerY(page);
    }

    drawCellText(page) {

        const {values, startingX, startingY} = this.data;

        values.forEach((text, i) => {
            page.page.drawText(text, {
                x: startingX,
                y: startingY - (this.subHeadingLineHeight * i),
                font: this.subHeadingFont,
                size: this.subHeadingTextSize,
                lineHeight: this.subHeadingLineHeight, //TODO: add this
                color: this.subHeadingTextColor
            });
        })
    }

    drawDividerY(page) { //TODO: add this
        const { startingX, startingY} = this.data;
        
        page.page.drawLine({
            start: { x: startingX, y: startingY + this.subHeadingLineHeight},
            end: { x: startingX, y: startingY - this.rowHeight + this.subHeadingLineHeight},
            thickness: this.subHeadingDividedYThickness, //TODO: add this
            color: this.subHeadingDividedYColor, //TODO: add this
            opacity: 0.75,
        }); 
    }
}
