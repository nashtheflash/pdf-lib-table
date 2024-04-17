export class Page {
    constructor(
        page, 
        {
            dimensions = [612, 792]
        } ={}
    )
    {
        this._page = page,
        this._dimensions = dimensions
    }
    
    setPage(page) {
        this._page = page
    }
    
    setDimensions(page) {
        this._page = page
    }

    get page() {
        return this._page
    }
    
    get page() {
        return this._dimensions
    }
}

