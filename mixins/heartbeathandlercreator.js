function createHeartbeatHandlerMixin (lib, mylib) {
  'use strict';

  function HeartbeatHandlerMixin () {
  }
  HeartbeatHandlerMixin.prototype.destroy = function () {
  };
  HeartbeatHandlerMixin.prototype.handleHeartbeat = function (timestamp) {
    if (lib.isArray(this.subElements)) {
      this.subElements.forEach(handlertriggerer.bind(null, timestamp));
    }
    timestamp = null;
  };

  function handlertriggerer (timestamp, chld) {
    if (lib.isFunction(chld.handleHeartbeat)) {
      chld.handleHeartbeat(timestamp);
    }
  }

  HeartbeatHandlerMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, HeartbeatHandlerMixin
      ,'handleHeartbeat'
    );
  };

  mylib.HeartbeatHandler = HeartbeatHandlerMixin;
}
module.exports = createHeartbeatHandlerMixin;

