export const drawTableBoarder = ({ 
    page, 
    startingX, 
    startingY, 
    availableTableHeight, 
    headerHeight, 
    availableTableWidth, 
    tableBoarderThickness, 
    tableBoarderColor 
}) => {
    page.drawRectangle({
        x: startingX,
        y: startingY - availableTableHeight,
        width: availableTableWidth,
        height: availableTableHeight,
        borderWidth: tableBoarderThickness,
        borderColor: tableBoarderColor,
        opacity: 1,
        borderOpacity: 1,
    })
}