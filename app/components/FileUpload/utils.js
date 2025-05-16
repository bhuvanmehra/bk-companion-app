import { whiteListColumns, renameColumnsMap, mergeColumnsMap } from './config';
import get from 'lodash/get';

export const sortColumnsByWhitelist = (data) => {
  if (data.length === 0) return [];

  const headers = data[0];

  // Create a case-insensitive sorting function
  const columnSorter = (a, b) => {
    const aIndex = whiteListColumns.findIndex(
      (col) => col.toLowerCase() === a.toLowerCase()
    );
    const bIndex = whiteListColumns.findIndex(
      (col) => col.toLowerCase() === b.toLowerCase()
    );

    // If both columns are in whitelist, sort by their order in whitelist
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only a is in whitelist, it comes first
    if (aIndex !== -1) return -1;
    // If only b is in whitelist, it comes first
    if (bIndex !== -1) return 1;

    // If neither is in whitelist, maintain original order
    return 0;
  };

  // Get the sorted column indices
  const sortedColumnIndices = headers
    .map((header, index) => ({ header, index }))
    .sort((a, b) => columnSorter(a.header, b.header))
    .map((item) => item.index);

  // Reorder columns in the data
  return data.map((row) => sortedColumnIndices.map((index) => row[index]));
};

export const removeEmptyColumns = (data) => {
  if (data.length === 0) return [];

  // Get number of columns from first row
  const numColumns = data[0].length;
  const numRows = data.length;
  // console.log('numColumns: ', numColumns, 'numRows: ', numRows);

  // Track which columns have data
  const columnsWithData = Array(numColumns).fill(false);
  columnsWithData[0] = false; // Always keep first column

  // Iterate column-wise
  for (let col = 0; col < numColumns; col++) {
    // console.log('col: ', data[0][col]);
    // Check each row for this column
    for (let row = 1; row < numRows; row++) {
      const cell = data[row][col];
      // console.log('cell: ', cell);
      if (cell !== '' && cell !== null && cell !== undefined) {
        columnsWithData[col] = true;
        break; // Found a non-empty cell in this column, move to next column
      }
    }
  }

  // console.log('columnsWithData: ', columnsWithData);

  // Filter out empty columns
  return data.map((row) =>
    row.filter((_, colIndex) => columnsWithData[colIndex])
  );
};

export const renameColumns = (data) => {
  if (data.length === 0) return [];

  const headers = data[0];

  // Create new headers by mapping through existing ones
  const newHeaders = headers.map(
    (header) => renameColumnsMap[header] || header
  );

  // Return new array with renamed headers and original data
  return [newHeaders, ...data.slice(1)];
};

export const mergeColumns = (data) => {
  if (data.length === 0) return [];

  const headers = data[0];
  const rows = data.slice(1);

  mergeColumnsMap.map((columnMap) => {
    const [validCol, invalidCol] = columnMap;
    const validColIndex = headers.findIndex(
      (header) => header.trim() === validCol
    );
    const invalidColIndex = headers.findIndex(
      (header) => header.trim() === invalidCol
    );

    if (validColIndex === -1 || invalidColIndex === -1) return;

    rows.forEach((row) => {
      row[validColIndex] = row[validColIndex] || row[invalidColIndex];
      row.splice(invalidColIndex, 1);
    });

    headers.splice(invalidColIndex, 1);
  });

  const updatedData = [headers, ...rows];
  return updatedData;
};

const existsInArrayIgnoreCase = (array, value) => {
  return array.some((item) => item.toLowerCase() === value.toLowerCase());
};

export const getWhitelistedColumnData = (data) => {
  if (data.length === 0) return [];

  const headers = data[0];
  const rows = data.slice(1);
  const updatedData = [];
  const updatedHeaders = [];

  whiteListColumns.map((whiteListedColumn) => {
    if (existsInArrayIgnoreCase(headers, whiteListedColumn)) {
      updatedHeaders.push(whiteListedColumn);
    }
  });

  updatedData.push(updatedHeaders);

  rows.map((row) => {
    const updatedRow = [];
    updatedHeaders.map((header) => {
      const originalHeaderIndex = headers.findIndex(
        (h) => h.toLowerCase() === header.toLowerCase()
      );
      updatedRow.push(row[originalHeaderIndex]);
    });
    updatedData.push(updatedRow);
  });

  return updatedData;
};

export const trimEmptySpaces = (data) => {
  return data.map((row) => row.map((cell) => cell.trim()));
};

export const sortByColumn = (data, columnName) => {
  if (data.length <= 1) return data;

  const headers = data[0];
  const columnIndex = headers.findIndex(
    (header) => header.toLowerCase() === columnName.toLowerCase()
  );

  if (columnIndex === -1) return data;

  const sortedData = [
    headers,
    ...data.slice(1).sort((a, b) => {
      const valueA = (a[columnIndex] || '').toLowerCase();
      const valueB = (b[columnIndex] || '').toLowerCase();
      return valueA.localeCompare(valueB);
    }),
  ];

  return sortedData;
};

