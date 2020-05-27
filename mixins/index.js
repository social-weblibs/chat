function createMixins (lib, timerlib, arrayopslib, mylib) {
  'use strict';

  var mixins = {};

  require('./interfacecreator')(lib, timerlib, arrayopslib, mixins);
  require('./conversationbriefcreator')(lib, mixins);
  require('./heartbeathandlercreator')(lib, mixins);
  require('./activitydisplayercreator')(lib, arrayopslib, mixins);

  mylib.mixins = mixins;
}
module.exports = createMixins;
