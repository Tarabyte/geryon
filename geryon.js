/*global setTimeout*/
(function(global, Math){
    "use strict";
    var word = 10,
        base = 3,
        len = Math.pow(base, word),
        eof = len - 1,
        proto = G.prototype,
        start = 33,
        last = 126,
        empty = '',
        max = len - 1,
        encrypted = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@".split(empty),
        alphabetLen = 94,
        makeArray = function(){
            return Array.apply(null, new Array(word));
        },
        toTritArray = function(num) {
            return pows.map(function(val){
                return (num - (num %= val))/val;
            });
        },
        crzTable = [[1, 0, 0], [1, 0, 2], [2, 2, 1]],
        pows = makeArray().map(function(_, i){
            return Math.pow(base, word - 1 - i);
        }),
        instructions = {
            4: 'i',
            5: '<',
            23: '/',
            39: '*',
            40: 'j',
            62: 'p',
            68: 'o',
            81: 'v'
        },
        isCommand = function(op, idx) {
            return getCode(op, idx) in instructions;    
        }, 
        toNumber = function(val) {
            return typeof val == 'number' ? val : (val+empty).charCodeAt(0);
        },
        getCode = function(op, idx) {
            op = toNumber(op);
                
            return (op + (idx||0)) % alphabetLen;
        },
        normalized = (function(){
            return Object.keys(instructions).reduce(function(memo, key){
                memo[instructions[key]] = key;
                return memo;
            }, {});
        }()),
        isSpace = (function(){
            var spaces = [9, 10, 13, 32];
            return function(code) {
                return spaces.indexOf(code) > -1;
            };
        }()),
        crz = function(a, b) {
            a = toTritArray(a);
            b = toTritArray(b);
        
            return pows.reduce(function(c, base, i) {
                return c + base * crzTable[a[i]][b[i]];
            }, 0);
        },
        rotr = function(a) {
            a = toTritArray(a);   
            a.unshift(a.pop());
        
            return pows.reduce(function(c, base, i){
                return c + base * a[i];
            }, 0);
        },
        fuQ = function(){
            var dfd = {},
                q = {},
                callbacks = [],
                fired = false,
                last,
                noop = function(){},
                callbackIndex = 0,
                run = function(func) {
                    var out = func(last);
                    if(out && out.then) { //is a promise;
                        out.then(function(data){
                            last = data;
                            callbackIndex++;
                            runCallbacks();
                        });
                        return false;
                    }
                    last = out;
                    callbackIndex++;
                    return true;
                },
                runCallbacks = function(func) {
                    while((func = callbacks[callbackIndex]) && run(func)){}

                    fired = fired || (callbackIndex == callbacks.length);
                },
                fire = function(arg) {
                    last = arg;
                    fire = noop;
                    runCallbacks();
                    return q;
                },
                then = function(){
                    callbacks.push.apply(callbacks, arguments);
                    if(fired) {runCallbacks();}
                    return q;
                };
            
            Object.defineProperties(dfd, {
                q: {
                    get: function(){
                        return q;
                    }    
                },
                
                fire: {
                    get: function() {
                        return fire;    
                    }
                }
            });
            
            Object.defineProperty(q, 'then', {
                get: function() {
                    return then;    
                }
            });
            return dfd;
        };
    
    function G(options) {
        var a, c, d, memory, running, step, loaded,
                instructions, warn, output, input, me = this;
        if(!(me instanceof G)) {
            return new G(options);
        }
        
        options = options || {};
        
        warn = options.warn || function(str) {
            console.warn(str);    
        };
        
        output = options.output || function(str) {
            console.info(str);    
        };
        
        input = options.input;
        
        function init() {                
            a = c = d = step = 0;
            running = loaded = false;
            memory = new Array(len);
        }
        
        init();
        
        function later(data) {
            var dfd = fuQ();
            
            setTimeout(function() {
                dfd.fire(data);    
            }, 13);
            
            return dfd.q;    
        }
        
        instructions = {
            4: function() {
                c = memory[d];
                c %= max;
                return later();
            },
            5: function() {
                var dfd;
                if(!input) {
                    warn("No stdin is specified");
                    running = false;
                    return later();
                }
                else {
                    dfd = fuQ();
                    
                    input().then(function(symbol){
                        me.input(symbol);
                        dfd.fire();
                    });
                    
                    return dfd.q;
                }
            },
            23: function() {
                output(me.atA());
                return later();
            },
            39: function() {
                if(c === d) {
                    warn("rotr is unsafe since c and d pointing the same address.");
                }
                a = memory[d] = rotr(memory[d]);
                return later();
            },
            40: function() {
                d = memory[d];
                d %= max; 
                return later();
            },
            62: function() {
                if(c === d) {
                    warn("crz is unsafe since c and d pointing the same address.");
                }
                a = memory[d] = crz(memory[d], a);
                return later();
            },
            81: function() {
                running = false;
                return later();
            }
        };
        
        function notAnInstruction() {
            running = false;
            return later();
        }
        
        function noop() {
            return later();    
        }
        
        function getInstruction(){
            var code = memory[c];
            if(code < start || code > last) {
                return notAnInstruction;    
            }
            
            return instructions[getCode(code, c)] || noop;
            
        }
        
        Object.defineProperties(this, {
            a: {
                get: function() {
                    return a;
                }
            },
            
            c: {
                get: function() {
                    return c;
                }
            },
            
            d: {
                get: function() {
                    return d;
                }
            },
            
            memory: {
                get: function() {
                    return memory.slice(0);    
                }
            },
            
            step: {
                get: function() {
                    return step;
                }
            },
            
            running: {
                get: function() {
                    return running;
                }
            },
            
            loaded: {
                get: function() {
                    return loaded;    
                }
            }
        });  
        
        /**
         * Copy value to A register.
         */
        this.input = function(value) {
            value = toNumber(value);
            
            a = value == -1 ? eof : value;
        };
        
        /**
         * Load a program code to memory.
         */ 
        this.load = function(code) {
            var errors = [], i, prev, preprev, commands = [], skipped = 0;
            (code + empty).split(empty).forEach(function(code, position) {
                var command = code.charCodeAt(0);
                
                if(isSpace(command)) { //skip spaces.
                    skipped++;
                    return;    
                }
                if(!isCommand(command, position - skipped)) { //check if a command is actually a command
                    errors.push({
                        position: position,
                        code: code
                    });
                }
                
                commands.push(command);
            });
            
            
            if(errors.length) {
                throw new Error('Error on parsing program:' + code + '\nCaused by: ' + errors.map(function(error){return error.code + ' at ' + error.position;})); 
            }
            if(commands.length > len) {
                throw new Error('Input program is too long. Length: ' + commands.length);    
            }
            
            init(); //kill previous steps etc.
            
            commands.forEach(function(command, position) { //copy program to memory
                memory[position] = command;    
            });
            
            //implementation specific behaviour for 1 char programs. 
            //http://stackoverflow.com/questions/23524597
            if(commands.length == 1) {
                warn("Undefined behaviour for 1 command programs");
                memory[1] = 0;
            }
            
            i = Math.max(2, commands.length);
            prev = memory[i - 1];
            preprev = memory[i - 2];
            
            for(; i < len; ++i) { //fill memory using crz.
                memory[i] = prev = crz(preprev, preprev = prev);
            }
            
            
            loaded = true;
        };
        
        /**
         * Run current program
         */
        this.run = function(progress, end) {
            if(!me.loaded) {
                throw new Error('No program was loaded.');       
            }
            
            running = true;
            
            function halt() {
                if(end) {
                    end(me);
                }
            }
            
            function report() {
                if(progress) {
                    progress(me);
                }
            }
            
            function next() {
                if(running) {
                    step++;
                    c++;
                    d++;
                    c %= max;
                    d %= max; 
                }
            }
            
            function trash() {
                var trashed;
                if(running) {
                    trashed = me.encrypt(memory[c]);
                    
                    if(trashed) {
                        memory[c] = trashed.charCodeAt(0);
                        return;
                    }
                    
                    warn("Unable to encrypt command @c: " + memory[c]);
                    running = false;    
                }
            }
            
            function tick() {
                if(running) {
                    getInstruction()().then(report, trash, next, tick);
                }
                else {
                    halt();    
                }
            }
            
            tick();            
        };
    }
    
    /**
     * Encrypt a symbol specified.
     */
    proto.encrypt = function(symbol) {
        return encrypted[toNumber(symbol) - start];    
    };
    
    /**
     * Perform crazy tritwise operation.
     * 
     */
    proto.crz = crz;
    
    /**
     * Tritwise rotate right.
     */
    proto.rotr = rotr;
    
    /**
     * Get value at A register.
     */
    proto.atA = function() {
        var a = this.a;
        return a === eof ? -1 : String.fromCharCode(a % 256);
    };
    
    /**
     * Denormalizing code.
     */
    proto.denormalize = function(code) {
        var skipped = 0;
        return (code + empty).split(empty).map(function(code, position){
            var command = code.charCodeAt(0);
            if(isSpace(command)) {
                skipped++;
                return code;
            }
            
            command = normalized[code];
            
            if(command) {
                position -= skipped %= alphabetLen;
                command -= position;
                while(command < start) {
                    command += alphabetLen;
                }
                
                return String.fromCharCode(command);
            }
            
            throw new Error('Symbol ' + code + ' at ' + position + ' is illegal.');
                
        }).join(empty);
    };
    
    /**
     * Normalizing code.
     */
    proto.normalize = function(code) {
        var skipped = 0;
        return (code + empty).split(empty).map(function(code, position) {
            var command = code.charCodeAt(0);
            if(isSpace(command)) {
                skipped++;
                return code;    
            }
            command = instructions[getCode(command, position - skipped)];
            
            if(command) {
                return command;   
            }
            
            throw new Error('Symbol ' + code + ' at ' + position + ' is illegal.');
            
        }).join(empty);
    };
    
    
    global.Γ = G;
}(this, Math));
