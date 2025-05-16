export const whiteListColumns = [
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
  'Intro to Raj Yoga before?',
  'Attended Intro course?',
];

export const renameColumnsMap = {
  'First name': 'First Name',
  'Are you coming by car or public transport?': 'Transport',
  'Do you have any medical condition we should know about? If so please write here.':
    'Medical',
  'Do you have any special dietary requirements? If yes,fill in box below:':
    'Dietary',
  'Who would you like to share a room with if appropriate.': 'Share',
  'Have you done the Introduction to Raja Yoga before?':
    'Intro to Raj Yoga before?',
  'Have you attended an introductory course in Raja Yoga Meditation?':
    'Attended Intro course?',
};

export const mergeColumnsMap = [
  ['First name', 'Full Name'],
  ['Mobile Number', 'Mobile number'],
  ['Last Name', 'Last name'],
];

export const dietaryBlackWords = [
  'No',
  'veg',
  'vegetarian',
  'NA',
  'No Onion',
  'No onion garlic',
  'No onion and garlic',
  'No onion n garlic',
  'NOG',
  'Nill',
  'nil',
  'None',
  'N/A',
];

export const medicalBlackWords = ['No', 'NA', 'None', 'N/A', 'nil', 'Nill'];

export const swapWordsList = [
  ['Public Transport', 'Public'],
  ['Car', 'Car'],
];
