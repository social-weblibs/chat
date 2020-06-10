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
    this.messageBoxFocused = this.createBufferableHookCollection();
    this.messageBoxBlurred = this.createBufferableHookCollection();
    this.timer = new timerlib.Timer(this.onHeartbeatTimer.bind(this));
    this.activechat = null;
    this.lastnotification = null;
    this.chatmessages = null;
  }
  ChatInterfaceMixin.prototype.destroy = function () {
    this.chatmessages = null;
    this.lastnotification = null;
    this.activechat = null;
    if (this.messageBoxBlurred) {
      this.messageBoxBlurred.destroy();
    }
    this.messageBoxBlurred = null;
    if (this.messageBoxFocused) {
      this.messageBoxFocused.destroy();
    }
    this.messageBoxFocused = null;
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
