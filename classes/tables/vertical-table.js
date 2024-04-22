import { processData, calcColumnHeaderWidths, calcHeaderHeight } from "../../functions/newLib/dataProcessing";
import {calcColumnWidths} from '../../functions/newLib/columnWidthStrtegies'

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
        this._rows = [],
        this.init()
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

    get data () {
        return this._finalData;
    }
    
    init() {
        const columnHeaderWidths = this.getColumnHeaderWidths() 
        this.getColumnDimension(columnHeaderWidths);
    }
    

    getColumnHeaderWidths() {
        const columnHeaderWidths = processData(this._columns, this._options);
        return columnHeaderWidths;
    }
    
    // getHeaderHeight() {
    //     console.log(this._columns, this._columnDimensions);
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
        // Draw the header
        this.drawBoarder();
        this._header.drawHeader()

        //Draw Rows
        let rowY = this._startingY - this._header.height;
        const numberOfRows = this._rows.length;
        this._rows.map((row, index) => {
            const isLast = numberOfRows === index + 1;
            const currentRow = row.drawRow(rowY, index, isLast);
            rowY -= currentRow.height
        })
    }
    
    drawBoarder() {
        this._page.page.drawRectangle({
            x: this._startingX - (this._tableBoarderThickness / 2),
            y: this._startingY - this._tableHeight - this._header.height + (this._tableBoarderThickness / 2),
            width: this._maxTableWidth + this._tableBoarderThickness,
            height: this._tableHeight + this._header.height,
            borderWidth: this._tableBoarderThickness,
            borderColor: this._tableBoarderColor,
            opacity: 0,
            borderOpacity: 1,
        })
    }
};
