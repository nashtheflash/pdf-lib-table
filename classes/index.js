import { tableColumnWidths } from "../functions/lib";


export class Document {
    constructor
    (
        page,
        pdfDoc,
        StandardFonts,
    ){
        this.page = page,
        this.pdfDoc = pdfDoc,
        this.pages = [page],
        this.StandardFonts = StandardFonts
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

    addPage(pageDimensions) {
        this.pages.push(this.pdfDoc.addPage(pageDimensions));
    }

    async addFont(font) {
        await this.pdfDoc.embedFont(this.StandardFonts[font])
    }
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

    get columnInfo() {
        return this.columns
    }

    get columnIds() {
        return this.columns.map(({ columnId }) => columnId)
    }
    
    get tableWidth() {
        return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - startingX) ? this.maxTableWidth : (this.pageWidth - startingX);
    }
        

    getPageHeight() {
        return this.pageHeight;
    }
    
    getPageWidth() {
        return this.pageWidth;
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
    constructor(id, values){
        this.id = id
        this.values = values
    }

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