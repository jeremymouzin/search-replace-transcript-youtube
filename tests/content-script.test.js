const searchAndReplace = require('../extension/content-script');

function fakeTextArea(textContent) {
  return {
    textContent,
    value: textContent,
    dispatchEvent: () => {},
  };
}
/* A simple test example */

it('should replace a word with the replacement', () => {
  const captions = [fakeTextArea(`The dom is awesome and is
even better in uppercase!`)];
  const updatedCaptions = [`The DOM is awesome and is
even better in uppercase!`,
  ];
  expect(searchAndReplace(captions, 'dom', 'DOM')).toEqual(updatedCaptions);
});

/* Draft about what's need to be tested later */

// const expressionsToFix = [
//   ["javascript", "JavaScript"],
//   ["java script", "JavaScript"],
//   ["visual studio code", "Visual Studio Code"],
// ]

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
