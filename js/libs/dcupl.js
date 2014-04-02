

define('dcupl', function() {

	var d = {},
		subscriptions = {},
		published = {},
		namespacer = '.';

	d.subscribe = function(events, callback, latecomer) {
		if (!events || typeof events !== 'string') { console.warn('subscribe: an event name string is required'); return; }

		if (typeof callback !== 'function') { console.warn('subscribe: a callback function is required'); return; }

		//multiple events?
		var events = events.split(/\s/),
			l = events.length,
			subscribe = function(e) {
				if (typeof subscriptions[e] === 'undefined') {
					subscriptions[e] = [callback];
				} else {
					subscriptions[e].push(callback);
				}

				var args = published[e];
				if (latecomer && typeof args !== 'undefined') {
					callback.apply(null, args);
				}
			}

		//loop through events, could be one or many
		for (var i = 0; i < l; i++) {
			subscribe(events[i]);
		}
	}

	d.unsubscribe = function(events, callback) {
		var events = events.split(/\s/),
			l = events.length,
			unsubscribe = function(e) {
				if (typeof subscriptions[e] !== 'undefined') {
					var i = 0,
						l = subscriptions[e].length;
					for ( ; i < l; i++) {
						if (subscriptions[e][i] === callback) {
							subscriptions[e].slice(i, 1);
							return e;
						}
					}
					return false;
				}
			}

		var unsubs = [];
		//loop through events, could be one or many
		for (var i = 0; i < l; i++) {
			var unsub = unsubscribe(events[i]);
			if (d.dbug && unsub) { unsubs.push(unsub); }
		}
		if (d.dbug && unsubs) { console.log('unsubscribed a callback from '+unsubs.join(', ')); }
	}

	d.publish = function() {
		var args = Array.prototype.slice.call(arguments),
		eventName = args.shift(),
		events = subscriptions[eventName],
		l = 0,
		i = 0;

		d.dbug && console.log('publish '+eventName+' with '+args.join(', '));

		published[eventName] = args;

		if (events instanceof Array) {
			events.published = true;
			l = events.length;
			for ( ; i < l; i++) {
				events[i].apply(null, args);
			}
		}

		//check for ancestors, recursively publish up the tree
		var a = eventName.split(namespacer).slice(0, -1);
		if (!a.length) { return; }
		d.publish.apply(d, [a.join(namespacer)].concat(args));
	}

	d.dbug = false;

	return d;
});
