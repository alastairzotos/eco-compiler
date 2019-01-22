var __extends = this.__extends || function (derived, base) {function __() { this.constructor = derived; } __.prototype = base.prototype; derived.prototype = new __();};

function __performAwait(responderType, responderMethod, args, cb) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			try
			{
				var res = JSON.parse(this.responseText);
				if (res && res.hasOwnProperty('__eco_error'))
					console.error(res['__eco_error']);
				else
					cb(res, this.status);
			}
			catch(e)
			{
				console.error(e);
				console.error(this.responseText);
			}
		}
	};

	xhttp.open("POST", ((typeof __eco__inPlugin != 'undefined') && __eco__inPlugin) ? "../index.php" : "index.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("__responder=" + responderType + "&__method=" + responderMethod + "&__args=" + JSON.stringify(args).replace('&', '%26'));
}


// Class array
function array_RemoveItem(self, item) {
	var narray = [];
	for (var i of self)
	{
		if (i != item)
			narray.push(i);
	}

	return narray;
}



// Class map
function map_Map(self, iterator) {
	return iterator;
}

function map_Omit(self, keys) {
	var res = {};
	for (var existing of Object.keys(self))
	{
		if (!keys.includes(existing))
			res[existing] = self[existing];
	}

	return res;
}

function map_Merge(self, obj) {
	var res = {};
	for (var i of Object.keys(self))
		res[i] = self[i];

	for (var i of Object.keys(obj))
		if (!((res)[i] !== undefined))
			res[i] = obj[i];

	return res;
}



// Class string
function string_Format(self, args) {
	var out = "";
	var inbrace = false;
	var found = "";
	for (var c = 0; c < self.length; c++)
	{
		if (inbrace)
		{
			if (self[c] == '}')
			{
				inbrace = false;
				out = out + (args[parseInt(found)]);
				found = "";
			}
			else
				found = found + self[c];

		}
		else
		{
			if (c < self.length - 1 && self[c] == '%' && self[c + 1] == '{')
			{
				c++;
				inbrace = true;
			}
			else
				out = out + self[c];

		}

	}

	return out;
}



