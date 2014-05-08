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
    expect(4);
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
    
    equal(memory.filter(function(current, idx) {
        return idx < 2 || current == g.crz(memory[idx-2], memory[idx-1]);
    }).length, memory.length, 'memory is f*cked up');
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
    
    var cat = "(aBA@?>=<;:9876543210/.-,JH)('&%$#\"!~}|{zy\\J6utsrq\nponmlkjihgJ%dcba`_^]\\[ZYXWVUTSRQPONMLKJIHGF('C%$$^\nK~<;4987654321a/.-,\\*)\nj\n!~%|{zya}|{zyxwvutsrqSonmlO\njLhg`edcba`_^]\\[ZYXWV8TSRQ4\nONM/KJIBGFE>CBA@?>=<;{9876w\n43210/.-m+*)('&%$#\"!~}|{zy\\\nwvunslqponmlkjihgfedcEa`_^A\n\\>ZYXWPUTSRQPONMLKJIH*FEDC&\nA@?>=<;:9876543210/.-m+*)(i\n&%$#\"!~}|{zyxwvutsrqpRnmlkN\nihgfedcba`_^]\\[ZYXWVU7SRQP3\nNMLKJIHGFEDCBA@?>=<;:z8765v\n3210/.-,+*)('&%$#\"!~}_{zyx[\nvutsrqjonmlejihgfedcba`_^]@\n[ZYXWVUTSRo",
        normCat = "jiooooooooooooooooooooooo<ioooooooooooooooj/iooooo\noooooooooojiooooooooooooooooooooooooooooooo**o**j<\nv*oopooooooooo/oooo/oo\nj\nppopppp*ooooooooooooo*ooooj\no*oopoooooooooooooooo*ooooj\nooo*ooopooopooooooooo*ooooj\noooooooo*oooooooooooooooooj\nooopopooooooooooooooo*ooooj\no*oooopoooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\nooooooooooooooooooooo*ooooj\noooooopoooopooooooooooooooj\nooooooooooi";
    
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