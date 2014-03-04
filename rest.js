(function(w){
    var rest = {};
    rest.methods = ['get', 'post', 'put', 'del'];
    rest.offline = true;
    rest.before = function(params) {
        //TODO
        console.log('sentData', params);
    };

    rest.after = function(params) {
        //TODO
        console.log('gotData', params);
    };

    if (rest.offline) {
        rest.get = function(url, data, okCallback, failCallback) {
            rest.before(arguments);
            if ('function' === typeof(data)) {
                failCallback = okCallback;
                okCallback = data;
                data = {};
            }
            $.getJSON(url, data, function(data, textStatus, jqXHR){
                okCallback(data, textStatus, jqXHR);
                rest.after(data, textStatus, jqXHR);
            });
        };
        rest.post = rest.put = rest.del = rest.get;
    } else {
        var len =  rest.methods.length;
        for (var i = 0; i < len; i++) {
            (function(){
                var methodName = rest.methods[i];
                rest[methodName] = function(url, data, okCallback, failCallback) {
                    if ('function' === typeof(data)) {
                        failCallback = okCallback;
                        okCallback = data;
                        data = {};
                    }
                    ('del' === methodName) && (methodName = 'delete');
                    if (!failCallback) {
                        failCallback = function(jqXHR, textStatus, errorThrown) {
                            console.error(jqXHR, textStatus, errorThrown);
                        };
                    }
                    rest.before(arguments);
                    $.ajax({
                        dataType: 'json',
                        type: methodName,
                        url: url,
                        data: data,
                        success: okCallback,
                        fail: failCallback,
                        complete: rest.after
                    });
                };
            })();
        }
    }

    if ( typeof define === "function") {
        if (define.amd || define.cmd) {
            define('rest', [], function() {
                return rest;
            });
        }
    } else {
        w.rest = rest;
    }
})(window);
