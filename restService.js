define(['./module', 'config'], function(mod, config){

    mod.service('restService', ['$http', function ($http) {
        var rest = this;
        var methods = ['get', 'post', 'del', 'put'];
		
		function log() {
			if (config.requestLog && typeof(console) !== 'undefined') {
				console.log(arguments);
			}
		}
		
		function error() {
			if (config.requestLog && typeof(console) !== 'undefined') {
				console.error(arguments);
			}
		}
		
        rest.before = function(params) {
            log('before request:', params);
            ('function' == typeof(params)) && params();
        };

        rest.after = function(params) {
            log('after request:', params);
            ('function' == typeof(params)) && params();
        };

        if (config.offline) {
            rest.get = function(url, data, okCallback, failCallback) {
                if (!url) {
                    throw new Error('URL must be specified');
                }
                rest.before(arguments);
                if ('function' === typeof(data)) {
                    failCallback = okCallback;
                    okCallback = data;
                    data = {};
                }

                if (!failCallback) {
                    failCallback = function(jqXHR, textStatus, errorThrown) {
                        error(jqXHR, textStatus, errorThrown);
                    };
                }

                $http.get(url, {
                    params: data
                }).success(function(data, staus){
                    okCallback(data, staus);
                    rest.after(data, staus);
                }).error(function(data, staus){
                    failCallback(data, staus);
                    rest.after(data, staus);
                });
            };
            rest.post = rest.put = rest.del = rest.get;
        } else {
            var len =  methods.length;
            for (var i = 0; i < len; i++) {
                (function(){
                    var methodName = methods[i];
                    rest[methodName] = function(url, data, okCallback, failCallback) {
                        if (!url) {
                            throw new Error('URL must be specified');
                        }
                        if ('function' === typeof(data)) {
                            failCallback = okCallback;
                            okCallback = data;
                            data = {};
                        }
                        ('del' === methodName) && (methodName = 'delete');
                        if (!failCallback) {
                            failCallback = function(data, status) {
                                error(data, status);
                            };
                        }
                        rest.before(arguments);

                        var httpObj = null;
                        if ('delete' === methodName) {
                            httpObj = $http[methodName](url);
                        } else if('get' === methodName) {
                            httpObj = $http[methodName](url, {params: data});
                        } else {
                            httpObj = $http[methodName](url, data);
                        }

                        httpObj.success(function(data, staus){
                            okCallback(data, staus);
                            rest.after(data, staus);
                        }).error(function(data, staus){
                            failCallback(data, staus);
                            rest.after(data, staus);
                        });
                    };
                })();
            }
        }
    }]);
});