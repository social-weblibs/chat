function createMixins (lib, mylib) {
  'use strict';

  var mixins = {};

  require('./interfacecreator')(lib, mixins);
  require('./conversationbriefcreator')(lib, mixins);

  mylib.mixins = mixins;
}
module.exports = createMixins;
