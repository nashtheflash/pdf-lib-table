import { calcColumnWidths, calcColumnHeaderWidths, calcHeaderHeight } from "../../functions/newLib/dataProcessing";

export class VerticalTable {
    constructor(
        //REQUIRED
        data,
        columns,
        page,
        options,
        //TABLE
        {
            startingX = 0,
            startingY = 0,
            dividedX = true,
            dividedY = true,
            dividedXColor = undefined,
            dividedYColor = undefined,
            dividedXThickness = 1,
            dividedYThickness = 1,
            maxTableWidth = undefined,
            maxTableHeight = undefined,
            rowHeightSizing = 'auto',
            tableBoarder = true,
            tableBoarderThickness = 1,
            tableBoarderColor = undefined,
            continuationFillerHeight = undefined
        } = {}
    ){
        //REQUIRED
        // this._page = page,
        this._data = data,
        this._columns = columns,
        this._options = options,
        this._page = page,
        //TABLE
        this._startingX = startingX,
        this._startingY = startingY,
        this._dividedX = dividedX,
        this._dividedY = dividedY,
        this._dividedXColor = dividedXColor,
        this._dividedYColor = dividedYColor,
        this._dividedXThickness = dividedXThickness,
        this._dividedYThickness = dividedYThickness,
        this._maxTableWidth = maxTableWidth,
        this._maxTableHeight = page.height - (page.height - startingY) - continuationFillerHeight,
        this._tableBoarder = tableBoarder,
        this._tableBoarderThickness = tableBoarderThickness,
        this._tableBoarderColor = tableBoarderColor,
        this._columnDimensions,
        this._columnHeaderHeight,
        this._tableHeight,
        this._finalData,
        this._remainingData,
        this._header,
        this._rows = []
    }
    
    setPage(page) {
        this._page = page;
        // this._maxTableWidth = this._page.width - this._startingX;
        // this._maxTableHeight = this._page.height - (this._page.height - this._startingY);
    }

    addRow(row) {
        this._rows.push(row)
    }

    addHeader(header) {
        this._header = header;
    }

    // setStartingX(startingX) {
    //     this._startingX = startingX;
    // }
    
    // setStartingY(startingY) {
    //     this._startingY = startingY;
    // }
    
    // setMaxTableWidth(maxTableWidth) {
    //     this._maxTableWidth = maxTableWidth;
    // }
    
    // setMaxTableHeight(maxTableHeight) {
    //     this._maxTableHeight = maxTableHeight;
    // }
    
    // setDividedX(dividedX) {
    //     this._dividedX = dividedX;
    // }
    
    // setDividedXColor(dividedXColor) {
    //     this._dividedXColor = dividedXColor;
    // }
    
    // setDividedXThickness(dividedXThickness) {
    //     this._dividedXThickness = dividedXThickness;
    // }
   
    // setDividedY(dividedY) {
    //     this._dividedY = dividedY;
    // }

    // setDividedYColor(dividedYColor) {
    //     this._dividedYColor = dividedYColor;
    // }
    
    // setDividedYThickness(dividedYThickness) {
    //     this._dividedYThickness = dividedYThickness;
    // }

    // setTableBoarder(tableBoarder) {
    //     this._tableBoarder = tableBoarder
    // }
    
    // setTableBoarderTickness(tableBoarderThickness) {
    //     this._tableBoarderThickness = tableBoarderThickness;
    // }
    
    // setTableBoarderColor(tableBoarderColor) {
    //     this._tableBoarderColor = tableBoarderColor;
    // }

    get width() {
        return this._maxTableWidth;
    }
    
    get startingX() {
        return this._startingX;
    }

    get tableHeight() {
        //return this.maxTableWidth && this.currentTableHeight + this.headerSectionHeight //- this.continuationFillerHeight;
    }

    get remainingTableSpace() {
        //return this.pageHeight - ( this.pageHeight - this.startingY) - (this.currentTableHeight + this.headerSectionHeight)
    }

    get rows() {
        return this._rows
    }
    
    get columnDimensions() {
        return this._columnDimensions;
    }
    
    get remainingData() {
        return this._remainingData
    }
    
    getData() {
        const columnHeaderWidths = this.getColumnHeaderWidths() 
        this.getColumnDimension(columnHeaderWidths);
        // this.getColumnHeaderHeights();

        return this._finalData;
    }
    

    getColumnHeaderWidths() {
        const columnHeaderWidths = calcColumnHeaderWidths(this._columns, this._options);
        return columnHeaderWidths;
    }
    
    // getColumnHeaderHeights() {
    //     this._columnHeaderHeight = calcHeaderHeight(this._columns, this._columnDimensions, this._options);
    // }

    getColumnDimension(columnHeaderWidths) {
        const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = calcColumnWidths(this._data, columnHeaderWidths, this._maxTableHeight, this._options);
        
        this._columnDimensions = finalColumnDimensions;
        this._tableHeight = tableHeight;
        this._finalData = wrappedTableData;
        this._remainingData = remainingData;
    }

    drawTable() {
        // console.log('drawing Table')
        this.drawBoarder();
        this._header.drawHeader()
    }
    
    drawBoarder() {

        this._page.page.drawRectangle({
            x: this._startingX - (this._tableBoarderThickness / 2),
            y: this._startingY - this._maxTableHeight + (this._tableBoarderThickness / 2),
            width: this._maxTableWidth + this._tableBoarderThickness,
            height: this._maxTableHeight,
            borderWidth: this._tableBoarderThickness,
            borderColor: this._tableBoarderColor,
            opacity: 0,
            borderOpacity: 1,
        })
    }
};