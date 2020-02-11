/**
 * Some definitions about the terms I use here.
 *
 * I call a subtitle a caption because originally, I made this to help me create captions for
 * hearing-impaired audiences for my JavaScript training videos.
 * But it can also be used for subtitles too: translating audio language to another language in text format
 * for foreigners.
 *
 * The "search expression" is the expression the user search for in the captions.
 * The "replacement expression" is the expression the user wants to use to replace the search expression
 * in the captions.
 *
 * I call a "caption update" the fact of replacing the search expression by the replacement expression.
 */


/* eslint-disable jest/valid-describe */
const { searchAndReplace, createStartOfSentence } = require('../extension/content-script');

// Mimick the textarea HTML input of the document
function fakeTextArea(textContent) {
  return {
    textContent,
    value: textContent,
    dispatchEvent: () => { },
  };
}

// Generic settings for tests
const TIMEOUT_IN_MS = 200;

// Generic functions to call to test caption updates
function testCaptionUpdate(testTitle, searchExpression, replacementExpression, captions, updatedCaptions, options) {
  const fakeCaption = [fakeTextArea(captions)];
  expect(searchAndReplace(fakeCaption, searchExpression, replacementExpression, options).updatedCaptionsList).toEqual([updatedCaptions]);
}

function groupTest(testTitle, testsSet, options) {
  const testsSetWithOptions = testsSet.map((data) => [...data, options]);
  it.each(testsSetWithOptions)('%s', testCaptionUpdate, TIMEOUT_IN_MS);
}

/**
 * Single word replacement tests
 */

const singleWordsReplacementsTests = [
  [
    'should not do anything when there is no match',
    'dom',
    'DOM',
    `There is nothing to replace
in this text, damn it!`,
    `There is nothing to replace
in this text, damn it!`,
  ],
  [
    'should replace a single word on the first line',
    'dom',
    'DOM',
    `The dom is awesome and is
even better in uppercase`,
    `The DOM is awesome and is
even better in uppercase`,
  ],
  [
    'should replace a single word on the second line',
    'dom',
    'DOM',
    `It's better to spell
dom in uppercase`,
    `It's better to spell
DOM in uppercase`,
  ],
  [
    'should replace only the whole word',
    'dom',
    'DOM',
    `The dominant language to
manipulate the dom is JavaScript`,
    `The dominant language to
manipulate the DOM is JavaScript`,
  ],
];
describe.each([
  [
    'Single words replacements (case insensitive search OFF)',
    singleWordsReplacementsTests,
    { insensitiveSearch: false },
  ],
  [
    'Single words replacements (case insensitive search ON)',
    singleWordsReplacementsTests,
    { insensitiveSearch: true },
  ],
])('%s', groupTest, TIMEOUT_IN_MS);

/**
 * Several words replacement tests
 */

const severalWordsReplacementsTests = [
  [
    'should manage several words on the same line',
    'java script',
    'JavaScript',
    `The java script language
is great when spelled correctly`,
    `The JavaScript language
is great when spelled correctly`,
  ],
  [
    'should handle 2-words expressions broken on two different lines',
    'java script',
    'JavaScript',
    `Starting to learn the java
script language is a good idea`,
    `Starting to learn the JavaScript
language is a good idea`,
  ],
  [
    'should handle several-words expressions broken on two different lines on the first word',
    'visual studio code',
    'Visual Studio Code',
    `Let's talk about visual
studio code, shall we?`,
    `Let's talk about Visual Studio Code,
shall we?`,
  ],
  [
    'should handle several-words expressions broken on two different lines on the second word',
    'visual studio code',
    'Visual Studio Code',
    `Let's talk about visual studio
code, shall we?`,
    `Let's talk about Visual Studio Code,
shall we?`,
  ],
];
describe.each([
  [
    'Several words replacements (case insensitive search OFF)',
    severalWordsReplacementsTests,
    { insensitiveSearch: false },
  ],
  [
    'Several words replacements (case insensitive search ON)',
    severalWordsReplacementsTests,
    { insensitiveSearch: true },
  ],
])('%s', groupTest, TIMEOUT_IN_MS);

/**
 * Case insensitive search tests
 *
 * To avoid creating new tests I use the previous ones and modify them to generate useful tests
 * to check the correctness of the case insensitive search option.
 *
 * Weakness: I use array indexes to manipulate test data, it's not ideal because if the structure
 * of the test changes, I'll have to update indexes values here too. I should change that...
 */

// Transforms a string like "javascript" to "JaVaScRiPt"
function createCaseInconsistency(string) {
  return [...string].map((letter, index) => (index % 2 ? letter : letter.toUpperCase())).join('');
}

function makeSearchExpressionsCaseInconsistent(testsData) {
  return testsData.map((data) => data.map(
    (searchExpression, index) => (index === 1 ? createCaseInconsistency(searchExpression) : searchExpression),
  ));
}

// When the app should not update the caption, the original caption should be identical to the updated caption
function makeOriginalCaptionIdenticalToUpdatedCaption(testData) {
  return testData.map((data) => data.map((value, index) => (index === 4 ? data[3] : value)));
}

describe.each([
  [
    'Single word replacements with case inconsistencies (case insensitive search OFF)',
    makeOriginalCaptionIdenticalToUpdatedCaption(makeSearchExpressionsCaseInconsistent(singleWordsReplacementsTests)),
    { insensitiveSearch: false },
  ],
  [
    'Single word replacements with case inconsistencies (case insensitive search ON)',
    makeSearchExpressionsCaseInconsistent(singleWordsReplacementsTests),
    { insensitiveSearch: true },
  ],
  [
    'Several words replacements with case inconsistencies (case insensitive search OFF)',
    makeOriginalCaptionIdenticalToUpdatedCaption(makeSearchExpressionsCaseInconsistent(severalWordsReplacementsTests)),
    { insensitiveSearch: false },
  ],
  [
    'Several words replacements with case inconsistencies (case insensitive search ON)',
    makeSearchExpressionsCaseInconsistent(severalWordsReplacementsTests),
    { insensitiveSearch: true },
  ],
])('%s', groupTest, TIMEOUT_IN_MS);

/**
 * Create start of sentences
 */
describe('Start of sentences feature', () => {
  it('Should create the start of a sentence', () => {
    expect(createStartOfSentence('here we go !', 2)).toEqual('Here we go !');
  });
  it('Should create the start of a sentence in the middle of a sentence', () => {
    expect(createStartOfSentence('it ends there here we go !', 16)).toEqual('it ends there. Here we go !');
  });
  it('Should create the start of a sentence in the middle of a sentence on multiple lines', () => {
    expect(createStartOfSentence(`it ends there
here we go !`, 16)).toEqual(`it ends there.
Here we go !`);
  });
  it('Should create the start of a sentence after the end of another sentence', () => {
    expect(createStartOfSentence('it ends there. here we go !', 16)).toEqual('it ends there. Here we go !');
  });
});
