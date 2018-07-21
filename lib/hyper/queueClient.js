/*jshint node: true */
'use strict';

var
  util = require('util'),
  QUEUE = require('./const'),
  Base = require('./clientBase');

function QueueClient() {
  Base.ClientBase.call(this);

  var
    cmdList = {};

  this.send = function (/* CommandBase */ obj, data)
  {
    var commandId = this.sendCommand(obj.getCommandData(), data);
    cmdList[commandId] = obj;
    return obj.deferred;
  };

  this.handle = function (msg)
  {
    if (msg.id && cmdList[msg.id])
    {
      var wait = cmdList[msg.id];
      if (wait.settle(this, msg))
      {
        delete cmdList[msg.id];
      }
    }
    else {
      // unknown command ID arrived, nothing to do, could write error?
      console.log('UNKNOWN PACKAGE', msg);
    }
  };
}
util.inherits(QueueClient, Base.ClientBase);

function ClientGate() {
  this.handle = function(session, msg) {
//console.log('>c', msg);  
    session.handle(msg);
  }
}

exports.QueueClient = QueueClient;
exports.ClientGate = ClientGate;

QueueClient.prototype.echo = function (data)
{
  return this.send(new Base.Echo(), data);
};

QueueClient.prototype.register = function (uri, taskCallback)
{
  return this.send(new Base.Register(uri, taskCallback), undefined);
};

QueueClient.prototype.unRegister = function (uri)
{
  return this.send(new Base.UnRegister(uri), undefined);
};

QueueClient.prototype.call = function (uri, data, callback)
{
  return this.send(new Base.Call(uri, callback), data);
};

// trace all messages in the queue
QueueClient.prototype.trace = function (uri, taskCallback, opt)
{
  return this.send(new Base.Trace(uri, taskCallback, opt), undefined);
};

QueueClient.prototype.unTrace = function (uri)
{
  return this.send(new Base.UnTrace(uri), undefined);
};

QueueClient.prototype.push = function (uri, data, opt)
{
  return this.send(new Base.Push(uri, opt), data);
};