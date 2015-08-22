var assert = require("assert");
var Timer = require("./timer.js");


function TasksQueue() {
  this._tasks = [];
}
TasksQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._tasks.length > 0;
  },

  processWorkUnits: function() {
    while (this.hasPendingWorkUnits()) {
      var task = this._tasks.pop();
      task(this)
    }
  }, 

  pushTask: function(task) {
    this._tasks.push(task);
  }
}

function IOQueue(select) {
  this._select = select;
}
IOQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._select.hasPendingEvents();
  },

  processWorkUnits: function() {
    while (this._select.hasAvailableEvents()) {
      var event = this._select.nextEvent();
      event.fire(this);
    }
  }
}

function TimersQueue(clock) {
  this._clock = clock;
  this._timers = [];
}
TimersQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._timers.length > 0
  },

  processWorkUnits: function() {
    while(this.hasPendingWorkUnits() && this._timers[0].expired(this._clock)) {
      var timer = this._timers.pop();
      timer.fire(this);
    }
  },

  pushTimer: function(timeout, handler) {
    this._timers.push(
      new Timer(
        this._clock.now().plus(timeout),
        handler))
  }
}

function Reactor(workQueues) {
  this._stopped = true;
  this._workQueues = workQueues;
}
Reactor.prototype = {
  run: function() {
    this.withinRun(function() {
      while (this.hasPendingWorkUnits()) {
        this.processWorkUnits();
      }      
    });
  },

  hasPendingWorkUnits: function() {
    return this._workQueues.some(function(queue){
      return queue.hasPendingWorkUnits();
    });
  },

  processWorkUnits: function() {
    return this._workQueues.forEach(function(queue){
      return queue.processWorkUnits();
    });
  },

  withinRun: function(action) {
    this._stopped = false;
    try {
      action.call(this);      
    } finally {
      this._stopped = true;
    }
  },

  isStopped: function() {
    return this._stopped;
  }
}

function IO(select) {
  this._select = select;
}

IO.prototype = {
  read: function(cont) {
    this._select.pushEvent("read-console", cont);
  } 
}

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

function Event(result, handler) {
  this._result = result;
  this._handler = handler;
}

Event.prototype.fire = function(reactor) {
  this._handler(this._result, reactor);
}

function FakeClock() {
}

FakeClock.prototype.now = function() {
  return { 
    after: function(other) { return true; },
    plus: function() { return {} }
  }
}

function FakeSelect() {
  this._availableEvents = [];
}

FakeSelect.prototype = {
  pushEvent: function(_event, handler) {
    this._availableEvents.push(new Event("hola", handler));
  }, 
  nextEvent: function() {
    return this._availableEvents.pop();
  },
  hasAvailableEvents: function() {
    return this._availableEvents.length > 0;
  },
  hasPendingEvents: function() {
    return this.hasAvailableEvents();
  }
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