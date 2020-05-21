function createMessageProcessing (lib, mylib) {
  'use strict';

  function processMessage (message) {
    return message.replace(/\b_([^_]*)_\b/g, '<i>$1</i>').replace(/\b\*([^\*]*)\*\b/g, '<b>$1</b>');
  };
  mylib.processMessage = processMessage;
}
module.exports = createMessageProcessing;
