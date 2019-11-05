define('ramp.runListUi', ['ramp.runList', 'dcupl', 'tmplt'], function(runList, dcupl, tmplt) {
    var $runList = $('#ramp-run-list');

    dcupl.subscribe('rampRunList.addSample', function(s, samples) {
        $runList.append('<li>'+s.file.name+'</li>');
    });
    dcupl.subscribe('rampRunList.reset', function() {
        $runList.empty();
    });

    var start = null;
    var end = null;

    $runList.on('mousedown', 'li', function() {
        var i = $(this).index();
        console.log('down', i);
        start = i;
    });
    $runList.on('mouseup', 'li', function() {
        var i = $(this).index();
        console.log('up', i);
        end = i;
        var $samples = $runList.children().removeClass('selected');
        // $samples.slice(start, end - start);
        // $samples.addClass('selected');
        runList.setRunSegment(start, end);
    });
});