/**
 * @jest-environment jsdom
 */

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
  const fakeCaption = fakeTextArea(captions);
  expect(searchAndReplace(fakeCaption, searchExpression, replacementExpression, options).updatedFullSubtitleText).toEqual(updatedCaptions);
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
  [
    'should replace words with accents at the beginning of the word',
    'événements',
    'évènements',
    `réseau, si le réseau est en ligne ou pas.
Les événements liés aux focus au web`,
    `réseau, si le réseau est en ligne ou pas.
Les évènements liés aux focus au web`,
  ],
  [
    'should replace words with accents at the end of the word',
    'présenté',
    'Présenté',
    `Tel qu'il est présenté, c'est bien parti.
Si c'était présenté différemment, ce serait autre chose.`,
    `Tel qu'il est Présenté, c'est bien parti.
Si c'était Présenté différemment, ce serait autre chose.`,
  ],
];

// Add a bunch of tests to check for RegExp special char within the word
for (const specialChar of '.*?+-$^{}()|[]\\') {
  singleWordsReplacementsTests.push([
    `should replace words with special RegExp char in it "${specialChar}"`,
    `c${specialChar}`,
    `C${specialChar}`,
    `Le langage c${specialChar} n'existe pas.`,
    `Le langage C${specialChar} n'existe pas.`,
  ]);
}

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
    'should check for exact several words sentence on the same line',
    'java script',
    'JavaScript',
    `The word javascript alone should not
be replaced here! But java script should!`,
    `The word javascript alone should not
be replaced here! But JavaScript should!`,
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
  it("When creating the start of a sentence, it should not add a period when the last char is a '?'", () => {
    expect(createStartOfSentence('Does it end here? of course not!', 19)).toEqual('Does it end here? Of course not!');
  });
  it("When creating the start of a sentence, it should not add a period when the last char is a '!'", () => {
    expect(createStartOfSentence('Does it end here! of course not!', 19)).toEqual('Does it end here! Of course not!');
  });
  it('When creating the start of a sentence, it should not add a period if the line before is blank', () => {
    expect(createStartOfSentence(`Does it end here!

of course not!`, 19)).toEqual(`Does it end here!

Of course not!`);
  });
});
