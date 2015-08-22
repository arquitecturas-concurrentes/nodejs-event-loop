var assert = require("assert");

function FullReactor(select, clock) {
  this._select = select;
  this._tasks = [];
  this._stopped = true;
  this._timers = [];
  this._clock = clock;
}

FullReactor.prototype = {
  run: function() {
    this.withinRun(function() {
      while (
        this.hasPendingIO() ||
        this.hasPendingTasks() || 
        this.hasPendingTimers()) {

        this.processTasks();
        this.processIO(); 
        this.processTimers(); 
      }
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

  get io() {
    return new IO(this._select);
  },

  hasPendingTimers: function() {
    return this._timers.length > 0
  },

  processTimers: function() {
    while(this.hasPendingTimers() && this._timers[0].expired(this._clock)) {
      var timer = this._timers.pop();
      timer.fire(this);
    }
  },

  hasPendingIO: function() {
    return this._select.hasPendingEvents();
  },

  processIO: function() {
    while (this._select.hasAvailableEvents()) {
      var event = this._select.nextEvent();
      event.fire(this);
    }
  },


  hasPendingTasks: function() {
    return this._tasks.length > 0;
  },

  processTasks: function() {
    while (this.hasPendingTasks()) {
      var task = this._tasks.pop();
      task(this)
    }
  },

  isStopped: function() {
    return this._stopped;
  },

  doLater: function(task) {
    this._tasks.push(task);
  },

  doAfter: function(timeout, handler) {
    this._timers.push(
      new Timer(
        this._clock.now().plus(timeout),
        handler));
  }
}

function Timer(timeout, handler) {
  this._timeout = timeout;
  this._handler = handler;
}

Timer.prototype = {
  expired: function(clock) {
    return clock.now().after(this._timeout);
  },

  fire: function(reactor) {
    this._handler(reactor);
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
  var reactor = new FullReactor(new FakeSelect(), new FakeClock());

  it("ends when nothing is scheduled", function(){
    reactor.run();
    assert(reactor.isStopped());
  });

  it("can enqueue single task", function(){
    var x = 0;

    reactor.doLater(function(){ x++; });

    assert(reactor.isStopped());
    assert(x == 0);
  });



  it("can execute enqued tasks", function(){
    var x = 0;

    reactor.doLater(function(){ x++; });

    reactor.run();
    assert(reactor.isStopped());
    assert.equal(x, 1);
  });

  it("can is not stopped while running", function(done){

    reactor.doLater(function(){
      assert(!reactor.isStopped());
      done();
    });

    reactor.run();
  });

  it("can schedule more tasks within a task", function(done){

    reactor.doLater(function(reactor){
      reactor.doLater(function(){
        done();
      })
    });

    reactor.run();
    assert(reactor.isStopped());
  });


  it("is stoped on exception", function(){
    reactor.doLater(function(){
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

    reactor.doLater(function(reactor){
      reactor.io.read(function(result){
        x = result;
      });
    });

    reactor.run();

    assert(reactor.isStopped());
    assert.equal(x, "hola");
  });

  it("can schedule tasks fires within io", function(done) {
    reactor.doLater(function(reactor){
      reactor.io.read(function(result, reactor){
        reactor.doLater(function(){
          done();
        });
      });
    });

    reactor.run();
  });


  it("can schedule timers", function() {
    reactor.doAfter(100, function() {})


    assert(reactor.hasPendingTimers());
  });


  it("can run timers", function() {
    var x = 0; 

    reactor.doAfter(100, function() {x++})
    reactor.doAfter(100, function() {x++})


    reactor.run();

    assert(!reactor.hasPendingTimers());
    assert.equal(x, 2);
    assert(reactor.isStopped());
  });



})