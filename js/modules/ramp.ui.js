/**
@fileOverview
*/

/**
	rAMP
	@name rAMP
	@class
*/
define('ramp.ui',
	['jquery', 'ramp.core', 'dcupl', 'tmplt'],
	function($, rampCore, dcupl, tmplt) {


	var $sourceList = null,
		$destList = null,
		$extrapolists = null,
		extrapolists = 0,
		$sampleInput = null,
		$connectButton = null,
		$disconnectButton = null,
		$listenButton = null,
		$runButton = null,
		$stopListeningButton = null,
		$stopRunningButton = null,
		$addButton = null,
		$removeButton = null,

		sourceIdPrefix = 'source-',
		destIdPrefix = 'dest-',

		addSourceHTML = '',
		addDestHTML = '',
		extrapolistsHTML = [],
		sourceSampleTmplt = null,
		destSampleTmplt = null;

	var rampUI = {
		addSamples: function(input, event) {
			addSourceHTML = '';
			addDestHTML = '';

			if (!input.files.length) { return this; }

			$.each(input.files, function(i, file) {
				var sample = rampCore.addSample(file),
					sourceData = {
						id: sourceIdPrefix+sample.id,
						name: sample.file.name
					},
					destData = {
						id: destIdPrefix+sample.id,
						name: sample.file.name
					};

				addSourceHTML += tmplt(sourceSampleTmplt, sourceData);
				addDestHTML += tmplt(destSampleTmplt, destData);

				$extrapolists.each(function(i) {
					extrapolistsHTML[i] = this.innerHTML;
					var data = {
						id: destIdPrefix+sample.id+'-'+i,
						name: sample.file.name
					}
					extrapolistsHTML[i] += tmplt(extrapSampleTmplt, data);
				});
			});
			$sourceList.append(addSourceHTML);
			$destList.append(addDestHTML);
			$extrapolists.each(function(i) {
				$(this).html(extrapolistsHTML[i]);
			});
		},
		showDests: function(sample, className, $list) {
			if (typeof sample === 'undefined') {
				var selected = rampUI.getSelectedSources();
				sample = rampCore.getSampleById(selected[0]);
			}
			if (!className) { className = 'destination'; }
			$destList.find('.'+className).removeClass(className);
			$extrapolists.find('.destiny').removeClass('destiny').css({
				opacity: 0
			});
			if (!sample) { return; }

			$.each(sample.destinations, function(i, id) {
				$('#'+destIdPrefix+id).addClass(className);
				var s = rampCore.getSampleById(id);
				var dests = s.destinations;
				var color = s.bgColor;
				// if (dests.length) { rampUI.extrapolateDests(dests, 0, color); }
			});
		},
		extrapolateDests: function(dests, level, color) {
			//console.log('extrapolate dests '+level);
			var nextLevel = level + 1;
			$.each(dests, function(i, id) {
				var s = rampCore.getSampleById(id),
					$e = $('#'+destIdPrefix+s.id+'-'+level);
					/*rgb1 = $e.css('backgroundColor').replace('rgb(','').split(','),
					r1 = parseInt(rgb1[0], 10),
					g1 = parseInt(rgb1[1], 10),
					b1 = parseInt(rgb1[2], 10),
					rgb2 = color.replace('rgb(','').split(','),
					r2 = parseInt(rgb2[0], 10),
					g2 = parseInt(rgb2[1], 10),
					b2 = parseInt(rgb2[2], 10);
				color = 'rgb('+(r1 + r1 - r2)+', '+(g1 + g1 - g2)+', '+(b1 + b1 - b2)+')';
				console.log(r1+', '+r2+', '+color);*/
				$e.addClass('destiny').css({
					opacity: parseFloat($e.css('opacity')) + 0.3/*,
					backgroundColor: color */
				});
				if (nextLevel < extrapolists) {
					rampUI.extrapolateDests(s.destinations, nextLevel, color);
				}
			});
		},
		getSampleId: function(id) {
			return id.replace(sourceIdPrefix,'').replace(destIdPrefix,'');
		},
		getSelectedSources: function() {
			var ids = [];
			$sourceList.find('.selected').each(function() {
				ids.push(rampUI.getSampleId(this.id));
			});
			return ids;
		},
		getSelectedDestinations: function() {
			var api = this;
			var ids = [];
			$destList.find('.selected').each(function() {
				ids.push(rampUI.getSampleId(this.id));
			});
			return ids;
		},
		getSelected: function() {
			var ids = {},
				idArray = [],
				sources = this.getSelectedSources(),
				dests = this.getSelectedDestinations(),
				i = 0,
				l = sources.length;

			for ( ; i < l; i++) {
				ids[sources[i]] = 0;
			}
			i = 0;
			l = dests.length;

			for ( ; i < l; i++) {
				var d = dests[i];
				if (typeof ids[d] === 'undefined') {
					ids[d] = 0;
				}
			}

			for (var id in ids) {
				if (ids.hasOwnProperty(id)) {
					idArray.push(id);
				}
			}

			return idArray;
		},
		removeSelected: function() {
			var ids = rampUI.getSelected(),
				i = 0,
				l = ids.length;

			for ( ; i < l; i++) {
				$('#'+sourceIdPrefix+ids[i]).remove();
				$('#'+destIdPrefix+ids[i]).remove();
				for (var j = 0; j < extrapolists; j++) {
					$('#'+destIdPrefix+ids[i]+'-'+j).remove();
				}
			}
		},
		updateButtonStates: function() {
			var sourcesSelected = ($sourceList.children('.selected').length > 0),
				destsSelected = ($destList.children('.selected').length > 0),
				$disable = $(),
				$enable = $();

			if (sourcesSelected || destsSelected) {
				$enable = $enable.add($removeButton).add($listenButton);
			} else {
				$disable = $disable.add($removeButton).add($listenButton);
			}
			if (sourcesSelected) {
				$enable = $enable.add($runButton);
			} else {
				$disable = $disable.add($runButton);
			}
			if (sourcesSelected && destsSelected) {
				$enable = $enable.add($connectButton).add($disconnectButton);
			} else {
				$disable = $disable.add($connectButton).add($disconnectButton);
			}
			$enable.removeClass('disabled');
			$disable.addClass('disabled');

		}
	};

	$(function() {
			$extrapolists = $('.extrapolists ul');
			extrapolists = $extrapolists.length;

			sourceSampleTmplt = document.getElementById('source-sample-tmplt').innerHTML;
			destSampleTmplt = document.getElementById('dest-sample-tmplt').innerHTML;
			extrapSampleTmplt = document.getElementById('extrap-sample-tmplt').innerHTML;

			$sampleInput = $('#sample-input').on('change', function(e) {
				rampUI.addSamples(this, e);
			});

			$connectButton = $('#connect-button').on('click touchend', function() {
				var sources = rampUI.getSelectedSources();
				var dests = rampUI.getSelectedDestinations();
				if (sources.length && dests.length) {
					$.each(sources, function(i, id) {
						$('#'+sourceIdPrefix+id).removeClass('no-destiny');
					});

					rampCore.connect(sources, dests);
				}
			});

			$disconnectButton = $('#disconnect-button').on('click touchend', function() {
				var sources = rampUI.getSelectedSources();
				var dests = rampUI.getSelectedDestinations();
				rampCore.disconnect(sources, dests);
			});

			$listenButton = $('#listen-button').on('click touchend', function() {
				var sources = rampUI.getSelectedSources();
				var dests = rampUI.getSelectedDestinations();
				var listening = rampCore.listen(sources, dests);
				if (listening) {
					$listenButton.hide();
					$stopListeningButton.show();
				}
			});
			$stopListeningButton = $('#stop-listening-button').on('click touchend', function() {
				rampCore.stop();
				$stopRunningButton.hide();
				$runButton.show();
			});

			$runButton = $('#run-button').on('click touchend', function() {
				var sources = rampUI.getSelectedSources();
				var running = rampCore.run(sources[0]);
				if (running) {
					$runButton.hide();
					$stopRunningButton.show();
				}
			});
			$stopRunningButton = $('#stop-running-button').on('click touchend', function() {
				rampCore.stop();
				$stopListeningButton.hide();
				$listenButton.show();
			});


			$addButton = $('#add-button').on('click touchend', function(e) {
				$sampleInput.trigger(e.type);
			});
			$removeButton = $('#remove-button').on('click touchend', function() {
				rampUI.removeSelected();
			});

			//click event is really screwing with the sample lists for some reason
			var touch = false;

			$sourceList = $('#source-list').on('click touchend', '.sample', function(e) {
				if (e.type === 'touchend') { touch = true; }
				if (touch === true && e.type === 'click') { return; }
				var id = rampUI.getSampleId(this.id);
				var sample = rampCore.getSampleById(id);
				var $sample = $(this);
				if ($sample.is('.selected')) {
					$sample.removeClass('selected');
					// rampUI.showDests(null);
					rampUI.updateButtonStates();
					return;
				}
				if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
					$sourceList.find('.selected').removeClass('selected');
				}
				$(this).addClass('selected');
				rampUI.updateButtonStates();
				// rampUI.showDests(sample);
			});

			$destList = $('#dest-list').on('click touchend', '.sample', function(e) {
				if (e.type === 'touchend') { touch = true; }
				if (touch === true && e.type === 'click') { return; }
				//var sample = rampCore.getSampleById(this.id.replace(sourceIdPrefix, ''));
				var $sample = $(this);
				if ($sample.is('.selected')) {
					$sample.removeClass('selected');
					rampUI.updateButtonStates();
					return;
				}
				if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
					$destList.find('.selected').removeClass('selected');
				}
				$(this).addClass('selected');
				rampUI.updateButtonStates();
				//rampUI.showDests(sample);
			});
		});


		dcupl.subscribe('rampCore.connected', function() {
			var id = rampUI.getSelectedSources()[0];
			var s = rampCore.getSampleById(id);
			// rampUI.showDests(s);
		});
		dcupl.subscribe('rampCore.disconnected', function() {
			var id = rampUI.getSelectedSources()[0];
			var s = rampCore.getSampleById(id);
			// rampUI.showDests(s);
		});

		dcupl.subscribe('rampCore.stopped', function() {
			$stopRunningButton.hide();
			$runButton.show();
			$stopListeningButton.hide();
			$listenButton.show();
			$sourceList.add($destList).find('.sample').removeClass('running');
			// rampUI.showDests();
		});

		dcupl.subscribe('sample.connected', function(s) {
			var $s = $('#'+sourceIdPrefix+s.id).addClass('connected');
			if (!s.destinations.length) {
				$s.addClass('no-destiny');
			} else {
				$s.removeClass('no-destiny');
			}
		});
		dcupl.subscribe('sample.disconnected', function(s) {
			var $s = $('#'+sourceIdPrefix+s.id);
			if (!s.destinations.length) {
				$s.removeClass('connected');
			} else {
				$s.addClass('connected');
			}
			if (s.dCount <= 0) {
				$s.addClass('no-destiny');
			} else {
				$s.removeClass('no-destiny');
			}
		});

		dcupl.subscribe('rampCore.runSample', function(s) {
			$sourceList.find('.running').removeClass('running');
			var $s = $('#'+sourceIdPrefix+s.id).addClass('running');
			// rampUI.showDests(s);
		});

		return rampUI;
	}
);
