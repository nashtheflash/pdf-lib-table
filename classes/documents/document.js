export class Document {
    constructor
    (
        initialPages,
        pdfDoc,
        fonts,
        pageDimensions,
    ){
        this._initialPages = initialPages,
        this._pdfDoc = pdfDoc,
        this._pages = [new Page(page)],
        this._fonts = fonts
        this._apendedPageDimensions = pageDimensions
    }

    get pages() {
        return this._pages;
    }
    
    get document() {
        return this._pages;
    }

    addPage() {
        const pg = new Page(this.pdfDoc.addPage(this.pageDimensions, this.pageDimensions, 'app'))
        this.pages.push(pg);
        return pg;
    }
}