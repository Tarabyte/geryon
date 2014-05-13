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
    
});

test('Encrypt', function() {
    var g = new Γ();
    
    equal(typeof g.encrypt, 'function', 'encrypt function is defined');
    
    var original = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".split(''),
        encrypted = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@".split('');
    
    original.forEach(function(letter, idx) {
        equal(g.encrypt(letter), encrypted[idx], letter + ' encrypted ok');    
    });

});

function trit (str) {
    return parseInt(str, 3);    
};

test('crz', function() {
    var g = new Γ();
    
    equal(typeof g.crz, 'function', 'crz function is defined');
    
    equal(g.crz(trit('0001112220'), trit('0120120120')), trit('1001022211'), 'ok for table');
});

test('rotr', function() {
    var g = new Γ();
    
    equal(typeof g.rotr, 'function', 'rotr function is defined');
    
    equal(g.rotr(trit('0001112221')), trit('1000111222'), '0001112221 --> 1000111222');
});

test('input', function() {
    var value = "c",
        g = new Γ();
    
    equal(typeof g.input, 'function', 'input function is defined');
    
    g.input(value);
    
    equal(g.a, value.charCodeAt(0), 'value moved to A register');
    
    g.input('\n');
    
    equal(g.a, 10, 'newline copied to A register');
    
    g.input(-1);
    equal(g.a, 59048, 'EOF copied to A register');  
});

test('atA', function() {
    var g = Γ(),
        value = "g";
    
    g.input(value);
    
    equal(typeof g.atA, 'function', 'atA is defined');
    
    equal(g.atA(), value, 'atA returns symbols');
    
    g.input(-1);
    
    equal(g.atA(), -1, 'atA returns symbols');
    
    g.input(10+256);
    equal(g.atA(), '\n', 'atA performs modulo 256');
    
});

var helloWorld1 = "(=<`:9876Z4321UT.-Q+*)M'&%$H\"!~}|Bzy?=|{z]KwZY44Eq0/{mlk**hKs_dG5[m_BA{?-Y;;Vb'rR5431M}/.zHGwEDCBA@98\\6543W10/.R,+O<",
    helloWorld2 = "('&%:9]!~}|z2Vxwv-,POqponl$Hjig%eB@@>}=<M:9wv6WsU2T|nm-,jcL(I&%$#\"`CB]V?Tx<uVtT`Rpo3NlF.Jh++FdbCBA@?]!~|4XzyTT43Qsqq(Lnmkj\"Fhg${z@>",
    
commands = [4 + 94, 5 + 94, 23 + 94, 39, 40, 62, 68, 81].map(function(code){
    return String.fromCharCode(code);
}),
    mnemonics = "ji*p</vo".split(''); 

test('load', function() {
    var g = Γ();
    
    equal(typeof g.load, 'function', 'load function is defined');
    
    throws(function(){
        g.load("=");
    }, 'can not contain non-command symbols');
    
    commands.forEach(function(code) {        
        var command = code.charCodeAt(0);
        g.load(code);
        ok(true, code + ' loaded ok');
        
        code += String.fromCharCode(command - 1);
        g.load(code);
        ok(true, code + ' loaded ok');
    });
    
    g.load(helloWorld1);
    
    var memory = g.memory;
    
    helloWorld1.split('').forEach(function(code, position) {
        equal(String.fromCharCode(memory[position]), code, code + ' copied to position ' + position);    
    });
    
    g.load('(');
    memory = g.memory;
    
    //@see http://stackoverflow.com/questions/23524597
    equal(memory[1], 0, 'Implementations specific');
    
    ok(memory.every(function(current, idx) {
        return idx < 2 || current == g.crz(memory[idx-2], memory[idx-1]);
    }), 'memory is f*cked up');
});

test('load should skip spaces', function() {
    var g = Γ(); 
    
    g.load(' (\t\n=\r\n<');
    ok(true, 'should not throw errors');
    
});

function makeArray(len) {
    return Array.apply(null, new Array(len));
}


function randomCommand() {
    return commands[Math.random()*commands.length|0];
}

