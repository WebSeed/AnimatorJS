describe('Animator', function () {

  var mockClock = null;

  beforeEach(function () {
    mockClock = {
      onTick: function () {},
      start: function () {},
      stop: function () {}
    };
  });

  describe('create', function () {
    it('should create a new Animator instance', function () {
      var animator = Animator.create();
      expect(animator instanceof Animator).toBeTruthy();
    });
  });

  describe('onFrame', function () {
    it('should notify listener with the time each frame', function () {
      var animator = Animator.create({clock: mockClock});
      var time = 0;
      animator.onFrame(function (t) {
        time = t;
      });
      animator.frame(42);
      expect(time).toBe(42);
    });
  });

  describe('frame', function () {
    it('should call the "frame" method with the time on all active animations', function () {
      var animator = Animator.create({clock: mockClock});
      var a = 0, b = 0;
      animator.active = [
        { frame: function (time) { a = time; } },
        { frame: function (time) { b = time; } }
      ];
      animator.frame(100);
      expect(a).toBe(100);
      expect(b).toBe(100);
    });
  });

  describe('animate', function () {

    it('should return a new Animation instance', function () {
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      expect(animation instanceof Animator.Animation).toBeTruthy();
    });

    it('should add the animation to the active list on "start"', function () {
        var animator = Animator.create({clock: mockClock});
        var animation = animator.animate();
        expect(animator.active.length).toBe(0);
        animation.start();
        expect(animator.active.length).toBe(1);
    });

    it('should remove the animation from the active on "stop" or "complete"', function () {
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      animation.start();
      expect(animator.active.length).toBe(1);
      animation.stop();
      expect(animator.active.length).toBe(0);
    });

    it('should start the clock on first active animation', function () {
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      spyOn(mockClock, 'start');
      animation.start();
      expect(mockClock.start).toHaveBeenCalled();
    });

    it('should stop the clock when there are no more active animations', function () {
      var startCount = 0;
      var stopCount = 0;
      mockClock = {
        isRunning: false,
        onTick: function () {},
        start: function () { this.isRunning = true; startCount += 1; },
        stop: function () { this.isRunning = false; stopCount += 1; }
      };
      var animator = Animator.create({clock: mockClock});
      var a1 = animator.animate();
      expect(startCount).toBe(0);
      expect(stopCount).toBe(0);
      a1.start();
      expect(startCount).toBe(1);
      expect(stopCount).toBe(0);
      var a2 = animator.animate();
      a2.start();
      expect(startCount).toBe(1);
      a1.stop();
      expect(stopCount).toBe(0);
      a2.stop();
      expect(stopCount).toBe(1);
    });
  });

  // See: http://www.robertpenner.com/easing
  //   t: current time (position)
  //   b: beginning value
  //   c: change in value
  //   d: duration
  describe('easing', function () {

    var testCases = [
      {t: 0, b: 0, c: 100, d: 1000},
      {t: 100, b: 0, c: 1, d: 400},
      {t: 500, b: 0, c: 1, d: 1000},
      {t: 300, b: 0, c: 1, d: 400},
      {t: 50, b: 99, c: 1, d: 50}
    ];
    var testEasing = function (easingFn, expected) {
      var testCase = null;
      var t, e;
      for (var i = 0; i < testCases.length; i++) {
        t = testCases[i];
        e = expected[i];
        var actual = easingFn(t.t, t.b, t.c, t.d);
        expect(e).toBeCloseTo(actual);
      }
    }

    it('linear', function () {
      testEasing(Animator.easing.linear, [0, 0.25, 0.5, 0.75, 100]);
    });

    it('in (quad)', function () {
      testEasing(Animator.easing.in, [0, 0.0625, 0.25, 0.5625, 100]);
    });

    it('out (quad)', function () {
      testEasing(Animator.easing.out, [0, 0.4375, 0.75, 0.9375, 100]);
    });

    it('inOut (quad)', function () {
      testEasing(Animator.easing.inOut, [0, 0.125, 0.5, 0.875, 100]);
    });

    it('inCubic', function () {
      testEasing(Animator.easing.inCubic, [0, 0.015625, 0.125, 0.421875, 100]);
    });

    it('outCubic', function () {
      testEasing(Animator.easing.outCubic, [0, 0.578125, 0.875, 0.984375, 100]);
    });

    it('inOutCubic', function () {
      testEasing(Animator.easing.inOutCubic, [0, 0.0625, 0.5, 0.9375, 100]);
    });

    it('inSine', function () {
      testEasing(Animator.easing.inSine, [0, 0.076120, 0.292893, 0.617317, 100]);
    });

    it('outSine', function () {
      testEasing(Animator.easing.outSine, [0, 0.382683, 0.707107, 0.923880, 100]);
    });

    it('inOutSine', function () {
      testEasing(Animator.easing.inOutSine, [0, 0.146447, 0.5, 0.853553, 100]);
    });

    it('inCircular', function () {
      testEasing(Animator.easing.inCircular, [0, 0.031754, 0.133974, 0.338562, 100]);
    });

    it('outCircular', function () {
      testEasing(Animator.easing.outCircular, [0, 0.661438, 0.866025, 0.968246, 100]);
    });

    it('inOutCircular', function () {
      testEasing(Animator.easing.inOutCircular, [0, 0.066987, 0.5, 0.933013, 100]);
    });
  });

  describe('Clock', function () {

    var Clock = Animator.Clock;
    var clock;

    beforeEach(function () {
      clock = Clock.create({
        requestAnimationFrame: function () {},
        cancelAnimationFrame: function () {}
      });
    });

    describe('create', function () {

      it('should create a new Clock instance', function () {
        expect(clock instanceof Clock).toBeTruthy();
      });
    });

    describe('start', function () {

      it('should start the clock running', function () {
        expect(clock.isRunning).toBeFalsy();
        clock.start();
        expect(clock.isRunning).toBeTruthy();
      });
    });

    describe('stop', function () {

      it('should stop the clock running', function () {
        expect(clock.start().stop().isRunning).toBeFalsy();
      });
    });
  });

  describe('Animation', function () {

    describe('create', function () {

      it('should return a new Animation instance', function () {
        var animation = Animator.Animation.create();
        expect(animation instanceof Animator.Animation).toBeTruthy();
      });

      it('should be possible to override the default 1000ms duration', function () {
        var animation = Animator.Animation.create();
        expect(animation.duration).toBe(1000);
        animation = Animator.Animation.create({
          duration: 500
        });
        expect(animation.duration).toBe(500);
      });

      it('should be able to initialise the optional "from", "to" and "position" properties', function () {
        var easing = function () {};
        var animation = Animator.Animation.create({
          from: 5,
          to: 6,
          easing: easing
        });
        expect(animation.from).toBe(5);
        expect(animation.to).toBe(6);
        expect(animation.easing).toBe(easing);
      });

      it('should be able to initialise the optional "target" and "property" properties', function () {
        var target = {foo: 0};
        var property = 'foo';
        var animation = Animator.Animation.create({
          target: target,
          property: property
        });
        expect(animation.target).toBe(target);
        expect(animation.property).toBe(property);
      });
    });

    describe('start', function () {

      it('should initialise animation properties', function () {
        var animation = Animator.Animation.create();
        animation.now = function () { return 42; };
        animation.start();
        expect(animation.startTime).toBe(42);
        expect(animation.currentTime).toBe(42);
        expect(animation.elapsed).toBe(0);
        expect(animation.delta).toBe(0);
        expect(animation.progress).toBe(0);
        expect(animation.frameCount).toBe(0);
      });

      it('should set the target\'s property to the "from" value (if set)', function () {
        var t = { foo: 10 };
        var animation = Animator.Animation.create({
          target: t,
          property: 'foo',
          from: 100,
          to: 200
        });
        animation.now = function () { return 0; };
        animation.start();
        expect(t.foo).toBe(100);
        expect(animation.position).toBe(100);
      });

      it('should set the "from" value from the target\'s initial value', function () {
        var t = { foo: 123 };
        var animation = Animator.Animation.create({
          target: t,
          property: 'foo',
          to: 200
        });
        animation.now = function () { return 0; };
        animation.start();
        expect(t.foo).toBe(123);
        expect(animation.from).toBe(123);
        expect(animation.position).toBe(123);
      });

      it('should start the animation running', function () {
        var animation = Animator.Animation.create();
        expect(animation.isRunning).toBeFalsy();
        animation.start();
        expect(animation.isRunning).toBeTruthy();
      });

      it('should fire a "start" event (once only)', function () {
        var animation = Animator.Animation.create();
        var countA = 0, countB = 0;
        animation
          .on('start', function (e) { countA += 1; })
          .on('start', function (e) { countB += 1; });
        animation.start().start();
        expect(countA).toBe(1);
        expect(countB).toBe(1);
      });

      it('should pass itself to "start" listeners', function () {
        var animation = Animator.Animation.create();
        var countA = 0, countB = 0;
        var ref = null;
        animation.on('start', function (a) { ref = a; });
        animation.start();
        expect(ref).toBe(animation);
      });
    });

    describe('stop', function () {

      it('should result in animation no longer running', function () {
        var animation = Animator.Animation.create();
        animation.start();
        expect(animation.isRunning).toBeTruthy();
        animation.stop();
        expect(animation.isRunning).toBeFalsy();
      });

      it('should fire a "stop" event (once only)', function () {
        var animation = Animator.Animation.create();
        var called = false;
        animation.on('stop', function (e) {
          called = true;
        });
        animation.start().stop();
        expect(called).toBeTruthy();
      });

      it('should pass itself to "stop" listeners', function () {
        var animation = Animator.Animation.create();
        var countA = 0, countB = 0;
        var ref = null;
        animation.on('stop', function (a) { ref = a; });
        animation.start().stop();
        expect(ref).toBe(animation);
      });
    });

    describe('frame', function () {

      it('should update the animation properties', function () {
        var animation = Animator.Animation.create({
          duration: 200
        });
        animation.now = function () { return 5000; };
        animation.start();
        expect(animation.startTime).toBe(5000);
        expect(animation.currentTime).toBe(5000);
        expect(animation.elapsed).toBe(0);
        expect(animation.delta).toBe(0);
        expect(animation.progress).toBe(0);
        expect(animation.frameCount).toBe(0);
        animation.frame(5080);
        expect(animation.currentTime).toBe(5080);
        expect(animation.elapsed).toBe(80);
        expect(animation.delta).toBe(80);
        expect(animation.progress).toBe(0.4);
        expect(animation.frameCount).toBe(1);
      });

      it('should fire "frame" event with itself passed back', function () {
        var animation = Animator.Animation.create({
          duration: 200
        });
        var calledA = false;
        var calledB = false;
        var ref = null;
        animation.now = function () { return 100; };
        animation.on('frame', function (a) { calledA = true; ref = a; });
        animation.on('frame', function (b) { calledB = true; });
        animation.start();
        animation.frame(101);
        expect(calledA).toBeTruthy();
        expect(calledB).toBeTruthy();
        expect(ref).toBe(animation);
      });

      it('should stop running and fire a "complete" event when progress complete', function () {
        var called = false;
        var ref = null;
        var animation = Animator.Animation.create({
          duration: 600
        });
        animation.on('complete', function (a) {
          called = true;
          ref = a;
        });
        animation.now = function () { return 1000 };
        animation.start();
        animation.frame(1400);
        expect(called).toBeFalsy();
        expect(animation.isRunning).toBeTruthy();
        expect(animation.isComplete).toBeFalsy();
        animation.frame(1660);
        expect(called).toBeTruthy();
        expect(animation.isRunning).toBeFalsy();
        expect(animation.isComplete).toBeTruthy();
        expect(ref).toBe(animation);
      });

      it('should apply the easing function to the position on update', function () {
        var animation = Animator.Animation.create({
          duration: 500,
          from: 1000,
          to: 2000,
          easing: Animator.easing.in
        });

        animation.now = function () { return 8000; };
        animation.start();
        expect(animation.position).toBeCloseTo(1000);
        animation.frame(8250);
        expect(animation.position).toBeCloseTo(1250);
        animation.frame(8500);
        expect(animation.position).toBeCloseTo(2000);
      });

      it('should apply the calculated easing "position" to the target object\'s property (if both set)', function () {
        var myObject = {
          z: 100
        };
        var animation = Animator.Animation.create({
          duration: 500,
          target: myObject,
          property: 'z',
          to: 200,
          easing: Animator.easing.in
        });

        animation.now = function () { return 1000; };
        animation.start();
        expect(animation.position).toBeCloseTo(100);
        expect(myObject.z).toBeCloseTo(100);
        animation.frame(1250);
        expect(animation.position).toBeCloseTo(125);
        expect(myObject.z).toBeCloseTo(125);
      });
    });
  });
});
