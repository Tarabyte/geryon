(function(global){
    "use strict";
    var word = 10,
        base = 3,
        len = Math.pow(base, word);
    
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
    
    global.Γ = G;
}(this));
