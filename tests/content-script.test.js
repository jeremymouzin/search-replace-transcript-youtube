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
/*
it('should manage spaces in search expression', () => {
  const captions = [fakeTextArea(`The java script language
is great when spelled correctly`)];
  const updatedCaptions = [`The JavaScript language
is great when spelled correctly`,
  ];
  expect(searchAndReplace(captions, 'java script', 'JavaScript')).toEqual(updatedCaptions);
});

it('should manage multiples words in search expression', () => {
  const captions = [fakeTextArea(`An IDE like visual studio code
is great when spelled correctly`)];
  const updatedCaptions = [`An IDE like Visual Studio Code
is great when spelled correctly`,
  ];
  expect(searchAndReplace(captions, 'visual studio code', 'Visual Studio Code')).toEqual(updatedCaptions);
});

it('should handle 2-words expressions broken on two different lines', () => {
  const captions = [fakeTextArea(`Starting to learn the java
script language is a good idea`)];
  const updatedCaptions = [`Starting to learn the JavaScript
language is a good idea`,
  ];
  expect(searchAndReplace(captions, 'java script', 'JavaScript')).toEqual(updatedCaptions);
});

/* Draft about what's need to be tested later */

// const test0 = `Grâce à visual studio
// code, vous pouvez faire...`;
// const test1 = `Vive le java
// script c'est génial`;
// const test2 = ` Vive le javascript
//   c'est génial    `;

// expressionsToFix.forEach(([expressionToSearch, replacement]) => {
//   const regExpSearch = new RegExp(expressionToSearch.replace(/ /g, "([ \\n])*"), "gm");
//   console.log(regExpSearch);
// });

// function searchAndReplace(text) {
//   console.log(`ENTRÉE:
// ${text}`);

//   /*
//   Create RegExp to manage edge cases like:
//   1. Expressions with spaces in it and words across multiple lines
//   Example: "visual studio code" shoud be fixed to "Visual Studio Code" and
//   in the text you have this:
//   "Thanks to visual studio"
//   "code, you can use lots of..."
//   2. Manage all words !
//   3. Manage bad inputs from user (spaces before or after)
//   */
//   let out = text.replace(/java([ \n])*script/, "JavaScript$1");
//   // Remove any trailing spaces at the beginning and end of lines
//   out = out.replace(/^ +/gm, "");
//   out = out.replace(/ +$/gm, "");
//   console.log(`SORTIE
// ${out}`);
//   console.log("---");
// }
