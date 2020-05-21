function createChatActivityDisplayer (lib, arrayopslib, mylib) {
  'use strict';

  function ChatActivityDisplayerMixin () {
    this.chatActiveUsers = null;
    this.chatActiveOriginalText = null;
    this.chatActiveConversationID = null;
  }
  ChatActivityDisplayerMixin.prototype.destroy = function () {
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
    lib.runNext(this.deactivateChatActivity.bind(this, activityobj), 6*lib.intervals.Second);
    activityobj = null;
  };
  ChatActivityDisplayerMixin.prototype.setChatActiveConversationId = function (activityobj) {
    if (!activityobj) {
      this.resetChatActivity();
    }
    this.chatActiveConversationID = activityobj.id;
  };
  ChatActivityDisplayerMixin.prototype.setChatActiveUsers = function (activityobj) {
    var whoindex, who = activityobj.user, p2p = activityobj.p2p;
    if (p2p) {
      this.chatActiveUsers = lib.isVal(who) ? '' : null;
      return;
    }
    if (lib.isArray(this.chatActiveUsers)) {
      if (who) {
        whoindex = this.chatActiveUsers.indexOf(who);
        if (whoindex<0) {
          this.chatActiveUsers.push(who);
          return;
        }
        //maybe move "who" to the head of this.chatActiveUsers?
        return;
      }
      return;
    }
    this.chatActiveUsers = who ? [who] : null;
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
    var userind, el;
    if (!activityobj) {
      return;
    }
    if (activityobj.id !== this.chatActiveConversationID) {
      return;
    }
    if (activityobj.p2p) {
      this.resetChatActivity();
      return;
    }
    if (!lib.isArray(this.chatActiveUsers)) {
      return;
    }
    userind = this.chatActiveUsers.indexOf(activityobj.user);
    if (userind<0) {
      return;
    }
    this.chatActiveUsers.splice(userind, 1);
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
    return users.join(', ')+' ';
  }

  ChatActivityDisplayerMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatActivityDisplayerMixin
      ,'showChatUserActivity'
      ,'setChatActiveConversationId'
      ,'setChatActiveUsers'
      ,'setChatActiveText'
      ,'resetChatActivity'
      ,'findChatActivityElement'
      ,'deactivateChatActivity'
    );
  };

  mylib.ChatActivityDisplayer = ChatActivityDisplayerMixin;
}
module.exports = createChatActivityDisplayer;
