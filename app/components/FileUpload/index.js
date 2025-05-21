'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import {
  trimEmptySpaces,
  removeEmptyColumns,
  renameColumns,
  mergeColumns,
  getWhitelistedColumnData,
  sortByColumn,
  removeBlackWords,
  cleanMobileNumbers,
  swapWords,
  formatFormsData,
  mapWithFormData,
  mergeDuplicateColumns,
} from './utils';
import { dietaryBlackWords, medicalBlackWords, swapWordsList } from './config';
import useFormsData from './useFormsData';
import get from 'lodash/get';

const App = () => {
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');
  const { data, isLoading, error: formsDataError } = useFormsData();
  const formResponses = formatFormsData(get(data, 'formResponses', []));

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setParsedData([]);
    setError('');

    Papa.parse(file, {
      header: false,
      complete: (results) => {
        const twoDArray = results.data;

        // First remove empty rows
        const noEmptyRows = twoDArray.filter((row) =>
          row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
        );

        const cleanedArray = trimEmptySpaces(removeEmptyColumns(noEmptyRows));
        const mergedDuplicateColumns = mergeDuplicateColumns(cleanedArray);
        const mergedColumns = mergeColumns(mergedDuplicateColumns);
        const renamedArray = renameColumns(mergedColumns);
        const whitelistedData = getWhitelistedColumnData(renamedArray);
        const sortedData = sortByColumn(whitelistedData, 'First Name');
        const blackWordsRemovedData = removeBlackWords(
          sortedData,
          'dietary',
          dietaryBlackWords
        );
        const blackWordsRemovedData2 = removeBlackWords(
          blackWordsRemovedData,
          'medical',
          medicalBlackWords
        );
        const swappedWordsData = swapWords(
          cleanMobileNumbers(blackWordsRemovedData2),
          'Transport',
          swapWordsList
        );
        const result = mapWithFormData(swappedWordsData, formResponses);
        setParsedData(result);

        // Create CSV string from modified data
        const csv = Papa.unparse(result);

        // Add BOM for Excel to recognize UTF-8
        const csvContent = '\uFEFF' + csv;

        // Create and download the new CSV file with Excel MIME type
        const blob = new Blob([csvContent], {
          type: 'application/vnd.ms-excel;charset=utf-8',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'modified_data.xls');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: (error) => {
        setError(error.message);
        console.error('Error parsing CSV:', error);
      },
    });
  };

  return (
    <>
      <h1>BK Web Companion App</h1>
      <input type='file' accept='.csv' onChange={handleFileUpload} />

      {parsedData.length === 0 && (
        <div>
          <h2>Instructions:</h2>
          <p>
            Upload a CSV file to parse and remove empty columns. The parsed data
            will be displayed below.
          </p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {parsedData.length > 0 && (
        <div style={{ color: 'green' }}>
          Conversion Success! Please check your downloads for file name
          modified_data.xls.
        </div>
      )}
      {isLoading && (
        <div style={{ color: 'blue' }}>Loading form responses...</div>
      )}
      {formsDataError && (
        <div style={{ color: 'red' }}>
          Error loading form responses: {formsDataError.message}
        </div>
      )}
      {formResponses && formResponses.length > 0 && (
        <div>
          <h2>Form Responses:</h2>
          <pre
            style={{
              maxHeight: '400px',
              overflow: 'auto',
              textAlign: 'left',
            }}
          >
            {JSON.stringify(formResponses, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};

export default App;
