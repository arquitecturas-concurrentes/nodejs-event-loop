function FakeClock() {
}

FakeClock.prototype.now = function() {
  return {
    after: function(other) { return true; },
    plus: function() { return {} }
  }
}

module.exports = FakeClock;
