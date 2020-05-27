(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (execlib) {
  var mylib = {};

  var lib = execlib.lib,
    timerlib = execlib.execSuite.libRegistry.get('allex_timerlib'),
    arrayopslib = execlib.execSuite.libRegistry.get('allex_arrayoperationslib');

  require('./messageprocessingcreator')(lib, mylib);
  require('./mixins')(lib, timerlib, arrayopslib, mylib);

  execlib.execSuite.libRegistry.register('social_chatweblib', mylib);
})(ALLEX);

},{"./messageprocessingcreator":2,"./mixins":6}],2:[function(require,module,exports){
function createMessageProcessing (lib, mylib) {
  'use strict';

  function processMessage (message) {
    return message.replace(/\b_([^_]*)_\b/g, '<i>$1</i>').replace(/\b\*([^\*]*)\*\b/g, '<b>$1</b>');
  };
  mylib.processMessage = processMessage;
}
module.exports = createMessageProcessing;

},{}],3:[function(require,module,exports){
function createChatActivityDisplayer (lib, arrayopslib, mylib) {
  'use strict';

  var _TIMECONSTANT = 6*lib.intervals.Second;

  function ChatActivityDisplayerMixin () {
    this.chatActiveUsers = null;
    this.chatActiveOriginalText = null;
    this.chatActiveConversationID = null;
    this.chatActiveReset = 1;
  }
  ChatActivityDisplayerMixin.prototype.destroy = function () {
    this.chatActiveReset = null;
    this.chatActiveConversationID = null;
    this.chatActiveOriginalText = null;
    this.chatActiveUsers = null;
  };
  ChatActivityDisplayerMixin.prototype.showChatUserActivity = function (activityobj) {
    var el = this.findChatActivityElement();
    if (!el) {
      return;
    }
    this.setChatActiveConversationId(activityobj);
    this.setChatActiveUsers(activityobj);
    this.setChatActiveText(el);
    lib.runNext(this.deactivateChatActivity.bind(this, {
      id: activityobj.conversationid,
      user: activityobj.user,
      p2p: activityobj.p2p,
      reset: this.chatActiveReset
    }), _TIMECONSTANT);
    activityobj = null;
  };
  ChatActivityDisplayerMixin.prototype.setChatActiveConversationId = function (activityobj) {
    if (!activityobj) {
      this.resetChatActivity();
    }
    this.chatActiveConversationID = activityobj.conversationid;
  };
  ChatActivityDisplayerMixin.prototype.setChatActiveUsers = function (activityobj) {
    var whofound, who = activityobj.user, p2p = activityobj.p2p;
    if (p2p) {
      this.chatActiveUsers = lib.isVal(who) ? activeObject('', this.chatActiveReset) : null;
      return;
    }
    if (lib.isArray(this.chatActiveUsers)) {
      if (who) {
        whofound = arrayopslib.findElementWithProperty(this.chatActiveUsers, 'user', who);//this.chatActiveUsers.indexOf(who);
        if (!whofound) { //whoindex<0) {
          this.chatActiveUsers.push(activeObject(who, this.chatActiveReset));
          return;
        }
        extendActiveObject(whofound);
        //maybe move "who" to the head of this.chatActiveUsers?
        return;
      }
      return;
    }
    this.chatActiveUsers = who ? [activeObject(who, this.chatActiveReset)] : null;
  };
  ChatActivityDisplayerMixin.prototype.setChatActiveText = function (el) {
    if (this.chatActiveOriginalText === null) {
      this.chatActiveOriginalText = el.text();
    }
    el.text(userstotext(this.chatActiveUsers)+'Typing');
  };
  ChatActivityDisplayerMixin.prototype.resetChatActivity = function () {
    var el;
    if (this.chatActiveOriginalText) {
      el = this.findChatActivityElement();
      if (el) {
        el.text(this.chatActiveOriginalText);
      }
    }
    this.chatActiveConversationID = null;
    this.chatActiveOriginalText = null;
    this.chatActiveUsers = null;
  };
  ChatActivityDisplayerMixin.prototype.resetOriginalText = function () {
    var el;
    if (!lib.isNumber(this.chatActiveReset)) {
      return;
    }
    this.chatActiveReset++;
    el = this.findChatActivityElement();
    this.chatActiveOriginalText = el ? el.text() : null;
  };
  ChatActivityDisplayerMixin.prototype.findChatActivityElement = function () {
    var el;
    if (!this.$element) {
      return null;
    }
    el = this.$element.find('.chatactivity');
    if (!(el && el[0])) {
      return null;
    }
    return el;
  };
  ChatActivityDisplayerMixin.prototype.deactivateChatActivity = function (activityobj) {
    var userfound, el;
    if (!activityobj) {
      return;
    }
    if (activityobj.id !== this.chatActiveConversationID) {
      return;
    }
    if (activityobj.reset !== this.chatActiveReset) {
      return;
    }
    userfound = arrayopslib.findElementAndIndexWithProperty(this.chatActiveUsers, 'user', activityobj.user);
    if (!(userfound && userfound.element)) {
      return;
    }
    if (Date.now() < userfound.element.until) {
      return;
    }
    if (activityobj.p2p) {
      this.resetChatActivity();
      return;
    }
    if (!lib.isArray(this.chatActiveUsers)) {
      return;
    }
    this.chatActiveUsers.splice(userfound.index, 1);
    if (this.chatActiveUsers.length<1) {
      this.resetChatActivity();
      return;
    }
    el = this.findChatActivityElement();
    if (el) {
      this.setChatActiveText(el);
    }
  };

  function userstotext (users) {
    if (!lib.isArray(users)) {
      return '';
    }
    if (users.length<1) {
      return '';
    }
    return users.reduce(commajoiner, '')+' ';
  }

  function commajoiner (res, item) {
    if (res.length>0) {
      res+=', ';
    }
    res += item.user;
    return res;
  }

  function activeObject (who, resetid) {
    return {user: who, reset: resetid, until: Date.now()+_TIMECONSTANT};
  }

  function extendActiveObject (obj) {
    obj.until = Date.now() + _TIMECONSTANT;
  }

  ChatActivityDisplayerMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatActivityDisplayerMixin
      ,'showChatUserActivity'
      ,'setChatActiveConversationId'
      ,'setChatActiveUsers'
      ,'setChatActiveText'
      ,'resetChatActivity'
      ,'resetOriginalText'
      ,'findChatActivityElement'
      ,'deactivateChatActivity'
    );
  };

  mylib.ChatActivityDisplayer = ChatActivityDisplayerMixin;
}
module.exports = createChatActivityDisplayer;

},{}],4:[function(require,module,exports){
function createChatConversationBriefMixin (lib, mylib) {
  'use strict';

  function ChatConversationBriefMixin () {
    this.selected = new lib.HookCollection();
    this.clicker = this.onChatConversationBriefClicked.bind(this);
  }
  ChatConversationBriefMixin.prototype.destroy = function () {
    var cel = this.findChatClickableElement();
    if (cel && this.clicker) {
      cel.off('click', this.clicker);
    }
    this.clicker = null;
    if (this.selected) {
      this.selected.destroy();
    }
    this.selected = null;
  };
  ChatConversationBriefMixin.prototype.initChatConversationBrief = function () {
    var cel = this.findChatClickableElement();
    if (cel) {
      cel.on('click', this.clicker);
    }
  };
  ChatConversationBriefMixin.prototype.onChatConversationBriefClicked = function () {
    this.selected.fire(this);
  };
  ChatConversationBriefMixin.prototype.handleConversationData = function (data) {
    var umel, nr;
    if (this === this.__parent.activechat) {
      return;
    }
    if (!(data && data.conv)) {
      return;
    }
    if (!this.$element) {
      return;
    }
    nr = data.conv.nr;
    umel = this.$element.find('.UnreadMessages');
    if (umel) {
      if (this.maybeHideUnreadMessages()) {
        umel.hide();
      } else {
        updateUnreadMessagesElement(umel, nr);
      }
    }
    //console.log('msgs', data.conv);
  };
  ChatConversationBriefMixin.prototype.maybeHideUnreadMessages = function () {
    return this.__parent && this.__parent.__parent && this.__parent.__parent.activechat===this;
  };
  ChatConversationBriefMixin.prototype.maybeDecreaseUnreadMessages = function () {
    var umel, val;
    if (!this.$element) {
      return;
    }
    umel = this.$element.find('.UnreadMessages');
    if (!(umel && umel[0])) {
      return;
    }
    if (umel.is(':hidden')) {
      return;
    }
    val = parseInt(umel.text());
    if (!lib.isNumber(val)) {
      return;
    }
    if (val<1) {
      return;
    }
    updateUnreadMessagesElement(umel, val-1);
  };
  ChatConversationBriefMixin.prototype.findChatClickableElement = function () {
    var cce;
    if (!this.$element) {
      return null;
    }
    cce = this.getConfigVal('chatclickableelement');
    return cce ? this.$element.find(cce) : this.$element;
  };

  function updateUnreadMessagesElement(umel, nr) {
    (lib.isNumber(nr) && nr>0) ? umel.show() : umel.hide();
    umel.text(lib.isNumber(nr) ? (nr>100 ? '99+' : nr) : '');
  }

  ChatConversationBriefMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatConversationBriefMixin
      ,'initChatConversationBrief'
      ,'onChatConversationBriefClicked'
      ,'handleConversationData'
      ,'maybeHideUnreadMessages'
      ,'maybeDecreaseUnreadMessages'
      ,'findChatClickableElement'
    );
    klass.prototype.postInitializationMethodNames = 
      klass.prototype.postInitializationMethodNames.concat('initChatConversationBrief');
  };

  mylib.ChatConversationBrief = ChatConversationBriefMixin;
}
module.exports = createChatConversationBriefMixin;

},{}],5:[function(require,module,exports){
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


},{}],6:[function(require,module,exports){
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

},{"./activitydisplayercreator":3,"./conversationbriefcreator":4,"./heartbeathandlercreator":5,"./interfacecreator":7}],7:[function(require,module,exports){
function createChatInterfaceMixin (lib, timerlib, arrayopslib, mylib) {
  'use strict';

  function ChatInterfaceMixin () {
    this.needConversations = this.createBufferableHookCollection();
    this.needInitiations = this.createBufferableHookCollection();
    this.needMessages = this.createBufferableHookCollection();
    this.messageSeen = this.createBufferableHookCollection();
    this.messageToSend = this.createBufferableHookCollection();
    this.messageToEdit = this.createBufferableHookCollection();
    this.active = this.createBufferableHookCollection();
    this.needGroupCandidates = this.createBufferableHookCollection();
    this.needGroupInfoDisplay = this.createBufferableHookCollection();
    this.chatSelected = this.createBufferableHookCollection();
    this.forgetSelected = this.createBufferableHookCollection();
    this.needUserNameForId = this.createBufferableHookCollection();
    this.userActive = this.createBufferableHookCollection();
    this.heartbeat = this.createBufferableHookCollection();
    this.timer = new timerlib.Timer(this.onHeartbeatTimer.bind(this));
    this.activechat = null;
    this.lastnotification = null;
    this.chatmessages = null;
  }
  ChatInterfaceMixin.prototype.destroy = function () {
    this.chatmessages = null;
    this.lastnotification = null;
    this.activechat = null;
    if (this.heartbeat) {
      this.heartbeat.destroy();
    }
    this.heartbeat = null;
    if (this.userActive) {
      this.userActive.destroy();
    }
    this.userActive = null;
    if (this.needUserNameForId) {
      this.needUserNameForId.destroy();
    }
    this.needUserNameForId = null;
    if (this.forgetSelected) {
      this.forgetSelected.destroy();
    }
    this.forgetSelected = null;
    if (this.chatSelected) {
      this.chatSelected.destroy();
    }
    this.chatSelected = null;
    if (this.needGroupInfoDisplay) {
      this.needGroupInfoDisplay.destroy();
    }
    this.needGroupInfoDisplay = null;
    if (this.needGroupCandidates) {
      this.needGroupCandidates.destroy();
    }
    this.needGroupCandidates = null;
    if (this.active) {
      this.active.destroy();
    }
    this.active = null;
    if (this.messageToEdit) {
      this.messageToEdit.destroy();
    }
    this.messageToEdit = null;
    if (this.messageToSend) {
      this.messageToSend.destroy();
    }
    this.messageToSend = null;
    if (this.messageSeen) {
      this.messageSeen.destroy();
    }
    this.messageSeen = null;
    if (this.needMessages) {
      this.needMessages.destroy();
    }
    this.needMessages = null;
    if (this.needInitiations) {
      this.needInitiations.destroy();
    }
    this.needInitiations = null;
    if (this.needConversations) {
      this.needConversations.destroy();
    }
    this.needConversations = null;
  };
  ChatInterfaceMixin.prototype.set_lastnotification = function (data) {
    var mydata, affectedwi, newaff, newdata, mychatmessages;
    if (!this.needUserNameForId) {
      return;
    }
    console.log('lastnotification', data);
    if (data.newgroup) {
      this.appendConversation({
        id: data.id,
        resolve: data.resolve,
        conv: {
          lastm: null,
          nr: 0,
          cby: data.affected[0],
          p2p: data.p2p,
          mids: data.mids,
          picture: data.picture,
          name: data.name
        }
      });
      return false; //doesn't need to be false actually
    }
    if (data.newgroupmember) {
      //ask for alteration of the group data.id to add the data.newgroupmember
      this.needUserNameForId.fire({
        context: data,
        userid: data.newgroupmember,
        username: null
      });
      return false;
    }
    if (data.activity) {
      if (!data.p2p) {
        this.needUserNameForId.fire({
          context: data,
          userid: data.activity,
          username: null
        });
        return false;
      }
      this.userActive.fire({
        p2p: true,
        conversationid: data.id,
        user: ''
      });
      return false;
    }
    mydata = this.get('data');
    if (!lib.isArray(mydata)) {
      return false;
    }
    affectedwi = lib.arryOperations.findElementAndIndexWithProperty(mydata, 'id', data.id);
    if (!(affectedwi && lib.isNumber(affectedwi.index) && affectedwi.element)) {
      affectedwi = lib.arryOperations.findElementAndIndexWithProperty(mydata, 'chatId', data.id);
      if (!(affectedwi && lib.isNumber(affectedwi.index) && affectedwi.element)) {
        return false;
      }
    }
    newaff = lib.extend({}, affectedwi.element);
    newaff.conv = newaff.conv || {};
    if (lib.isArray(data.mids) && data.mids.length>0) {
      if (newaff && newaff.conv && newaff.conv.lastm && newaff.conv.lastm.id !== data.mids[0]) {
        throw new Error('My lastm id '+newaff.conv.lastm.id+' should have matched incoming '+data.mids[0]);
      }
      newaff.conv.nr = data.nr;
      newaff.conv.lastm = lib.extend({id: data.mids.length<2 ? data.mids[0] : data.mids[1]}, data.lastm);
    }
    data2newaff(data, 'rcvdat', newaff, 'rcvdm');
    data2newaff(data, 'seenat', newaff, 'seenm');
    data2newaff(data, 'editedmessage', newaff, 'editedm', 'editedmessage');
    data2newaff(data, 'preview', newaff, 'preview', 'preview', true);
    newdata = mydata.slice();
    newdata[affectedwi.index] = newaff;
    this.set('data', newdata);

    this.lastnotification = newaff;

    /*
    mychatmessages = this.get('chatmessages');
    if (mychatmessages[mychatmessages.length-1].id === data.mids[0]) {
      this.set('chatmessages', mychatmessages.concat([newaff.conv.lastm]));
    }
    */
    return true;
  };
  function isAcceptableString (thingy) {
    return lib.isString(thingy) && thingy.length;
  }
  ChatInterfaceMixin.prototype.initiateWithUsers = function (usernames) {
    this.set('data', null);
    if (!(lib.isArray(usernames) && usernames.every(isAcceptableString))) {
      //console.warn('initiateWithUsers must receive usernames as an Array of non-zero length strings');
      return;
    }
    this.needInitiations.fire(usernames);
  };
  ChatInterfaceMixin.prototype.handleSelectedChat = function (selected) {
    this.set('activechat', selected);
    this.chatSelected.fire(selected);
  };
  ChatInterfaceMixin.prototype.handleMessageSeen = function (msgid) {
    if (!this.activechat) {
      return;
    }
    this.messageSeen.fire({convid: this.activechat.get('data').id, msgid: msgid});
  };
  ChatInterfaceMixin.prototype.detachActiveChat = function () {
    this.set('activechat', null);
    this.forgetSelected.fire(true);
  };
  ChatInterfaceMixin.prototype.userNameForId = function (queryobj) {
    var context;
    if (!(queryobj && queryobj.context)) {
      return;
    }
    context = queryobj.context;
    if (context.activity) {
      this.userActive.fire({
        p2p: context.p2p,
        conversationid: context.id,
        user: queryobj.username
      });
      return;
    }
    if (context.newgroupmember) {
      this.alterOrAppendConversation({
        id: context.id,
        resolve: context.resolve,
        conv: {
          lastm: context.lastm,
          nr: context.nr,
          cby: context.cby,
          p2p: context.p2p,
          mids: context.mids,
          picture: context.picture,
          name: context.name
        }
      });
      return;
    }
  };
  ChatInterfaceMixin.prototype.appendConversation = function (conversationobj) {
    var mydata = (this.get('data') || []).slice(); //these are conversations
    mydata.push(conversationobj);
    this.set('data', mydata);
  };
  ChatInterfaceMixin.prototype.alterOrAppendConversation = function (conversationobj) {
    var mydata, found;
    mydata = this.get('data');
    if (lib.isArray(mydata)) {
      found = arrayopslib.findElementWithProperty(mydata, 'id', conversationobj.id);
    }
    if (found) {
      lib.extend(found, conversationobj);
      this.set('data', mydata.slice());
      return;
    }
    this.appendConversation(conversationobj);
  };
  ChatInterfaceMixin.prototype.onHeartbeatTimer = function () {
    if (!this.heartbeat) {
      return;
    }
    this.heartbeat.fire(Date.now());
  };

  ChatInterfaceMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatInterfaceMixin
      ,'set_lastnotification'
      ,'initiateWithUsers'
      ,'handleSelectedChat'
      ,'handleMessageSeen'
      ,'detachActiveChat'
      ,'userNameForId'
      ,'appendConversation'
      ,'alterOrAppendConversation'
      ,'onHeartbeatTimer'
    );
  };

  function data2newaff (data, critpropname, newaff, newaffconvpropname, dataselectpropname, doin) {
    var crit = doin ? (critpropname in data) : (data[critpropname]);
    if (crit) {
      newaff.conv[newaffconvpropname] = dataselectpropname ? data[dataselectpropname] : data;
    } else {
      if (newaff.conv && newaff.conv[newaffconvpropname]) {
        newaff.conv[newaffconvpropname] = null;
      }
    }
  }

  mylib.Interface = ChatInterfaceMixin;
}
module.exports = createChatInterfaceMixin;

},{}]},{},[1]);
