function createChatInterfaceMixin (lib, mylib) {
  'use strict';

  function ChatInterfaceMixin () {
    this.needConversations = this.createBufferableHookCollection();
    this.needInitiations = this.createBufferableHookCollection();
    this.needMessages = this.createBufferableHookCollection();
    this.messageSeen = this.createBufferableHookCollection();
    this.messageToSend = this.createBufferableHookCollection();
    this.needGroupCandidates = this.createBufferableHookCollection();
    this.activechat = null;
    this.lastnotification = null;
    this.chatmessages = null;
  }
  ChatInterfaceMixin.prototype.destroy = function () {
    this.chatmessages = null;
    this.lastnotification = null;
    this.activechat = null;
    if (this.needGroupCandidates) {
      this.needGroupCandidates.destroy();
    }
    this.needGroupCandidates = null;
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
    var mydata = this.get('data'), affectedwi, newaff, newdata,
      mychatmessages;
    if (!lib.isArray(mydata)) {
      return false;
    }
    if (data.rcvdby) {
      //handle message rcvd notification
      //return false;
    }
    if (data.seenby) {
      //handle message seen notification
      //return false;
    }
    affectedwi = lib.arryOperations.findElementAndIndexWithProperty(mydata, 'id', data.id);
    if (!(affectedwi && lib.isNumber(affectedwi.index) && affectedwi.element)) {
      affectedwi = lib.arryOperations.findElementAndIndexWithProperty(mydata, 'chatId', data.id);
      if (!(affectedwi && lib.isNumber(affectedwi.index) && affectedwi.element)) {
        return false;
      }
    }
    newaff = lib.extend({}, affectedwi.element);
    newaff.conv.nr = data.nr;
    if (lib.isArray(data.mids) && data.mids.length>0) {
      if (newaff && newaff.conv && newaff.conv.lastm && newaff.conv.lastm.id !== data.mids[0]) {
        throw new Error('My lastm id '+newaff.conv.lastm.id+' should have matched incoming '+data.mids[0]);
      }
      newaff.conv.lastm = lib.extend({id: data.mids.length<2 ? data.mids[0] : data.mids[1]}, data.lastmessage);
    }
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
  ChatInterfaceMixin.prototype.handleMessageSeen = function (msgid) {
    if (!this.activechat) {
      return;
    }
    this.messageSeen.fire({convid: this.activechat.get('data').id, msgid: msgid});
  };

  ChatInterfaceMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ChatInterfaceMixin
      ,'set_lastnotification'
      ,'initiateWithUsers'
      ,'handleMessageSeen'
    );
  };

  mylib.Interface = ChatInterfaceMixin;
}
module.exports = createChatInterfaceMixin;
