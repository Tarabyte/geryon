(function(global){
    "use strict";
    var word = 10,
        base = 3,
        len = Math.pow(base, word),
        proto = G.prototype,
        start = 33,
        encrypted = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@".split('');
    
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
     * Encrypt a symbol specified;
     */
    proto.encrypt = function(symbol) {
        return encrypted[('' + symbol).charCodeAt(0) - start];    
    };
    
    global.Γ = G;
}(this));
