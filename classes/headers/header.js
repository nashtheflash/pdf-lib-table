export class Header {
    constructor(
        page, 
        columns,
        headers,
        columnWidths,
        {
            headerBackgroundColor = undefined,
            headerWrapText = true,
            headerFont = undefined,
            headerTextSize = 12,
            headerLineHeight = 12,
            headerTextColor = undefined,
            headerTextAlignment = 'left',
            headerTextJustification = 'center',
            headerDividedX = true,
            headerDividedY = true,
            headerDividedXColor = undefined,
            headerDividedYColor = undefined,
            headerDividedXThickness = 1,
            headerDividedYThickness = 1
        } ={}
    ){
        this._page = page,
        this._columns = columns,
        this._columnWidths = columnWidths,
        this._headers = headers,
        this._headerBackgroundColor = headerBackgroundColor,
        this._headerWrapText = headerWrapText,
        this._headerFont = headerFont,
        this._headerTextSize = headerTextSize,
        this._headerLineHeight = headerLineHeight,
        this._headerTextColor = headerTextColor,
        this._headerTextAlignment = headerTextAlignment,
        this._headerTextJustification = headerTextJustification,
        this._headerDividedX = headerDividedX,
        this._headerDividedY = headerDividedY,
        this._headerDividedXColor = headerDividedXColor,
        this._headerDividedYColor = headerDividedYColor,
        this._headerDividedXThickness = headerDividedXThickness,
        this._headerDividedYThickness = headerDividedYThickness
    }

    drawHeader(tableWidth) {
        this.drawHeadings();
        this.drawFill(tableWidth);
        if(this._headerDividedX) this.drawDividerX(tableWidth);
        if(this._headerDividedY) this.drawDividerY();
    };

    drawHeadings() {
        let horizontalCursor = 0;
        this.headerData.forEach((header) => {
            const textHeight = header.values.length * this._headerLineHeight;
            
            const justification = this._headerTextJustification === 'center' ? 
            (this._headerSectionHeight - textHeight) / 2 :
            this._headerTextJustification === 'bottom' ? 
            this._headerSectionHeight - textHeight :
            0;

            header.values.forEach((textLines, i) => {
                
                const alignment = this._headerTextAlignment === 'center' ? 
                (this._columnWidths[header.colID] - getTextWidth(this._headerFont, this._headerTextSize, textLines)) / 2 : 
                this._headerTextAlignment === 'right' ?  this._columnWidths[header.colID] - getTextWidth(this._headerFont, this._headerTextSize, textLines) : 
                0

                this.tablePage.drawText(textLines, {
                    x: this._startingX + alignment + horizontalCursor,
                    y: this._startingY - justification - this._headerLineHeight - (this._headerLineHeight * i),
                    size: this._headerTextSize,
                    font: this._headerFont,
                    color: this._headerTextColor,
                    lineHeight: this._headerLineHeight
                });
            })
            horizontalCursor += this._columnWidths[header.colID];
        });
    }

    drawFill(tableWidth) {
        this.tablePage.drawRectangle({
            x: this._startingX,
            y: this._startingY - this._headerSectionHeight, //Math.max(headerHeight, headerFullTextHeight),
            width: tableWidth,
            height: this._headerSectionHeight, //Math.max(headerHeight, headerFullTextHeight),
            borderWidth: 0,
            color: this._headerBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX(tableWidth) {
        this.tablePage.drawLine({
            start: { x: this._startingX, y: this._startingY - this._headerSectionHeight}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + tableWidth, y: this._startingY - this._headerSectionHeight}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._headerDividedXThickness,
            color: this._headerDividedXColor,
            opacity: 1,
        });
    }
    
    drawDividerY() {
        let counter = 0
        Object.keys(this._columnWidths).forEach((col, i) => {
            const dividerX = i == 0 ? this._columnWidths[col] : this._columnWidths[col] + counter;

            this.tablePage.drawLine({
                start: { x: this._startingX + dividerX, y: this._startingY },
                end: { x: this._startingX + dividerX, y: this._startingY - this._headerSectionHeight}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this._headerDividedYThickness,
                color: this._headerDividedYColor,
                opacity: 0.75,
            });

            counter += this._columnWidths[col];
        })
    }

};