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
