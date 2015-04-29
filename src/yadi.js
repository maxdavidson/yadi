class InjectorBinder {

    constructor(injector, key) {
        this._injector = injector;
        this._key = key;

        // Bind to its own implementation by default.
        this.toInstanceOf(key, key);

        Object.freeze(this);
    }

    /// Bind a value to a specific key.
    toValue(value) {
        this._injector._data.set(this._key, { type: 'value', value });
    }

    /// Bind a factory function to be lazily evaluated.
    /// The function may receive arguments injected using an array of keys.
    /// The resulting value is memoized by default.
    toFactory(fn, { inject = [], memoize = true } = {}) {
        this._injector._data.set(this._key, { type: 'factory', fn, inject, memoize });
    }

    /// Bind a concrete type to be created by the injector
    /// The type is injected asyncronously by default
    toInstanceOf(implementation, { memoize = true } = {}) {
        this._injector._data.set(this._key, { type: 'constructor', implementation, memoize });
    }
}

export class InjectionError extends Error {
    constructor(key) {
        const name = typeof key === 'function' ? key.name : key;
        super(`No provider associated for dependency "${name}" (${typeof key})`);
    }
}

export class Injector {

    constructor() {
        this._data = new Map();
        this.register(Injector).toValue(this);

        Object.freeze(this);
    }

    /// Register a key to the injector.
    /// Returns an object for overriding the binding method.
    register(key) {
        return new InjectorBinder(this, key);
    }

    // Asynchronously get the value provided by the injector for the key.
    get(key) {
        if (!this._data.has(key)) {
            throw new InjectionError(key);
        }

        const binder = this._data.get(key);

        // If result should memoized, immediately store the promise as a value
        const maybeMemoize = promise => {
            if (binder.memoize) {
                this.register(key).toValue(promise);
            }
            return promise;
        };

        switch (binder.type) {
            // Return value as a promise
            case 'value':
                return Promise.resolve(binder.value);

            // Wait for dependecies to be recursively evaluated, and then evaluate factory
            case 'factory':
                return maybeMemoize(Promise.all(binder.inject.map(this.get, this))
                    .then(args => binder.fn(...args)));

            // Delegate creation of constructor
            case 'constructor':
                return maybeMemoize(this.create(binder.implementation));
        }
    }

    // Create a new instance of a registered constructor
    create(constructor) {
        let deps = constructor.inject || [];

        if (typeof deps === 'function') {
            deps = inject.call(constructor);
        }

        return Promise.all(deps.map(this.get, this)).then(args => new constructor(...args));
    }
}

export function inject(...keys) {
    return Class => { Class.inject = keys; };
}
