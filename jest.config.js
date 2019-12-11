module.exports = {
  /* This is used to mock the Chrome API */
  globals: {
    chrome: {
      runtime: {
        onMessage: {
          addListener() {},
        },
      },
    },
  },
};
