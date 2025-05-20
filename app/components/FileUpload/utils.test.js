import {
  sortColumnsByWhitelist,
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
import { describe, test, expect } from '@jest/globals';
import { dietaryBlackWords, swapWordsList } from './config';

describe('utils', () => {
  describe.skip('sortColumnsByWhitelist', () => {
    test('returns empty array for empty input', () => {
      expect(sortColumnsByWhitelist([])).toEqual([]);
    });

    test('sorts columns according to whitelist order', () => {
      const input = [
        ['Email', 'Random', 'First Name', 'Last Name'],
        ['john@email.com', 'data1', 'John', 'Doe'],
        ['jane@email.com', 'data2', 'Jane', 'Smith'],
      ];

      const expected = [
        ['First Name', 'Last Name', 'Email', 'Random'],
        ['John', 'Doe', 'john@email.com', 'data1'],
        ['Jane', 'Smith', 'jane@email.com', 'data2'],
      ];

      expect(sortColumnsByWhitelist(input)).toEqual(expected);
    });

    test('maintains order of non-whitelisted columns', () => {
      const input = [
        ['Random1', 'Random2', 'Random3'],
        ['data1', 'data2', 'data3'],
        ['info1', 'info2', 'info3'],
      ];

      // Should maintain same order as none are in whitelist
      expect(sortColumnsByWhitelist(input)).toEqual(input);
    });

    test('handles mixed whitelisted and non-whitelisted columns', () => {
      const input = [
        ['Random1', 'Email', 'Random2', 'First Name', 'Random3'],
        ['data1', 'john@email.com', 'data2', 'John', 'data3'],
        ['info1', 'jane@email.com', 'info2', 'Jane', 'info3'],
      ];

      const expected = [
        ['First Name', 'Email', 'Random1', 'Random2', 'Random3'],
        ['John', 'john@email.com', 'data1', 'data2', 'data3'],
        ['Jane', 'jane@email.com', 'info1', 'info2', 'info3'],
      ];

      expect(sortColumnsByWhitelist(input)).toEqual(expected);
    });

    test('handles single row data', () => {
      const input = [['Random', 'Email', 'First Name']];

      const expected = [['First Name', 'Email', 'Random']];

      expect(sortColumnsByWhitelist(input)).toEqual(expected);
    });

    test('Real Test', () => {
      const input = [
        [
          'First name',
          'Last name',
          'Email',
          'Full Name',
          'Gender',
          'Transport?',
        ],
        ['Clark', 'Kent', 'clark@superman.com', 'Clark Kent', 'Male', 'Flight'],
        ['Tony', 'Stark', 'tony@ironman.com', 'Tony Stark', 'Male', 'Flight'],
      ];

      const expected = [
        [
          'First name',
          'Last name',
          'Email',
          'Full Name',
          'Gender',
          'Transport?',
        ],
        ['Clark', 'Kent', 'clark@superman.com', 'Clark Kent', 'Male', 'Flight'],
        ['Tony', 'Stark', 'tony@ironman.com', 'Tony Stark', 'Male', 'Flight'],
      ];

      // console.log(
      //   'sortColumnsByWhitelist(input): ',
      //   sortColumnsByWhitelist(input)
      // );
      expect(sortColumnsByWhitelist(input)).toEqual(expected);
    });
  });

  describe('removeEmptyColumns', () => {
    test('returns empty array for empty input', () => {
      expect(removeEmptyColumns([])).toEqual([]);
    });

    test('removes columns with only empty values', () => {
      const input = [
        ['Header1', 'Header2', 'Header3'],
        ['data1', '', ''],
        ['data2', '', ''],
        ['data3', '', ''],
      ];

      const expected = [['Header1'], ['data1'], ['data2'], ['data3']];

      expect(removeEmptyColumns(input)).toEqual(expected);
    });

    test('keeps columns with at least one non-empty value', () => {
      const input = [
        ['Header1', 'Header2', 'Header3'],
        ['data1', 'data2', ''],
        ['data2', '', 'data3'],
        ['data3', '', ''],
      ];

      const expected = [
        ['Header1', 'Header2', 'Header3'],
        ['data1', 'data2', ''],
        ['data2', '', 'data3'],
        ['data3', '', ''],
      ];

      expect(removeEmptyColumns(input)).toEqual(expected);
    });

    test('handles null and undefined values', () => {
      const input = [
        ['Header1', 'Header2', 'Header3'],
        ['data1', null, undefined],
        ['data2', null, undefined],
        ['data3', null, undefined],
      ];

      const expected = [['Header1'], ['data1'], ['data2'], ['data3']];

      expect(removeEmptyColumns(input)).toEqual(expected);
    });
  });

  describe('renameColumns', () => {
    test('returns empty array for empty input', () => {
      expect(renameColumns([])).toEqual([]);
    });

    test('renames columns based on columnsMap', () => {
      const input = [
        [
          'First Name',
          'Last Name',
          'Email Address',
          'Are you coming by car or public transport?',
          'Do you have any medical condition we should know about? If so please write here.',
          'Do you have any special dietary requirements? If yes,fill in box below:',
          'Who would you like to share a room with if appropriate.',
        ],
      ];

      const expected = [
        [
          'First Name',
          'Last Name',
          'Email Address',
          'Transport',
          'Medical',
          'Dietary',
          'Share',
        ],
      ];

      expect(renameColumns(input)).toEqual(expected);
    });
  });

  describe('mergeColumns', () => {
    test('returns empty array for empty input', () => {
      expect(mergeColumns([])).toEqual([]);
    });

    test('merges columns based on columnsMap', () => {
      const input = [
        [
          'First name',
          'Last name',
          'Last Name',
          'Email',
          'Full Name',
          'Gender',
          'Transport?',
          'Mobile Number',
          'Mobile number',
        ],
        [
          'Clark',
          'Kent',
          '',
          'clarky@superman.com',
          '',
          'Male',
          'Flight',
          '',
          '1234567890',
        ],
        [
          '',
          '',
          'Wayne',
          'batman@gmail.com',
          'Bruce',
          'Male',
          'Batmobile',
          '9876543210',
          '',
        ],
        [
          '',
          'Stark',
          '',
          'tony@ironman.com',
          'Tony',
          'Male',
          'Flight',
          '',
          '9876543210',
        ],
      ];

      const expected = [
        [
          'First name',
          'Last Name',
          'Email',
          'Gender',
          'Transport?',
          'Mobile Number',
        ],
        [
          'Clark',
          'Kent',
          'clarky@superman.com',
          'Male',
          'Flight',
          '1234567890',
        ],
        [
          'Bruce',
          'Wayne',
          'batman@gmail.com',
          'Male',
          'Batmobile',
          '9876543210',
        ],
        ['Tony', 'Stark', 'tony@ironman.com', 'Male', 'Flight', '9876543210'],
      ];

      expect(mergeColumns(input)).toEqual(expected);
    });
  });

  describe('getWhitelistedColumnData', () => {
    test('returns white listed columns', () => {
      const input = [
        [
          'Booking',
          'First Name',
          'Last Name',
          'Email',
          'Full Name',
          'Gender',
          'Transport',
          'Share',
          'Sharing',
        ],
        [
          'XXXX',
          'Clark',
          'Kent',
          'clark@superman.com',
          'Clark Kent',
          'Male',
          'Flight',
          'Batman',
          'XXXX',
        ],
        [
          'XXXX',
          'Tony',
          'Stark',
          'tony@ironman.com',
          'Tony Stark',
          'Male',
          'Flight',
          'Jarvis',
          'XXXX',
        ],
      ];

      const expected = [
        [
          'First Name',
          'Last Name',
          'Gender',
          'Email',
          'Booking',
          'Transport',
          'Share',
        ],
        [
          'Clark',
          'Kent',
          'Male',
          'clark@superman.com',
          'XXXX',
          'Flight',
          'Batman',
        ],
        [
          'Tony',
          'Stark',
          'Male',
          'tony@ironman.com',
          'XXXX',
          'Flight',
          'Jarvis',
        ],
      ];

      expect(getWhitelistedColumnData(input)).toEqual(expected);
    });

    test('test 2', () => {
      const input = [
        [
          'Booking',
          'First name',
          'Email',
          'Last Name',
          'Gender',
          'Transport',
          'Do you have any special dietary requirements? If yes,fill in box below:',
          'Do you have any medical condition we should know about? If so please write here.',
          'Mobile Number',
          'Who would you like to share a room with if appropriate.',
          'First name',
          'Last name',
          'Have you done the Introduction to Raja Yoga before?',
          'Have you attended an introductory course in Raja Yoga Meditation?',
          'Do you have a disability or any special needs we s…lity, hearing, intellectual or mental health etc?',
          'Emergency contact number',
        ],
        [
          'JXXXX',
          'Vikas',
          'vixxx_axxx@hotmail.com',
          'Test Last Name',
          'Male',
          '',
          'Vegetarian food',
          '',
          '0416421500',
          'My wife who I’m attending this retreat with',
          '',
          '',
          '',
          '',
          '',
          '+61 410 962 271',
        ],
      ];

      const result = [
        [
          'First Name',
          'Last Name',
          'Gender',
          'Mobile Number',
          'Email',
          'Booking',
          'Transport',
        ],
        [
          'Vikas',
          'Test Last Name',
          'Male',
          '0416421500',
          'vixxx_axxx@hotmail.com',
          'JXXXX',
          '',
        ],
      ];
      expect(getWhitelistedColumnData(input)).toEqual(result);
    });

    test('should handle same column names with different casing', () => {
      const input = [
        [
          'Booking',
          'First Name',
          'Last Name',
          'Email',
          'Full Name',
          'Gender',
          'Transport',
          'Share',
          'Sharing',
          'Mobile number',
        ],
        [
          'XXXX',
          'Clark',
          'Kent',
          'clark@superman.com',
          'Clark Kent',
          'Male',
          'Flight',
          'Batman',
          'XXXX',
          '0452401600',
        ],
        [
          'XXXX',
          'Tony',
          'Stark',
          'tony@ironman.com',
          'Tony Stark',
          'Male',
          'Flight',
          'Jarvis',
          'XXXX',
          '0452401600',
        ],
      ];

      const expected = [
        [
          'First Name',
          'Last Name',
          'Gender',
          'Mobile Number',
          'Email',
          'Booking',
          'Transport',
          'Share',
        ],
        [
          'Clark',
          'Kent',
          'Male',
          '0452401600',
          'clark@superman.com',
          'XXXX',
          'Flight',
          'Batman',
        ],
        [
          'Tony',
          'Stark',
          'Male',
          '0452401600',
          'tony@ironman.com',
          'XXXX',
          'Flight',
          'Jarvis',
        ],
      ];

      expect(getWhitelistedColumnData(input)).toEqual(expected);
    });
  });

  describe('sortByColumn', () => {
    test('sorts data by specified column name', () => {
      const input = [
        ['First Name', 'Last Name', 'Email'],
        ['John', 'Doe', 'john@email.com'],
        ['Alice', 'Smith', 'alice@email.com'],
        ['Bob', 'Johnson', 'bob@email.com'],
      ];

      const expected = [
        ['First Name', 'Last Name', 'Email'],
        ['Alice', 'Smith', 'alice@email.com'],
        ['Bob', 'Johnson', 'bob@email.com'],
        ['John', 'Doe', 'john@email.com'],
      ];

      expect(sortByColumn(input, 'First Name')).toEqual(expected);
    });

    test('handles case-insensitive column names', () => {
      const input = [
        ['First Name', 'Last Name'],
        ['John', 'Doe'],
        ['Alice', 'Smith'],
      ];

      const expected = [
        ['First Name', 'Last Name'],
        ['Alice', 'Smith'],
        ['John', 'Doe'],
      ];

      expect(sortByColumn(input, 'first name')).toEqual(expected);
    });

    test('returns original data if column not found', () => {
      const input = [
        ['Name', 'Email'],
        ['John', 'john@email.com'],
      ];

      expect(sortByColumn(input, 'First Name')).toEqual(input);
    });
  });

  describe('removeBlackWords', () => {
    test('removes blacklisted words from data', () => {
      const input = [
        ['First Name', 'dietary'],
        ['John', 'veg'],
        ['Alice', 'vegetarian'],
        ['Bob', 'No Onion'],
        ['Ben', 'Low Fat'],
        ['Ken', 'NOG'],
        ['Ryu', 'No beef or pork'],
        ['Aladdin', 'gluten free vegetarian please'],
        ['Neo', 'no dairy milk'],
      ];

      const expected = [
        ['First Name', 'dietary'],
        ['John', ''],
        ['Alice', ''],
        ['Bob', ''],
        ['Ben', 'Low Fat'],
        ['Ken', ''],
        ['Ryu', 'No beef or pork'],
        ['Aladdin', 'gluten free vegetarian please'],
        ['Neo', 'no dairy milk'],
      ];

      expect(removeBlackWords(input, 'dietary', dietaryBlackWords)).toEqual(
        expected
      );
    });
  });

  describe('cleanMobileNumbers', () => {
    test('cleans mobile numbers', () => {
      const input = [
        ['First Name', 'Mobile Number'],
        ['John', '0452401600'],
        ['Alice', '+61452401600'],
        ['Bob', '452401600'],
        ['Ben', ''],
        ['Charlie', '0469 336 886'],
      ];

      const expected = [
        ['First Name', 'Mobile Number'],
        ['John', '452401600'],
        ['Alice', '452401600'],
        ['Bob', '452401600'],
        ['Ben', ''],
        ['Charlie', '469336886'],
      ];

      expect(cleanMobileNumbers(input)).toEqual(expected);
    });
  });

  describe('swapWords', () => {
    test('swaps words in data', () => {
      const input = [
        ['First Name', 'Transport'],
        ['John', 'Public Transport'],
        ['Alice', 'Public'],
        ['Bob', 'Car'],
        ['Ben', 'Public Transport'],
        ['Charlie', 'Public Transport (Train)'],
        ['Ken', 'Public Transportation'],
        ['Ryu', 'Car with Friends'],
      ];

      const expected = [
        ['First Name', 'Transport'],
        ['John', 'Public'],
        ['Alice', 'Public'],
        ['Bob', 'Car'],
        ['Ben', 'Public'],
        ['Charlie', 'Public'],
        ['Ken', 'Public'],
        ['Ryu', 'Car'],
      ];

      expect(swapWords(input, 'Transport', swapWordsList)).toEqual(expected);
    });
  });

  describe('formatFormsData', () => {
    const mockInput = [
      {
        responseId:
          'ACYDBNgR8nO_tBLec1hT-LFgIEbxo8IQfc5pORQ6vBEN_cVrEqRoMJsW_aPSgK7745doaN4',
        createTime: '2025-05-06T02:16:18.694Z',
        lastSubmittedTime: '2025-05-06T02:16:18.694809Z',
        respondentEmail: 'clark.kent@gmail.com',
        answers: {
          '60dde9e4': {
            questionId: '60dde9e4',
            textAnswers: {
              answers: [
                {
                  value: 'Yes',
                },
              ],
            },
          },
          '0c997b31': {
            questionId: '0c997b31',
            textAnswers: {
              answers: [
                {
                  value: 'Clark Kent',
                },
              ],
            },
          },
        },
      },
      {
        responseId:
          'ACYDBNgZHRU_WU1NU54RuVPwVfqcYp-M3koe30R_c1YDs4XEdq8MdZmF0p-L9C5xvfXHWW0',
        createTime: '2025-05-06T23:28:58.086Z',
        lastSubmittedTime: '2025-05-06T23:28:58.086772Z',
        respondentEmail: 'bruce.wayne@gmail.com',
        answers: {
          '60dde9e4': {
            questionId: '60dde9e4',
            textAnswers: {
              answers: [
                {
                  value: 'No',
                },
              ],
            },
          },
          '0c997b31': {
            questionId: '0c997b31',
            textAnswers: {
              answers: [
                {
                  value: 'Bruce Wayne',
                },
              ],
            },
          },
        },
      },
    ];

    const mockOutput = [
      {
        email: 'clark.kent@gmail.com',
        name: 'Clark Kent',
        answer: 'Yes',
      },
      {
        email: 'bruce.wayne@gmail.com',
        name: 'Bruce Wayne',
        answer: 'No',
      },
    ];

    test('formats form data correctly', () => {
      const result = formatFormsData(mockInput);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('mapWithFormData', () => {
    test('maps data with form responses', () => {
      const mockData = [
        [
          'First Name',
          'Last Name',
          'Gender',
          'Mobile Number',
          'Email',
          'Booking',
          'Transport',
          'Medical',
          'Share',
          'Dietary',
        ],
        [
          'Clark',
          'Kent',
          'Male',
          '416130000',
          'clark.kent@gmail.com',
          'XGMXX',
          'Fly',
          '',
          'No',
          '',
        ],
        [
          'Bruce',
          'Wayne',
          'Male',
          '482027000',
          'bruce.wayne@gmail.com',
          'T7XXX',
          'Batmobile',
          '',
          'OK',
          '',
        ],
      ];

      const mockFormResponses = [
        {
          email: 'clark.kent@gmail.com',
          name: 'Clark Kent',
          answer: 'Yes',
        },
        {
          email: 'bruce.wayne@gmail.com',
          name: 'Bruce Wayne',
          answer: 'No',
        },
      ];

      const expectedOutput = [
        [
          'First Name',
          'Last Name',
          'Gender',
          'Mobile Number',
          'Email',
          'Booking',
          'Transport',
          'Medical',
          'Share',
          'Dietary',
          'Confirmation',
        ],
        [
          'Clark',
          'Kent',
          'Male',
          '416130000',
          'clark.kent@gmail.com',
          'XGMXX',
          'Fly',
          '',
          'No',
          '',
          'Yes',
        ],
        [
          'Bruce',
          'Wayne',
          'Male',
          '482027000',
          'bruce.wayne@gmail.com',
          'T7XXX',
          'Batmobile',
          '',
          'OK',
          '',
          'No',
        ],
      ];
      const result = mapWithFormData(mockData, mockFormResponses);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('mergeDuplicateColumns', () => {
    const mockInput = [
      [
        'First Name',
        'Last Name',
        'First name',
        'Last Name',
        'Email',
        'First name',
      ],
      ['Clark', '', 'Clark', 'Kent', 'superman@gmail.com', ''],
      ['', 'Wayne', 'Bruce', '', 'batman@gmail.com', ''],
      ['', '', 'Clark', 'Kent', 'superman@gmail.com', 'Clark'],
    ];

    const expectedOutput = [
      ['First Name', 'Last Name', 'Email'],
      ['Clark', 'Kent', 'superman@gmail.com'],
      ['Bruce', 'Wayne', 'batman@gmail.com'],
      ['Clark', 'Kent', 'superman@gmail.com'],
    ];

    test('removes duplicate column names', () => {
      const result = mergeDuplicateColumns(mockInput);
      expect(result).toEqual(expectedOutput);
    });
  });
});
