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
    this.$element.data('chat', data);
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
