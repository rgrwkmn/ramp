define('ramp.runList', ['ramp.core', 'dcupl'], function(rampCore, dcupl) {
    var samples = [];
    var currentSegment = [];
    var segments = {};
    var segmentId = 0;

    var runList = {
        subscribe: function() {
            var self = this;
            dcupl.subscribe('rampCore.running', function() {
                self.reset();
            });

            dcupl.subscribe('rampCore.runSample', function(s, samples) {
                self.addSample(s);
            });
        },
        reset: function() {
            samples = [];
            dcupl.publish('rampRunList.reset');
        },
        addSample: function(s) {
            samples.push(s);
            dcupl.publish('rampRunList.addSample', s, samples);
        },
        setRunSegment: function(start, end) {
            if (end < start) {
                var i = end;
                end = start;
                start = i;
            }
            console.log(start, end, samples);
            currentSegment = samples.slice(start, end - start + 1);
            rampCore.listen(currentSegment);
        },
        saveSegment: function() {
            var id = 's'+segmentId;
            segmentId += 1;
            segments[id] = currentSegment;
        }
    };

    runList.subscribe();

    return runList;
});