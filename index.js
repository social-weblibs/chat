(function (execlib) {
  var mylib = {};

  var lib = execlib.lib,
    timerlib = execlib.execSuite.libRegistry.get('allex_timerlib'),
    arrayopslib = execlib.execSuite.libRegistry.get('allex_arrayoperationslib');

  require('./messageprocessingcreator')(lib, mylib);
  require('./mixins')(lib, timerlib, arrayopslib, mylib);

  execlib.execSuite.libRegistry.register('social_chatweblib', mylib);
})(ALLEX);
