const searchAndReplace = require('../extension/content-script');

// Mimick the textarea HTML input of the document
function fakeTextArea(textContent) {
  return {
    textContent,
    value: textContent,
    dispatchEvent: () => { },
  };
}

// Generic function to call to test caption update
function testCaptionUpdate(testTitle, searchExpression, replaceExpression, captions, updatedCaptions) {
  const fakeCaption = [fakeTextArea(captions)];
  expect(searchAndReplace(fakeCaption, searchExpression, replaceExpression)).toEqual([updatedCaptions]);
}

describe('Single word replacements', () => {
  it.each([
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
  ])('%s', testCaptionUpdate);
});

describe('Several words replacement', () => {
  it.each([
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
  ])('%s', testCaptionUpdate);
});
