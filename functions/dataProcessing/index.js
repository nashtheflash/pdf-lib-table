import { getTextWidth } from "../lib";

export const getColumnIds = (columns) => {
    const extractedColumnIds = columns.reduce((acc, curr) => {
      if (curr.columnId) {
        acc.push(curr.columnId);
      }
      return acc;
    }, []);
  
    return extractedColumnIds;
}

export const getColumnManualWidths = (columns) => {
    const extractedWidths = columns.reduce((acc, curr) => {
      if (curr.width) {
        acc = {...acc, [curr.columnId]: curr.width}
      }
      return acc;
    }, []);
  
    return extractedWidths;
}

// export const getColumnTextWrap = (columns) => {
//     const extractedWidths = columns.reduce((acc, curr) => {
//       if (curr.width) {
//         acc = {...acc, [curr.columnId]: curr.wrapText}
//       }
//       return acc;
//     }, []);
  
//     return extractedWidths;
// }

export const getLongestColumnItem = (rows, cellFont, cellTextSize) => {  
    const columnItemLength = rows.map((obj) => {
      let newRow = {};
      
      Object.keys(obj).forEach(function(key, index) {
        newRow[key] = getTextWidth(cellFont, cellTextSize, obj[key]?.toString());
      });
  
      return newRow;
    });
  
    const maxValues = columnItemLength.reduce((acc, obj) => {
      // Iterate through each key in the current object
      Object.keys(obj).forEach(key => {
        // If the key is not already in acc or the current value is greater than the stored maximum value, update acc
        if (!(key in acc) || obj[key] > acc[key]) {
          acc[key] = obj[key];
        }
      });
      return acc;
    }, {});
  
    return maxValues;
};

export const getHeaderItemLengths = (headers, headerFont, headerTextSize) => {
    let headerLength = {};

    headers.forEach((header) => {
        headerLength = { ...headerLength, [header.columnId]: getTextWidth(headerFont, headerTextSize, header.header)}
    })
    
    return headerLength
};

export const getColumnWidths = ({
    page, 
    columnIds,
    pageHeight,
    pageWidth,
    maxTableWidth, 
    maxTableHeight,
    manualColumnWidths, 
    headerLengths, 
    longestRowItem,
    columnTextWrap,
    availableTableWidth
}) => { 
    let columSizing = {}
    let manualColumns = Object.keys(manualColumnWidths);
    let autoColumns = columnIds.filter(column => !manualColumns.includes(column));
    let totalManualSize = 0
    let totalAutoSize = 0

    
    columnIds.forEach((id) => {
        const headerLength = headerLengths[id];
        const longestRow = !longestRowItem[id] ? 0 : longestRowItem[id];
        const manualWidths = manualColumnWidths[id];

        if(manualWidths) { 
            totalManualSize += manualWidths;
            columSizing = {...columSizing, [id]: manualWidths};
        };

        if(!manualWidths) { 
            totalAutoSize += Math.max(headerLength, longestRow);
            columSizing = {...columSizing, [id]: Math.max(headerLength, longestRow)};
        };
    })

    const totelExtraLength = (availableTableWidth - totalManualSize - totalAutoSize);
    const columnExtraLength = totelExtraLength / autoColumns.length;

    autoColumns.forEach(column => {
        columSizing[column] += columnExtraLength
    })

    return columSizing;
}

export const getNumberOfRows = (data) => {
    const onlyRows = data.filter((item) => !item.subHeading)
    return onlyRows.length
}

export const getNumberOfSubHeadings =(data) => {
    const onlySubHeadings = data.filter((item) => item.subHeading)
    return onlySubHeadings.length
}