module("Geryon");

test('Should be defined', function() {
    equal(typeof Γ, 'function', 'is defined');
    
    var g = Γ();
    
    ok(g, 'got new machine');
    ok(g instanceof Γ, 'can be called without new');
});

test('Registers', function() {
    var g = Γ(), registers = "acd".split("");
    
    registers.forEach(function(item) {
        ok(item in g, item + ' register is defined');
        equal(g[item], 0, 'initial value is 0');    
        
        try {
            g[item] = "somevalue";
        }
        catch (e) {        
            equal(g[item], 0, 'readonly');    
        }
        
    });    
});

test('Memory', function() {
    var g = Γ(),
        memory = g.memory,
        length = Math.pow(3, 10);
    
    ok(Array.isArray(memory), 'memory is array');
    
    equal(memory.length, length, 'Memory length is 3^10');
    
    memory.length = 0;
    
    memory = g.memory;
    equal(memory.length, length, 'Memory is immutable');
    
    try {
        g.memory = [];
    } catch (e) {
        ok(true, 'Memory is readonly');
    }
    
});