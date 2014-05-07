(function(global, Math){
    "use strict";
    var word = 10,
        base = 3,
        len = Math.pow(base, word),
        proto = G.prototype,
        start = 33,
        encrypted = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@".split(''),
        makeArray = function(){
            return Array.apply(null, new Array(word));
        },
        toTritArray = function(num) {
            return pows.map(function(val){
                return (num - (num %= val))/val;
            });
        },
        crz = [[1, 0, 0], [1, 0, 2], [2, 2, 1]],
        pows = makeArray().map(function(_, i){
            return Math.pow(base, word - 1 - i);
        });
    
    function G() {
        var a, c, d, memory;
        if(!(this instanceof G)) {
            return new G();
        }
        
        a = c = d = 0;
        
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
    }
    
    /**
     * Encrypt a symbol specified.
     */
    proto.encrypt = function(symbol) {
        return encrypted[('' + symbol).charCodeAt(0) - start];    
    };
    
    /**
     * Perform crazy tritwise operation.
     * 
     */
    proto.crz = function(a, b) {
        a = toTritArray(a);
        b = toTritArray(b);
        
        return pows.reduce(function(c, base, i) {
            return c + base * crz[a[i]][b[i]];
        }, 0);
    };
    
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
    
    
    global.Γ = G;
}(this, Math));
