define('tmplt',
	[],
	function() {
		function tmplt(string, data) {
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					string = string.replace(new RegExp(tmplt.leftDelimiter+i+tmplt.rightDelimiter, 'g'), data[i]);
				}
			}
			return string;
		}
		tmplt.leftDelimiter = '{';
		tmplt.rightDelimiter = '}';

		return tmplt;
	}
);