export const removeBlackWords = (data, columnName, blackWords) => {
  if (data.length <= 1) return data;

  const headers = data[0];
  const columnIndex = headers.findIndex(
    (header) => header.toLowerCase() === columnName.toLowerCase()
  );

  if (columnIndex === -1) return data;
  const rows = data.slice(1);

  rows.map((row) => {
    const cell = row[columnIndex].toLowerCase();
    blackWords.map((blackWord) => {
      if (cell.toLowerCase() === blackWord.toLowerCase()) {
        row[columnIndex] = '';
      }
    });
  });
  const updatedData = [headers, ...rows];

  return updatedData;
};

export const cleanMobileNumbers = (data) => {
  if (data.length <= 1) return data;

  const headers = data[0];
  const mobileIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'mobile number'
  );

  if (mobileIndex === -1) return data;
  const rows = data.slice(1);

  rows.map((row) => {
    const cell = row[mobileIndex];
    const trimmedCell = cell.replace(/\s+/g, '');
    if (trimmedCell) {
      if (trimmedCell.length === 10 && trimmedCell.startsWith('04')) {
        row[mobileIndex] = trimmedCell.slice(1, trimmedCell.length);
      } else if (trimmedCell.startsWith('+61')) {
        row[mobileIndex] = trimmedCell.slice(3, trimmedCell.length);
      }
    }
  });

  const updatedData = [headers, ...rows];
  return updatedData;
};

export const swapWords = (data, columnName, wordList) => {
  if (data.length <= 1) return data;

  const headers = data[0];
  const columnIndex = headers.findIndex(
    (header) => header.toLowerCase() === columnName.toLowerCase()
  );

  if (columnIndex === -1) return data;
  const rows = data.slice(1);

  rows.map((row) => {
    const cell = row[columnIndex].toLowerCase();
    wordList.map((word) => {
      const [oldWord, newWord] = word;

      if (cell.includes(oldWord.toLowerCase())) {
        row[columnIndex] = newWord;
      }
    });
  });
  const updatedData = [headers, ...rows];

  return updatedData;
};

export const formatFormsDatas = (input) => {
  if (!input || !Array.isArray(input)) {
    return [];
  }

  return input.map((item) => {
    const answerEntries = Object.values(item.answers || {});
    // Sort by questionId to keep order consistent (optional)
    answerEntries.sort((a, b) => (a.questionId > b.questionId ? 1 : -1));
    const answer1 = answerEntries[0]?.textAnswers?.answers?.[0]?.value || '';
    const answer2 = answerEntries[1]?.textAnswers?.answers?.[0]?.value || '';
    // Heuristic: If answer1 is Yes/No, treat as answer, else as name
    const yesNo = ['yes', 'no'];
    let name = answer1,
      answer = answer2;
    if (yesNo.includes((answer1 || '').toLowerCase())) {
      answer = answer1;
      name = answer2;
    }
    return {
      email: item.respondentEmail || '',
      name,
      answer,
    };
  });
};

export const formatFormsData = (input) => {
  if (!input || !Array.isArray(input)) {
    return [];
  }

  const seenEmails = new Set();

  return input.reduce((acc, item) => {
    const answerEntries = Object.values(item.answers || {});
    answerEntries.sort((a, b) => (a.questionId > b.questionId ? 1 : -1));
    const answer1 = answerEntries[0]?.textAnswers?.answers?.[0]?.value || '';
    const answer2 = answerEntries[1]?.textAnswers?.answers?.[0]?.value || '';
    const yesNo = ['yes', 'no'];
    let name = answer1,
      answer = answer2;
    if (yesNo.includes((answer1 || '').toLowerCase())) {
      answer = answer1;
      name = answer2;
    }
    const email = item.respondentEmail || '';
    if (email && !seenEmails.has(email)) {
      acc.push({ email, name, answer });
      seenEmails.add(email);
    }
    return acc;
  }, []);
};

export const mapWithFormData = (data, formResponses) => {
  if (data.length === 0 && formResponses.length === 0) return data;

  const headers = data[0];
  headers.push('Confirmation');
  const emailIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'email'
  );
  const rows = data.slice(1);

  formResponses.map((formResponse) => {
    const email = formResponse.email;
    const name = formResponse.name;
    const answer = formResponse.answer;

    rows.map((row) => {
      if (row[emailIndex].toLowerCase() === email.toLowerCase()) {
        row.push(answer);
      }
    });
  });

  const updatedData = [headers, ...rows];

  return updatedData;
};
