var assert = require("assert");

var FakeSelect = require("../fakeSelect");
var IO = require("../io");

function ReactorWithIO(select) {
  this._select = select;
  this._tasks = [];
  this._stopped = true;
}

ReactorWithIO.prototype = {
  run: function() {
    this.withinRun(function() {
      while (this.hasPendingIO() || this.hasPendingTasks()) {
        this.processTasks();
        this.processIO();
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
  }
}

describe("simple reactor", function() {
  var reactor = new ReactorWithIO(new FakeSelect());

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



})
