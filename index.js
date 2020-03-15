(function (execlib) {
  var mylib = {};

  var lib = execlib.lib;

  require('./messageprocessingcreator')(lib, mylib);
  require('./mixins')(lib, mylib);

  execlib.execSuite.libRegistry.register('social_chatweblib', mylib);
})(ALLEX);
