function createMessageProcessing (lib, mylib) {
  'use strict';

  function processMessage (message) {
    return message.replace(/_([^_]*)_/g, '<i>$1</i>').replace(/\*([^\*]*)\*/g, '<b>$1</b>');
  };
  mylib.processMessage = processMessage;
}
module.exports = createMessageProcessing;