function randomMnemonic() {
    return mnemonics[Math.random()*mnemonics.length|0];
}

    var cat = "(aBA@?>=<;:9876543210/.-,JH)('&%$#\"!~}|{zy\\J6utsrq\nponmlkjihgJ%dcba`_^]\\[ZYXWVUTSRQPONMLKJIHGF('C%$$^\nK~<;4987654321a/.-,\\*)\nj\n!~%|{zya}|{zyxwvutsrqSonmlO\njLhg`edcba`_^]\\[ZYXWV8TSRQ4\nONM/KJIBGFE>CBA@?>=<;{9876w\n43210/.-m+*)('&%$#\"!~}|{zy\\\nwvunslqponmlkjihgfedcEa`_^A\n\\>ZYXWPUTSRQPONMLKJIH*FEDC&\nA@?>=<;:9876543210/.-m+*)(i\n&%$#\"!~}|{zyxwvutsrqpRnmlkN\nihgfedcba`_^]\\[ZYXWVU7SRQP3\nNMLKJIHGFEDCBA@?>=<;:z8765v\n3210/.-,+*)('&%$#\"!~}_{zyx[\nvutsrqjonmlejihgfedcba`_^]@\n[ZYXWVUTSRo",
        normCat = "jiooooooooooooooooooooooo<ioooooooooooooooj/iooooo\noooooooooojiooooooooooooooooooooooooooooooo**o**j<\nv*oopooooooooo/oooo/oo\nj\nppopppp*ooooooooooooo*ooooj\no*oopoooooooooooooooo*ooooj\nooo*ooopooopooooooooo*ooooj\noooooooo*oooooooooooooooooj\nooopopooooooooooooooo*ooooj\no*oooopoooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\noooooopoooopooooooooooooooj\nooooooooooi";

test('normalize|denormalize', function() {
    var g = Γ();
    
    equal(typeof g.denormalize, 'function', 'denormalize is a function');
    
    var code = makeArray(1000).map(function() {
        return randomMnemonic();
    }).join('');
    
    
    var denormalized = g.denormalize(code);
    
    g.load(denormalized);
    ok(true, 'denormalized code loaded');
    
    //mixin random spaces 
    var spaces = " \t\r\n".split('');
    
    code = code.split('').map(function(item, idx) {
        if(idx%25) {
            return item;            
        }
        return spaces[Math.random()*spaces.length|0];
    }).join('');
    
    denormalized = g.denormalize(code);
    
    equal(denormalized.length, code.length, 'spaces were not stripped');
    
    g.load(denormalized);
    ok(true, 'denormalize works with spaces');
    
    equal(typeof g.normalize, 'function', 'normalize is a function');
    
    var normalized = g.normalize(denormalized);
    
    equal(normalized, code, 'normalized code equals to original');
    
    g.load(cat);
    
    equal(g.normalize(cat), normCat, 'cat normalized');
    
    equal(g.denormalize(normCat), cat, 'cat back and force');
    
});

test('load should throw on large inputs', function() {
    var g = Γ(),
        longProgram = g.denormalize(makeArray(Math.pow(3,10)).map(randomMnemonic).join(''));
    
    //console.log(longProgram);
    
    g.load(longProgram);
    ok(true, 'loaded');
    
    longProgram = "   " + longProgram + " \t";
    g.load(longProgram);
    ok(true, 'loaded');
    
    longProgram = g.denormalize(makeArray(Math.pow(3,10)+1).map(randomMnemonic).join(''));
    
    throws(function() {
        g.load(longProgram);    
    }, /too long/, 'throw on programs larger than mem capacity');
    
    
});

test('running, step, loaded', function() {
    var g = Γ();
    
    equal(g.running, false, 'is  not running');
    
    equal(g.step, 0, 'no steps performed');
    
    equal(g.loaded, false, 'is not loaded');
    
    g.load(g.denormalize(randomMnemonic()));
    
    equal(g.loaded, true, 'is loaded');
});


