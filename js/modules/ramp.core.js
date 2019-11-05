/**
@fileOverview
*/

/**
	rAMP
	@name rAMP
	@class
*/
define('ramp.core',
	['jquery', 'dcupl', 'ramp.sample'],
	function($, dcupl, Sample) {

		if (typeof window.webkitURL !== 'undefined') {
			window.URL = window.webkitURL;
		}

		var samples = {};
		var sampleID = 0;
		var started;

		var playing = false;

		var rampCore = {
			addSample: function(file) {
				console.log('rampCore.addSample');
				//console.log(file);

				var id = 's'+sampleID;

				var s = new Sample({
					file: file,
					id: id,
					destinations: [],
					onLoadedMetaData: function() {
						dcupl.publish('rampCore.newSampleData', this);
					}
				});

				window.testSample = s;

				samples[id] = s;

				dcupl.publish('rampCore.newSample', s);

				sampleID += 1;

				return s;
			},
			removeSamples: function(ids) {
				for (var i = 0; i < ids.length; i++) {
					this.removeSample(ids[i]);
				}
			},
			removeSample: function(id) {
				var s = samples[id];
				s.destroy();
				delete samples[id];

				return this;
			},
			getSamples: function() {
				return samples;
			},
			getSampleById: function(id) {
				var s = samples[id];
				if (typeof s === 'undefined') { console.log('rampCore.getSampleById: no sample with ID '+id); }
				return s;
			},
			connect: function(sources, dests) {
				/*console.log('rampCore.connect');
				console.log(sources);
				console.log(dests);*/

				$.each(sources, function(i, sid) {
					var s = samples[sid];
					if (typeof s === 'undefined') { console.log('rampCore.connect: no sample with ID '+sid); return; }
					//loop destinations once, make hash table of destinations that is easy to check
					var d = {};
					$.each(s.destinations, function(k, did) {
						d[did] = true;
					});

					var newDests = [];

					//for each destination selected
					$.each(dests, function(j, nid) {
						var dSample = samples[nid];
						if (typeof dSample === 'undefined') { console.log('rampCore.connect: no sample with ID '+nid); return; }
						//add to destinations if it's not in the hash table
						if (typeof d[nid] === 'undefined') {
							dSample.connected();
							dcupl.publish('sample.connected', dSample, s);
							newDests.push(nid);
						}
					});
					s.destinations = s.destinations.concat(newDests);
					dcupl.publish('sample.connected', s);
					// console.log('sample connected to destinations');
					// console.log(s);
				});

				dcupl.publish('rampCore.connected');
			},
			disconnect: function(sources, dests) {
				$.each(sources, function(i, id) {
					var s = samples[id];
					if (typeof s === 'undefined') { console.log('rampCore.connect: no sample with ID '+id); return; }
					//loop dests once, make hash table of destinations that is easy to check
					var d = {};
					$.each(dests, function(k, id) {
						d[id] = true;
					});

					var newDests = [];
					//for each destination already on the sample
					$.each(s.destinations, function(j, id) {
						if (typeof d[id] === 'undefined') {
							newDests.push(id);
						} else {
							samples[id].disconnected();
							dcupl.publish('sample.disconnected', samples[id]);
						}
					});
					s.destinations = newDests;
					dcupl.publish('sample.disconnected', s);
					// console.log('samples disconnected');
					// console.log(s);
				});

				dcupl.publish('rampCore.disconnected');
			},
			listen: function(sources, dests) {
				console.log('listen');
				var self = this;
				// console.log(sources);
				// console.log('listen');
				// console.log(sources);
				// console.log(dests);
				if (dests) {
					var destSamples = [];
					$.each(dests, function(i, id) {
						var s = samples[id];
						if (typeof s === 'undefined') { console.log('rampCore.connect: no sample with ID '+id); return; }

						destSamples.push(s);
					});

					var listenList = [];
					$.each(sources, function(i, id) {
						var s = samples[id];
						console.log('source '+id);
						console.log(s);
						if (typeof s === 'undefined') { console.log('rampCore.connect: no sample with ID '+id); return; }

						if (destSamples.length) {
							$.each(destSamples, function(j, ds) {
								listenList.push(s);
								listenList.push(ds);
							});
						} else {
							listenList.push(s);
						}
					});
				} else {
					var listenList = sources;
				}

				var i = 0,
					l = listenList.length;

				function listen() {
					console.log('listen '+i+', '+l+' '+(i >= l));
					if (i >= l) {
						console.log('stop!');
						rampCore.stop();
						return;
					}
					var s = listenList[i];
					console.log('listen to sample '+s.id);
					dcupl.publish('rampCore.listenSample', s);
					//TODO: same sample played twice stops playback without calling rampCore.stop
					s.play(function() {
						// console.log('afterPlay');
						i += 1;
						listen();
					});
				}

				listen();
				return true;
			},
			run: function(id) {
				playing = true;
				dcupl.publish('rampCore.running');

				var s = samples[id];
				if (typeof s === 'undefined') {
					console.log('rampCore.run: no sample with ID '+id);
					rampCore.stop();
					return;
				}
				console.log('run');
				function run() {
					s.play(function() {
						//console.log('playCallback');
						s = samples[this.getRandomDest()];

						if (!s) {
							console.log('rampCore.run: no destiny: early arrival');
							rampCore.stop();
							return;
						} else if (playing) {
							run();
						}
					});
					dcupl.publish('rampCore.runSample', s);
				}
				run();

				return true;
			},
			stop: function() {
				playing = false;
				dcupl.publish('rampCore.stopped');
			}
		};

		return rampCore;
	}
);
