(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.yadi = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    var _bind = Function.prototype.bind;

    var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

    exports.__esModule = true;
    exports.inject = inject;

    var InjectorBinder = (function () {
        function InjectorBinder(injector, key) {
            _classCallCheck(this, InjectorBinder);

            this._injector = injector;
            this._key = key;

            // Bind to its own implementation by default.
            this.toInstanceOf(key, key);

            Object.freeze(this);
        }

        /// Bind a value to a specific key.

        InjectorBinder.prototype.toValue = function toValue(value) {
            this._injector._data.set(this._key, { type: 'value', value: value });
        };

        /// Bind a factory function to be lazily evaluated.
        /// The function may receive arguments injected using an array of keys.
        /// The resulting value is memoized by default.

        InjectorBinder.prototype.toFactory = function toFactory(fn) {
            var _ref = arguments[1] === undefined ? {} : arguments[1];

            var _ref$inject = _ref.inject;
            var inject = _ref$inject === undefined ? [] : _ref$inject;
            var _ref$memoize = _ref.memoize;
            var memoize = _ref$memoize === undefined ? true : _ref$memoize;

            this._injector._data.set(this._key, { type: 'factory', fn: fn, inject: inject, memoize: memoize });
        };

        /// Bind a concrete type to be created by the injector
        /// The type is injected asyncronously by default

        InjectorBinder.prototype.toInstanceOf = function toInstanceOf(implementation) {
            var _ref2 = arguments[1] === undefined ? {} : arguments[1];

            var _ref2$memoize = _ref2.memoize;
            var memoize = _ref2$memoize === undefined ? true : _ref2$memoize;

            this._injector._data.set(this._key, { type: 'constructor', implementation: implementation, memoize: memoize });
        };

        return InjectorBinder;
    })();

    var InjectionError = (function (_Error) {
        function InjectionError(key) {
            _classCallCheck(this, InjectionError);

            var name = typeof key === 'function' ? key.name : key;

            var _this = new _Error('No provider associated for dependency "' + name + '" (' + typeof key + ')');

            _this.__proto__ = InjectionError.prototype;
            _this;
            return _this;
        }

        _inherits(InjectionError, _Error);

        return InjectionError;
    })(Error);

    exports.InjectionError = InjectionError;

    var Injector = (function () {
        function Injector() {
            _classCallCheck(this, Injector);

            this._data = new Map();
            this.register(Injector).toValue(this);

            Object.freeze(this);
        }

        /// Register a key to the injector.
        /// Returns an object for overriding the binding method.

        Injector.prototype.register = function register(key) {
            return new InjectorBinder(this, key);
        };

        // Asynchronously get the value provided by the injector for the key.

        Injector.prototype.get = function get(key) {
            var _this2 = this;

            if (!this._data.has(key)) {
                throw new InjectionError(key);
            }

            var binder = this._data.get(key);

            // If result should memoized, immediately store the promise as a value
            var maybeMemoize = function maybeMemoize(promise) {
                if (binder.memoize) {
                    _this2.register(key).toValue(promise);
                }
                return promise;
            };

            switch (binder.type) {
                // Return value as a promise
                case 'value':
                    return Promise.resolve(binder.value);

                // Wait for dependecies to be recursively evaluated, and then evaluate factory
                case 'factory':
                    return maybeMemoize(Promise.all(binder.inject.map(this.get, this)).then(function (args) {
                        return binder.fn.apply(binder, args);
                    }));

                // Delegate creation of constructor
                case 'constructor':
                    return maybeMemoize(this.create(binder.implementation));
            }
        };

        // Create a new instance of a registered constructor

        Injector.prototype.create = function create(constructor) {
            var deps = constructor.inject || [];

            if (typeof deps === 'function') {
                deps = deps.call(constructor);
            }

            return Promise.all(deps.map(this.get, this)).then(function (args) {
                return new (_bind.apply(constructor, [null].concat(args)))();
            });
        };

        return Injector;
    })();

    exports.Injector = Injector;

    function inject() {
        for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
            keys[_key] = arguments[_key];
        }

        return function (Class) {
            Class.inject = keys;
        };
    }
});
//# sourceMappingURL=data:application/json;base64,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LElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO3dDQUFRLFdBQVcsZ0JBQUksSUFBSTthQUFDLENBQUMsQ0FBQztTQUN2Rjs7ZUF4RFEsUUFBUTs7O1lBQVIsUUFBUSxHQUFSLFFBQVE7O0FBMkRkLGFBQVMsTUFBTSxHQUFVOzBDQUFOLElBQUk7QUFBSixnQkFBSTs7O0FBQzFCLGVBQU8sVUFBQSxLQUFLLEVBQUk7QUFBRSxpQkFBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FBRSxDQUFDO0tBQzVDIiwiZmlsZSI6InlhZGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBJbmplY3RvckJpbmRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihpbmplY3Rvciwga2V5KSB7XG4gICAgICAgIHRoaXMuX2luamVjdG9yID0gaW5qZWN0b3I7XG4gICAgICAgIHRoaXMuX2tleSA9IGtleTtcblxuICAgICAgICAvLyBCaW5kIHRvIGl0cyBvd24gaW1wbGVtZW50YXRpb24gYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy50b0luc3RhbmNlT2Yoa2V5LCBrZXkpO1xuXG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgLy8vIEJpbmQgYSB2YWx1ZSB0byBhIHNwZWNpZmljIGtleS5cbiAgICB0b1ZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2luamVjdG9yLl9kYXRhLnNldCh0aGlzLl9rZXksIHsgdHlwZTogJ3ZhbHVlJywgdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLy8vIEJpbmQgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIGxhemlseSBldmFsdWF0ZWQuXG4gICAgLy8vIFRoZSBmdW5jdGlvbiBtYXkgcmVjZWl2ZSBhcmd1bWVudHMgaW5qZWN0ZWQgdXNpbmcgYW4gYXJyYXkgb2Yga2V5cy5cbiAgICAvLy8gVGhlIHJlc3VsdGluZyB2YWx1ZSBpcyBtZW1vaXplZCBieSBkZWZhdWx0LlxuICAgIHRvRmFjdG9yeShmbiwgeyBpbmplY3QgPSBbXSwgbWVtb2l6ZSA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIHRoaXMuX2luamVjdG9yLl9kYXRhLnNldCh0aGlzLl9rZXksIHsgdHlwZTogJ2ZhY3RvcnknLCBmbiwgaW5qZWN0LCBtZW1vaXplIH0pO1xuICAgIH1cblxuICAgIC8vLyBCaW5kIGEgY29uY3JldGUgdHlwZSB0byBiZSBjcmVhdGVkIGJ5IHRoZSBpbmplY3RvclxuICAgIC8vLyBUaGUgdHlwZSBpcyBpbmplY3RlZCBhc3luY3Jvbm91c2x5IGJ5IGRlZmF1bHRcbiAgICB0b0luc3RhbmNlT2YoaW1wbGVtZW50YXRpb24sIHsgbWVtb2l6ZSA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIHRoaXMuX2luamVjdG9yLl9kYXRhLnNldCh0aGlzLl9rZXksIHsgdHlwZTogJ2NvbnN0cnVjdG9yJywgaW1wbGVtZW50YXRpb24sIG1lbW9pemUgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5qZWN0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3Ioa2V5KSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0eXBlb2Yga2V5ID09PSAnZnVuY3Rpb24nID8ga2V5Lm5hbWUgOiBrZXk7XG4gICAgICAgIHN1cGVyKGBObyBwcm92aWRlciBhc3NvY2lhdGVkIGZvciBkZXBlbmRlbmN5IFwiJHtuYW1lfVwiICgke3R5cGVvZiBrZXl9KWApO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEluamVjdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9kYXRhID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKEluamVjdG9yKS50b1ZhbHVlKHRoaXMpO1xuXG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgLy8vIFJlZ2lzdGVyIGEga2V5IHRvIHRoZSBpbmplY3Rvci5cbiAgICAvLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIG92ZXJyaWRpbmcgdGhlIGJpbmRpbmcgbWV0aG9kLlxuICAgIHJlZ2lzdGVyKGtleSkge1xuICAgICAgICByZXR1cm4gbmV3IEluamVjdG9yQmluZGVyKHRoaXMsIGtleSk7XG4gICAgfVxuXG4gICAgLy8gQXN5bmNocm9ub3VzbHkgZ2V0IHRoZSB2YWx1ZSBwcm92aWRlZCBieSB0aGUgaW5qZWN0b3IgZm9yIHRoZSBrZXkuXG4gICAgZ2V0KGtleSkge1xuICAgICAgICBpZiAoIXRoaXMuX2RhdGEuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbmplY3Rpb25FcnJvcihrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmluZGVyID0gdGhpcy5fZGF0YS5nZXQoa2V5KTtcblxuICAgICAgICAvLyBJZiByZXN1bHQgc2hvdWxkIG1lbW9pemVkLCBpbW1lZGlhdGVseSBzdG9yZSB0aGUgcHJvbWlzZSBhcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IG1heWJlTWVtb2l6ZSA9IHByb21pc2UgPT4ge1xuICAgICAgICAgICAgaWYgKGJpbmRlci5tZW1vaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlcihrZXkpLnRvVmFsdWUocHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKGJpbmRlci50eXBlKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdmFsdWUgYXMgYSBwcm9taXNlXG4gICAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShiaW5kZXIudmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBkZXBlbmRlY2llcyB0byBiZSByZWN1cnNpdmVseSBldmFsdWF0ZWQsIGFuZCB0aGVuIGV2YWx1YXRlIGZhY3RvcnlcbiAgICAgICAgICAgIGNhc2UgJ2ZhY3RvcnknOlxuICAgICAgICAgICAgICAgIHJldHVybiBtYXliZU1lbW9pemUoUHJvbWlzZS5hbGwoYmluZGVyLmluamVjdC5tYXAodGhpcy5nZXQsIHRoaXMpKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihhcmdzID0+IGJpbmRlci5mbiguLi5hcmdzKSkpO1xuXG4gICAgICAgICAgICAvLyBEZWxlZ2F0ZSBjcmVhdGlvbiBvZiBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgY2FzZSAnY29uc3RydWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBtYXliZU1lbW9pemUodGhpcy5jcmVhdGUoYmluZGVyLmltcGxlbWVudGF0aW9uKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZWdpc3RlcmVkIGNvbnN0cnVjdG9yXG4gICAgY3JlYXRlKGNvbnN0cnVjdG9yKSB7XG4gICAgICAgIGxldCBkZXBzID0gY29uc3RydWN0b3IuaW5qZWN0IHx8IFtdO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZGVwcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZGVwcyA9IGRlcHMuY2FsbChjb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZGVwcy5tYXAodGhpcy5nZXQsIHRoaXMpKS50aGVuKGFyZ3MgPT4gbmV3IGNvbnN0cnVjdG9yKC4uLmFyZ3MpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3QoLi4ua2V5cykge1xuICAgIHJldHVybiBDbGFzcyA9PiB7IENsYXNzLmluamVjdCA9IGtleXM7IH07XG59XG4iXX0=