asyncTest('run', function() {
    expect(15);
    var g = Γ();
    
    equal(typeof g.run, 'function', 'run is defined');
    
    throws(function() {
        g.run();    
    }, /No program was loaded/, 'is not loaded');
    
    g.load(g.denormalize('ov'));
    
    var memory = g.memory;
    
    var called = 0,
        old, 
        progress = function(m) {
            ++called;
            if(called == 1) {
                equal(m.running, true, 'is running');
                equal(m.c, 0, 'c == 0');
                equal(m.d, 0, 'd == 0');
                equal(m.step, 0, 'first step');
                old = m.memory[0];
            }
            else if (called == 2) {
                equal(m.running, false, 'is not running');
                equal(m.c, 1, 'c == 1');
                equal(m.d, 1, 'd == 1');
                equal(m.step, 1, 'second step');
                notEqual(old, m.memory[0], 'trashed');
                equal(m.memory[0], g.encrypt(old).charCodeAt(0), 'memory was trashed');
            }
            else {
                ok(false, 'should not get here');    
            }
        }, end = function(m) {
            equal(m.running, false, 'is not running');
            equal(m.c, 1, 'c == 1');
            equal(m.d, 1, 'd == 1');
            start();
        
        };
    
    g.run(progress, end);
});



test('warn', function() {
    var g = Γ({
        warn: function(message) {
            ok(message, 'called with message: ' + message);    
        }
    });
    
    g.load(g.denormalize("j"));
});

asyncTest('command load', function(){
    var g = Γ();
    
    g.load(g.denormalize('j'));
    
    var d = 40;
    g.run(function(m) {
        equal(m.d, d++, 'got d');
    }, start);
});

asyncTest('command jump', function(){
    var g = Γ();
    
    g.load(g.denormalize('i'));
    
    g.run(function(m){
        equal(m.c, 98, 'got c');
    }, start);
});

asyncTest('command rotr', function() {
    var g = Γ();
    
    g.load(g.denormalize('*'));
    
    var old = g.memory[0];
    
    g.run(function(m){
        equal(m.a, g.rotr(old), 'got a');
    }, start);
});

asyncTest('command crz', function() {
    var g = Γ();
    
    g.load(g.denormalize("p"));
    
    var d = g.memory[0];
    
    g.run(function(m) {
        var crz = g.crz(d, 0);
        equal(m.a, crz, 'a was crazied');
        equal(m.memory[0], crz, 'memory is filled with value');
    }, start);
    
});

asyncTest('command print', function() {
    var g = Γ({
        output: function(str) {
            equal(str, g.atA(), 'got a as output');    
        }
    });
    
    g.load(g.denormalize("/")); 
    
    g.run(null, start);
});

asyncTest('command input', function() {
    var symbol ="a", g = Γ({
        input: function(func) {
            ok(true, 'input function was called');
            func(symbol);  
        }
    });
    
    g.load(g.denormalize("<"));
    
    g.run(function(){
        equal(g.atA(), symbol, 'got symbol');
    }, start);
});


asyncTest('Hello world', function() {
    var buff = [],
        g =  Γ({
            output: function(s) {
                buff.push(s);         
            },
            input: function(f){
                console.log('Input was called');
                f(-1);
            },
            invertInOut: true
        });
    
    g.load(helloWorld1);
    
    g.run(null, function(){
        equal(buff.join(''), 'Hello, world.', 'Got hello world');
        start();
    });
});

asyncTest('Hello world2', function() {
    var buff = [],
        g =  Γ({
            output: function(s) {
                buff.push(s);         
            },
            input: function(f){
                console.log('Input was called');
                f(-1);
            },
            invertInOut: true
        });
    
    g.load(helloWorld1);
    
    g.run(null, function(){
        equal(buff.join(''), 'Hello, world.', 'Got hello world');
        start();
    });
});

/*
asyncTest("cat aka echo", function() {
    var buff = [],
        str = "Hi in there!",
        
        g =  Γ({
            output: function(s) {
                console.log('out: ' + s);
                buff.push(s);         
            },
            input: function(f){
                console.log('Input was called');
                f(-1);
            },
            invertInOut: true
        });
    
    
});
*/