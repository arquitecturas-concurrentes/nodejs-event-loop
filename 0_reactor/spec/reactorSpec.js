var assert = require("assert");

var IO = require("../io");

var IOQueue = require("../reactor/ioQueue.js");
var TasksQueue = require("../reactor/tasksQueue.js");
var TimersQueue = require("../reactor/timersQueue.js");
var Reactor = require("../reactor/reactor.js");

var FakeSelect = require("../fakeSelect");
var FakeClock = require("../fakeClock");

function Timers(timersQueue) {
  this._timersQueue = timersQueue;
}

Timers.prototype = {
  setTimeout: function(timeout, handler) {
    this._timersQueue.pushTimer(timeout, handler);
  }
}

function Process(taskQueue) {
  this._taskQueue = taskQueue;
}

Process.prototype = {
  nextTick: function(task) {
    this._taskQueue.pushTask(task);
  },
}

describe("full reactor", function() {
  var select = new FakeSelect();
  var clock = new FakeClock();

  var ioQueue = new IOQueue(select);
  var taskQueue = new TasksQueue();
  var timersQueue = new TimersQueue(clock);

  var reactor = new Reactor([
    timersQueue,
    taskQueue,
    ioQueue]);

  var io = new IO(select);
  var process = new Process(taskQueue);
  var timers = new Timers(timersQueue);

  it("ends when nothing is scheduled", function(){
    reactor.run();
    assert(reactor.isStopped());
  });

  it("can enqueue single task", function(){
    var x = 0;

    process.nextTick(function(){ x++; });

    assert(reactor.isStopped());
    assert(x == 0);
  });



  it("can execute enqued tasks", function(){
    var x = 0;

    process.nextTick(function(){ x++; });

    reactor.run();
    assert(reactor.isStopped());
    assert.equal(x, 1);
  });

  it("can is not stopped while running", function(done){

    process.nextTick(function(){
      assert(!reactor.isStopped());
      done();
    });

    reactor.run();
  });

  it("can schedule more tasks within a task", function(done){

    process.nextTick(function(reactor){
      process.nextTick(function(){
        done();
      })
    });

    reactor.run();
    assert(reactor.isStopped());
  });


  it("is stoped on exception", function(){
    process.nextTick(function(){
      throw new Error("ups");
    });

    try {
      reactor.run();
      assert.fail();
    } catch(e) {
      assert(reactor.isStopped());
    }
  });

  it("can schedule tasks that do io", function() {
    var x;

    process.nextTick(function(reactor){
      io.read(function(result){
        x = result;
      });
    });

    reactor.run();

    assert(reactor.isStopped());
    assert.equal(x, "hola");
  });

  it("can schedule tasks fires within io", function(done) {
    process.nextTick(function(reactor){
      io.read(function(result, reactor){
        process.nextTick(function(){
          done();
        });
      });
    });

    reactor.run();
  });


  it("can run timers", function() {
    var x = 0; 

    timers.setTimeout(100, function() {x++})
    timers.setTimeout(100, function() {x++})


    reactor.run();

    assert.equal(x, 2);
    assert(reactor.isStopped());
  });



})