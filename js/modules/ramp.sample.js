define('ramp.sample',
	['dcupl.hook'],
	function(dcupl) {

		var allSamples = {};

		var Sample = function(options) {
			var self = this;

			$.extend(true, this, options);

			var audio = new Audio();
			audio.src = window.URL.createObjectURL(this.file);

			audio.addEventListener('ended', function() {
				console.log('audio ended');
				// console.log(self.playCallback);
				// console.log(typeof self.playCallback === 'function');
				if (typeof self.playCallback === 'function') {
					// console.log('SHOULD CALL PLAYCALLBACK');
					self.playCallback.call(self);
					// console.log('?????');
				}
			});
			audio.addEventListener('loadedmetadata', function(event) {
				self.onLoadedMetaData.call(self);
			});

			this.audio = audio;

			this.bgColor = 'rgb('+Math.round(Math.random() * 255)+', '+Math.round(Math.random() * 255)+', '+Math.round(Math.random() * 255)+')';

			allSamples[this.id] = this.id;

			//dcupl.hook(this, 'sample', this, this);

		}

		Sample.prototype = {
			file: null,
			id: null,
			destinations: [],
			dCount: 0,
			bgColor: '#fff',
			getRandomDest: function() {
				var l = this.destinations.length;
				if (!l) { return false; }

				var i = Math.floor(Math.random()*l),
					id = this.destinations[i];
				if (typeof allSamples[id] === 'undefined') {
					this.removeDestination(i);
					id = this.getRandomDest();
				}
				return id;
			},
			play: function(cb) {
				console.log(this.id+' play');
				if (typeof cb === 'function') {
					console.log('set callback function');
					this.playCallback = cb;
				}
				this.audio.currentTime = 0;
				this.audio.play();
			},
			disconnected: function() {
				this.dCount -= 1;
			},
			connected: function() {
				this.dCount += 1;
			},
			removeDestination: function(i) {
				this.destinations.splice(i, 1);
			},
			destroy: function() {
				delete allSamples[this.id];
			},
			playCallback: function(){}
		};

		return Sample;
	}
);
