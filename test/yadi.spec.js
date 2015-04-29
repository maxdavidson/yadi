import { Injector, InjectionError, inject } from '../src/yadi';

class Animal {}

class Dog {
    constructor(breed = 'Labrador') {
        this.breed = breed;
    }
}

@inject(Animal)
class Farm {
    constructor(animal) {
        this.animal = animal;
    }
}

describe('Injector', () => {

    let injector;

    beforeEach(() => {
        injector = new Injector();
    });

    it('should be able to inject itself', async () => {
        expect(await injector.get(Injector)).to.equal(injector);
    });

    it('should register a class to an instance of itself by default', async () => {
        injector.register(Animal);

        const animal = await injector.get(Animal);

        expect(animal).to.be.an.instanceOf(Animal);
    });

    it('should register a class to an instance of another class', async () => {
        injector.register(Animal).toInstanceOf(Dog);

        const animal = await injector.get(Animal);

        expect(animal).to.be.an.instanceOf(Dog);
    });

    it('should wire up instances for decorated classes', async () => {
        injector.register(Animal).toInstanceOf(Dog);

        const farm = await injector.create(Farm);

        expect(farm.animal).to.be.an.instanceOf(Dog);
    });

    it('should register dependencies as values', async () => {
        injector.register(5).toValue(6);
        injector.register('hello').toValue('world');

        expect(await injector.get(5)).to.equal(6);
        expect(await injector.get('hello')).to.equal('world');
    });

    it('should inject lazily and asynchronously', async () => {
        injector.register('foo').toFactory(() => Promise.resolve('bar'));

        expect(await injector.get('foo')).to.equal('bar');
    });

    it('should memoize the result of factories by default', async () => {
        injector.register('foo').toFactory(() => ({ foo: 'bar' }));

        const [first, second] = await* [injector.get('foo'), injector.get('foo')];

        expect(first).to.exist.and.to.equal(second);
    });

    it('should not memoize the result of factories if specified', async () => {
        injector.register('foo').toFactory(() => ({ foo: 'bar' }), { memoize: false });

        const [first, second] = await* [injector.get('foo'), injector.get('foo')];

        expect(first).to.exist.and.to.not.equal(second);
    });

    it('should inject using any object and evaluate asynchronously', async () => {
        injector.register(Animal).toFactory(breed => new Dog(breed), { inject: ['breed'] });
        injector.register('breed').toValue(Promise.resolve('Golden'));

        const dog = await injector.get(Animal);

        expect(dog).to.be.an.instanceOf(Dog);
        expect(dog.breed).to.equal('Golden');
    });

    it('should not allow injecting unregistered dependencies', () => {
        expect(() => injector.get(Farm)).to.throw(InjectionError);
    });

});
