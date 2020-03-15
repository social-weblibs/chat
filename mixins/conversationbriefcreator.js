function createChatConversationBriefMixin (lib, mylib) {
  'use strict';

  function ChatConversationBriefMixin () {
    this.selected = new lib.HookCollection();
    this.clicker = this.onChatConversationBriefClicked.bind(this);
  }
  ChatConversationBriefMixin.prototype.destroy = function () {
    if (this.$element && this.clicker) {
      this.$element.off('click', this.clicker);
    }
    this.clicker = null;
    if (this.selected) {
      this.selected.destroy();
    }
    this.selected = null;
  };
  ChatConversationBriefMixin.prototype.initChatConversationBrief = function () {
    if (this.$element) {
      this.$element.on('click', this.clicker);
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
        (lib.isNumber(nr) && nr>0) ? umel.show() : umel.hide();
        umel.text(lib.isNumber(nr) ? (nr>100 ? '99+' : nr) : '');
      }
    }
    //console.log('msgs', data.conv);
  };
  ChatConversationBriefMixin.prototype.maybeHideUnreadMessages = function () {
    return this.__parent && this.__parent.__parent && this.__parent.__parent.activechat===this;
  };

  ChatConversationBriefMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatConversationBriefMixin
      ,'initChatConversationBrief'
      ,'onChatConversationBriefClicked'
      ,'handleConversationData'
      ,'maybeHideUnreadMessages'
    );
    klass.prototype.postInitializationMethodNames = 
      klass.prototype.postInitializationMethodNames.concat('initChatConversationBrief');
  };

  mylib.ChatConversationBrief = ChatConversationBriefMixin;
}
module.exports = createChatConversationBriefMixin;
