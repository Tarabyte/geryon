(function(global, Math){
    "use strict";
    var word = 10,
        base = 3,
        len = Math.pow(base, word),
        eof = len - 1,
        proto = G.prototype,
        start = 33,
        empty = '',
        encrypted = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@".split(empty),
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
        alphabetLen = 94,
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
        };
    
    function G(options) {
        var a, c, d, memory, input;
        if(!(this instanceof G)) {
            return new G(options);
        }
        
        a = c = d = 0;
        options = options || {};
        
        memory = new Array(len);
        
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
            
            commands.forEach(function(command, position) { //copy program to memory
                memory[position] = command;    
            });
            
            //implementation specific behaviour for 1 char programs. 
            //http://stackoverflow.com/questions/23524597
            if(commands.length == 1) {
                memory[1] = 0;
            }
            
            i = Math.max(2, commands.length);
            prev = memory[i - 1];
            preprev = memory[i - 2];
            
            for(; i < len; ++i) { //fill memory using crz.
                memory[i] = prev = crz(preprev, preprev = prev);
            }
        };
    }
    
    /**
     * Encrypt a symbol specified.
     */
    proto.encrypt = function(symbol) {
        return encrypted[(empty + symbol).charCodeAt(0) - start];    
    };
    
    /**
     * Perform crazy tritwise operation.
     * 
     */
    proto.crz = crz;
    
    /**
     * Tritwise rotate right.
     */
    proto.rotr = function(a) {
        a = toTritArray(a);   
        a.unshift(a.pop());
        
        return pows.reduce(function(c, base, i){
            return c + base * a[i];
        }, 0);
    };
    
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
