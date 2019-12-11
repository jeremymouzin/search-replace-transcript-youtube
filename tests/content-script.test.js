const searchAndReplace = require('../extension/content-script');

// Mimick the textarea HTML input of the document
function fakeTextArea(textContent) {
  return {
    textContent,
    value: textContent,
    dispatchEvent: () => { },
  };
}

describe('Single word replacements', () => {
  it('should not do anything when there is no match', () => {
    const captions = [fakeTextArea(`There is nothing to replace
in this text, damn it!`)];
    const updatedCaptions = [`There is nothing to replace
in this text, damn it!`,
    ];
    expect(searchAndReplace(captions, 'dom', 'DOM')).toEqual(updatedCaptions);
  });

  it('should replace a single word on the first line', () => {
    const captions = [fakeTextArea(`The dom is awesome and is
even better in uppercase`)];
    const updatedCaptions = [`The DOM is awesome and is
even better in uppercase`,
    ];
    expect(searchAndReplace(captions, 'dom', 'DOM')).toEqual(updatedCaptions);
  });

  it('should replace a single word on the second line', () => {
    const captions = [fakeTextArea(`It's better to spell
dom in uppercase`)];
    const updatedCaptions = [`It's better to spell
DOM in uppercase`,
    ];
    expect(searchAndReplace(captions, 'dom', 'DOM')).toEqual(updatedCaptions);
  });

  it('should replace only the whole word', () => {
    const captions = [fakeTextArea(`The dominant language to
manipulate the dom is JavaScript`)];
    const updatedCaptions = [`The dominant language to
manipulate the DOM is JavaScript`,
    ];
    expect(searchAndReplace(captions, 'dom', 'DOM')).toEqual(updatedCaptions);
  });
});

describe('Several words replacement', () => {
  it('should manage several words on the same line', () => {
    const captions = [fakeTextArea(`The java script language
is great when spelled correctly`)];
    const updatedCaptions = [`The JavaScript language
is great when spelled correctly`,
    ];
    expect(searchAndReplace(captions, 'java script', 'JavaScript')).toEqual(updatedCaptions);
  });

  it('should handle 2-words expressions broken on two different lines', () => {
    const captions = [fakeTextArea(`Starting to learn the java
script language is a good idea`)];
    const updatedCaptions = [`Starting to learn the JavaScript
language is a good idea`,
    ];
    expect(searchAndReplace(captions, 'java script', 'JavaScript')).toEqual(updatedCaptions);
  });

  it('should handle several-words expressions broken on two different lines on the first word', () => {
    const captions = [fakeTextArea(`Let's talk about visual
studio code, shall we?`)];
    const updatedCaptions = [`Let's talk about Visual Studio Code,
shall we?`,
    ];
    expect(searchAndReplace(captions, 'visual studio code', 'Visual Studio Code')).toEqual(updatedCaptions);
  });

  it('should handle several-words expressions broken on two different lines on the second word', () => {
    const captions = [fakeTextArea(`Let's talk about visual studio
code, shall we?`)];
    const updatedCaptions = [`Let's talk about Visual Studio Code,
shall we?`,
    ];
    expect(searchAndReplace(captions, 'visual studio code', 'Visual Studio Code')).toEqual(updatedCaptions);
  });
});
