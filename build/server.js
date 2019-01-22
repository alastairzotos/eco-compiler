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




// Extend console
var __console_log = console.log;
console.log = function(msg) {
	process.send({stdout: msg, stderr: ''});
	__console_log(msg);
};

var __console_error = console.error;
console.error = function(msg) {
	process.send({stdout: '', stderr: msg});
	__console_error(msg);
};

// Namespace std
if (typeof std == 'undefined') std = {};
// Namespace eco
if (typeof eco == 'undefined') eco = {};
/**

 */
eco.CompilerModel = (function() {
	function CompilerModel() {
	}

	// Constructor _New()
	CompilerModel._New = function(self) {
		self.FileID = "";
		self.Name = "";
		self.Target = null;
		self.ModelType = null;
		self.Code = "";
		self.LineCount = 0;
		self.Usings = null;
		self.ParseNodes = null;
		self.Imports = null;
		self.Namespaces = null;
		self.Methods = null;
		self.Properties = null;
		self.Errors = null;
		self._compiler = null;
		self._semanticAnalyser = null;
		self._parser = null;
		return self;
	};

	// Constructor _New(Compiler,string,string,CompilationTarget,string)
	CompilerModel._New1 = function(self, compiler, fileId, name, target, code) {
		self.FileID = "";
		self.Name = "";
		self.Target = null;
		self.ModelType = null;
		self.Code = "";
		self.LineCount = 0;
		self.Usings = null;
		self.ParseNodes = null;
		self.Imports = null;
		self.Namespaces = null;
		self.Methods = null;
		self.Properties = null;
		self.Errors = null;
		self._compiler = null;
		self._semanticAnalyser = null;
		self._parser = null;
		self._compiler = compiler;
		self._semanticAnalyser = self._compiler._semanticAnalyser;
		self._parser = self._compiler._parser;
		self.FileID = fileId;
		self.Name = name;
		self.Target = target;
		self.Code = code;
		self.ModelType = eco.CompilationModelType.File;
		self.Imports = [];
		self.Usings = [];
		self.ParseNodes = [];
		self.Namespaces = [];
		self.Methods = [];
		self.Properties = [];
		return self;
	};

	// virtual void Build()
	CompilerModel.prototype.Build = function() {
		var self = this;
	};

	// virtual void BuildSkeleton()
	CompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
	};

	/**

	 */
	CompilerModel.prototype.PrepareForBuild = function(cb) {
		var self = this;
		self._compiler._parser.setCurrentFileID(self.FileID);
		self._compiler._parser.setCurrentFileName(self.Name);
		self._compiler._parser.setCurrentNamespace(self.GetSymbolTableByTarget());
		self._compiler._parser.SetContent(self.Code);
		self._compiler._semanticAnalyser.setFileName(self.Name);
		self._compiler._semanticAnalyser.ClearErrors();
		self._compiler._semanticAnalyser.setFileID(self.FileID);
		self._compiler._semanticAnalyser.setFileName(self.Name);
		eco.Namespace.ClearStaticData();
		try
		{
			if (cb)
				cb();
		}
		catch (err)
		{
			self._compiler.AddParserError(err);
		}
		for (var e of self._compiler._semanticAnalyser._errors)
			self._compiler.AddParserError(e);

	};

	/**

	 */
	CompilerModel.prototype.GetSymbolAtPosition = function(line, column) {
		var self = this;
		var property = self.GetPropertyAtPosition(line, column);
		if (property)
			return property;
		var method = self.GetMethodAtPosition(line, column);
		if (method)
			return method;
		return self.GetNamespaceAtPosition(line, column);
	};

	/**

	 */
	CompilerModel.prototype.GetPropertyAtPosition = function(startLine, startColumn) {
		var self = this;
		for (var property of self.Properties)
		{
			if (property._startLine == property._endLine)
			{
				if (startLine == property._startLine && startColumn >= property._startColumn && startColumn <= property._endColumn)
					return property;
			}
			else
			{
				if (startLine > property._startLine && startLine < property._endLine)
					return property;
				if (startLine == property._startLine && startColumn >= property._startColumn)
					return property;
				if (startLine == property._endLine && startColumn <= property._endColumn)
					return property;
			}

		}

		return null;
	};

	/**

	 */
	CompilerModel.prototype.GetMethodAtPosition = function(startLine, startColumn) {
		var self = this;
		for (var method of self.Methods)
		{
			if (method._defStartLine == method._defEndLine)
			{
				if (startLine == method._defStartLine && startColumn >= method._defStartColumn && startColumn <= method._defEndColumn)
					return method;
			}
			else
			{
				if (startLine > method._defStartLine && startLine < method._defEndLine)
					return method;
				if (startLine == method._defStartLine && startColumn >= method._defStartColumn)
					return method;
				if (startLine == method._defEndLine && startColumn <= method._defEndColumn)
					return method;
			}

		}

		return null;
	};

	/**

	 */
	CompilerModel.prototype.GetNamespaceAtPosition = function(startLine, startColumn) {
		var self = this;
		var len = self.Namespaces.length;
		for (var n = len; n > 0; n--)
		{
			var ns = self.Namespaces[n - 1];
			if (startLine > ns._startLine && startLine < ns._endLine)
				return ns;
			if (startLine == ns._startLine && startColumn >= ns._startColumn)
				return ns;
			if (startLine == ns._endLine && startColumn <= ns._endColumn)
				return ns;
		}

		return null;
	};

	/**

	 */
	CompilerModel.prototype.GetNamespaceDefinitionAtPosition = function(startLine, startColumn) {
		var self = this;
		for (var ns of self.Namespaces)
		{
			if (startLine >= ns._startLine && startLine <= ns._defEndLine)
			{
				if (startColumn >= ns._startColumn && startColumn <= ns._defEndColumn)
					return ns;
			}
		}

		return null;
	};

	// object GetSymbolOffsetsFromMethod(Method)
	CompilerModel.prototype.GetSymbolOffsetsFromMethod = function(method) {
		var self = this;
		return self.GetSymbolOffsetsFromLine(method._defEndLine);
	};

	/**

	 */
	CompilerModel.prototype.GetSymbolOffsetsFromLine = function(line) {
		var self = this;
		var foundMethods = [];
		var foundNamespaces = [];
		for (var mth of self.Methods)
		{
			if (mth._defStartLine >= line)
				foundMethods.push(mth);
		}

		for (var ns of self.Namespaces)
		{
			if (ns._startLine >= line || ns._endLine >= line)
				foundNamespaces.push(ns);
		}

		return {"methods": foundMethods, "namespaces": foundNamespaces};
	};

	/**

	 */
	CompilerModel.prototype.AdjustSymbolOffsets = function(sizeDifference, posDifference, namespaces, methods, ignoreNs) {
		var self = this;
		for (var method of methods)
		{
			method.setStartLine(method._startLine + sizeDifference);
			method.setEndLine(method._endLine + sizeDifference);
			method.setDefinitionStartLine(method._defStartLine + sizeDifference);
			method.setDefinitionEndLine(method._defEndLine + sizeDifference);
			method.setDefinitionStartPosition(method._defStartPosition + posDifference);
			method.setDefinitionEndPosition(method._defEndPosition + posDifference);
		}

		for (var ns of namespaces)
		{
			if (ns != ignoreNs)
				ns.setStartLine(ns._startLine + sizeDifference);
			ns.setEndLine(ns._endLine + sizeDifference);
		}

	};

	// SymbolTable GetSymbolTableByTarget()
	CompilerModel.prototype.GetSymbolTableByTarget = function() {
		var self = this;
		if (self.Target == eco.CompilationTarget.Client)
			return self._compiler._clientSymbolTable;
		else if (self.Target == eco.CompilationTarget.Server)
			return self._compiler._serverSymbolTable;
		else if (self.Target == eco.CompilationTarget.Shared)
			return self._compiler._sharedSymbolTable;
	};

	// Namespace[] ComputeUsedNamespaces()
	CompilerModel.prototype.ComputeUsedNamespaces = function() {
		var self = this;
		var symbolTable = self.GetSymbolTableByTarget();
		var used = [];
		for (var use of self.Usings)
			used.push(symbolTable.GetNamespaceFromTypeNode(use));

		return used;
	};

	return CompilerModel;
}());

/**

 */
eco.Compiler = (function() {
	function Compiler() {
	}

	// Constructor _New()
	Compiler._New = function(self) {
		self._expressionLocations = null;
		self.OnClearAutocompletions = null;
		self.OnAddAutocompletion = null;
		self.OnParserError = null;
		self.DebugMode = true;
		self._expressionMappings = null;
		self._models = null;
		self._clientSymbolTable = null;
		self._serverSymbolTable = null;
		self._sharedSymbolTable = null;
		self._parser = null;
		self._semanticAnalyser = null;
		self._projectName = "";
		self._sharedImports = null;
		self._serverImports = null;
		self._clientImports = null;
		self._dependencies = null;
		self._fileCount = 0;
		return self;
	};

	// Constructor _New(string,object)
	Compiler._New1 = function(self, projectName, packageContents) {
		self._expressionLocations = null;
		self.OnClearAutocompletions = null;
		self.OnAddAutocompletion = null;
		self.OnParserError = null;
		self.DebugMode = true;
		self._expressionMappings = null;
		self._models = null;
		self._clientSymbolTable = null;
		self._serverSymbolTable = null;
		self._sharedSymbolTable = null;
		self._parser = null;
		self._semanticAnalyser = null;
		self._projectName = "";
		self._sharedImports = null;
		self._serverImports = null;
		self._clientImports = null;
		self._dependencies = null;
		self._fileCount = 0;
		self._projectName = projectName;
		self._sharedImports = [];
		self._serverImports = [];
		self._clientImports = [];
		self._expressionLocations = {};
		self._parser = eco.Parser._New1(new eco.Parser());
		self._parser.OnErrorRegistered = function (error) {
			if (self.OnParserError)
				self.OnParserError(error);
		};
		self._parser.OnClearExpressions = function () {
		};
		self._parser.OnExpressionCreated = function (expressionNode) {
			self._expressionLocations[self._parser._currentFileID + ":" + expressionNode._startLine] = {"file": self._parser._currentFileName, "line": expressionNode._startLine, "column": expressionNode._startColumn};
		};
		self.SetupSymbolTables(projectName, packageContents);
		self._semanticAnalyser = eco.SemanticAnalyser._New1(new eco.SemanticAnalyser(), self._serverSymbolTable, self._clientSymbolTable, self._sharedSymbolTable);
		self._models = {};
		self.CreateModels(packageContents);
		return self;
	};

	// map<object> getExpressionMappings()
	Compiler.prototype.getExpressionMappings = function() {
		var self = this;
		return self._expressionMappings;
	};

	// map<CompilerModel> getModels()
	Compiler.prototype.getModels = function() {
		var self = this;
		return self._models;
	};

	// SymbolTable getClientSymbolTable()
	Compiler.prototype.getClientSymbolTable = function() {
		var self = this;
		return self._clientSymbolTable;
	};

	// SymbolTable getServerSymbolTable()
	Compiler.prototype.getServerSymbolTable = function() {
		var self = this;
		return self._serverSymbolTable;
	};

	// SymbolTable getSharedSymbolTable()
	Compiler.prototype.getSharedSymbolTable = function() {
		var self = this;
		return self._sharedSymbolTable;
	};

	// Parser getParser()
	Compiler.prototype.getParser = function() {
		var self = this;
		return self._parser;
	};

	// SemanticAnalyser getAnalyser()
	Compiler.prototype.getAnalyser = function() {
		var self = this;
		return self._semanticAnalyser;
	};

	/**

	 */
	Compiler.prototype.CreateModelIfNotExist = function(file, target) {
		var self = this;
		var id = file.id;
		if (((self._models)[id] !== undefined))
			return;
		var model = eco.FileCompilerModel._New3(new eco.FileCompilerModel(), self, id, file.name, target, file.content);
		self._models[id] = model;
	};

	/**

	 */
	Compiler.prototype.CreateComponentModelIfNotExist = function(comp) {
		var self = this;
		var name = comp.name;
		var serverFile = comp.serverFile;
		var serverFileId = serverFile.id;
		var clientFile = comp.clientFile;
		var clientFileId = clientFile.id;
		if (((self._models)[serverFileId] !== undefined))
			return;
		var serverModel = eco.ServerComponentCompilerModel._New3(new eco.ServerComponentCompilerModel(), self, serverFileId, name, serverFile.content);
		self._models[serverFileId] = serverModel;
		var clientModel = eco.ClientComponentCompilerModel._New3(new eco.ClientComponentCompilerModel(), self, clientFileId, name, clientFile.content);
		self._models[clientFileId] = clientModel;
	};

	/**

	 */
	Compiler.prototype.RemoveModel = function(file) {
		var self = this;
		if (((self._models)[file.id] !== undefined))
			delete self._models[file.id];
	};

	/**

	 */
	Compiler.prototype.FileOpened = function(fileId, fileInfo) {
		var self = this;
		self._semanticAnalyser._verifier.Reset(fileId);
		self.CreateModelIfNotExist1(fileId, fileInfo);
	};

	/**

	 */
	Compiler.prototype.AddParserError = function(error) {
		var self = this;
		if (self.OnParserError)
			self.OnParserError(error);
	};

	/**

	 */
	Compiler.prototype.Rebuild = function(cb) {
		var self = this;
		self._sharedSymbolTable.ClearAll();
		self._clientSymbolTable.ClearAll();
		self._serverSymbolTable.ClearAll();
		eco.Interface.ResetCount();
		eco.Namespace.ClearStylingClasses();
		self.PerformFullBuild();
		if (cb)
			cb();
	};

	/**

	 */
	Compiler.prototype.PerformFullBuild = function() {
		var self = this;
		var sharedModels = [];
		var otherModels = [];
		for (var id of Object.keys(self._models))
		{
			if (self._models[id].Target == eco.CompilationTarget.Shared)
				sharedModels.push(self._models[id]);
			else
				otherModels.push(self._models[id]);

			self._semanticAnalyser._verifier.Reset(self._models[id].FileID);
		}

		for (var model of sharedModels)
			model.BuildSkeleton();

		for (var model1 of sharedModels)
			model1.Build();

		for (var shared of self._sharedSymbolTable.getSymbolArray())
		{
			self._clientSymbolTable.SetSymbol(shared, true);
			self._serverSymbolTable.SetSymbol(shared, true);
		}

		for (var model2 of otherModels)
			model2.BuildSkeleton();

		for (var model3 of otherModels)
			model3.Build();

		self._semanticAnalyser._verifier.VerifyAll();
		for (var error of self._semanticAnalyser._errors)
			self.AddParserError(error);

	};

	/**

	 */
	Compiler.prototype.Compile = function(onCompiled) {
		var self = this;
		eco.Namespace.SetCurrentPackageID(0);
		self.Rebuild(null);
		var allImports = {"client": [], "server": []};
		for (var id of Object.keys(self._models))
		{
			var model = self._models[id];
			var symbolTable = model.GetSymbolTableByTarget();
			var namespaces = model.Usings;
			var imports = model.Imports;
			for (var imp of imports)
			{
				if (model.Target == eco.CompilationTarget.Client)
					allImports["client"].push(imp);
				else if (model.Target == eco.CompilationTarget.Server)
					allImports["server"].push(imp);
			}

			for (var used of namespaces)
				symbolTable.UseNamespace(symbolTable.GetNamespaceFromTypeNode(used));

		}

		console.log({"client": self._clientSymbolTable.Serialise(), "server": self._serverSymbolTable.Serialise(), "shared": self._sharedSymbolTable.Serialise()});
		console.log(self._projectName);
		var clientTranslator = eco.JSTranslator._New3(new eco.JSTranslator(), 0, self._projectName, eco.CompilationTarget.Client, allImports["client"], self._clientSymbolTable, self._serverSymbolTable, self._sharedSymbolTable);
		var serverTranslator = eco.JSServerTranslator._New1(new eco.JSServerTranslator(), 0, self._projectName, eco.CompilationTarget.Server, allImports["server"], self._serverSymbolTable, self._sharedSymbolTable);
		clientTranslator.DebugMode = self.DebugMode;
		serverTranslator.DebugMode = self.DebugMode;
		if (self.DebugMode)
			serverTranslator.setExpressionLocations(self._expressionLocations);
		clientTranslator.setWriteComments(true);
		serverTranslator.setWriteComments(true);
		var clientOutput = clientTranslator.Translate();
		var clientCommon = clientTranslator.GetCommonCode();
		var serverOutput = serverTranslator.Translate();
		var serverCommon = serverTranslator.GetCommonCode();
		serverOutput = serverCommon + serverOutput;
		if (self.DebugMode)
			self._expressionMappings = serverTranslator._expressionMappings;
		if (onCompiled)
			onCompiled(self._clientSymbolTable.Serialise(), self._serverSymbolTable.Serialise(), clientCommon, clientOutput, serverOutput);
	};

	/**

	 */
	Compiler.prototype.ApplyChange = function(fileId, change, editor) {
		var self = this;
		var activeModel = self._models[fileId];
		var symbolBeingEditted = null;
		self._semanticAnalyser._verifier.Reset(activeModel.FileID);
		if (editor)
			activeModel.Code = editor.getModel().getValue();
		if (change)
		{
			var inMethod = activeModel.GetMethodAtPosition(change.range.endLineNumber, change.range.endColumn);
			self.CreateParserAlerts(activeModel, change, inMethod);
			if (inMethod)
			{
				self.ReprocessMethod(activeModel, inMethod);
				symbolBeingEditted = inMethod;
			}
			{
				var text = change.text;
				var range = change.range;
				var sizeDifference = 0;
				var posDifference = 0;
				if (text.length > 0)
					sizeDifference = text.split("\n").length - 1;
				else
					sizeDifference = range.startLineNumber - range.endLineNumber;

				var offsets = activeModel.GetSymbolOffsetsFromLine(range.startLineNumber);
				var curNamespace = activeModel.GetNamespaceAtPosition(range.startLineNumber, range.endLineNumber);
				activeModel.AdjustSymbolOffsets(sizeDifference, posDifference, offsets.namespaces, offsets.methods, null);
				var inSymbolDef = activeModel.GetNamespaceDefinitionAtPosition(change.range.endLineNumber, change.range.endColumn);
				if (inSymbolDef)
				{
					self.Rebuild(null);
					return inSymbolDef;
				}
			}
		}
		activeModel.Build();
		self._semanticAnalyser._verifier.VerifyAll();
		for (var error of self._semanticAnalyser._errors)
			self.AddParserError(error);

		if (change)
		{
			var typingIn = activeModel.GetSymbolAtPosition(change.range.startLineNumber, change.range.startColumn);
			if (typingIn)
			{
				if (typingIn.IsNamespace())
					(typingIn).ClearCache();
				return typingIn;
			}
		}
		return symbolBeingEditted;
	};

	/**

	 */
	Compiler.prototype.ReprocessMethod = function(activeModel, method) {
		var self = this;
		activeModel.PrepareForBuild(function () {
			method._owner.ClearCache();
			var offsets = activeModel.GetSymbolOffsetsFromMethod(method);
			var oldEndLine = method._defEndLine;
			var oldEndPos = method._defEndPosition;
			var parseResult = self._parser.ParseMethodBody(method);
			var sizeDifference = method._defEndLine - oldEndLine;
			var posDifference = method._defEndPosition - oldEndPos;
			activeModel.AdjustSymbolOffsets(sizeDifference, posDifference, offsets.namespaces, offsets.methods, null);
			self._semanticAnalyser.UseNamespaces(activeModel.FileID, activeModel.GetSymbolTableByTarget(), activeModel.Usings);
			self._semanticAnalyser._verifier.ResetAndVerifyMethod(activeModel.FileID, activeModel.Name, activeModel.GetSymbolTableByTarget(), method);
		});
	};

	/**

	 */
	Compiler.prototype.ImportPackage = function(name, rawClient, rawServer, rawShared) {
		var self = this;
		self._sharedImports.push(eco.SymbolTable.Import1(name, self._sharedSymbolTable, JSON.parse(rawShared), null));
		self._clientImports.push(eco.SymbolTable.Import1(name, self._clientSymbolTable, JSON.parse(rawClient), self._sharedSymbolTable));
		self._serverImports.push(eco.SymbolTable.Import1(name, self._serverSymbolTable, JSON.parse(rawServer), self._sharedSymbolTable));
		self.ApplyImports();
	};

	/**

	 */
	Compiler.prototype.ApplyImports = function() {
		var self = this;
		for (var imported of self._sharedImports)
		{
			for (var symbol of imported.getSymbolArray())
				self._sharedSymbolTable.SetSymbol(symbol, false);

		}

		for (var imported1 of self._serverImports)
		{
			for (var symbol1 of imported1.getSymbolArray())
				self._serverSymbolTable.SetSymbol(symbol1, false);

		}

		for (var imported2 of self._clientImports)
		{
			for (var symbol2 of imported2.getSymbolArray())
				self._clientSymbolTable.SetSymbol(symbol2, false);

		}

	};

	// object[] CollectFiles(object,string)
	Compiler.prototype.CollectFiles = function(packageContents, entry) {
		var self = this;
		var output = [];
		var collectFiles = null;
		collectFiles = function (cur) {
			if (cur.isdir)
			{
				var files = cur.files;
				for (var key of Object.keys(files))
				{
					if (files[key].isdir)
						collectFiles(files[key]);
					else
						output.push(map_Omit(map_Merge((files[key]), {"name": key}), ["isdir"]));

				}

			}
		};
		collectFiles(packageContents[entry]);
		return output;
	};

	// object[] CollectComponents(object)
	Compiler.prototype.CollectComponents = function(packageContents) {
		var self = this;
		var output = [];
		console.log(packageContents);
		var root = packageContents.components.files;
		for (var name of Object.keys(root))
		{
			var compData = root[name];
			var serverFile = map_Omit(map_Merge((compData.files[name + "-server.eco"]), {"name": name + "-server.eco"}), ["isdir"]);
			var clientFile = map_Omit(map_Merge((compData.files[name + "-client.eco"]), {"name": name + "-client.eco"}), ["isdir"]);
			output.push({"name": name, "serverFile": serverFile, "clientFile": clientFile});
		}

		return output;
	};

	// void CreateModels(object)
	Compiler.prototype.CreateModels = function(packageContents) {
		var self = this;
		var server = self.CollectFiles(packageContents, "server");
		var client = self.CollectFiles(packageContents, "client");
		var shared = self.CollectFiles(packageContents, "shared");
		var components = self.CollectComponents(packageContents);
		for (var file of server)
			self.CreateModelIfNotExist(file, eco.CompilationTarget.Server);

		for (var file1 of client)
			self.CreateModelIfNotExist(file1, eco.CompilationTarget.Client);

		for (var file2 of shared)
			self.CreateModelIfNotExist(file2, eco.CompilationTarget.Shared);

		for (var comp of components)
			self.CreateComponentModelIfNotExist(comp);

	};

	// void CreateModelIfNotExist(string,object)
	Compiler.prototype.CreateModelIfNotExist1 = function(fileId, fileInfo) {
		var self = this;
		if (((self._models)[fileId] !== undefined))
			return;
		var type = fileInfo.type;
		switch (type)
		{
			case "file":
			{
				var target = null;
				if (fileInfo.Target == 0)
					target = eco.CompilationTarget.Server;
				else if (fileInfo.Target == 1)
					target = eco.CompilationTarget.Client;
				else if (fileInfo.Target == 2)
					target = eco.CompilationTarget.Shared;
				var model = eco.FileCompilerModel._New3(new eco.FileCompilerModel(), self, fileId, fileInfo.Name, target, fileInfo.Code);
				self._models[fileId] = model;
				break;
			}
			case "comp-s-file":
			{
				var serverModel = eco.ServerComponentCompilerModel._New3(new eco.ServerComponentCompilerModel(), self, fileId, fileInfo.Name, fileInfo.ServerCode);
				self._models[fileId] = serverModel;
				break;
			}
			case "comp-c-file":
			{
				var clientModel = eco.ClientComponentCompilerModel._New3(new eco.ClientComponentCompilerModel(), self, fileId, fileInfo.Name, fileInfo.ClientCode);
				self._models[fileId] = clientModel;
				break;
			}
			case "plugin-s-file":
			{
				var serverModel1 = eco.ServerComponentCompilerModel._New3(new eco.ServerComponentCompilerModel(), self, fileId, fileInfo.Name, fileInfo.ServerCode);
				self._models[fileId] = serverModel1;
				break;
			}
			case "plugin-c-file":
			{
				var clientModel1 = eco.ClientComponentCompilerModel._New3(new eco.ClientComponentCompilerModel(), self, fileId, fileInfo.Name, fileInfo.ClientCode);
				self._models[fileId] = clientModel1;
				break;
			}
			case "init":
			{
				var model1 = eco.InitialiserCompilerModel._New3(new eco.InitialiserCompilerModel(), self, fileId, fileInfo.Name, fileInfo.Code);
				self._models[fileId] = model1;
				break;
			}
			case "service":
			{
				var model2 = eco.ServiceCompilerModel._New3(new eco.ServiceCompilerModel(), self, fileId, fileInfo.Name, fileInfo.Code);
				self._models[fileId] = model2;
				break;
			}
		}
	};

	// void CreateParserAlerts(CompilerModel,object,Method)
	Compiler.prototype.CreateParserAlerts = function(model, change, inMethod) {
		var self = this;
		var line = change.range.endLineNumber;
		var column = change.range.endColumn;
		var text = change.text;
		if (self.OnClearAutocompletions)
			self.OnClearAutocompletions();
		self.CreateIdentAlert(model, line, column, inMethod);
		self.CreateTypeAlert(model, line, column, inMethod);
		self.CreateDotAccessAlert(model, line, column, inMethod);
	};

	// void CreateIdentAlert(CompilerModel,int,int,Method)
	Compiler.prototype.CreateIdentAlert = function(model, line, column, inMethod) {
		var self = this;
		self._parser.AlertOnLoad(line, column, function (items) {
			for (var item of items)
			{
				if (item.Name != "self")
				{
					if (self.OnAddAutocompletion)
					{
						self.OnAddAutocompletion({"label": item.Name, "kind": monaco.languages.CompletionItemKind.Variable, "detail": item.ItemType.Signature(), "sortText": "0-local"});
					}
				}
			}

		});
		self._parser.AlertOnLoadMember(line, column, function (items1) {
			for (var item1 of items1)
			{
				if (!item1.IsMethod() || !(item1).IsConstructor())
				{
					if (self.OnAddAutocompletion)
					{
						self.OnAddAutocompletion(self.CreateMemberCompletion(model, item1, false, false, false));
					}
				}
			}

		});
	};

	// void CreateTypeAlert(CompilerModel,int,int,Method)
	Compiler.prototype.CreateTypeAlert = function(model, line, column, inMethod) {
		var self = this;
		self._parser.AlertOnType(line, column, function (ns, context, currentlyInMethod) {
			if (ns)
			{
				var completions = [];
				if (ns.IsInterface())
				{
					var intr = ns;
					if (intr.IsEnum())
					{
						var pairs = (intr)._kv;
						for (var key of Object.keys(pairs))
						{
							if (self.OnAddAutocompletion)
							{
								self.OnAddAutocompletion({"label": key, "kind": monaco.languages.CompletionItemKind.Field});
							}
						}

					}
					else if (intr.IsClass())
					{
						if (inMethod)
						{
							var members = (ns).GetMembersAccessibleFrom(inMethod);
							for (var member of members)
							{
								if (self.OnAddAutocompletion)
								{
									self.OnAddAutocompletion(self.CreateMemberCompletion(model, member, false, true, true));
								}
							}

						}
					}
				}
				else
				{
					var visible = [];
					if (context != eco.ParserContext.Type && context != eco.ParserContext.New && context != eco.ParserContext.ClassInfo && context != eco.ParserContext.Using)
					{
						visible = [eco.Interface.getVoidType(), eco.Interface.getBoolType(), eco.Interface.getCharType(), eco.Interface.getIntType(), eco.Interface.getFloatType(), eco.Interface.getStringType(), eco.Interface.getObjectType()];
					}
					ns.CollectVisibleNamespaces(visible);
					if (context != eco.ParserContext.Type && context != eco.ParserContext.Using)
					{
						for (var usedNode of model.Usings)
						{
							var used = model.GetSymbolTableByTarget().GetNamespaceFromTypeNode(usedNode);
							if (used)
								used.CollectVisibleNamespaces(visible);
						}

					}
					if (context == eco.ParserContext.Member)
					{
						if (ns._namespace)
							ns._namespace.CollectVisibleNamespaces(visible);
					}
					if (context != eco.ParserContext.Type)
						self._sharedSymbolTable.CollectVisibleNamespaces(visible);
					for (var symbol of visible)
					{
						var docs = "";
						if (symbol._docs)
							docs = symbol._docs.ToString(false, "");
						if (self._parser.InContext(eco.ParserContext.Using))
						{
							if (symbol._symbolType == eco.SymbolType.Namespace)
							{
								if (self.OnAddAutocompletion)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Module, "documentation": docs, "sortText": "10-namespace"});
								}
							}
						}
						else if (self._parser.InContext(eco.ParserContext.New))
						{
							if (symbol._symbolType == eco.SymbolType.Namespace)
							{
								if (self.OnAddAutocompletion)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Module, "documentation": docs, "sortText": "10-namespace"});
								}
							}
							else if (symbol._symbolType == eco.SymbolType.Class)
							{
								var cls = symbol;
								for (var member1 of cls._members)
								{
									if (member1.IsMethod())
									{
										if ((member1).IsConstructor())
										{
											var constr = member1;
											if (inMethod && constr.AccessibleFrom(inMethod))
											{
												if (self.OnAddAutocompletion)
												{
													self.OnAddAutocompletion(self.CreateMemberCompletion(model, member1, false, false, true));
												}
											}
										}
									}
								}

							}
						}
						else
						{
							if (self.OnAddAutocompletion)
							{
								if (symbol._symbolType == eco.SymbolType.Namespace)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Module, "documentation": docs, "sortText": "10-namespace"});
								}
								else if (symbol._symbolType == eco.SymbolType.Interface)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Interface, "documentation": docs, "sortText": "12-interface"});
								}
								else if (symbol._symbolType == eco.SymbolType.Enum)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Enum, "documentation": docs, "sortText": "13-enum"});
								}
								else if (symbol._symbolType == eco.SymbolType.Class)
								{
									self.OnAddAutocompletion({"label": symbol._name, "kind": monaco.languages.CompletionItemKind.Class, "documentation": docs, "insertText": {"value": symbol._name}, "sortText": "11-class"});
								}
							}
						}

					}

				}

			}
		});
	};

	// void CreateDotAccessAlert(CompilerModel,int,int,Method)
	Compiler.prototype.CreateDotAccessAlert = function(model, line, column, inMethod) {
		var self = this;
		self._parser.AlertOnDotAccess(line, column, function (exprType) {
			if (exprType)
			{
				var completions = [];
				if (!exprType.IsEnum())
				{
					if (exprType.IsClass())
					{
						if (inMethod)
						{
							var members = (exprType).GetMembersAccessibleFrom(inMethod);
							for (var member of members)
							{
								if (self.OnAddAutocompletion)
									self.OnAddAutocompletion(self.CreateMemberCompletion(model, member, true, false, true));
							}

						}
					}
					else
					{
						var members1 = exprType.GetAllMembers();
						for (var member1 of members1)
						{
							self.OnAddAutocompletion(self.CreateMemberCompletion(model, member1, true, false, true));
						}

					}

				}
			}
		});
	};

	// map<object> CreateMemberCompletion(CompilerModel,Member,bool,bool,bool)
	Compiler.prototype.CreateMemberCompletion = function(model, member, variableAccess, staticAccess, forceStaticFilter) {
		var self = this;
		if (forceStaticFilter)
		{
			if (staticAccess)
			{
				if (!member._static)
					return null;
			}
			else
			{
				if (member._static)
					return null;
			}

		}
		var docs = "";
		if (member._docs)
			docs = member._docs.ToString(false, "");
		var access = "";
		if (member._access == eco.MemberAccess.Private)
			access = "private ";
		else if (member._access == eco.MemberAccess.Protected)
			access = "protected ";
		else if (member._access == eco.MemberAccess.Public)
			access = "public ";
		if (member.IsField() || member.IsProperty())
		{
			return {"label": member.Signature(), "kind": monaco.languages.CompletionItemKind.Field, "detail": access + member._type.Signature(), "documentation": docs, "sortText": "1-field"};
		}
		else if (member.IsMethod())
		{
			var method = member;
			if (!method._isPropMethod)
			{
				if (!method.IsConstructor())
				{
					return {"label": (member).DetailName(), "kind": monaco.languages.CompletionItemKind.Method, "insertText": {"value": (member).GetInsertSnippet()}, "detail": access + member._type.Signature(), "documentation": docs, "sortText": "2-method"};
				}
				else if (method.IsConstructor())
				{
					if (!variableAccess)
						return {"label": (member).ConstructorDetailName(), "kind": monaco.languages.CompletionItemKind.Constructor, "insertText": {"value": (member).GetInsertSnippet1()}, "detail": access, "documentation": docs, "sortText": "3-constructor"};
				}
			}
		}
		return null;
	};

	// void SetupSymbolTables(string,object)
	Compiler.prototype.SetupSymbolTables = function(name, packageContents) {
		var self = this;
		self._sharedSymbolTable = eco.SymbolTable._New5(new eco.SymbolTable(), name + "-shared");
		self._serverSymbolTable = eco.SymbolTable._New5(new eco.SymbolTable(), name + "-server");
		self._clientSymbolTable = eco.SymbolTable._New5(new eco.SymbolTable(), name + "-client");
		self._serverSymbolTable.SetSymbol(eco.Interface.getPackageInterface(), false);
		self._serverSymbolTable.SetSymbol(eco.Interface.getEntryPoint(), false);
	};

	return Compiler;
}());

/**

 */
eco.CaptureList = (function() {
	function CaptureList() {
	}

	// Constructor _New()
	CaptureList._New = function(self) {
		self._items = null;
		self._items = [];
		return self;
	};

	// ScopeItem[] getItems()
	CaptureList.prototype.getItems = function() {
		var self = this;
		return self._items;
	};

	// void AddItem(ScopeItem)
	CaptureList.prototype.AddItem = function(item) {
		var self = this;
		for (var i of self._items)
		{
			if (i.CompiledName() == item.CompiledName())
				return;
		}

		self._items.push(item);
	};

	return CaptureList;
}());

/**

 */
eco.Translator = (function() {
	function Translator() {
	}

	// Constructor _New()
	Translator._New = function(self) {
		self.DebugMode = true;
		self._symbolTable = null;
		self._sharedSymbolTable = null;
		self._minify = false;
		self._writeComments = false;
		self._expressionLocations = null;
		self._expressionMappings = null;
		self._projectName = "";
		self._shouldIndent = false;
		self._shouldNewLine = false;
		self._captureLists = null;
		self._namespacesToCompile = null;
		self._classesToCompile = null;
		self._nativeClassesToCompile = null;
		self._symbolsToCompile = null;
		self._currentLine = 0;
		self._currentFileID = "";
		self._stack = null;
		self._startCode = "";
		self._commonCode = "";
		self._indent = 0;
		return self;
	};

	// Constructor _New(string,SymbolTable,SymbolTable)
	Translator._New1 = function(self, projectName, symbolTable, sharedSymbolTable) {
		self.DebugMode = true;
		self._symbolTable = null;
		self._sharedSymbolTable = null;
		self._minify = false;
		self._writeComments = false;
		self._expressionLocations = null;
		self._expressionMappings = null;
		self._projectName = "";
		self._shouldIndent = false;
		self._shouldNewLine = false;
		self._captureLists = null;
		self._namespacesToCompile = null;
		self._classesToCompile = null;
		self._nativeClassesToCompile = null;
		self._symbolsToCompile = null;
		self._currentLine = 0;
		self._currentFileID = "";
		self._stack = null;
		self._startCode = "";
		self._commonCode = "";
		self._indent = 0;
		self._projectName = projectName;
		self._symbolTable = symbolTable;
		self._sharedSymbolTable = sharedSymbolTable;
		self._stack = [];
		self._startCode = "";
		self._commonCode = "";
		self._indent = 0;
		self._writeComments = false;
		self._shouldIndent = true;
		self._shouldNewLine = true;
		self._minify = false;
		self._symbolsToCompile = [];
		self._classesToCompile = [];
		self._nativeClassesToCompile = [];
		self._namespacesToCompile = [];
		self._captureLists = [];
		self._captureLists.push(eco.CaptureList._New(new eco.CaptureList()));
		self._expressionMappings = {};
		return self;
	};

	// SymbolTable getSymbolTable()
	Translator.prototype.getSymbolTable = function() {
		var self = this;
		return self._symbolTable;
	};

	// SymbolTable getSharedSymbolTable()
	Translator.prototype.getSharedSymbolTable = function() {
		var self = this;
		return self._sharedSymbolTable;
	};

	// bool getMinify()
	Translator.prototype.getMinify = function() {
		var self = this;
		return self._minify;
	};

	// bool setMinify(bool)
	Translator.prototype.setMinify = function(value) {
		var self = this;
		self._minify = value;
	};

	// bool getWriteComments()
	Translator.prototype.getWriteComments = function() {
		var self = this;
		return self._writeComments;
	};

	// bool setWriteComments(bool)
	Translator.prototype.setWriteComments = function(value) {
		var self = this;
		self._writeComments = value;
	};

	// map<object> getExpressionLocations()
	Translator.prototype.getExpressionLocations = function() {
		var self = this;
		return self._expressionLocations;
	};

	// map<object> setExpressionLocations(map<object>)
	Translator.prototype.setExpressionLocations = function(value) {
		var self = this;
		self._expressionLocations = value;
	};

	// map<object> getExpressionMappings()
	Translator.prototype.getExpressionMappings = function() {
		var self = this;
		return self._expressionMappings;
	};

	// map<object> setExpressionMappings(map<object>)
	Translator.prototype.setExpressionMappings = function(value) {
		var self = this;
		self._expressionMappings = value;
	};

	// string Translate()
	Translator.prototype.Translate = function() {
		var self = this;
		self.PushStack();
		var symbols = self._symbolTable._symbols;
		for (var key of Object.keys(symbols))
			self.CollectObjectsToCompile(symbols[key]);

		self.PushStack();
		self.CreateStart();
		var createdStart = self.PopStack();
		var classOrder = [];
		for (var i = 0; i < 100; i++)
			classOrder.push([]);

		for (var cls of self._classesToCompile)
			classOrder[cls.getClassDepth()].push(cls);

		for (var nativeClass of self._nativeClassesToCompile)
			self.TranslateSymbol(nativeClass._name, nativeClass);

		if (self.DebugMode)
			self._currentLine = self._currentLine + (self._commonCode + createdStart).split("\n").length;
		for (var ns of self._namespacesToCompile)
			self.TranslateNamespace(ns._name, ns);

		for (var order of classOrder)
		{
			for (var cls1 of order)
			{
				self._currentFileID = cls1._fileId;
				self.TranslateSymbol(cls1._name, cls1);
			}

		}

		for (var other of self._symbolsToCompile)
			self.TranslateSymbol(other._name, other);

		self.CreateEnd();
		return createdStart + self._startCode + self.PopStack();
	};

	// string GetCommonCode()
	Translator.prototype.GetCommonCode = function() {
		var self = this;
		return self._commonCode;
	};

	// string QualifyName(string)
	Translator.prototype.QualifyName = function(sig) {
		var self = this;
		var output = "";
		for (var c = 0; c < sig.length; c++)
		{
			if (sig[c] == '.')
				output = output + "__";
			else
				output = output + sig[c];

		}

		return output;
	};

	// void TranslateSymbol(string,Symbol)
	Translator.prototype.TranslateSymbol = function(name, symbol) {
		var self = this;
		var symbolType = symbol._symbolType;
		if (symbol._imported)
		{
			if (symbol._symbolType == eco.SymbolType.Namespace)
			{
				self.TranslateNamespace(symbol._name, symbol);
			}
			return;
		}
		switch (symbolType)
		{
			case eco.SymbolType.Namespace:
			{
				self._symbolTable.UseNamespace(symbol);
				self.TranslateNamespace(name, symbol);
				break;
			}
			case eco.SymbolType.Class:
			{
				if ((symbol)._isNative)
					self.TranslateNativeClass(name, symbol);
				else
					self.TranslateClass(name, symbol);

				break;
			}
			case eco.SymbolType.Enum:
			{
				self.TranslateEnum(name, symbol);
				break;
			}
			case eco.SymbolType.Template:
			{
				self.TranslateTemplate(name, symbol);
				break;
			}
			case eco.SymbolType.ServerComponent:
			{
				self.TranslateServerComponent(name, symbol);
				break;
			}
			case eco.SymbolType.ClientComponent:
			{
				self.TranslateClientComponent(name, symbol);
				break;
			}
			case eco.SymbolType.Initialiser:
			{
				self.TranslateInitialiser(name, symbol);
				break;
			}
			case eco.SymbolType.Service:
			{
				self.TranslateService(name, symbol);
				break;
			}
		}
	};

	// virtual void CreateStart()
	Translator.prototype.CreateStart = function() {
		var self = this;
	};

	// virtual void CreateEnd()
	Translator.prototype.CreateEnd = function() {
		var self = this;
	};

	// virtual void TranslateNamespace(string,Namespace)
	Translator.prototype.TranslateNamespace = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateClass(string,Class)
	Translator.prototype.TranslateClass = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateNativeClass(string,Class)
	Translator.prototype.TranslateNativeClass = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateEnum(string,Enum)
	Translator.prototype.TranslateEnum = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateTemplate(string,Template)
	Translator.prototype.TranslateTemplate = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateServerComponent(string,ServerComponent)
	Translator.prototype.TranslateServerComponent = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateClientComponent(string,ClientComponent)
	Translator.prototype.TranslateClientComponent = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateInitialiser(string,Initialiser)
	Translator.prototype.TranslateInitialiser = function(name, symbol) {
		var self = this;
	};

	// virtual void TranslateService(string,Service)
	Translator.prototype.TranslateService = function(name, symbol) {
		var self = this;
	};

	// virtual string GetTypeDefaultLiteral(map<object>)
	Translator.prototype.GetTypeDefaultLiteral = function(type) {
		var self = this;
		return "null";
	};

	// void PushStack()
	Translator.prototype.PushStack = function() {
		var self = this;
		self._stack.push("");
	};

	// string PopStack()
	Translator.prototype.PopStack = function() {
		var self = this;
		var top = self._stack.pop();
		return top;
	};

	// virtual void Comment(string)
	Translator.prototype.Comment = function(text) {
		var self = this;
		if (!self._minify && self._writeComments)
			self.WriteLine("// " + text, true);
	};

	// virtual void DocComment(Namespace)
	Translator.prototype.DocComment = function(symbol) {
		var self = this;
		if (!self._minify && self._writeComments)
		{
			if (symbol._docs)
				self.Write(symbol._docs.ToString(true, self.GetIndent()), false);
			else
			{
				if (symbol._symbolType == eco.SymbolType.Class)
				{
					var cls = symbol;
					self.Comment("Class " + cls._name + (cls._baseClass ? (" : " + cls._baseClass._name) : ""));
				}
			}

		}
	};

	// virtual void DocComment(Member)
	Translator.prototype.DocComment1 = function(symbol) {
		var self = this;
		if (!self._minify && self._writeComments)
		{
			if (symbol._docs)
				self.Write(symbol._docs.ToString(true, self.GetIndent()), false);
			else
			{
				if (symbol.IsMethod())
				{
					var method = symbol;
					if (method.IsConstructor())
						self.Comment("Constructor " + method.Signature());
					else
						self.Comment((method._static ? "static " : "") + (method._virtual ? "virtual " : "") + method._type.Signature() + " " + method.Signature());

				}
			}

		}
	};

	// void Write(string,bool)
	Translator.prototype.Write = function(text, indent) {
		var self = this;
		if (indent && !self._minify)
		{
			self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + (self.GetIndent() + text);
		}
		else
			self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + text;

		if (self.DebugMode && self._stack.length == 1)
		{
			if ((Object.prototype.toString.call((text)) === '[object String]') && (text).indexOf("\n") > -1)
				self._currentLine = self._currentLine + text.split("\n").length - 1;
		}
	};

	// void Indent()
	Translator.prototype.Indent = function() {
		var self = this;
		self._indent++;
	};

	// void Outdent()
	Translator.prototype.Outdent = function() {
		var self = this;
		self._indent--;
	};

	// void WriteLine(string,bool)
	Translator.prototype.WriteLine = function(text, indent) {
		var self = this;
		if (self._minify)
			self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + text + " ";
		else
		{
			if (indent)
				self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + self.GetIndent() + text + "\n";
			else
				self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + (text + "\n");

		}

		if (self.DebugMode && self._stack.length == 1)
		{
			if ((text).indexOf("\n") > -1)
				self._currentLine = self._currentLine + text.split("\n").length;
			else
				self._currentLine++;

		}
	};

	// void NewLine()
	Translator.prototype.NewLine = function() {
		var self = this;
		if (!self._shouldNewLine)
			return;
		if (self._minify)
			self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + " ";
		else
			self._stack[self._stack.length - 1] = self._stack[self._stack.length - 1] + "\n";

		if (self.DebugMode && self._stack.length == 1)
			self._currentLine++;
	};

	// void AddStartCode(string)
	Translator.prototype.AddStartCode = function(startCode) {
		var self = this;
		self._startCode = self._startCode + startCode;
		if (self._minify)
			self._startCode = self._startCode + " ";
		else
		{
			self._startCode = self._startCode + "\n\n";
			if (self.DebugMode)
			{
			}
		}

	};

	// void AddCommonCode(string)
	Translator.prototype.AddCommonCode = function(commonCode) {
		var self = this;
		self._commonCode = self._commonCode + commonCode;
		if (self._minify)
			self._commonCode = self._commonCode + " ";
		else
		{
			self._commonCode = self._commonCode + "\n\n";
			if (self.DebugMode)
			{
			}
		}

	};

	// void PushCaptureList()
	Translator.prototype.PushCaptureList = function() {
		var self = this;
		self._captureLists.push(eco.CaptureList._New(new eco.CaptureList()));
	};

	// CaptureList PopCaptureList()
	Translator.prototype.PopCaptureList = function() {
		var self = this;
		var last = self._captureLists[self._captureLists.length - 1];
		self._captureLists.pop();
		return last;
	};

	// CaptureList CurrentCaptureList()
	Translator.prototype.CurrentCaptureList = function() {
		var self = this;
		return self._captureLists[self._captureLists.length - 1];
	};

	// string GetIndent()
	Translator.prototype.GetIndent = function() {
		var self = this;
		if (!self._shouldIndent)
			return "";
		var indent = "";
		for (var i = 0; i < self._indent; i++)
			indent = indent + "\t";

		return indent;
	};

	// void CollectObjectsToCompile(Symbol)
	Translator.prototype.CollectObjectsToCompile = function(sym) {
		var self = this;
		if (sym.GetSymbolType() == eco.SymbolType.Namespace)
		{
			var ns = sym;
			self._namespacesToCompile.push(ns);
			for (var s of Object.keys(ns._symbols))
				self.CollectObjectsToCompile(ns._symbols[s]);

		}
		else if (sym.GetSymbolType() == eco.SymbolType.Class)
		{
			if ((sym)._isNative)
				self._nativeClassesToCompile.push(sym);
			else
				self._classesToCompile.push(sym);

		}
		else
			self._symbolsToCompile.push(sym);

	};

	return Translator;
}());

/**

 */
eco.ParserError = (function() {
	function ParserError() {
	}

	// Constructor _New()
	ParserError._New = function(self) {
		self._fileId = "";
		self._fileName = "";
		self._msg = "";
		self._startLine = 0;
		self._endLine = 0;
		self._startColumn = 0;
		self._endColumn = 0;
		return self;
	};

	// Constructor _New(string,string,string,int,int,int,int)
	ParserError._New1 = function(self, fileId, fileName, msg, startLine, endLine, startColumn, endColumn) {
		self._fileId = "";
		self._fileName = "";
		self._msg = "";
		self._startLine = 0;
		self._endLine = 0;
		self._startColumn = 0;
		self._endColumn = 0;
		self._fileId = fileId;
		self._fileName = fileName;
		self._msg = msg;
		self._startLine = startLine;
		self._endLine = endLine;
		self._startColumn = startColumn;
		self._endColumn = endColumn;
		return self;
	};

	// string getFileID()
	ParserError.prototype.getFileID = function() {
		var self = this;
		return self._fileId;
	};

	// string getFileName()
	ParserError.prototype.getFileName = function() {
		var self = this;
		return self._fileName;
	};

	// string getMessage()
	ParserError.prototype.getMessage = function() {
		var self = this;
		return self._msg;
	};

	// int getStartLine()
	ParserError.prototype.getStartLine = function() {
		var self = this;
		return self._startLine;
	};

	// int getEndLine()
	ParserError.prototype.getEndLine = function() {
		var self = this;
		return self._endLine;
	};

	// int getStartColumn()
	ParserError.prototype.getStartColumn = function() {
		var self = this;
		return self._startColumn;
	};

	// int getEndColumn()
	ParserError.prototype.getEndColumn = function() {
		var self = this;
		return self._endColumn;
	};

	// string ToString()
	ParserError.prototype.ToString = function() {
		var self = this;
		return "Error (" + self._fileId + ", " + self._fileName + string_Format("), line %{0}, column %{1}: %{2}", [self._startLine, self._startColumn, self._msg]);
	};

	return ParserError;
}());

// Class Token
eco.Token = (function() {
	function Token() {
	}

	Token._keywords = null;
	// Constructor _New()
	Token._New = function(self) {
		self._tokType = eco.TokenType.None;
		self._value = null;
		self.Line = 0;
		self.Column = 0;
		self.Position = 0;
		return self;
	};

	/**

	 */
	Token._New1 = function(self, type, val) {
		self._tokType = eco.TokenType.None;
		self._value = null;
		self.Line = 0;
		self.Column = 0;
		self.Position = 0;
		self._tokType = type;
		self._value = val;
		return self;
	};

	// TokenType getType()
	Token.prototype.getType = function() {
		var self = this;
		return self._tokType;
	};

	// object getValue()
	Token.prototype.getValue = function() {
		var self = this;
		return self._value;
	};

	/**

	 */
	Token.GetKeyword = function(kw) {
		if (!Token._keywords)
		{
			Token._keywords = {"__target": eco.TokenType.K_Target, "__targets": eco.TokenType.K_Targets, "__excludes": eco.TokenType.K_Excludes, "import": eco.TokenType.K_Import, "using": eco.TokenType.K_Using, "typedef": eco.TokenType.K_Typedef, "namespace": eco.TokenType.K_Package, "template": eco.TokenType.K_Template, "native": eco.TokenType.K_Native, "class": eco.TokenType.K_Class, "interface": eco.TokenType.K_Interface, "enum": eco.TokenType.K_Enum, "public": eco.TokenType.K_Public, "protected": eco.TokenType.K_Protected, "private": eco.TokenType.K_Private, "static": eco.TokenType.K_Static, "virtual": eco.TokenType.K_Virtual, "get": eco.TokenType.K_Get, "set": eco.TokenType.K_Set, "alias": eco.TokenType.K_Alias, "__ajax": eco.TokenType.K_Ajax, "__router": eco.TokenType.K_Router, "__routes": eco.TokenType.K_Routes, "as": eco.TokenType.K_As, "var": eco.TokenType.K_Var, "return": eco.TokenType.K_Return, "true": eco.TokenType.K_True, "false": eco.TokenType.K_False, "null": eco.TokenType.K_Null, "this": eco.TokenType.K_This, "self": eco.TokenType.K_Self, "base": eco.TokenType.K_Base, "new": eco.TokenType.K_New, "if": eco.TokenType.K_If, "else": eco.TokenType.K_Else, "for": eco.TokenType.K_For, "foreach": eco.TokenType.K_Foreach, "in": eco.TokenType.K_In, "while": eco.TokenType.K_While, "switch": eco.TokenType.K_Switch, "case": eco.TokenType.K_Case, "default": eco.TokenType.K_Default, "break": eco.TokenType.K_Break, "continue": eco.TokenType.K_Continue, "try": eco.TokenType.K_Try, "catch": eco.TokenType.K_Catch, "throw": eco.TokenType.K_Throw, "print": eco.TokenType.K_Print, "await": eco.TokenType.K_Await};
		}
		if (((Token._keywords)[kw] !== undefined))
			return Token._keywords[kw];
		return eco.TokenType.None;
	};

	/**

	 */
	Token.GetTokenName = function(type) {
		switch (type)
		{
			case eco.TokenType.None:
				return "n/a";
			case eco.TokenType.DocComment:
				return "doc-comment";
			case eco.TokenType.Ident:
				return "idenfifier";
			case eco.TokenType.Bool:
				return "boolean";
			case eco.TokenType.Char:
				return "char";
			case eco.TokenType.Int:
				return "integer";
			case eco.TokenType.Float:
				return "float";
			case eco.TokenType.String:
				return "string";
			case eco.TokenType.AsmStr:
				return "asm string";
			case eco.TokenType.Operator:
				return "operator";
			case eco.TokenType.BraceOpen:
				return "{";
			case eco.TokenType.BraceClose:
				return "}";
			case eco.TokenType.ParOpen:
				return "(";
			case eco.TokenType.ParClose:
				return ")";
			case eco.TokenType.SquareOpen:
				return "[";
			case eco.TokenType.SquareClose:
				return "]";
			case eco.TokenType.Comma:
				return ",";
			case eco.TokenType.Dot:
				return ".";
			case eco.TokenType.Arrow:
				return "->";
			case eco.TokenType.Colon:
				return ":";
			case eco.TokenType.Semicolon:
				return ";";
			case eco.TokenType.Amp:
				return "&";
			case eco.TokenType.At:
				return "@";
			case eco.TokenType.MClose:
				return "</";
			case eco.TokenType.MSelfClose:
				return "/>";
			case eco.TokenType.Dollar:
				return "$";
			case eco.TokenType.K_Target:
				return "target";
			case eco.TokenType.K_Targets:
				return "targets";
			case eco.TokenType.K_Excludes:
				return "excludes";
			case eco.TokenType.K_Import:
				return "import";
			case eco.TokenType.K_Using:
				return "using";
			case eco.TokenType.K_Typedef:
				return "typedef";
			case eco.TokenType.K_Package:
				return "namespace";
			case eco.TokenType.K_Template:
				return "template";
			case eco.TokenType.K_Native:
				return "native";
			case eco.TokenType.K_Class:
				return "class";
			case eco.TokenType.K_Interface:
				return "interface";
			case eco.TokenType.K_Enum:
				return "enum";
			case eco.TokenType.K_Public:
				return "public";
			case eco.TokenType.K_Protected:
				return "protected";
			case eco.TokenType.K_Private:
				return "private";
			case eco.TokenType.K_Static:
				return "static";
			case eco.TokenType.K_Virtual:
				return "virtual";
			case eco.TokenType.K_Get:
				return "get";
			case eco.TokenType.K_Set:
				return "set";
			case eco.TokenType.K_Alias:
				return "alias";
			case eco.TokenType.K_Ajax:
				return "__ajax";
			case eco.TokenType.K_Router:
				return "__router";
			case eco.TokenType.K_Routes:
				return "__routes";
			case eco.TokenType.K_Var:
				return "var";
			case eco.TokenType.K_Return:
				return "return";
			case eco.TokenType.K_True:
				return "true";
			case eco.TokenType.K_False:
				return "false";
			case eco.TokenType.K_Null:
				return "null";
			case eco.TokenType.K_This:
				return "this";
			case eco.TokenType.K_Self:
				return "self";
			case eco.TokenType.K_Base:
				return "base";
			case eco.TokenType.K_New:
				return "new";
			case eco.TokenType.K_If:
				return "if";
			case eco.TokenType.K_Else:
				return "else";
			case eco.TokenType.K_For:
				return "for";
			case eco.TokenType.K_Foreach:
				return "foreach";
			case eco.TokenType.K_In:
				return "in";
			case eco.TokenType.K_While:
				return "while";
			case eco.TokenType.K_Switch:
				return "switch";
			case eco.TokenType.K_Case:
				return "case";
			case eco.TokenType.K_Default:
				return "default";
			case eco.TokenType.K_Break:
				return "break";
			case eco.TokenType.K_Continue:
				return "continue";
			case eco.TokenType.K_Try:
				return "try";
			case eco.TokenType.K_Catch:
				return "catch";
			case eco.TokenType.K_Throw:
				return "throw";
			case eco.TokenType.K_Print:
				return "print";
			case eco.TokenType.K_Await:
				return "await";
		}
		return "n/a";
	};

	return Token;
}());

/**

 */
eco.LexerState = (function() {
	function LexerState() {
	}

	// Constructor _New()
	LexerState._New = function(self) {
		self.Position = 0;
		self.Line = 0;
		self.Column = 0;
		return self;
	};

	// Constructor _New(int,int,int)
	LexerState._New1 = function(self, position, line, column) {
		self.Position = 0;
		self.Line = 0;
		self.Column = 0;
		self.Position = position;
		self.Line = line;
		self.Column = column;
		return self;
	};

	return LexerState;
}());

/**

 */
eco.Lexer = (function() {
	function Lexer() {
	}

	/**

	 */
	Lexer._New = function(self) {
		self._currentFileID = "";
		self._currentFileName = "";
		self._errors = [];
		self.OnErrorRegistered = null;
		self._curLine = 0;
		self._curCol = 0;
		self._curPos = 0;
		self._oldPos = 0;
		self._oldLine = 0;
		self._oldCol = 0;
		self._lineStart = 0;
		self._contents = "";
		self._lastCheck = null;
		return self;
	};

	/**

	 */
	Lexer.prototype.SetContent = function(contents) {
		var self = this;
		self._contents = self._removeComments(contents + " ");
		var start = "//_debug";
		if (contents.substr(0, start.length) == start)
			console.log(self._contents);
		self._curPos = 0;
		self._oldPos = 0;
		self._curLine = 1;
		self._curCol = 0;
		self._lineStart = 0;
		self._lastCheck = null;
		self._errors = [];
	};

	// string getCurrentFileID()
	Lexer.prototype.getCurrentFileID = function() {
		var self = this;
		return self._currentFileID;
	};

	// string setCurrentFileID(string)
	Lexer.prototype.setCurrentFileID = function(value) {
		var self = this;
		self._currentFileID = value;
	};

	// string getCurrentFileName()
	Lexer.prototype.getCurrentFileName = function() {
		var self = this;
		return self._currentFileName;
	};

	// string setCurrentFileName(string)
	Lexer.prototype.setCurrentFileName = function(value) {
		var self = this;
		self._currentFileName = value;
	};

	/**

	 */
	Lexer.prototype.GetCurPos = function() {
		var self = this;
		return self._curPos;
	};

	/**

	 */
	Lexer.prototype.GetCurLine = function() {
		var self = this;
		return self._curLine;
	};

	/**

	 */
	Lexer.prototype.SetCurPos = function(curpos) {
		var self = this;
		self._curPos = curpos;
	};

	/**

	 */
	Lexer.prototype.SetCurLine = function(curline) {
		var self = this;
		self._curLine = curline;
	};

	/**

	 */
	Lexer.prototype.SaveState = function() {
		var self = this;
		return eco.LexerState._New1(new eco.LexerState(), self._curPos, self._curLine, self._curCol);
	};

	/**

	 */
	Lexer.prototype.SaveOldState = function() {
		var self = this;
		return eco.LexerState._New1(new eco.LexerState(), self._oldPos, self._oldLine, self._oldCol);
	};

	/**

	 */
	Lexer.prototype.RestoreState = function(state) {
		var self = this;
		self._curPos = state.Position;
		self._curLine = state.Line;
		self._curCol = state.Column;
	};

	/**

	 */
	Lexer.prototype.HasNext = function() {
		var self = this;
		return self._curPos < self._contents.length;
	};

	/**

	 */
	Lexer.prototype.GetNext = function() {
		var self = this;
		self._oldPos = self._curPos;
		self._oldCol = self._curCol;
		self._oldLine = self._curLine;
		var token = self._getNext();
		if (token)
		{
			token.Line = self._oldLine;
			token.Column = self._oldCol;
			token.Position = self._oldPos;
		}
		return token;
	};

	/**

	 */
	Lexer.prototype.Check = function() {
		var self = this;
		return self._checkNext();
	};

	/**

	 */
	Lexer.prototype.Check1 = function(type) {
		var self = this;
		var tok = self.Check();
		if (!tok || tok._tokType != type)
			return null;
		return tok;
	};

	/**

	 */
	Lexer.prototype.Check2 = function(op) {
		var self = this;
		var tok = self.Check1(eco.TokenType.Operator);
		if (!tok || tok._opType != op)
			return null;
		return tok;
	};

	/**

	 */
	Lexer.prototype.Accept = function() {
		var self = this;
		var tok = self.GetNext();
		if (!tok)
			self.Error("Expected token");
		return tok;
	};

	/**

	 */
	Lexer.prototype.Accept1 = function(type, throwError) {
		var self = this;
		if (throwError)
		{
			var tok = self.Accept();
			if (!tok)
				self.Error("Expected '" + eco.Token.GetTokenName(type) + "'");
			else if (tok._tokType != type)
			{
				if (tok._tokType == eco.TokenType.Operator)
					self.Error("Unexpected operator token '" + eco.TokenOp.GetOpName((tok)._opType) + "'. Expected '" + eco.Token.GetTokenName(type) + "'");
				else
					self.Error("Unexpected token '" + eco.Token.GetTokenName(tok._tokType) + "'. Expected '" + eco.Token.GetTokenName(type) + "'");

			}
			return tok;
		}
		else
		{
			var state = self.SaveOldState();
			var tok1 = self.Check();
			var error = false;
			if (!tok1)
			{
				error = true;
				self.ErrorNoThrow("Expected '" + eco.Token.GetTokenName(type) + "'");
			}
			else if (tok1._tokType != type)
			{
				error = true;
				if (tok1._tokType == eco.TokenType.Operator)
					self.ErrorNoThrow3("Expected '" + eco.Token.GetTokenName(type) + "'", state, self._oldLine, self._oldCol);
				else
					self.ErrorNoThrow3("Expected '" + eco.Token.GetTokenName(type) + "'", state, self._oldLine, self._oldCol);

			}
			if (!error)
			{
				self.Accept();
				return tok1;
			}
			else
				return null;

		}

	};

	/**

	 */
	Lexer.prototype.Accept2 = function(op, throwError) {
		var self = this;
		if (throwError)
		{
			var tok = self.Accept1(eco.TokenType.Operator, true);
			if (!tok || tok._opType != op)
				self.Error("Expected operator '" + eco.TokenOp.GetOpName(op) + "'");
			return tok;
		}
		else
		{
			var error = false;
			var state = self.SaveOldState();
			var tok1 = self.Check();
			if (!tok1)
			{
				error = true;
				self.ErrorNoThrow3("Expected operator '" + eco.TokenOp.GetOpName(op) + "'", state, self._oldLine, self._oldCol);
			}
			else if (tok1._tokType != eco.TokenType.Operator)
			{
				error = true;
				self.ErrorNoThrow3("Expected operator '" + eco.TokenOp.GetOpName(op) + "'", state, self._oldLine, self._oldCol);
			}
			else if ((tok1)._opType != op)
			{
				error = true;
				self.ErrorNoThrow3("Expected operator '" + eco.TokenOp.GetOpName(op) + "'", state, self._oldLine, self._oldCol);
			}
			if (!error)
			{
				self.Accept();
				return tok1;
			}
			else
				return null;

		}

	};

	/**

	 */
	Lexer.prototype.AcceptHTMLText = function() {
		var self = this;
		self._lastCheck = null;
		var outp = "";
		for (; self._curPos < self._contents.length; self._curPos++)
		{
			if (self._contents[self._curPos] == '<')
				break;
			else if (self._contents[self._curPos] != "\n")
			{
				if (self._contents[self._curPos] == "\t")
					outp = outp + " ";
				else
					outp = outp + self._contents[self._curPos];

			}
			else
				self._curLine++;

		}

		return eco.Token._New1(new eco.Token(), eco.TokenType.String, '"' + outp + '"');
	};

	/**

	 */
	Lexer.prototype.AcceptHTMLAttr = function() {
		var self = this;
		self._lastCheck = null;
		var outp = "";
		while (self._curPos < self._contents.length && (self._contents[self._curPos] == ' ' || self._contents[self._curPos] == '\t'))
			self._curPos++;

		while (self._curPos < self._contents.length && (Lexer.IsAlpha(self._contents[self._curPos]) || self._contents[self._curPos] == '-'))
		{
			outp = outp + self._contents[self._curPos];
			self._curPos++;
		}

		return eco.Token._New1(new eco.Token(), eco.TokenType.String, outp);
	};

	/**

	 */
	Lexer.prototype.Revert = function(pos) {
		var self = this;
		var diff = self._curPos - pos;
		self._curPos = pos;
		self._curCol = self._curCol - diff;
		if (self._curCol < 1)
		{
			self._curLine--;
			self._curCol = self._curPos + 1;
			for (var c = self._curPos; c > -1; c--)
				if (self._contents[c] == '\n')
				{
					self._curCol = self._curPos - c + 1;
					break;
				}

		}
	};

	/**

	 */
	Lexer.prototype.Search = function(a, b) {
		var self = this;
		var tok = self.Accept();
		while (tok._tokType != a && tok._tokType != b)
			tok = self.Accept();

		return false;
	};

	/**

	 */
	Lexer.prototype.Find = function(chr) {
		var self = this;
		var len = self._contents.length;
		while (self._curPos < len && (self._contents[self._curPos] != chr))
		{
			self._curPos++;
			self._curCol = self._curPos - self._lineStart + 1;
			if (self._contents[self._curPos] == '\n')
			{
				self._curLine++;
				self._lineStart = self._curPos + 1;
			}
		}

		if (self._curPos >= len)
			throw {"error": "EOF", "line": self._curLine, "col": self._curCol};
		self._curPos--;
	};

	// ParserError[] getErrors()
	Lexer.prototype.getErrors = function() {
		var self = this;
		return self._errors;
	};

	/**

	 */
	Lexer.prototype.Error = function(msg) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, self._curLine, self._curLine, self._curCol, self._curCol);
		throw err;
	};

	/**

	 */
	Lexer.prototype.Error1 = function(msg, state) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, state.Line, self._curLine, state.Column, self._curCol);
		throw err;
	};

	/**

	 */
	Lexer.prototype.Error2 = function(msg, endLine, endColumn) {
		var self = this;
		if (endLine == 0)
			endLine = self._curLine;
		if (endColumn == 0)
			endColumn = self._curCol;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, self._curLine, endLine, self._curCol, endColumn);
		throw err;
	};

	/**

	 */
	Lexer.prototype.Error3 = function(msg, state, endLine, endColumn) {
		var self = this;
		if (endLine == 0)
			endLine = self._curLine;
		if (endColumn == 0)
			endColumn = self._curCol;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, state.Line, endLine, state.Column, endColumn);
		throw err;
	};

	// void Error(string,ParseNode)
	Lexer.prototype.Error4 = function(msg, node) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, node._startLine, node._endLine, node._startColumn, node._endColumn);
		throw err;
	};

	/**

	 */
	Lexer.prototype.ErrorNoThrow = function(msg) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, self._curLine, self._curLine, self._curCol, self._curCol);
		if (self.OnErrorRegistered)
			self.OnErrorRegistered(err);
	};

	/**

	 */
	Lexer.prototype.ErrorNoThrow1 = function(msg, state) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, state.Line, self._curLine, state.Column, self._curCol);
		if (self.OnErrorRegistered)
			self.OnErrorRegistered(err);
	};

	/**

	 */
	Lexer.prototype.ErrorNoThrow2 = function(msg, endLine, endColumn) {
		var self = this;
		if (endLine == 0)
			endLine = self._curLine;
		if (endColumn == 0)
			endColumn = self._curCol;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, self._curLine, endLine, self._curCol, endColumn);
		if (self.OnErrorRegistered)
			self.OnErrorRegistered(err);
	};

	/**

	 */
	Lexer.prototype.ErrorNoThrow3 = function(msg, state, endLine, endColumn) {
		var self = this;
		if (endLine == 0)
			endLine = self._curLine;
		if (endColumn == 0)
			endColumn = self._curCol;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, state.Line, endLine, state.Column, endColumn);
		if (self.OnErrorRegistered)
			self.OnErrorRegistered(err);
	};

	// void ErrorNoThrow(string,ParseNode)
	Lexer.prototype.ErrorNoThrow4 = function(msg, node) {
		var self = this;
		var err = eco.ParserError._New1(new eco.ParserError(), self._currentFileID, self._currentFileName, msg, node._startLine, node._endLine, node._startColumn, node._endColumn);
		if (self.OnErrorRegistered)
			self.OnErrorRegistered(err);
	};

	/**

	 */
	Lexer.IsAlpha = function(chr) {
		return (chr >= 'a' && chr <= 'z') || (chr >= 'A' && chr <= 'Z') || (chr == '_');
	};

	/**

	 */
	Lexer.IsDigit = function(chr) {
		return chr >= '0' && chr <= '9';
	};

	/**

	 */
	Lexer.IsWhite = function(chr) {
		return chr == " " || chr == "\t" || chr == "\n";
	};

	/**

	 */
	Lexer.IsDelim = function(chr) {
		return chr == '(' || chr == ')' || chr == '{' || chr == '}' || chr == '[' || chr == ']' || chr == ',' || chr == ';' || chr == '+' || chr == '-' || chr == '*' || chr == '/' || chr == '^' || chr == '%' || chr == '<' || chr == '>' || chr == '=' || chr == '!' || chr == '&' || chr == '|' || chr == ':' || chr == '@' || chr == '$' || chr == '?' || chr == '.';
	};

	// string _removeComments(string)
	Lexer.prototype._removeComments = function(contents) {
		var self = this;
		var str = "";
		var len = contents.length;
		if (len >= 4)
		{
			var inSingleComment = false;
			var inMultiComment = false;
			var inString = false;
			var inChar = false;
			for (var i = 0; i < len - 1; i++)
			{
				if (!inSingleComment && !inMultiComment)
				{
					if (!inString)
					{
						if (!inChar)
						{
							if (contents[i] == '\'')
								inChar = true;
						}
						else
						{
							if (contents[i] == '\'')
								inChar = false;
						}

					}
					if (!inChar)
					{
						if (!inString)
						{
							if (contents[i] == '"')
								inString = true;
						}
						else
						{
							if (contents[i] == '"')
								inString = false;
						}

					}
					if (inString || inChar)
					{
						if (contents[i] == '\\')
						{
							str = str + '\\';
							str = str + contents[i + 1];
							i++;
							continue;
						}
					}
				}
				if (!inString && !inChar)
				{
					if (contents[i] == '/')
					{
						if (contents[i + 1] == '*' && contents[i + 2] != '*')
						{
							inMultiComment = true;
							str = str + "  ";
						}
						else if (!inMultiComment && (contents[i + 1] == '/'))
						{
							inSingleComment = true;
							str = str + "  ";
						}
					}
					if (inMultiComment)
					{
						if (contents[i] == '*' && contents[i + 1] == '/')
						{
							inMultiComment = false;
							i = i + 2;
							str = str + "  ";
						}
					}
					else if (inSingleComment)
					{
						if (contents[i] == '\n')
						{
							inSingleComment = false;
						}
					}
				}
				if (!inMultiComment && !inSingleComment)
					str = str + contents[i];
				else
				{
					if (contents[i] == '\n')
						str = str + '\n';
				}

			}

			return str;
		}
		return "";
	};

	// string _removeComments_old(string)
	Lexer.prototype._removeComments_old = function(contents) {
		var self = this;
		var str = "";
		var len = contents.length;
		if (len >= 4)
		{
			var inComment = false;
			var inString = false;
			for (var i = 0; i < len - 1; i++)
			{
				if (!inString)
				{
					if (contents[i] == '"')
						inString = true;
					else
					{
						if (contents[i] == '/' && contents[i + 1] == '*' && contents[i + 2] != '*')
							inComment = true;
						if (inComment && contents[i] == '*' && contents[i + 1] == '/')
						{
							inComment = false;
							i = i + 2;
						}
					}

				}
				else
				{
					if (contents[i] == '"')
						inString = false;
				}

				if (!inComment)
					str = str + contents[i];
				else if (contents[i] == '\n')
					str = str + '\n';
			}

			return str;
		}
		return "";
	};

	// Token _checkNext()
	Lexer.prototype._checkNext = function() {
		var self = this;
		if (self._lastCheck)
			return self._lastCheck;
		self._lastCheck = self.GetNext();
		return self._lastCheck;
	};

	// Token _getNext()
	Lexer.prototype._getNext = function() {
		var self = this;
		if (self._lastCheck)
		{
			var tmp = self._lastCheck;
			self._lastCheck = null;
			return tmp;
		}
		var len = self._contents.length;
		var state = eco.TokenType.None;
		var curTok = "";
		if (self._curPos >= len)
			return null;
		for (; self._curPos < len; self._curPos++)
		{
			var cur = self._contents[self._curPos];
			self._curCol = self._curPos - self._lineStart + 1;
			switch (state)
			{
				case eco.TokenType.None:
				{
					if (cur == "\n")
					{
						self._curLine++;
						self._lineStart = self._curPos + 1;
					}
					else if (Lexer.IsWhite(cur))
						state = eco.TokenType.None;
					else if (Lexer.IsAlpha(cur))
						state = eco.TokenType.Ident;
					else if (Lexer.IsDigit(cur))
						state = eco.TokenType.Int;
					else if (cur == '\'')
						state = eco.TokenType.Char;
					else if (cur == '"')
						state = eco.TokenType.String;
					else if (cur == '/' && self._contents[self._curPos + 1] == '*' && self._contents[self._curPos + 2] == '*')
					{
						self._curPos = self._curPos + 2;
						state = eco.TokenType.DocComment;
					}
					else if (cur == '<' && self._contents[self._curPos + 1] == '%')
					{
						self._curPos++;
						state = eco.TokenType.AsmStr;
					}
					else if (Lexer.IsDelim(cur))
					{
						self._curPos++;
						switch (cur)
						{
							case '{':
								return eco.Token._New1(new eco.Token(), eco.TokenType.BraceOpen, null);
							case '}':
								return eco.Token._New1(new eco.Token(), eco.TokenType.BraceClose, null);
							case '[':
								return eco.Token._New1(new eco.Token(), eco.TokenType.SquareOpen, null);
							case ']':
								return eco.Token._New1(new eco.Token(), eco.TokenType.SquareClose, null);
							case '(':
								return eco.Token._New1(new eco.Token(), eco.TokenType.ParOpen, null);
							case ')':
								return eco.Token._New1(new eco.Token(), eco.TokenType.ParClose, null);
							case ',':
								return eco.Token._New1(new eco.Token(), eco.TokenType.Comma, null);
							case ':':
								return eco.Token._New1(new eco.Token(), eco.TokenType.Colon, null);
							case ';':
								return eco.Token._New1(new eco.Token(), eco.TokenType.Semicolon, null);
							case '@':
								return eco.Token._New1(new eco.Token(), eco.TokenType.At, null);
							case '$':
								return eco.Token._New1(new eco.Token(), eco.TokenType.Dollar, null);
							case '?':
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Cond);
							case '.':
								return eco.Token._New1(new eco.Token(), eco.TokenType.Dot, null);
							default:
								break;
						}
						state = eco.TokenType.Operator;
						self._curPos = self._curPos - 2;
						continue;
					}
					else
						self.Error("Unexpected character '" + cur + "'");

					break;
				}
				case eco.TokenType.DocComment:
				{
					if (cur == '*' && self._contents[self._curPos + 1] == '/')
					{
						self._curPos = self._curPos + 2;
						var docComment = "";
						var tmpComment = (curTok.substr(1, curTok.length - 1)).trim();
						var parts = tmpComment.split("\n");
						for (var part of parts)
							docComment = docComment + ((part).trim() + "\n");

						return eco.Token._New1(new eco.Token(), eco.TokenType.DocComment, docComment);
					}
					else if (cur == '\n')
						self._curLine++;
					break;
				}
				case eco.TokenType.AsmStr:
				{
					if (cur == '%' && self._contents[self._curPos + 1] == '>')
					{
						self._curPos = self._curPos + 2;
						var code = curTok.substr(1, curTok.length - 1);
						var asmtok = null;
						if (code[0] == '[')
						{
							var tstr = "";
							var tc = 1;
							for (; tc < code.length; tc++)
							{
								if (code[tc] == ']')
								{
									tc = tc + 2;
									break;
								}
								tstr = tstr + code[tc];
							}

							asmtok = eco.TokenAsm._New3(new eco.TokenAsm(), curTok.substr(tc, curTok.length - 1));
							asmtok._targs.push(tstr);
						}
						else
							asmtok = eco.TokenAsm._New3(new eco.TokenAsm(), curTok.substr(1, curTok.length - 1));

						return asmtok;
					}
					else if (cur == '\n')
						self._curLine++;
					break;
				}
				case eco.TokenType.Ident:
				{
					if (Lexer.IsDelim(cur) || Lexer.IsWhite(cur))
					{
						var kw = eco.Token.GetKeyword(curTok);
						if (kw != eco.TokenType.None)
							return eco.Token._New1(new eco.Token(), kw, curTok);
						else if (curTok == "true")
							return eco.Token._New1(new eco.Token(), eco.TokenType.Bool, true);
						else if (curTok == "false")
							return eco.Token._New1(new eco.Token(), eco.TokenType.Bool, false);
						else
							return eco.Token._New1(new eco.Token(), eco.TokenType.Ident, curTok);

					}
					break;
				}
				case eco.TokenType.Char:
				{
					if (cur == '\'')
					{
						self._curPos++;
						return eco.Token._New1(new eco.Token(), eco.TokenType.Char, "'" + curTok.substr(1, curTok.length - 1) + "'");
					}
					else if (cur == '\n')
						self.Error("Illegal new line in character");
					break;
				}
				case eco.TokenType.Int:
				{
					if (cur == '.')
						state = eco.TokenType.Float;
					else if (Lexer.IsDelim(cur) || Lexer.IsWhite(cur))
						return eco.Token._New1(new eco.Token(), eco.TokenType.Int, parseInt(curTok));
					else if (Lexer.IsAlpha(cur))
						self.Error("Unexpected character '" + cur + "'");
					break;
				}
				case eco.TokenType.Float:
				{
					if (cur == '.' || Lexer.IsAlpha(cur))
						self.Error("Unexpected character '" + cur + "'");
					else if (Lexer.IsDelim(cur) || Lexer.IsWhite(cur))
						return eco.Token._New1(new eco.Token(), eco.TokenType.Float, parseFloat(curTok));
					break;
				}
				case eco.TokenType.String:
				{
					if (cur == '"')
					{
						self._curPos++;
						return eco.Token._New1(new eco.Token(), eco.TokenType.String, '"' + curTok.substr(1, curTok.length - 1) + '"');
					}
					else if (cur == "\n")
						self._curLine++;
					break;
				}
				case eco.TokenType.Operator:
				{
					switch (cur)
					{
						case '+':
						{
							if (self._curPos < len)
							{
								var next = self._contents[++self._curPos];
								self._curPos++;
								if (next == '=')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.AAdd);
								else if (next == '+')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Inc);
								self._curPos--;
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Add);
						}
						case '-':
						{
							if (self._curPos < len)
							{
								var next1 = self._contents[++self._curPos];
								self._curPos++;
								if (next1 == '=')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.ASub);
								else if (next1 == '-')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Dec);
								else if (next1 == '>')
									return eco.Token._New1(new eco.Token(), eco.TokenType.Arrow, null);
								self._curPos--;
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Sub);
						}
						case '*':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.AMul);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Mult);
						}
						case '/':
						{
							if (self._curPos < len)
							{
								var next2 = self._contents[++self._curPos];
								self._curPos++;
								if (next2 == '=')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.ADiv);
								else if (next2 == '>')
									return eco.Token._New1(new eco.Token(), eco.TokenType.MSelfClose, null);
								self._curPos--;
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Div);
						}
						case '^':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.AExp);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Exp);
						}
						case '%':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.AMod);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Mod);
						}
						case '=':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpEq);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Assign);
						}
						case '<':
						{
							if (self._curPos < len)
							{
								var next3 = self._contents[++self._curPos];
								self._curPos++;
								if (next3 == '=')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpLTE);
								else if (next3 == '-')
									return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Connect);
								else if (next3 == '/')
									return eco.Token._New1(new eco.Token(), eco.TokenType.MClose, null);
								self._curPos--;
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpLT);
						}
						case '>':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpGTE);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpGT);
						}
						case '!':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '=')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.CmpNEq);
							}
							return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Not);
						}
						case '&':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '&')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.And);
							}
							return eco.Token._New1(new eco.Token(), eco.TokenType.Amp, null);
						}
						case '|':
						{
							if (self._curPos < len && self._contents[++self._curPos] == '|')
							{
								self._curPos++;
								return eco.TokenOp._New3(new eco.TokenOp(), eco.OpType.Or);
							}
							self.Error("Unknown operator '|'");
						}
						default:
							break;
					}
					break;
				}
			}
			if (state != eco.TokenType.None)
			{
				if (state == eco.TokenType.Char || state == eco.TokenType.String)
				{
					if (cur == '\\')
						curTok = curTok + self._getEscapeChar(self._contents[++self._curPos]);
					else
						curTok = curTok + cur;

				}
				else
					curTok = curTok + cur;

			}
			else
				self._oldPos = self._curPos;

		}

	};

	// string _getEscapeChar(char)
	Lexer.prototype._getEscapeChar = function(esc) {
		var self = this;
		switch (esc)
		{
			case 'n':
				return "\\n";
			case 't':
				return "\\t";
			case '\\':
				return "\\\\";
			case '\'':
				return "\\\'";
			case '"':
				return "\\\"";
			default:
				break;
		}
		return "" + esc;
	};

	return Lexer;
}());

/**

 */
eco.ParseNode = (function() {
	function ParseNode() {
	}

	// Constructor _New()
	ParseNode._New = function(self) {
		self._astType = null;
		self._startLine = 0;
		self._endLine = 0;
		self._startColumn = 0;
		self._endColumn = 0;
		self._startPosition = 0;
		self._endPosition = 0;
		return self;
	};

	// ASTType getType()
	ParseNode.prototype.getType = function() {
		var self = this;
		return self._astType;
	};

	// ASTType setType(ASTType)
	ParseNode.prototype.setType = function(value) {
		var self = this;
		self._astType = value;
	};

	// int getStartLine()
	ParseNode.prototype.getStartLine = function() {
		var self = this;
		return self._startLine;
	};

	// int setStartLine(int)
	ParseNode.prototype.setStartLine = function(value) {
		var self = this;
		self._startLine = value;
	};

	// int getEndLine()
	ParseNode.prototype.getEndLine = function() {
		var self = this;
		return self._endLine;
	};

	// int setEndLine(int)
	ParseNode.prototype.setEndLine = function(value) {
		var self = this;
		self._endLine = value;
	};

	// int getStartColumn()
	ParseNode.prototype.getStartColumn = function() {
		var self = this;
		return self._startColumn;
	};

	// int setStartColumn(int)
	ParseNode.prototype.setStartColumn = function(value) {
		var self = this;
		self._startColumn = value;
	};

	// int getEndColumn()
	ParseNode.prototype.getEndColumn = function() {
		var self = this;
		return self._endColumn;
	};

	// int setEndColumn(int)
	ParseNode.prototype.setEndColumn = function(value) {
		var self = this;
		self._endColumn = value;
	};

	// int getStartPosition()
	ParseNode.prototype.getStartPosition = function() {
		var self = this;
		return self._startPosition;
	};

	// int setStartPosition(int)
	ParseNode.prototype.setStartPosition = function(value) {
		var self = this;
		self._startPosition = value;
	};

	// int getEndPosition()
	ParseNode.prototype.getEndPosition = function() {
		var self = this;
		return self._endPosition;
	};

	// int setEndPosition(int)
	ParseNode.prototype.setEndPosition = function(value) {
		var self = this;
		self._endPosition = value;
	};

	/**

	 */
	ParseNode.prototype.SetFromState = function(state) {
		var self = this;
		self._startLine = state.Line;
		self._startColumn = state.Column;
		self._startPosition = state.Position;
	};

	return ParseNode;
}());

/**

 */
eco.ScopeItem = (function() {
	function ScopeItem() {
	}

	// Constructor _New()
	ScopeItem._New = function(self) {
		self.Name = "";
		self.ItemType = null;
		self.Overload = 0;
		self.Native = false;
		self.Visible = false;
		self.Index = 0;
		return self;
	};

	// Constructor _New(Interface,string,bool,bool)
	ScopeItem._New1 = function(self, type, name, isNative, visible) {
		self.Name = "";
		self.ItemType = null;
		self.Overload = 0;
		self.Native = false;
		self.Visible = false;
		self.Index = 0;
		self.ItemType = type;
		self.Name = name;
		self.Native = isNative;
		self.Visible = visible;
		return self;
	};

	// string CompiledName()
	ScopeItem.prototype.CompiledName = function() {
		var self = this;
		if (self.Overload == 0)
			return self.Name;
		if (eco.Lexer.IsDigit(self.Name[self.Name.length - 1]))
			return self.Name + "_" + self.Overload;
		return self.Name + self.Overload;
	};

	return ScopeItem;
}());

/**

 */
eco.Scope = (function() {
	function Scope() {
	}

	// Constructor _New()
	Scope._New = function(self) {
		self._method = null;
		self._parent = null;
		self._items = null;
		self._size = 0;
		self._root = null;
		return self;
	};

	// Constructor _New(Method,Scope)
	Scope._New1 = function(self, method, parent) {
		self._method = null;
		self._parent = null;
		self._items = null;
		self._size = 0;
		self._root = null;
		self._method = method;
		self._parent = parent;
		self._items = [];
		if (self._parent)
		{
			self._root = self._parent._root;
			self._size = self._parent._size;
		}
		else
		{
			self._root = self;
			var selfItem = self.AddItem(method._owner, "self", false);
		}

		if (method && (!parent || parent._method != method))
		{
			for (var param of method._parameters)
				self.AddItem(param.Type, param.Name, false);

		}
		return self;
	};

	// Method getOwnerMethod()
	Scope.prototype.getOwnerMethod = function() {
		var self = this;
		return self._method;
	};

	// Scope getParent()
	Scope.prototype.getParent = function() {
		var self = this;
		return self._parent;
	};

	// ScopeItem[] getItems()
	Scope.prototype.getItems = function() {
		var self = this;
		return self._items;
	};

	// int getSize()
	Scope.prototype.getSize = function() {
		var self = this;
		return self._size;
	};

	// int GetOverload(ScopeItem)
	Scope.prototype.GetOverload = function(item) {
		var self = this;
		var overload = 0;
		if (self._parent)
			overload = self._parent.GetOverload(item);
		for (var i of self._items)
			if (i.CompiledName() == item.CompiledName())
				overload++;

		return overload;
	};

	// ScopeItem AddItem(Interface,string,bool)
	Scope.prototype.AddItem = function(type, name, isNative) {
		var self = this;
		var valid = true;
		for (var item of self._items)
		{
			if (item.Name == name && item.Visible)
			{
				valid = false;
				break;
			}
		}

		self.IncSize();
		var item1 = eco.ScopeItem._New1(new eco.ScopeItem(), type, name, isNative, true);
		item1.Overload = self.GetOverload(item1);
		item1.Index = self._size;
		self._items.push(item1);
		if (self._root != self._parent)
			self._root._items.push(eco.ScopeItem._New1(new eco.ScopeItem(), type, name, isNative, false));
		return valid ? item1 : null;
	};

	// void GetAllItems(ScopeItem[])
	Scope.prototype.GetAllItems = function(items) {
		var self = this;
		if (self._parent)
			self._parent.GetAllItems(items);
		for (var item of self._items)
			if (item.Visible)
				items.push(item);

	};

	// ScopeItem[] GetItemsStartingWith(string)
	Scope.prototype.GetItemsStartingWith = function(token) {
		var self = this;
		var len = token.length;
		var items = [eco.ScopeItem._New1(new eco.ScopeItem(), self._method._owner, "this", false, true)];
		var allItems = [];
		self.GetAllItems(allItems);
		for (var item of allItems)
		{
			if (item.Name.substr(0, len) == token)
				items.push(item);
		}

		return items;
	};

	// ScopeItem GetItem(string)
	Scope.prototype.GetItem = function(name) {
		var self = this;
		if (name == "this")
			return self.GetItem("self");
		for (var item of self._items)
		{
			if (item.Name == name && item.Visible)
				return item;
		}

		if (self._parent)
			return self._parent.GetItem(name);
		return null;
	};

	// void IncSize()
	Scope.prototype.IncSize = function() {
		var self = this;
		self._size++;
		if (self._parent)
			self._parent.IncSize();
	};

	// void DecSize()
	Scope.prototype.DecSize = function() {
		var self = this;
		self._size--;
		if (self._parent)
			self._parent.DecSize();
	};

	return Scope;
}());

/**

 */
eco.ParamDoc = (function() {
	function ParamDoc() {
	}

	// Constructor _New()
	ParamDoc._New = function(self) {
		self._name = "";
		self._desc = "";
		self._subParams = null;
		self._subParams = [];
		return self;
	};

	// string getName()
	ParamDoc.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// string setName(string)
	ParamDoc.prototype.setName = function(value) {
		var self = this;
		self._name = value;
	};

	// string getDescription()
	ParamDoc.prototype.getDescription = function() {
		var self = this;
		return self._desc;
	};

	// string setDescription(string)
	ParamDoc.prototype.setDescription = function(value) {
		var self = this;
		self._desc = value;
	};

	// ParamDoc[] getSubParams()
	ParamDoc.prototype.getSubParams = function() {
		var self = this;
		return self._subParams;
	};

	// ParamDoc[] setSubParams(ParamDoc[])
	ParamDoc.prototype.setSubParams = function(value) {
		var self = this;
		self._subParams = value;
	};

	// void AddSubParam(ParamDoc)
	ParamDoc.prototype.AddSubParam = function(param) {
		var self = this;
		self._subParams.push(param);
	};

	// ParamDoc GetSubParam(string)
	ParamDoc.prototype.GetSubParam = function(name) {
		var self = this;
		for (var param of self._subParams)
			if (param._name == name)
				return param;

		return null;
	};

	// string GetFunctionInsertSnippet(FunctionType,object)
	ParamDoc.prototype.GetFunctionInsertSnippet = function(type, counter) {
		var self = this;
		var snippet = "function(";
		counter.count = counter.count + 1;
		var startCount = counter.count;
		for (var p = 0; p < type._paramTypes.length; p++)
		{
			var param = type._paramTypes[p];
			var subParam = self._subParams[p];
			if (counter.count > startCount)
				snippet = snippet + ", ";
			snippet = snippet + param.Signature() + ' ${' + counter.count + ":" + subParam._name + "}";
			counter.count = counter.count + 1;
		}

		snippet = snippet + ")";
		if (type._return && type._return != eco.Interface.getVoidType() && type._return != eco.Interface.getObjectType())
			snippet = snippet + ":" + type._return.Signature();
		return snippet + " {$" + counter.count + "}";
	};

	// string ToString()
	ParamDoc.prototype.ToString = function() {
		var self = this;
		return self._name + ": " + self._desc;
	};

	// static ParamDoc Create(string,string,ParamDoc[])
	ParamDoc.Create = function(name, desc, subParams) {
		var doc = eco.ParamDoc._New(new eco.ParamDoc());
		doc.setName(name);
		doc.setDescription(desc);
		doc.setSubParams(subParams);
		return doc;
	};

	return ParamDoc;
}());

/**

 */
eco.SymbolDoc = (function() {
	function SymbolDoc() {
	}

	// Constructor _New()
	SymbolDoc._New = function(self) {
		self._doc = "";
		self._desc = "";
		self._returns = "";
		self._params = null;
		self._params = [];
		return self;
	};

	// Constructor _New(string)
	SymbolDoc._New1 = function(self, doc) {
		self._doc = "";
		self._desc = "";
		self._returns = "";
		self._params = null;
		self._doc = doc;
		self._params = [];
		self.ParseDoc();
		return self;
	};

	// string getRawDoc()
	SymbolDoc.prototype.getRawDoc = function() {
		var self = this;
		return self._doc;
	};

	// string getDescription()
	SymbolDoc.prototype.getDescription = function() {
		var self = this;
		return self._desc;
	};

	// string setDescription(string)
	SymbolDoc.prototype.setDescription = function(value) {
		var self = this;
		self._desc = value;
	};

	// string getReturns()
	SymbolDoc.prototype.getReturns = function() {
		var self = this;
		return self._returns;
	};

	// string setReturns(string)
	SymbolDoc.prototype.setReturns = function(value) {
		var self = this;
		self._returns = value;
	};

	// ParamDoc[] getParams()
	SymbolDoc.prototype.getParams = function() {
		var self = this;
		return self._params;
	};

	// ParamDoc[] setParams(ParamDoc[])
	SymbolDoc.prototype.setParams = function(value) {
		var self = this;
		self._params = value;
	};

	// ParamDoc GetParam(string)
	SymbolDoc.prototype.GetParam = function(name) {
		var self = this;
		for (var param of self._params)
			if (param._name == name)
				return param;

		return null;
	};

	// string ToString(bool,string)
	SymbolDoc.prototype.ToString = function(forOutput, indent) {
		var self = this;
		if (forOutput)
		{
			var output = indent + "/**\n";
			var splitDesc = self._desc.split("\n");
			for (var part of splitDesc)
			{
				if ((part).trim() != "")
					output = output + indent + " * " + part + "\n";
			}

			for (var param of self._params)
				output = output + ("\n" + indent + " * " + param.ToString());

			if (self._returns != "")
				output = output + ("\n" + indent + " * returns: " + self._returns);
			output = output + "\n" + indent + " */\n";
			return output;
		}
		else
		{
			var output1 = self._desc;
			for (var param1 of self._params)
				output1 = output1 + ("\n" + param1.ToString());

			if (self._returns != "")
				output1 = output1 + ("\nreturns: " + self._returns);
			return output1;
		}

	};

	// string GetMethodInsertSnippet(Method)
	SymbolDoc.prototype.GetMethodInsertSnippet = function(method) {
		var self = this;
		var snippet = method._name + "(";
		var counter = {"count": 1};
		for (var param of method._parameters)
		{
			if (counter["count"] > 1)
				snippet = snippet + ", ";
			if (param.Type.IsFunction())
			{
				var found = self.GetParam(param.Name);
				if (found)
					snippet = snippet + found.GetFunctionInsertSnippet(param.Type, counter);
				else
					snippet = snippet + (param.Type).GetInsertSnippet(counter);

			}
			else
				snippet = snippet + '${' + ("" + counter["count"]) + ':' + param.Name + '}';

			counter["count"] = counter["count"] + 1;
		}

		return snippet + ")";
	};

	// static SymbolDoc Create(string,ParamDoc[])
	SymbolDoc.Create = function(desc, params) {
		if (!params)
			params = [];
		var doc = eco.SymbolDoc._New(new eco.SymbolDoc());
		doc.setDescription(desc);
		doc.setParams(params);
		return doc;
	};

	// void ParseDoc()
	SymbolDoc.prototype.ParseDoc = function() {
		var self = this;
		self._doc = (self._doc).trim();
		var lines = self._doc.split("\n");
		for (var line of lines)
		{
			line = self.CleanLine(line);
			if (line[0] == "@")
				self.ParseCommand(line);
			else
				self._desc = self._desc + (line + "\n");

		}

	};

	// void ParseCommand(string)
	SymbolDoc.prototype.ParseCommand = function(line) {
		var self = this;
		var parts = line.split(" ");
		var command = parts[0];
		var rest = line.substr(command.length + 1, line.length - command.length - 1);
		var lexer = eco.Lexer._New(new eco.Lexer());
		lexer.SetContent(rest);
		if (command == "@param")
			self._params.push(self.ParseParam(lexer));
		else if (command = "@returns")
			self._returns = rest;
	};

	// ParamDoc ParseParam(Lexer)
	SymbolDoc.prototype.ParseParam = function(lexer) {
		var self = this;
		var doc = eco.ParamDoc._New(new eco.ParamDoc());
		doc.setName(lexer.Accept1(eco.TokenType.Ident, true)._value);
		if (lexer.Check2(eco.OpType.CmpLT))
		{
			lexer.Accept();
			doc.AddSubParam(self.ParseParam(lexer));
			while (lexer.Check1(eco.TokenType.Comma))
			{
				lexer.Accept();
				doc.AddSubParam(self.ParseParam(lexer));
			}

			lexer.Accept2(eco.OpType.CmpGT, true);
		}
		if (lexer.Check1(eco.TokenType.String))
		{
			var desc = lexer.Accept1(eco.TokenType.String, true)._value;
			desc = desc.substr(1, desc.length - 2);
			doc.setDescription(desc);
		}
		return doc;
	};

	// string CleanLine(string)
	SymbolDoc.prototype.CleanLine = function(line) {
		var self = this;
		var newLine = "";
		var foundAsterisk = false;
		var lineStarted = false;
		for (var c = 0; c < line.length; c++)
		{
			var chr = line[c];
			if (foundAsterisk && chr != " " && chr != "\t")
				lineStarted = true;
			if (lineStarted)
				newLine = newLine + chr;
			if (chr == "*")
				foundAsterisk = true;
		}

		return newLine;
	};

	return SymbolDoc;
}());

/**

 */
eco.EcoStdLib = (function() {
	function EcoStdLib() {
	}

	// Constructor _New()
	EcoStdLib._New = function(self) {
		return self;
	};

	// static void CreateObjectMethods(Interface)
	EcoStdLib.CreateObjectMethods = function(intr) {
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsArray", [], {"js": "(Object.prototype.toString.call($t) === '[object Array]')", "php": "is_array($t)"}, eco.SymbolDoc.Create("Checks if the object is an array", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsMap", [], {"js": "(!(Object.prototype.toString.call($t) === '[object String]') && (Object.keys($t).length > 0))"}, eco.SymbolDoc.Create("Checks if the object is a map", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsFunction", [], {"js": "($t && {}.toString.call($t) === '[object Function]')"}, eco.SymbolDoc.Create("Checks if the object is a function", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsString", [], {"js": "(Object.prototype.toString.call($t) === '[object String]')", "php": "is_string($t)"}, eco.SymbolDoc.Create("Checks if the object is a string", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsNumeric", [], {"js": "(!isNaN(parseFloat($t)) && isFinite($t))"}, eco.SymbolDoc.Create("Checks if the object is a number", [])));
	};

	// static void CreateStringMethods(Interface)
	EcoStdLib.CreateStringMethods = function(intr) {
		intr.AddMember(eco.Method.Create(eco.Interface.getStringType(), "Format", [{"type": eco.Interface.getStringType().getArrayOf(), "name": "args"}], {"block": "{ string out = \"\"; bool inbrace = false; string found = \"\"; for (int c = 0; c < this.Length(); c++) { if (inbrace) { if (this[c] == '}') { inbrace = false; out += (string)(args[found.ToInt()]); found = \"\"; } else found += this[c]; } else { if (c < this.Length() - 1 && this[c] == '%' && this[c + 1] == '{') { c++; inbrace = true; } else out += this[c]; } } return out; }"}, eco.SymbolDoc.Create("Create a parameterised string by inserting arguments into a template", [eco.ParamDoc.Create("args", "The arguments to insert into the template", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getIntType(), "Length", [], {"js": "$t.length", "php": "strlen($t)"}, eco.SymbolDoc.Create("Returns the length of the string", [])));
		intr.AddMember(eco.Method.Create(intr, "SubString", [{"intr": eco.Interface.getIntType(), "name": "start"}, {"intr": eco.Interface.getIntType(), "name": "length"}], {"php": "substr($t, $1, $2)", "js": "$t.substr($1, $2)"}, eco.SymbolDoc.Create("Get an inner piece of the script", [eco.ParamDoc.Create("start", "The beginning of the sub-string", null), eco.ParamDoc.Create("length", "How far from the start to grab", null)])));
		intr.AddMember(eco.Method.Create(intr.getArrayOf(), "Split", [{"type": intr, "name": "delimiter"}], {"php": "explode($1, $t)", "js": "$t.split($1)"}, null));
		intr.AddMember(eco.Method.Create(eco.Interface.getIntType(), "ToInt", [], {"js": "parseInt($t)", "php": "(int)($t)"}, null));
		intr.AddMember(eco.Method.Create(eco.Interface.getFloatType(), "ToFloat", [], {"js": "parseFloat($t)", "php": "(float)($t)"}, null));
	};

	// static void CreateArrayMethods(ArrayType)
	EcoStdLib.CreateArrayMethods = function(intr) {
		intr.AddMember(eco.Method.Create(eco.Interface.getIntType(), "Length", [], {"js": "$t.length", "php": "sizeof($t)"}, eco.SymbolDoc.Create("Get length of array", null)));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "IsEmpty", [], {"js": "($t.length == 0)", "php": "(sizeof($t) == 0)"}, eco.SymbolDoc.Create("Check if array is empty", null)));
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Add", [{"type": intr._elem, "name": "item"}], {"js": "$t.push($1)", "php": "array_push($t, $1)"}, eco.SymbolDoc.Create("Add an item to the end of the array", [eco.ParamDoc.Create("item", "The item to add", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Enque", [{"type": intr._elem, "name": "item"}], {"js": "$t.unshift($1)", "php": "array_unshift($t, $1)"}, eco.SymbolDoc.Create("Add an item to the beginning of array", [eco.ParamDoc.Create("item", "The item to add to the start of the array", null)])));
		intr.AddMember(eco.Method.Create(intr, "Concat", [{"type": intr, "name": "items"}], {"js": "$t.concat($1)", "php": "__concat($t, $1)"}, eco.SymbolDoc.Create("Returns a new array with items appended to the end of current array", [eco.ParamDoc.Create("name", "List of items to concatenate to the end", null)])));
		intr.AddMember(eco.Method.Create(intr._elem, "Pop", [], {"js": "$t.pop()", "php": "array_pop($t)"}, eco.SymbolDoc.Create("Remove an item from the end of the array and return it", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "Contains", [{"type": intr._elem, "name": "item"}], {"js": "$t.includes($1)", "php": "in_array($1, $t)"}, eco.SymbolDoc.Create("Returns true if the array contains given element, false otherwise", [eco.ParamDoc.Create("item", "The item to check", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Remove", [{"type": eco.Interface.getIntType(), "name": "index"}], {"js": "$t.splice($1, 1)", "php": "unset($t[$1])"}, eco.SymbolDoc.Create("Removes an element from the array at the given index. This modifies the original array", [eco.ParamDoc.Create("index", "The index of the array to remove", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getIntType(), "IndexOf", [{"type": intr._elem, "name": "value"}], {"js": "$t.indexOf($1)", "php": "array_search($1, $t)"}, eco.SymbolDoc.Create("Get the index of the first instance of a value in the array. Returns -1 or false (JS/PHP) if not found", [eco.ParamDoc.Create("value", "The value to search for in the array", null)])));
		intr.AddMember(eco.Method.Create(intr, "RemoveItem", [{"type": intr._elem, "name": "item"}], {"block": "{ var narray = []; foreach (var i in this) { if (i != item) narray.Add(i); } return narray; }"}, eco.SymbolDoc.Create("Returns a new array without any occurances of supplied item", [eco.ParamDoc.Create("item", "The item to exclude from returned array", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getObjectType().getArrayOf(), "Map", [{"type": eco.FunctionType.Create([intr._elem], eco.Interface.getObjectType()), "name": "iterator"}], {"js": "$t.map($1)", "php": "array_map($1, $t)"}, eco.SymbolDoc.Create("Iterate over array", [eco.ParamDoc.Create("iterator", "The function to execute for each item", [eco.ParamDoc.Create("value", "The current value in the array", null)])])));
		intr.AddMember(eco.Method.Create(eco.Interface.getObjectType().getArrayOf(), "Map", [{"type": eco.FunctionType.Create([intr._elem, eco.Interface.getIntType()], eco.Interface.getObjectType()), "name": "iterator"}], {"js": "$t.map($1)", "php": "array_map($1, $t)"}, eco.SymbolDoc.Create("Iterate over array", [eco.ParamDoc.Create("iterator", "The function to execute for each item", [eco.ParamDoc.Create("value", "The current value in the array", null), eco.ParamDoc.Create("index", "The current index in the array", null)])])));
		intr.AddMember(eco.Method.Create(intr, "Where", [{"type": eco.FunctionType.Create([intr._elem], eco.Interface.getBoolType()), "name": "iterator"}], {"js": "$t.filter($1)"}, eco.SymbolDoc.Create("Build an array from items that return true from the iterator", [eco.ParamDoc.Create("iterator", "The function to execute for each item. Return true to add item to resulting array", [eco.ParamDoc.Create("value", "The current value in the array", null)])])));
		intr.AddMember(eco.Method.Create(eco.Interface.getStringType(), "Join", [{"type": eco.Interface.getStringType(), "name": "glue"}], {"php": "implode($1, $t)", "js": "$t.join($1)"}, eco.SymbolDoc.Create("Join array items into a string", [eco.ParamDoc.Create("glue", "The token put between each item in the array", null)])));
	};

	// static void CreateMapMethods(MapType)
	EcoStdLib.CreateMapMethods = function(intr) {
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Map", [{"type": eco.FunctionType.Create([eco.Interface.getStringType(), intr._elem], null), "name": "iterator"}], {"block": "{ return iterator; }"}, eco.SymbolDoc.Create("Iterate over map", [eco.ParamDoc.Create("iterator", "The function to execute for each item", [eco.ParamDoc.Create("key", "The current key in the map", null), eco.ParamDoc.Create("value", "The current value in the map", null)])])));
		intr.AddMember(eco.Method.Create(eco.Interface.getStringType().getArrayOf(), "Keys", [], {"js": "Object.keys($t)", "php": "array_keys($t)"}, eco.SymbolDoc.Create("Get keys of maps", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getBoolType(), "HasKey", [{"type": eco.Interface.getStringType(), "name": "key"}], {"js": "(($t)[$1] !== undefined)", "php": "array_key_exists($1, $t)"}, eco.SymbolDoc.Create("Check if a key exists in the map", [eco.ParamDoc.Create("key", "The key to look for", null)])));
		intr.AddMember(eco.Method.Create(intr, "Omit", [{"type": eco.Interface.getStringType().getArrayOf(), "name": "keys"}], {"block": "{ var res = {}; foreach (var existing in this.Keys()) { if (!keys.Contains(existing)) res[existing] = this[existing]; } return res; }"}, eco.SymbolDoc.Create("Returns a new map with the selected keys removed", [eco.ParamDoc.Create("keys", "The keys to remove from the input map", null)])));
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Delete", [{"type": eco.Interface.getStringType(), "name": "key"}], {"js": "delete $t[$1]", "php": "unset($t[$1])"}, eco.SymbolDoc.Create("Deletes a key from a map", [eco.ParamDoc.Create("key", "The key to remove from the map", null)])));
		intr.AddMember(eco.Method.Create(intr, "Merge", [{"type": intr, "name": "obj"}], {"block": "{ var res = {}; foreach (var i in this.Keys()) res[i] = this[i]; foreach (var i in obj.Keys()) if (!res.HasKey(i)) res[i] = obj[i]; return res; }"}, eco.SymbolDoc.Create("Returns a new object by merging this object with another", [eco.ParamDoc.Create("obj", "The object to merge this with", null)])));
	};

	// static void CreateEventMethods(EventType)
	EcoStdLib.CreateEventMethods = function(intr) {
		var listener = eco.FunctionType._New6(new eco.FunctionType());
		listener.setReturnType(eco.Interface.getVoidType());
		var callParams = [];
		var count = 0;
		var block = "{ foreach (var listener in this) listener(";
		for (var paramType of intr._paramTypes)
		{
			listener.AddParamType(paramType);
			callParams.push({"type": paramType, "name": "value" + ((count > 0 ? ("" + (count + 1)) : ""))});
			if (count > 0)
				block = block + ", ";
			block = block + "value" + ((count > 0) ? ("" + (count + 1)) : "");
			count++;
		}

		block = block + "); }";
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Bind", [{"type": listener, "name": "listener"}], {"js": "$t.push($1)", "php": "array_push($t, $1)"}, eco.SymbolDoc.Create("Register a listener for the event", [])));
		intr.AddMember(eco.Method.Create(eco.Interface.getVoidType(), "Call", (callParams), {"js": "$t.forEach(function(receiver) { receiver(" + intr._paramTypes.map(function (intr2, index) {
			return "$" + (index + 1);
		}).join(", ") + "); })", "php": ""}, eco.SymbolDoc.Create("Call the event", [])));
	};

	// static void CreatePackageInitialiserMethods(Interface)
	EcoStdLib.CreatePackageInitialiserMethods = function(intr) {
		intr.AddMember(eco.Method.CreateStatic(eco.Interface.getVoidType(), "Uninstall", [], {}, eco.SymbolDoc.Create("Called when a package is being uninstalled", [])));
	};

	// static void CreateEntryPointMethods(Interface)
	EcoStdLib.CreateEntryPointMethods = function(intr) {
		intr.AddMember(eco.Method.CreateStatic(eco.Interface.getVoidType(), "Start", [], {}, eco.SymbolDoc.Create("This method is called when the site starts", [])));
	};

	return EcoStdLib;
}());

/**

 */
eco.SemanticAnalyser = (function() {
	function SemanticAnalyser() {
	}

	// Constructor _New()
	SemanticAnalyser._New = function(self) {
		self._errors = [];
		self._fileName = "";
		self._fileId = "";
		self._serverSymbolTable = null;
		self._clientSymbolTable = null;
		self._sharedSymbolTable = null;
		self._currentSymbolTable = null;
		self._verifier = null;
		self._namespaces = null;
		self._classes = null;
		self._membersToBuild = null;
		self._interfaceMembersToBuild = null;
		self._methods = null;
		self._properties = null;
		return self;
	};

	// Constructor _New(SymbolTable,SymbolTable,SymbolTable)
	SemanticAnalyser._New1 = function(self, serverSymbolTable, clientSymbolTable, sharedSymbolTable) {
		self._errors = [];
		self._fileName = "";
		self._fileId = "";
		self._serverSymbolTable = null;
		self._clientSymbolTable = null;
		self._sharedSymbolTable = null;
		self._currentSymbolTable = null;
		self._verifier = null;
		self._namespaces = null;
		self._classes = null;
		self._membersToBuild = null;
		self._interfaceMembersToBuild = null;
		self._methods = null;
		self._properties = null;
		self._serverSymbolTable = serverSymbolTable;
		self._clientSymbolTable = clientSymbolTable;
		self._sharedSymbolTable = sharedSymbolTable;
		self._namespaces = [];
		self._verifier = eco.Verifier._New1(new eco.Verifier(), self);
		var dummy = eco.Interface.BasicTypes();
		return self;
	};

	// ParserError[] getErrors()
	SemanticAnalyser.prototype.getErrors = function() {
		var self = this;
		return self._errors;
	};

	// string getFileName()
	SemanticAnalyser.prototype.getFileName = function() {
		var self = this;
		return self._fileName;
	};

	// string setFileName(string)
	SemanticAnalyser.prototype.setFileName = function(value) {
		var self = this;
		self._fileName = value;
	};

	// string getFileID()
	SemanticAnalyser.prototype.getFileID = function() {
		var self = this;
		return self._fileId;
	};

	// string setFileID(string)
	SemanticAnalyser.prototype.setFileID = function(value) {
		var self = this;
		self._fileId = value;
	};

	// SymbolTable getServerSymbolTable()
	SemanticAnalyser.prototype.getServerSymbolTable = function() {
		var self = this;
		return self._serverSymbolTable;
	};

	// SymbolTable getClientSymbolTable()
	SemanticAnalyser.prototype.getClientSymbolTable = function() {
		var self = this;
		return self._clientSymbolTable;
	};

	// SymbolTable getSharedSymbolTable()
	SemanticAnalyser.prototype.getSharedSymbolTable = function() {
		var self = this;
		return self._sharedSymbolTable;
	};

	// SymbolTable getCurrentSymbolTable()
	SemanticAnalyser.prototype.getCurrentSymbolTable = function() {
		var self = this;
		return self._currentSymbolTable;
	};

	// SymbolTable setCurrentSymbolTable(SymbolTable)
	SemanticAnalyser.prototype.setCurrentSymbolTable = function(value) {
		var self = this;
		self._currentSymbolTable = value;
	};

	// Verifier getVerifier()
	SemanticAnalyser.prototype.getVerifier = function() {
		var self = this;
		return self._verifier;
	};

	/**

	 */
	SemanticAnalyser.prototype.UseNamespaces = function(fileId, symbolTable, nodes) {
		var self = this;
		symbolTable.ClearUsings();
		for (var used of nodes)
		{
			var found = symbolTable.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbolTable.UseNamespace(found);
				else
					self.Error2(fileId, "Cannot use '" + found._name + "' as it is not a namespace", used);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

	};

	// void BuildSkeleton(string,SymbolTable,NamespaceNode[])
	SemanticAnalyser.prototype.BuildSkeleton = function(fileId, symbolTable, nodes) {
		var self = this;
		self._currentSymbolTable = symbolTable;
		symbolTable.RefreshSpan();
		self._namespaces = [];
		self._classes = [];
		for (var node of nodes)
		{
			switch (node._astType)
			{
				case eco.ASTType.Namespace:
				{
					self.BuildNamespaceSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Interface:
				{
					self.BuildInterfaceSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Class:
				{
					self.BuildClassSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.ServerComponent:
				{
					self.BuildServerComponentSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.ClientComponent:
				{
					self.BuildClientComponentSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Initialiser:
				{
					self.BuildInitialiserSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Service:
				{
					self.BuildServiceSkeleton(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Enum:
				{
					self.BuildEnum(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Template:
				{
					self.BuildTemplateSkeleton(fileId, symbolTable, node);
					break;
				}
			}
		}

	};

	// object BuildFull(string,SymbolTable,NamespaceNode[])
	SemanticAnalyser.prototype.BuildFull = function(fileId, symbolTable, nodes) {
		var self = this;
		self._currentSymbolTable = symbolTable;
		self._membersToBuild = [];
		self._interfaceMembersToBuild = [];
		self._methods = [];
		self._properties = [];
		self._classes = [];
		for (var node of nodes)
		{
			switch (node._astType)
			{
				case eco.ASTType.Namespace:
				{
					self.BuildNamespace(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Interface:
				{
					self.BuildInterface(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Class:
				{
					self.BuildClass(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.ServerComponent:
				{
					self.BuildServerComponent(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.ClientComponent:
				{
					self.BuildClientComponent(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Initialiser:
				{
					self.BuildInitialiser(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Service:
				{
					self.BuildService(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Template:
				{
					self.BuildTemplate(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Enum:
				{
					self.BuildEnum(fileId, symbolTable, node);
					break;
				}
				case eco.ASTType.Typedef:
				{
					var typeDefNode = node;
					var typeDef = eco.TypeDef._New5(new eco.TypeDef(), typeDefNode._name);
					typeDef.setOtherType(symbolTable.GetType(typeDefNode._otherType, null));
					self.CopyLineInfo1(typeDef, typeDefNode);
					symbolTable.SetSymbol(typeDef, false);
					break;
				}
			}
		}

		for (var method of self._interfaceMembersToBuild)
			self.BuildInterfaceMember(fileId, method.symbol, method.member);

		for (var member of self._membersToBuild)
			self.BuildMember(fileId, member.symbol, member.member);

		for (var member1 of self._membersToBuild)
			self.BuildSerialisationMethods(fileId, member1.symbol);

		for (var cls of self._classes)
			self.CheckClassSatisfiesInterfaces(fileId, cls);

		for (var eventType of eco.Namespace._eventTypes)
			symbolTable.SetSymbol(eventType, true);

		return {"namespaces": self._namespaces, "methods": self._methods, "properties": self._properties};
	};

	// void ClearErrors()
	SemanticAnalyser.prototype.ClearErrors = function() {
		var self = this;
		self._errors = [];
	};

	// void Error(string,string,Symbol)
	SemanticAnalyser.prototype.Error = function(fileId, message, sym) {
		var self = this;
		self._errors.push(eco.ParserError._New1(new eco.ParserError(), fileId, self._fileName, message, sym._startLine, sym._endLine, sym._startColumn, sym._endColumn));
	};

	// void Error(string,string,Namespace)
	SemanticAnalyser.prototype.Error1 = function(fileId, message, sym) {
		var self = this;
		self._errors.push(eco.ParserError._New1(new eco.ParserError(), fileId, self._fileName, message, sym._startLine, sym._defEndLine, sym._startColumn, sym._defEndColumn));
	};

	// void Error(string,string,ParseNode)
	SemanticAnalyser.prototype.Error2 = function(fileId, message, node) {
		var self = this;
		self._errors.push(eco.ParserError._New1(new eco.ParserError(), fileId, self._fileName, message, node._startLine, node._endLine, node._startColumn, node._endColumn));
	};

	// void BuildNamespaceSkeleton(string,Namespace,NamespaceNode)
	SemanticAnalyser.prototype.BuildNamespaceSkeleton = function(fileId, ns, nsNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(nsNode._name, true);
		var symbol = null;
		if (found && found._symbolType == eco.SymbolType.Namespace)
		{
			var foundNs = found;
			symbol = foundNs;
			self._namespaces.push(symbol);
			if (symbol._fileId != fileId)
			{
				symbol.setSpansMultipleFiles(true);
			}
		}
		else
		{
			symbol = eco.Namespace._New3(new eco.Namespace(), nsNode._name);
			self.CopyLineInfo1(symbol, nsNode);
			self._namespaces.push(symbol);
			ns.SetSymbol(symbol, false);
			symbol.setFileID(fileId);
		}

		for (var node of nsNode._children)
		{
			switch (node._astType)
			{
				case eco.ASTType.Namespace:
				{
					self.BuildNamespaceSkeleton(fileId, symbol, node);
					break;
				}
				case eco.ASTType.Interface:
				{
					self.BuildInterfaceSkeleton(fileId, symbol, node);
					break;
				}
				case eco.ASTType.Class:
				{
					self.BuildClassSkeleton(fileId, symbol, node);
					break;
				}
				case eco.ASTType.Enum:
				{
					self.BuildEnum(fileId, symbol, node);
					break;
				}
				case eco.ASTType.Template:
				{
					self.BuildTemplateSkeleton(fileId, symbol, node);
					break;
				}
			}
		}

	};

	// bool IsSameSymbol(Symbol,ParseNode)
	SemanticAnalyser.prototype.IsSameSymbol = function(sym, node) {
		var self = this;
		var lineDiff = sym._startLine - node._startLine;
		var symHeight = node._endLine - node._startLine;
		return lineDiff >= symHeight;
	};

	// void BuildInterfaceSkeleton(string,Namespace,InterfaceNode)
	SemanticAnalyser.prototype.BuildInterfaceSkeleton = function(fileId, ns, iNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(iNode._name, true);
		if (found && found._startLine == iNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Interface._New5(new eco.Interface(), iNode._name);
		self.CopyLineInfo1(symbol, iNode);
		self._namespaces.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(iNode._docs);
		symbol.IsDefined = true;
		if (found && found._startLine != iNode._startLine)
		{
			if (self.IsSameSymbol(found, iNode))
				self.Error1(fileId, "Symbol '" + iNode._name + "' already exists in scope", symbol);
		}
	};

	// void BuildClassSkeleton(string,Namespace,ClassNode)
	SemanticAnalyser.prototype.BuildClassSkeleton = function(fileId, ns, cNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(cNode._name, true);
		if (found && found._startLine == cNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Class._New7(new eco.Class(), cNode._name);
		self.CopyLineInfo1(symbol, cNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setIsNative(cNode._isNative);
		symbol.setDocs(cNode._docs);
		if (found && (found._startLine != cNode._startLine))
		{
			if (self.IsSameSymbol(found, cNode))
				self.Error1(fileId, "Symbol '" + cNode._name + "' already exists in scope", symbol);
		}
	};

	// void BuildTemplateSkeleton(string,Namespace,TemplateNode)
	SemanticAnalyser.prototype.BuildTemplateSkeleton = function(fileId, ns, tNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(tNode._name, true);
		if (found && found._startLine == tNode._startLine)
		{
			(found).ClearMembers();
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Template._New9(new eco.Template(), tNode._name);
		self.CopyLineInfo1(symbol, tNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(tNode._docs);
		if (found && found._startLine != tNode._startLine)
		{
			if (self.IsSameSymbol(found, tNode))
				self.Error1(fileId, "Symbol '" + tNode._name + "' already exists in scope", symbol);
		}
	};

	// void BuildServerComponentSkeleton(string,Namespace,ComponentServerNode)
	SemanticAnalyser.prototype.BuildServerComponentSkeleton = function(fileId, ns, cNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(cNode._name, true);
		if (found && found._startLine == cNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.ServerComponent._New9(new eco.ServerComponent(), cNode._name);
		self.CopyLineInfo1(symbol, cNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(cNode._docs);
		if (found && found._startLine != cNode._startLine)
		{
			if (self.IsSameSymbol(found, cNode))
				self.Error(fileId, "Symbol '" + cNode._name + "' already exists in scope", found);
		}
	};

	// void BuildClientComponentSkeleton(string,Namespace,ComponentClientNode)
	SemanticAnalyser.prototype.BuildClientComponentSkeleton = function(fileId, ns, cNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(cNode._name, true);
		if (found && found._startLine == cNode._startLine)
		{
			found.setPackageID(eco.Namespace._currentPckId);
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.ClientComponent._New9(new eco.ClientComponent(), cNode._name);
		self.CopyLineInfo1(symbol, cNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setPackageID(eco.Namespace._currentPckId);
		symbol.setFileID(fileId);
		symbol.setDocs(cNode._docs);
		if (found && found._startLine != cNode._startLine)
		{
			if (self.IsSameSymbol(found, cNode))
				self.Error(fileId, "Symbol '" + cNode._name + "' already exists in scope", found);
		}
	};

	// void BuildInitialiserSkeleton(string,Namespace,InitialiserNode)
	SemanticAnalyser.prototype.BuildInitialiserSkeleton = function(fileId, ns, iNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(iNode._name, true);
		if (found && found._startLine == iNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Initialiser._New9(new eco.Initialiser(), iNode._name);
		self.CopyLineInfo1(symbol, iNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(iNode._docs);
		if (found && found._startLine != iNode._startLine)
		{
			if (self.IsSameSymbol(found, iNode))
				self.Error(fileId, "Symbol '" + iNode._name + "' already exists in scope", found);
		}
	};

	// void BuildServiceSkeleton(string,Namespace,ServiceNode)
	SemanticAnalyser.prototype.BuildServiceSkeleton = function(fileId, ns, iNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(iNode._name, true);
		if (found && found._startLine == iNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Service._New9(new eco.Service(), iNode._name);
		self.CopyLineInfo1(symbol, iNode);
		self._namespaces.push(symbol);
		self._classes.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(iNode._docs);
		if (found && found._startLine != iNode._startLine)
		{
			if (self.IsSameSymbol(found, iNode))
				self.Error(fileId, "Symbol '" + iNode._name + "' already exists in scope", found);
		}
	};

	// void BuildEnum(string,Namespace,EnumNode)
	SemanticAnalyser.prototype.BuildEnum = function(fileId, ns, eNode) {
		var self = this;
		var found = ns.GetSymbolBySignature(eNode._name, true);
		if (found && found._startLine != eNode._startLine)
		{
			self._namespaces.push(found);
			return;
		}
		var symbol = eco.Enum._New7(new eco.Enum(), eNode._name);
		self.CopyLineInfo1(symbol, eNode);
		self._namespaces.push(symbol);
		ns.SetSymbol(symbol, false);
		symbol.setFileID(fileId);
		symbol.setDocs(eNode._docs);
		for (var key of Object.keys(eNode._kv))
			symbol._kv[key] = eNode._kv[key];

	};

	// void BuildNamespace(string,Namespace,NamespaceNode)
	SemanticAnalyser.prototype.BuildNamespace = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		for (var used of node._usedNamespaces)
		{
			var found = symbol.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbol.UseNamespace(found);
				else
					self.Error1(fileId, "Cannot use '" + found._name + "' as it is not a namespace", found);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

		for (var child of node._children)
		{
			switch (child._astType)
			{
				case eco.ASTType.Namespace:
				{
					self.BuildNamespace(fileId, symbol, child);
					break;
				}
				case eco.ASTType.Interface:
				{
					self.BuildInterface(fileId, symbol, child);
					break;
				}
				case eco.ASTType.Class:
				{
					self.BuildClass(fileId, symbol, child);
					break;
				}
				case eco.ASTType.Template:
				{
					self.BuildTemplate(fileId, symbol, child);
					break;
				}
				case eco.ASTType.Typedef:
				{
					var typeDefNode = node;
					var typeDef = eco.TypeDef._New5(new eco.TypeDef(), typeDefNode._name);
					typeDef.setOtherType(symbol.GetType(typeDefNode._otherType, null));
					self.CopyLineInfo1(typeDef, typeDefNode);
					symbol.SetSymbol(typeDef, false);
					break;
				}
			}
		}

	};

	// void BuildInterface(string,Namespace,InterfaceNode)
	SemanticAnalyser.prototype.BuildInterface = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		symbol.ClearMembers();
		for (var member of node._members)
			self._interfaceMembersToBuild.push({"symbol": symbol, "member": member});

	};

	// void BuildTemplate(string,Namespace,TemplateNode)
	SemanticAnalyser.prototype.BuildTemplate = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		self._membersToBuild.push({"symbol": symbol, "member": node._mainMethod});
		for (var param of node._parameters)
		{
			var defaultValue = param.defaultValue ? ((param.defaultValue)._lit._value) : null;
			symbol.AddParameter(parent.GetType(param.type, null), param.name, defaultValue);
		}

	};

	// void BuildServerComponent(string,Namespace,ComponentServerNode)
	SemanticAnalyser.prototype.BuildServerComponent = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		for (var used of node._compUsings)
		{
			var found = parent.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbol.UseNamespace(found);
				else
					self.Error1(fileId, "Cannot use '" + found._name + "' as it is not a namespace", found);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

		if (node._baseClass)
		{
			var foundBase = symbol.GetInterfaceFromTypeNode(node._baseClass);
			if (foundBase)
			{
				if (foundBase._symbolType == eco.SymbolType.Class)
					symbol.setBaseClass(foundBase);
				else
					self.Error1(fileId, "Class '" + symbol._name + "' cannot extend '" + foundBase._name + "' as it is not a class", symbol);

			}
			else
				self.Error2(fileId, "Cant find base class '" + node._baseClass._name + "'", node._baseClass);

		}
		var hasEmptyConstructor = false;
		for (var member of node._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._params.length == 0)
					hasEmptyConstructor = true;
			}
		}

		if (!hasEmptyConstructor)
		{
			var fake = eco.ConstructorNode._New5(new eco.ConstructorNode());
			fake.setBlock(eco.BlockNode._New2(new eco.BlockNode()));
			self._membersToBuild.push({"symbol": symbol, "member": fake});
		}
		symbol.ClearMembers();
		for (var member1 of node._members)
			self._membersToBuild.push({"symbol": symbol, "member": member1});

		var interfaces = node._interaces;
		for (var i of interfaces)
		{
			var found1 = symbol.GetInterfaceFromTypeNode(i);
			if (found1)
			{
				if (found1._symbolType == eco.SymbolType.Interface)
					symbol.AddInterface(found1);
				else
					self.Error2(fileId, "Class '" + symbol._name + "' cannot implement '" + found1._name + "' as it is not an interface", i);

			}
			else
				self.Error2(fileId, "Cant find interface '" + i._name + "'", i);

		}

	};

	// void BuildClientComponent(string,Namespace,ComponentClientNode)
	SemanticAnalyser.prototype.BuildClientComponent = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		for (var used of node._compUsings)
		{
			var found = parent.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbol.UseNamespace(found);
				else
					self.Error1(fileId, "Cannot use '" + found._name + "' as it is not a namespace", found);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

		if (node._baseClass)
		{
			var foundBase = symbol.GetInterfaceFromTypeNode(node._baseClass);
			if (foundBase)
			{
				if (foundBase._symbolType == eco.SymbolType.Class)
					symbol.setBaseClass(foundBase);
				else
					self.Error1(fileId, "Class '" + symbol._name + "' cannot extend '" + foundBase._name + "' as it is not a class", symbol);

			}
			else
				self.Error2(fileId, "Cant find base class '" + node._baseClass._name + "'", node._baseClass);

		}
		var hasEmptyConstructor = false;
		for (var member of node._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._params.length == 0)
					hasEmptyConstructor = true;
			}
		}

		if (!hasEmptyConstructor)
		{
			var fake = eco.ConstructorNode._New5(new eco.ConstructorNode());
			fake.setBlock(eco.BlockNode._New2(new eco.BlockNode()));
			self._membersToBuild.push({"symbol": symbol, "member": fake});
		}
		symbol.ClearMembers();
		for (var member1 of node._members)
			self._membersToBuild.push({"symbol": symbol, "member": member1});

		var parser = eco.Parser._New1(new eco.Parser());
		var getElem = eco.Method._New5(new eco.Method(), eco.Interface.getObjectType(), "GetElem");
		symbol.AddMember(getElem);
		parser.SetContent("{ return :this.__elem__; }");
		getElem.setBlock(parser.ParseBlock());
		var getChild = eco.Method._New5(new eco.Method(), eco.Interface.getObjectType(), "GetChild");
		getChild.AddParameter(eco.Interface.getStringType(), "name", null);
		symbol.AddMember(getChild);
		parser.SetContent("{ return :this.__elem__.querySelector('[data-name=\"' + name + '\"]'); }");
		getChild.setBlock(parser.ParseBlock());
		var interfaces = node._interaces;
		for (var i of interfaces)
		{
			var found1 = symbol.GetInterfaceFromTypeNode(i);
			if (found1)
			{
				if (found1._symbolType == eco.SymbolType.Interface)
					symbol.AddInterface(found1);
				else
					self.Error2(fileId, "Class '" + symbol._name + "' cannot implement '" + found1._name + "' as it is not an interface", i);

			}
			else
				self.Error2(fileId, "Cant find interface '" + i._name + "'", i);

		}

	};

	// void BuildInitialiser(string,Namespace,InitialiserNode)
	SemanticAnalyser.prototype.BuildInitialiser = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		for (var used of node._initUsings)
		{
			var found = parent.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbol.UseNamespace(found);
				else
					self.Error1(fileId, "Cannot use '" + found._name + "' as it is not a namespace", found);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

		if (node._baseClass)
		{
			var foundBase = symbol.GetInterfaceFromTypeNode(node._baseClass);
			if (foundBase)
			{
				if (foundBase._symbolType == eco.SymbolType.Class)
					symbol.setBaseClass(foundBase);
				else
					self.Error1(fileId, "Class '" + symbol._name + "' cannot extend '" + foundBase._name + "' as it is not a class", symbol);

			}
			else
				self.Error2(fileId, "Cant find base class '" + node._baseClass._name + "'", node._baseClass);

		}
		var hasEmptyConstructor = false;
		for (var member of node._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._params.length == 0)
					hasEmptyConstructor = true;
			}
		}

		if (!hasEmptyConstructor)
		{
			var fake = eco.ConstructorNode._New5(new eco.ConstructorNode());
			fake.setBlock(eco.BlockNode._New2(new eco.BlockNode()));
			self._membersToBuild.push({"symbol": symbol, "member": fake});
		}
		symbol.ClearMembers();
		for (var member1 of node._members)
			self._membersToBuild.push({"symbol": symbol, "member": member1});

		var interfaces = node._interaces;
		for (var i of interfaces)
		{
			var found1 = symbol.GetInterfaceFromTypeNode(i);
			if (found1)
			{
				if (found1._symbolType == eco.SymbolType.Interface)
					symbol.AddInterface(found1);
				else
					self.Error2(fileId, "Class '" + symbol._name + "' cannot implement '" + found1._name + "' as it is not an interface", i);

			}
			else
				self.Error2(fileId, "Cant find interface '" + i._name + "'", i);

		}

	};

	// void BuildService(string,Namespace,ServiceNode)
	SemanticAnalyser.prototype.BuildService = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		for (var used of node._serviceUsings)
		{
			var found = parent.GetNamespaceFromTypeNode(used);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Namespace || found._symbolType == eco.SymbolType.SymbolTable)
					symbol.UseNamespace(found);
				else
					self.Error1(fileId, "Cannot use '" + found._name + "' as it is not a namespace", found);

			}
			else
				self.Error2(fileId, "Cannot find namespace '" + used._name + "'", used);

		}

		if (node._baseClass)
		{
			var foundBase = symbol.GetInterfaceFromTypeNode(node._baseClass);
			if (foundBase)
			{
				if (foundBase._symbolType == eco.SymbolType.Class)
					symbol.setBaseClass(foundBase);
				else
					self.Error1(fileId, "Class '" + symbol._name + "' cannot extend '" + foundBase._name + "' as it is not a class", symbol);

			}
			else
				self.Error2(fileId, "Cant find base class '" + node._baseClass._name + "'", node._baseClass);

		}
		var hasEmptyConstructor = false;
		for (var member of node._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._params.length == 0)
					hasEmptyConstructor = true;
			}
		}

		if (!hasEmptyConstructor)
		{
			var fake = eco.ConstructorNode._New5(new eco.ConstructorNode());
			fake.setBlock(eco.BlockNode._New2(new eco.BlockNode()));
			self._membersToBuild.push({"symbol": symbol, "member": fake});
		}
		symbol.ClearMembers();
		for (var member1 of node._members)
			self._membersToBuild.push({"symbol": symbol, "member": member1});

		var interfaces = node._interaces;
		for (var i of interfaces)
		{
			var found1 = symbol.GetInterfaceFromTypeNode(i);
			if (found1)
			{
				if (found1._symbolType == eco.SymbolType.Interface)
					symbol.AddInterface(found1);
				else
					self.Error2(fileId, "Class '" + symbol._name + "' cannot implement '" + found1._name + "' as it is not an interface", i);

			}
			else
				self.Error2(fileId, "Cant find interface '" + i._name + "'", i);

		}

	};

	// void BuildClass(string,Namespace,ClassNode)
	SemanticAnalyser.prototype.BuildClass = function(fileId, parent, node) {
		var self = this;
		var symbol = parent.GetSymbolBySignature(node._name, true);
		self._classes.push(symbol);
		if (node._baseClass)
		{
			var foundBase = symbol.GetInterfaceFromTypeNode(node._baseClass);
			if (foundBase)
			{
				if (foundBase._symbolType == eco.SymbolType.Class)
					symbol.setBaseClass(foundBase);
				else
					self.Error1(fileId, "Class '" + symbol._name + "' cannot extend '" + foundBase._name + "' as it is not a class", symbol);

			}
			else
				self.Error2(fileId, "Cant find base class '" + node._baseClass._name + "'", node._baseClass);

		}
		symbol.ClearMembers();
		var hasEmptyConstructor = false;
		for (var member of node._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._params.length == 0)
					hasEmptyConstructor = true;
			}
		}

		if (!hasEmptyConstructor)
		{
			var fake = eco.ConstructorNode._New5(new eco.ConstructorNode());
			fake.setBlock(eco.BlockNode._New2(new eco.BlockNode()));
			self._membersToBuild.push({"symbol": symbol, "member": fake});
		}
		for (var member1 of node._members)
			self._membersToBuild.push({"symbol": symbol, "member": member1});

		var interfaces = node._interaces;
		for (var i of interfaces)
		{
			var found = symbol.GetInterfaceFromTypeNode(i);
			if (found)
			{
				if (found._symbolType == eco.SymbolType.Interface)
					symbol.AddInterface(found);
				else
					self.Error2(fileId, "Class '" + symbol._name + "' cannot implement '" + found._name + "' as it is not an interface", i);

			}
			else
				self.Error2(fileId, "Cant find interface '" + i._name + "'", i);

		}

	};

	/**

	 */
	SemanticAnalyser.prototype.BuildSerialisationMethods = function(fileId, cls) {
		var self = this;
	};

	/**

	 */
	SemanticAnalyser.prototype.BuildInterfaceMember = function(fileId, intr, node) {
		var self = this;
		var type = intr.GetType(node._type, function (errorNode) {
			self.Error2(fileId, "Unknown type '" + errorNode._name + "'", errorNode);
		});
		if (node.IsMethod())
		{
			var method = eco.Method._New5(new eco.Method(), type, node._name);
			self.CopyLineInfo(method, node);
			var methodNode = node;
			for (var paramNode of methodNode._params)
			{
				var pType = intr.GetType(paramNode.type, (function(fileId) {
					return function (errorNode1) {
					self.Error2(fileId, "Unknown type '" + errorNode1._name + "'", errorNode1);
				};
				})(fileId));
				method.AddParameter(pType, paramNode.name, null);
			}

			if (!intr.AddMember(method))
				self.Error2(fileId, "'" + method.Signature() + "' already exists in interface '" + intr._name + "'", node);
		}
		else if (node.IsField())
		{
			var field = eco.Field._New5(new eco.Field(), type, node._name);
			self.CopyLineInfo(field, node);
			if (!intr.AddMember(field))
				self.Error2(fileId, "'" + field.Signature() + "' already exists in interface '" + intr._name + "'", node);
		}
	};

	/**

	 */
	SemanticAnalyser.prototype.BuildMember = function(fileId, cls, node) {
		var self = this;
		if (node.IsField())
		{
			var type = cls.GetType(node._type, function (errorNode) {
				self.Error2(fileId, "Unknown type '" + errorNode._name + "'", errorNode);
			});
			var field = eco.Field._New5(new eco.Field(), type, node._name);
			self.CopyLineInfo(field, node);
			field.setDefault((node)._defaultValue);
			if (!cls.AddMember(field))
				self.Error2(fileId, "'" + node._name + "' already exists in class '" + cls._name + "'", node);
			field.setStatic(node._static);
			field.setAccess(node._access);
			field.setDocs(node._docs);
		}
		else if (node.IsMethod())
		{
			if (node.IsConstructor())
			{
				var constr = eco.Constructor._New6(new eco.Constructor());
				self.CopyLineInfo(constr, node);
				self._methods.push(constr);
				var constrNode = node;
				for (var paramNode of constrNode._params)
				{
					var pType = cls.GetType(paramNode.type, (function(fileId) {
						return function (errorNode1) {
						self.Error2(fileId, "Unknown type '" + errorNode1._name + "'", errorNode1);
					};
					})(fileId));
					var defaultValue = paramNode.defaultValue ? ((paramNode.defaultValue)._lit._value) : null;
					if (!constr.AddParameter(pType, paramNode.name, defaultValue))
						self.Error2(fileId, "Parameter '" + paramNode.name + "' already exists", node);
				}

				constr.setAccess(constrNode._access);
				constr.setStatic(false);
				constr.setVirtual(false);
				constr.setDocs(node._docs);
				if (!cls.AddMember(constr))
					self.Error2(fileId, "Constructor '" + constr.Signature() + "' already exists in class '" + cls._name + "'", node);
				constr.setBlock(constrNode._block);
				constr.setBaseCall(constrNode._baseCall);
				constr.CopyUsingsFromSymbolTable(self._currentSymbolTable);
				self._verifier.AddItem(self._fileId, self._fileName, constr, self._currentSymbolTable);
			}
			else if (node.IsServerRender())
			{
				var method = eco.ServerRender._New6(new eco.ServerRender());
				self.CopyLineInfo(method, node);
				self._methods.push(method);
				var methodNode = node;
				for (var paramNode1 of methodNode._params)
				{
					var pType1 = cls.GetType(paramNode1.type, (function(fileId) {
						return function (errorNode2) {
						self.Error2(fileId, "Unknown type '" + errorNode2._name + "'", errorNode2);
					};
					})(fileId));
					var defaultValue1 = paramNode1.defaultValue ? ((paramNode1.defaultValue)._lit._value) : null;
					if (!method.AddParameter(pType1, paramNode1.name, defaultValue1))
						self.Error2(fileId, "Parameter '" + paramNode1.name + "' already exists", node);
				}

				method.setAccess(eco.MemberAccess.Public);
				method.setStatic(false);
				method.setVirtual(false);
				method.setDocs(node._docs);
				if (!cls.AddMember(method))
					self.Error2(fileId, "'" + method.Signature() + "' already exists in class '" + cls._name + "'", node);
				(cls).setRenderMethod(method);
				method.setBlock(methodNode._block);
				method.CopyUsingsFromSymbolTable(self._currentSymbolTable);
				self._verifier.AddItem(self._fileId, self._fileName, method, self._currentSymbolTable);
			}
			else if (node.IsTemplateMethod())
			{
				var method1 = eco.TemplateRender._New7(new eco.TemplateRender(), node._name, cls);
				self.CopyLineInfo(method1, node);
				self._methods.push(method1);
				var methodNode1 = node;
				for (var paramNode2 of methodNode1._params)
				{
					var pType2 = cls.GetType(paramNode2.type, (function(fileId) {
						return function (errorNode3) {
						self.Error2(fileId, "Unknown type '" + errorNode3._name + "'", errorNode3);
					};
					})(fileId));
					var defaultValue2 = paramNode2.defaultValue ? ((paramNode2.defaultValue)._lit._value) : null;
					if (!method1.AddParameter(pType2, paramNode2.name, defaultValue2))
						self.Error2(fileId, "Parameter '" + paramNode2.name + "' already exists", node);
				}

				method1.setAccess(eco.MemberAccess.Public);
				method1.setStatic(false);
				method1.setVirtual(false);
				method1.setDocs(node._docs);
				if (!cls.AddMember(method1))
					self.Error2(fileId, "'" + method1.Signature() + "' already exists in class '" + cls._name + "'", node);
				method1.setBlock(methodNode1._block);
				method1.CopyUsingsFromSymbolTable(self._currentSymbolTable);
				self._verifier.AddItem(self._fileId, self._fileName, method1, self._currentSymbolTable);
			}
			else
			{
				var type1 = cls.GetType(node._type, function (errorNode4) {
					self.Error2(fileId, "Unknown type '" + errorNode4._name + "'", errorNode4);
				});
				var method2 = eco.Method._New5(new eco.Method(), type1, node._name);
				self.CopyLineInfo(method2, node);
				self._methods.push(method2);
				var methodNode2 = node;
				for (var paramNode3 of methodNode2._params)
				{
					var pType3 = cls.GetType(paramNode3.type, (function(fileId) {
						return function (errorNode5) {
						self.Error2(fileId, "Unknown type '" + errorNode5._name + "'", errorNode5);
					};
					})(fileId));
					var defaultValue3 = paramNode3.defaultValue ? ((paramNode3.defaultValue)._lit._value) : null;
					if (!method2.AddParameter(pType3, paramNode3.name, defaultValue3))
						self.Error2(fileId, "Parameter '" + paramNode3.name + "' already exists", node);
				}

				method2.setStatic(methodNode2._static);
				method2.setAccess(methodNode2._access);
				method2.setVirtual(methodNode2._virtual);
				method2.setDocs(node._docs);
				method2.setAliased(methodNode2._aliased);
				if (!cls.AddMember(method2))
					self.Error2(fileId, "'" + method2.Signature() + "' already exists in class '" + cls._name + "'", node);
				method2.setBlock(methodNode2._block);
				method2.CopyUsingsFromSymbolTable(self._currentSymbolTable);
				self._verifier.AddItem(self._fileId, self._fileName, method2, self._currentSymbolTable);
			}

		}
		else if (node.IsProperty())
		{
			var type2 = cls.GetType(node._type, function (errorNode6) {
				self.Error2(fileId, "Unknown type '" + errorNode6._name + "'", errorNode6);
			});
			var property = eco.Property._New5(new eco.Property(), type2, node._name);
			self.CopyLineInfo(property, node);
			self._properties.push(property);
			if (!cls.AddMember(property))
				self.Error2(fileId, "'" + node._name + "' already exists in class '" + cls._name + "'", node);
			property.setStatic(node._static);
			property.setAccess(node._access);
			property.setDocs(node._docs);
			var propNode = node;
			if (propNode._getter)
			{
				var getterMethod = eco.Method._New5(new eco.Method(), type2, "get" + propNode._name);
				getterMethod.setIsPropertyMethod(true);
				getterMethod.setStatic(node._static);
				getterMethod.setAccess(node._access);
				self._methods.push(getterMethod);
				cls.AddMember(getterMethod);
				property.setGetter(getterMethod);
				getterMethod.setBlock(propNode._getter);
				getterMethod.setPropertyMethodIsBlock(propNode._getterIsBlock);
				self._verifier.AddItem(self._fileId, self._fileName, getterMethod, self._currentSymbolTable);
			}
			if (propNode._setter)
			{
				var setterMethod = eco.Method._New5(new eco.Method(), type2, "set" + propNode._name);
				setterMethod.AddParameter(type2, "value", null);
				setterMethod.setIsPropertyMethod(true);
				setterMethod.setStatic(node._static);
				setterMethod.setAccess(node._access);
				self._methods.push(setterMethod);
				cls.AddMember(setterMethod);
				property.setSetter(setterMethod);
				setterMethod.setBlock(propNode._setter);
				setterMethod.setPropertyMethodIsBlock(propNode._setterIsBlock);
				self._verifier.AddItem(self._fileId, self._fileName, setterMethod, self._currentSymbolTable);
			}
		}
	};

	/**

	 */
	SemanticAnalyser.prototype.CheckClassSatisfiesInterfaces = function(fileId, cls) {
		var self = this;
		var interfaces = cls._interfaces;
		for (var intr of interfaces)
		{
			var members = intr.GetAllMembers();
			var missing = [];
			for (var member of members)
			{
				var signature = member.Signature();
				var found = cls.GetMemberFromTop(signature);
				if (found)
				{
					found.setImplementing(member);
					if (found._type != member._type)
						self.Error(fileId, "Member type should be '" + member._type._name + "' to fit interface '" + intr._name + "'", found);
					if (found.IsMethod())
					{
						var otherMethods = cls.GetMembersByName(member._name);
						for (var otherMethod of otherMethods)
						{
							if (otherMethod != found && !(otherMethod).DoesOverride(found))
							{
								self.Error(fileId, "Cannot overload method '" + found.Signature() + string_Format("' as it creates a conflict in interface '%{0}'", [intr._name]), otherMethod);
							}
						}

					}
				}
				else
					missing.push(member);

			}

			if (missing.length > 0)
			{
				var missingNames = missing[0].Signature();
				for (var m = 1; m < missing.length; m++)
					missingNames = missingNames + ", " + missing[m].Signature();

				self.Error1(fileId, string_Format("Class '%{0}' does not fully implement '%{1}'. Missing: %{2}", [cls._name, intr._name, missingNames]), cls);
			}
		}

	};

	// void CopyLineInfo(Symbol,ParseNode)
	SemanticAnalyser.prototype.CopyLineInfo = function(nto, from) {
		var self = this;
		nto.setStartLine(from._startLine);
		nto.setEndLine(from._endLine);
		nto.setStartColumn(from._startColumn);
		nto.setEndColumn(from._endColumn);
	};

	// void CopyLineInfo(Namespace,NamespaceNode)
	SemanticAnalyser.prototype.CopyLineInfo1 = function(nto, from) {
		var self = this;
		nto.setStartLine(from._startLine);
		nto.setEndLine(from._endLine);
		nto.setStartColumn(from._startColumn);
		nto.setEndColumn(from._endColumn);
		nto.setDefinitionEndLine(from._defEndLine);
		nto.setDefinitionEndColumn(from._defEndColumn);
	};

	return SemanticAnalyser;
}());

/**

 */
eco.VerificationItem = (function() {
	function VerificationItem() {
	}

	// Constructor _New()
	VerificationItem._New = function(self) {
		self.FileID = "";
		self.FileName = "";
		self.Method = null;
		self.SymbolTable = null;
		self.Usings = null;
		return self;
	};

	// Constructor _New(string,string,Method,SymbolTable,Namespace[])
	VerificationItem._New1 = function(self, fileId, fileName, method, symbolTable, usings) {
		self.FileID = "";
		self.FileName = "";
		self.Method = null;
		self.SymbolTable = null;
		self.Usings = null;
		self.FileID = fileId;
		self.FileName = fileName;
		self.Method = method;
		self.Usings = usings;
		self.SymbolTable = symbolTable;
		return self;
	};

	return VerificationItem;
}());

/**

 */
eco.Verifier = (function() {
	function Verifier() {
	}

	// Constructor _New()
	Verifier._New = function(self) {
		self._verItems = null;
		self._symbolTable = null;
		self._scope = null;
		self._semanticAnalyser = null;
		self._curFileId = "";
		self._loopDepth = 0;
		self._switchDepth = 0;
		return self;
	};

	// Constructor _New(SemanticAnalyser)
	Verifier._New1 = function(self, semanticAnalyser) {
		self._verItems = null;
		self._symbolTable = null;
		self._scope = null;
		self._semanticAnalyser = null;
		self._curFileId = "";
		self._loopDepth = 0;
		self._switchDepth = 0;
		self._semanticAnalyser = semanticAnalyser;
		self._verItems = [];
		return self;
	};

	// VerificationItem[] getVerificationItems()
	Verifier.prototype.getVerificationItems = function() {
		var self = this;
		return self._verItems;
	};

	// void AddItem(string,string,Method,SymbolTable)
	Verifier.prototype.AddItem = function(fileId, fileName, method, symbolTable) {
		var self = this;
		self._verItems.push(eco.VerificationItem._New1(new eco.VerificationItem(), fileId, fileName, method, symbolTable, symbolTable._usings));
	};

	// void Reset(string)
	Verifier.prototype.Reset = function(fileId) {
		var self = this;
		self._curFileId = fileId;
		self._verItems = [];
		self._loopDepth = 0;
		self._switchDepth = 0;
	};

	// void VerifyAll()
	Verifier.prototype.VerifyAll = function() {
		var self = this;
		for (var item of self._verItems)
			self.VerifyItem(item);

	};

	// void ResetAndVerifyMethod(string,string,SymbolTable,Method)
	Verifier.prototype.ResetAndVerifyMethod = function(fileId, fileName, symbolTable, method) {
		var self = this;
		self.Reset(fileId);
		self.VerifyItem(eco.VerificationItem._New1(new eco.VerificationItem(), fileId, fileName, method, symbolTable, symbolTable._usings));
	};

	// void VerifyItem(VerificationItem)
	Verifier.prototype.VerifyItem = function(item) {
		var self = this;
		self._curFileId = item.FileID;
		self._semanticAnalyser.setFileName(item.FileName);
		var method = item.Method;
		self._symbolTable = item.SymbolTable;
		self._symbolTable.ClearUsings();
		self._semanticAnalyser.setCurrentSymbolTable(self._symbolTable);
		self._symbolTable.UseNamespaces(item.Usings);
		var cls = method._owner;
		for (var intr of cls._interfaces)
		{
			var found = intr.GetMethodBySignature(method.Signature());
			if (found)
				method.setImplementing(found);
		}

		var block = method._block;
		self._scope = eco.Scope._New1(new eco.Scope(), method, null);
		if (method.IsServerRender())
		{
			var htmlElement = method._owner.GetNamespaceBySignature("std", false).GetNamespaceBySignature("html", false).GetNamespaceBySignature("HTMLElement", false);
			self._scope.AddItem(eco.Interface.getObjectType().getMapOf(), "attr", false);
			self._scope.AddItem(htmlElement, "children", false);
		}
		else if (method.IsTemplateMethod())
		{
			var templ = method._owner;
			var params = templ._parameters;
			for (var p of params)
				self._scope.AddItem(p.Type, p.Name, false);

		}
		for (var statement of block._statements)
		{
			try
			{
				self.VerifyStatement(statement);
			}
			catch (e)
			{
				console.error(e);
			}
		}

	};

	// void VerifyStatement(StatementNode)
	Verifier.prototype.VerifyStatement = function(stmt) {
		var self = this;
		switch (stmt._stmtType)
		{
			case eco.StatementType.None:
				break;
			case eco.StatementType.Block:
				self.VerifyBlock(stmt);
				break;
			case eco.StatementType.VarDecl:
				self.VerifyVarDecl(stmt);
				break;
			case eco.StatementType.If:
				self.VerifyIf(stmt);
				break;
			case eco.StatementType.For:
				self.VerifyFor(stmt);
				break;
			case eco.StatementType.Foreach:
				self.VerifyForeach(stmt);
				break;
			case eco.StatementType.While:
				self.VerifyWhile(stmt);
				break;
			case eco.StatementType.Switch:
				self.VerifySwitch(stmt);
				break;
			case eco.StatementType.TryCatch:
				self.VerifyTryCatch(stmt);
				break;
			case eco.StatementType.Throw:
				self.VerifyThrow(stmt);
				break;
			case eco.StatementType.Target:
				self.VerifyTarget(stmt);
				break;
			case eco.StatementType.Await:
				self.VerifyAwait(stmt);
				break;
			case eco.StatementType.Return:
				self.VerifyReturn(stmt);
				break;
			case eco.StatementType.Break:
				self.VerifyBreak(stmt);
				break;
			case eco.StatementType.Continue:
				self.VerifyContinue(stmt);
				break;
			case eco.StatementType.Assembly:
				self.VerifyAssembly(stmt);
				break;
			case eco.StatementType.Expression:
				self.VerifyExpression(stmt);
				break;
		}
	};

	// void VerifyBlock(BlockNode)
	Verifier.prototype.VerifyBlock = function(node) {
		var self = this;
		self.AddScope();
		for (var statement of node._statements)
			self.VerifyStatement(statement);

		self.PopScope();
	};

	// void VerifyVarDecl(VarDeclNode)
	Verifier.prototype.VerifyVarDecl = function(node) {
		var self = this;
		if (node._varType == eco.TypeNode.getVarType())
		{
			self.VerifyExpression(node._expr);
			var type = node._expr.GetTypeOf(self._scope, null);
			if (!self._scope.AddItem(type, node._name, false))
				self.Error(string_Format("Local '%{0}' already exists in scope", [node._name]), node);
		}
		else
		{
			var varType = self._scope._method._owner.GetType(node._varType, null);
			if (!varType)
				self.Error("Unrecognised type '" + node._varType._name + "'", node._varType);
			else if (!self._scope.AddItem(varType, node._name, false))
				self.Error(string_Format("Local '%{0}' already exists in scope", [node._name]), node);
			if (node._expr)
			{
				var expr = node._expr;
				self.VerifyExpression(expr);
				var exprType = expr.GetTypeOf(self._scope, null);
				if (!exprType)
				{
					var call = expr;
					var localFunction = self._scope.GetItem(call._name);
					if (localFunction)
					{
						var funcType = localFunction.ItemType;
						var returnType = funcType._return;
						if (varType && returnType)
						{
							if (returnType.DistanceTo(varType) < 0)
								self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [returnType._name, varType._name]), node);
						}
					}
				}
				else if (expr._exprType == eco.ExpressionType.LitArray)
				{
					if (varType)
					{
						if (!varType.IsArray() && varType != eco.Interface.getObjectType())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
						else
						{
							if (varType != eco.Interface.getObjectType())
							{
								var arrType = varType;
								if (!arrType.CastsTo2(expr, self._scope))
									self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
							}
						}

					}
				}
				else if (expr._exprType == eco.ExpressionType.Map)
				{
					if (varType)
					{
						if (!varType.IsMap() && varType != eco.Interface.getObjectType() && !varType.IsInline() && !varType.IsDefined && !varType.IsClass())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
						else
						{
							if (varType != eco.Interface.getObjectType())
							{
								if (varType.IsClass() || varType.IsInline() || varType.IsDefined)
								{
									if (!varType.CastsTo(expr, self._scope))
										self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
								}
								else
								{
									var mapType = varType;
									if (!mapType.CastsTo(expr, self._scope))
										self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
								}

							}
						}

					}
				}
				else if (expr._exprType == eco.ExpressionType.Function)
				{
					if (varType)
					{
						if (!varType.IsFunction() && varType != eco.Interface.getObjectType())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
						else
						{
							var funcType1 = varType;
							var funcNode = expr;
							var rightFuncType = funcNode.GetTypeOf(self._scope, null);
							if (rightFuncType.DistanceTo(funcType1) < 0)
								self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [rightFuncType._name, funcType1._name]), node);
						}

					}
				}
				else
				{
					if (exprType && varType)
						if (exprType.DistanceTo(varType) < 0)
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [exprType._name, varType._name]), node);
				}

			}
		}

	};

	// void VerifyIf(IfNode)
	Verifier.prototype.VerifyIf = function(node) {
		var self = this;
		self.VerifyExpression(node._cond);
		var condType = node._cond.GetTypeOf(self._scope, null);
		if (!condType)
			self.Error("Illegal condition", node._cond);
		else if (condType == eco.Interface.getVoidType())
			self.Error("Condition cannot be void", node._cond);
		self.VerifyStatement(node._then);
		if (node._else)
			self.VerifyStatement(node._else);
	};

	// void VerifyFor(ForNode)
	Verifier.prototype.VerifyFor = function(node) {
		var self = this;
		self._loopDepth++;
		self.AddScope();
		self.VerifyStatement(node._init);
		self.VerifyExpression(node._condition);
		var condType = node._condition.GetTypeOf(self._scope, null);
		if (!condType)
			self.Error("Illegal condition", node._condition);
		else if (condType == eco.Interface.getVoidType())
			self.Error("Condition cannot be void", node._condition);
		self.VerifyExpression(node._update);
		self.VerifyStatement(node._stmt);
		self.PopScope();
		self._loopDepth--;
	};

	// void VerifyForeach(ForeachNode)
	Verifier.prototype.VerifyForeach = function(node) {
		var self = this;
		self._loopDepth++;
		self.AddScope();
		var collection = node._collection;
		var itrTypeNode1 = node._iterType;
		var itrName1 = node._iterName;
		var itrTypeNode2 = node._iterType2;
		var itrName2 = node._iterName2;
		self.VerifyExpression(collection);
		var itrIsVar = itrTypeNode1 == eco.TypeNode.getVarType();
		var itrType1 = null;
		if (!itrIsVar)
		{
			itrType1 = self._scope._method._owner.GetType(itrTypeNode1, null);
			if (!itrType1)
				self.Error("Invalid 'foreach' iterator type", itrTypeNode1);
		}
		var collectionType = collection.GetTypeOf(self._scope, null);
		if (!collectionType)
			self.Error("Illegal 'foreach' collection", node._collection);
		else
		{
			if (!collectionType.IsArray() && !collectionType.IsMap() && collectionType != eco.Interface.getStringType() && collectionType != eco.Interface.getObjectType())
				self.Error("'foreach' collection is not enumerable", node._collection);
			if (collectionType.IsArray())
			{
				var arrayType = collectionType;
				var elemType = arrayType._elem;
				if (itrIsVar)
					itrType1 = arrayType._elem;
				else if (elemType.DistanceTo(itrType1) < 0)
					self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [elemType._name, itrType1._name]), node);
				self._scope.AddItem(itrType1, itrName1, false);
				if (itrTypeNode2)
					self.Error("Array collection only takes one iterator", node);
			}
			else if (collectionType.IsMap())
			{
				if (!itrIsVar)
				{
					if (itrType1 != eco.Interface.getStringType())
						self.Error("Map collection requires first iterator to be string", node);
				}
				else
					itrType1 = eco.Interface.getStringType();

				self._scope.AddItem(itrIsVar ? eco.Interface.getStringType() : itrType1, itrName1, false);
				if (!itrTypeNode2)
					self.Error("Map collection takes two iterators", node);
				else
				{
					var mapType = collectionType;
					var elemType1 = mapType._elem;
					var itrIsVar2 = itrTypeNode2 == eco.TypeNode.getVarType();
					var itrType2 = null;
					if (!itrIsVar2)
					{
						itrType2 = self._scope._method._owner.GetType(itrTypeNode2, null);
						if (!itrType2)
							self.Error("Invalid 'foreach' iterator type", node);
					}
					else
						itrType2 = mapType._elem;

					if (!itrIsVar2 && elemType1.DistanceTo(itrType2) < 0)
						self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [elemType1._name, itrType2._name]), node);
					self._scope.AddItem(itrType2, itrName2, false);
				}

			}
			else if (collectionType == eco.Interface.getStringType())
			{
				if (itrIsVar)
					itrType1 = eco.Interface.getCharType();
				else if (itrType1 != eco.Interface.getCharType())
					self.Error(string_Format("Cannot cast from 'char' to '%{0}'", [itrType1._name]), node);
				self._scope.AddItem(eco.Interface.getCharType(), itrName1, false);
				if (itrTypeNode2)
					self.Error("String collection only takes one iterator", node);
			}
			else if (collectionType == eco.Interface.getObjectType())
			{
				self._scope.AddItem(eco.Interface.getObjectType(), itrName1, false);
			}
		}

		self.VerifyStatement(node._statement);
		self.PopScope();
		self._loopDepth--;
	};

	// void VerifyWhile(WhileNode)
	Verifier.prototype.VerifyWhile = function(node) {
		var self = this;
		self._loopDepth++;
		self.VerifyExpression(node._cond);
		var condType = node._cond.GetTypeOf(self._scope, null);
		if (!condType)
			self.Error("Illegal condition", node._cond);
		else if (condType == eco.Interface.getVoidType())
			self.Error("Condition cannot be void", node._cond);
		self.VerifyStatement(node._stmt);
		self._loopDepth--;
	};

	// void VerifySwitch(SwitchCaseNode)
	Verifier.prototype.VerifySwitch = function(node) {
		var self = this;
		self._switchDepth++;
		self.VerifyExpression(node._value);
		for (var cas of node._cases)
		{
			self.VerifyExpression(cas._value);
			for (var caseStmt of cas._statements)
				self.VerifyStatement(caseStmt);

		}

		if (node._defaultCase)
		{
			for (var defStmt of node._defaultCase._statements)
				self.VerifyStatement(defStmt);

		}
		self._switchDepth--;
	};

	// void VerifyTryCatch(TryCatchNode)
	Verifier.prototype.VerifyTryCatch = function(node) {
		var self = this;
		self.VerifyStatement(node._tryBlock);
		self.AddScope();
		var catchType = self._scope._method._owner.GetType(node._catchType, null);
		if (!catchType)
			self.Error(string_Format("Illegal catch type '%{0}'", [node._catchType._name]), node._catchType);
		else
			self._scope.AddItem(catchType, node._catchName, false);

		self.VerifyBlock(node._catchBlock);
		self.PopScope();
	};

	// void VerifyThrow(ThrowNode)
	Verifier.prototype.VerifyThrow = function(node) {
		var self = this;
		self.VerifyExpression(node._expr);
	};

	// void VerifyTarget(TargetNode)
	Verifier.prototype.VerifyTarget = function(node) {
		var self = this;
	};

	// void VerifyAwait(AwaitNode)
	Verifier.prototype.VerifyAwait = function(node) {
		var self = this;
		if (self._semanticAnalyser._currentSymbolTable != self._semanticAnalyser._clientSymbolTable)
			self.Error("Cannot use 'await' on server and shared files", node);
		var responderTypeNode = node._responder._parent;
		var responderName = node._responder._name;
		var callSig = "";
		var responderType = self._semanticAnalyser._serverSymbolTable.GetType(responderTypeNode, null);
		if (!responderType)
			self.Error(string_Format("Cannot find server-side class '%{0}'", [responderTypeNode.getFullName()]), responderTypeNode);
		else
		{
			var callNode = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), responderName);
			for (var arg of node._argList)
				callNode._argList.push(arg);

			var callSig1 = callNode.Signature(self._scope);
			var responderMethod = responderType.GetMethod(callNode, self._scope, function (dilemmas) {
				var ambi = "";
				var count = 0;
				for (var method of dilemmas)
				{
					if (count > 0)
						ambi = ambi + ", ";
					ambi = ambi + method.Signature();
					count++;
				}

				self.Error("Ambiguous await method call. Could be " + ambi, node._responder);
			});
			if (!responderMethod)
				self.Error(string_Format("Cannot find server-side method '%{0}' in class '%{1}'", [callSig1, responderTypeNode.getFullName()]), node._responder);
			else if (!responderMethod._static)
				self.Error(string_Format("Server-side method '%{0}()' must be static", [responderName]), node._responder);
		}

		for (var arg1 of node._argList)
			self.VerifyExpression(arg1);

		var resultType = self._scope._method._owner.GetType(node._resultType, null);
		if (!resultType)
			self.Error(string_Format("Unknown type '%{0}'", [node._resultType.getFullName()]), node._resultType);
		var resultName = node._resultVarName;
		self.AddScope();
		self._scope.AddItem(resultType, resultName, false);
		if (node._statusVarName != "")
			self._scope.AddItem(eco.Interface.getIntType(), node._statusVarName, false);
		else
			self._scope.AddItem(eco.Interface.getIntType(), "status", false);

		self.VerifyBlock(node._block);
		self.PopScope();
	};

	// void VerifyReturn(ReturnNode)
	Verifier.prototype.VerifyReturn = function(node) {
		var self = this;
		if (node._returnValue)
		{
			self.VerifyExpression(node._returnValue);
			if (self._scope._method._type == eco.Interface.getObjectType())
				return;
			if (node._returnValue._exprType == eco.ExpressionType.LitArray)
			{
				var t1 = self._scope._method._type;
				if (t1)
				{
					if (!t1.IsArray())
						self.Error("Cannot cast from '" + node._returnValue.GetTypeOf(self._scope, null)._name + string_Format("' to '%{0}'", [t1._name]), node);
					else
					{
						var arrType = t1;
						if (!arrType.CastsTo2(node._returnValue, self._scope))
							self.Error("Cannot cast from '" + node._returnValue.GetTypeOf(self._scope, null)._name + string_Format("' to '%{0}'", [t1._name]), node);
					}

				}
			}
			else if (node._returnValue._exprType == eco.ExpressionType.Map)
			{
				var t1_1 = self._scope._method._type;
				if (t1_1)
				{
					if (!t1_1.IsMap())
					{
						if (t1_1.IsClass() || t1_1.IsInline() || t1_1.IsDefined)
						{
							if (!t1_1.CastsTo(node._returnValue, self._scope))
								self.Error("Cannot cast from '" + node._returnValue.GetTypeOf(self._scope, null)._name + string_Format("' to '%{0}'", [t1_1._name]), node);
						}
						else
							self.Error("Cannot cast from '" + node._returnValue.GetTypeOf(self._scope, null)._name + string_Format("' to '%{0}'", [t1_1._name]), node);

					}
					else
					{
						var mapType = t1_1;
						if (!mapType.CastsTo(node._returnValue, self._scope))
							self.Error("Cannot cast from '" + node._returnValue.GetTypeOf(self._scope, null)._name + string_Format("' to '%{0}'", [t1_1._name]), node);
					}

				}
			}
			else
			{
				var retType = node._returnValue.GetTypeOf(self._scope, null);
				if (!retType)
				{
					if (node._returnValue._exprType == eco.ExpressionType.MethodCall)
					{
						var call = node._returnValue;
						retType = call._expr.TryGetType(self._scope);
						if (retType)
						{
							var found = retType.GetMethod(call._call, self._scope, null);
							if (found)
								retType = found._type;
						}
					}
					if (!retType)
						self.Error("Illegal return type", node);
				}
				else if (retType.DistanceTo(self._scope._method._type) < 0)
					self.Error("Method '" + self._scope._method.Signature() + string_Format("' cannot return value of type '%{0}'", [retType._name]), node);
			}

		}
		else if (self._scope._method._type && self._scope._method._type != eco.Interface.getVoidType())
			self.Error("'" + self._scope._method.Signature() + "' must return a value", node);
	};

	// void VerifyBreak(BreakNode)
	Verifier.prototype.VerifyBreak = function(node) {
		var self = this;
		if (self._loopDepth <= 0 && self._switchDepth <= 0)
			self.Error("Illegal 'break' statement outside loop or switch case", node);
	};

	// void VerifyContinue(ContinueNode)
	Verifier.prototype.VerifyContinue = function(node) {
		var self = this;
		if (self._loopDepth <= 0)
			self.Error("Illegal 'continue' statement outside loop", node);
	};

	// void VerifyAssembly(AssemblyNode)
	Verifier.prototype.VerifyAssembly = function(node) {
		var self = this;
	};

	// void VerifyExpression(ExpressionNode)
	Verifier.prototype.VerifyExpression = function(node) {
		var self = this;
		switch (node._exprType)
		{
			case eco.ExpressionType.None:
				break;
			case eco.ExpressionType.Lit:
				self.VerifyLit(node);
				break;
			case eco.ExpressionType.Load:
				self.VerifyLoad(node);
				break;
			case eco.ExpressionType.Access:
				self.VerifyAccess(node, false);
				break;
			case eco.ExpressionType.ArrayAccess:
				self.VerifyArrayAccess(node, false);
				break;
			case eco.ExpressionType.LitArray:
				self.VerifyLitArray(node);
				break;
			case eco.ExpressionType.Map:
				self.VerifyLitMap(node);
				break;
			case eco.ExpressionType.Function:
				self.VerifyFunction(node);
				break;
			case eco.ExpressionType.Op:
				self.VerifyOp(node);
				break;
			case eco.ExpressionType.PreOp:
				self.VerifyPreOp(node);
				break;
			case eco.ExpressionType.PostOp:
				self.VerifyPostOp(node);
				break;
			case eco.ExpressionType.CondOp:
				self.VerifyCondOp(node);
				break;
			case eco.ExpressionType.Par:
				self.VerifyPar(node);
				break;
			case eco.ExpressionType.New:
				self.VerifyNew(node);
				break;
			case eco.ExpressionType.Call:
				self.VerifyCall(node);
				break;
			case eco.ExpressionType.ComplexCall:
				self.VerifyComplexCall(node);
				break;
			case eco.ExpressionType.BaseCall:
				self.VerifyBaseCall(node);
				break;
			case eco.ExpressionType.MethodCall:
				self.VerifyMethodCall(node);
				break;
			case eco.ExpressionType.Typecast:
				self.VerifyTypecast(node);
				break;
			case eco.ExpressionType.Assembly:
				self.VerifyAssemblyExpr(node);
				break;
			case eco.ExpressionType.HTML:
				self.VerifyHTML(node);
				break;
			case eco.ExpressionType.HTMLText:
				self.VerifyHTMLText(node);
				break;
			case eco.ExpressionType.HTMLCode:
				self.VerifyHTMLCode(node);
				break;
		}
	};

	// void VerifyLValue(ExpressionNode)
	Verifier.prototype.VerifyLValue = function(node) {
		var self = this;
		switch (node._exprType)
		{
			case eco.ExpressionType.Load:
				self.VerifyLoad(node);
				break;
			case eco.ExpressionType.Access:
				self.VerifyAccess(node, true);
				break;
			case eco.ExpressionType.ArrayAccess:
				self.VerifyArrayAccess(node, true);
				break;
			default:
				self.Error("Illegal l-value", node);
		}
	};

	// void VerifyLit(LitExpressionNode)
	Verifier.prototype.VerifyLit = function(node) {
		var self = this;
	};

	// void VerifyLoad(LoadExpressionNode)
	Verifier.prototype.VerifyLoad = function(node) {
		var self = this;
		if (self._scope._method._static && node._varName == "this" && !node._native)
			self.Error("Cannot access 'this' from static method", node);
		var etype = node.GetTypeOf(self._scope, null);
		if (!etype || etype == eco.Interface.getNullType())
			self.Error(string_Format("Cannot find identifier '%{0}'", [node._varName]), node);
		else if (!node._native)
		{
			var item = self._scope.GetItem(node._varName);
			if (!item)
			{
				var member = self._scope._method._owner.GetMember(node._varName);
				if (self._scope._method._static && !member._static)
					self.Error(string_Format("Cannot access non-static member '%{0}' from static method '", [node._varName]) + self._scope._method.Signature() + "'", node);
				if (member._memberType == eco.MemberType.Field)
				{
					var field = member;
					if (field && !field.AccessibleFrom(self._scope._method))
						self.Error("'" + field._owner._name + "." + field._name + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
				}
			}
		}
	};

	// void VerifyAccess(AccessExpressionNode,bool)
	Verifier.prototype.VerifyAccess = function(node, lValue) {
		var self = this;
		var staticAccess = false;
		var intr = node._expr.GetTypeOf(self._scope, null);
		if (!intr || intr == eco.Interface.getNullType())
		{
			intr = node._expr.TryGetType(self._scope);
			staticAccess = true;
		}
		else
		{
			self.VerifyExpression(node._expr);
			if (intr == eco.Interface.getObjectType() || intr.IsMap())
				return;
			var exprType = node.GetTypeOf(self._scope, null);
			if (!exprType)
				self.Error(string_Format("Cannot find identifier '%{0}' in type '%{1}'", [node._field, intr._name]), node);
		}

		if (intr)
		{
			if (intr.GetSymbolType() == eco.SymbolType.Enum)
			{
				var kvpairs = (intr)._kv;
				if (!((kvpairs)[node._field] !== undefined))
					self.Error(string_Format("Cannot find identifier '%{0}' in enum '%{1}'", [node._field, intr._name]), node);
				else if (lValue)
					self.Error(string_Format("Cannot assign value to '%{0}.%{1}'", [intr._name, node._field]), node);
			}
			else
			{
				if (intr.GetSymbolType() == eco.SymbolType.Interface)
				{
					if (intr.IsInline() || intr.IsDefined)
					{
						var inlineMember = intr.GetMember(node._field);
						if (!inlineMember)
							self.Error(string_Format("Cannot find identifier '%{0}' in type '%{1}'", [node._field, intr._name]), node);
						else if (!inlineMember.IsField())
							self.Error(string_Format("Cannot access method '%{0}' as field from type '%{1}'", [node._field, intr._name]), node);
					}
					else
						self.Error(string_Format("Cannot access field '%{0}' from non-class type '%{1}'", [node._field, intr._name]), node);

				}
				var member = intr.GetMember(node._field);
				if (!member)
					self.Error(string_Format("Cannot find identifier '%{0}' in class '%{1}'", [node._field, intr._name]), node);
				else
				{
					if (!member.AccessibleFrom(self._scope._method))
						self.Error("'" + intr._name + "." + member._name + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
					if (staticAccess && !member._static)
						self.Error("Member '" + member._owner._name + "." + member._name + "' is not static", node);
					if (member._static && !staticAccess)
						self.Error("Cannot access static field '" + member._owner._name + "." + member._name + "' from an object", node);
					if (member._memberType == eco.MemberType.Property)
					{
						var prop = member;
					}
				}

			}

		}
		else
			self.Error("Invalid expression", node._expr);

	};

	// void VerifyArrayAccess(ArrayAccessExpressionNode,bool)
	Verifier.prototype.VerifyArrayAccess = function(node, lValue) {
		var self = this;
		self.VerifyExpression(node._expr);
		var exprType = node._expr.GetTypeOf(self._scope, null);
		if (!exprType || (exprType == eco.Interface.getNullType()) || (!exprType.IsArray() && (exprType != eco.Interface.getStringType()) && !exprType.IsMap() && exprType != eco.Interface.getObjectType()))
			self.Error("Cannot index non-array, map or string value", node._expr);
		self.VerifyExpression(node._index);
		var indexType = node._index.GetTypeOf(self._scope, null);
		if (!indexType)
			self.Error("Illegal index type", node._index);
		else if (indexType != eco.Interface.getIntType() && indexType != eco.Interface.getStringType() && indexType != eco.Interface.getCharType())
			self.Error(string_Format("Cannot access value using '%{0}' as an index", [indexType._name]), node._index);
	};

	// void VerifyLitArray(LitArrayExpressionNode)
	Verifier.prototype.VerifyLitArray = function(node) {
		var self = this;
		for (var item of node._items)
			self.VerifyExpression(item);

	};

	// void VerifyLitMap(LitMapExpressionNode)
	Verifier.prototype.VerifyLitMap = function(node) {
		var self = this;
		for (var key of Object.keys(node._items))
			self.VerifyExpression(node._items[key]);

	};

	// void VerifyFunction(FunctionExpressionNode)
	Verifier.prototype.VerifyFunction = function(node) {
		var self = this;
		var returnType = eco.Interface.getObjectType();
		if (node._return)
			returnType = self._scope._method._owner.GetType(node._return, null);
		var func = eco.Method._New5(new eco.Method(), returnType, "<anonymous>");
		func.setOwner(self._scope._method._owner);
		self.AddScope1(func);
		for (var param of node._params)
		{
			var name = param.name;
			var type = self._scope._method._owner.GetType(param.type, null);
			var typeName = (param.type)._name;
			if (!type)
				self.Error(string_Format("Unknown parameter type '%{0}' for '%{1}'", [typeName, name]), param.type);
			func.AddParameter(type, name, null);
			self._scope.AddItem(type, name, false);
		}

		self.VerifyBlock(node._block);
		self.PopScope();
	};

	// void VerifyOp(OperatorExpressionNode)
	Verifier.prototype.VerifyOp = function(node) {
		var self = this;
		switch (node._op)
		{
			case eco.OpType.Assign:
			case eco.OpType.AAdd:
			case eco.OpType.ASub:
			case eco.OpType.AMul:
			case eco.OpType.ADiv:
			case eco.OpType.AExp:
			case eco.OpType.AMod:
			{
				self.VerifyLValue(node._expr1);
				self.VerifyExpression(node._expr2);
				var t1 = node._expr1.GetTypeOf(self._scope, null);
				var t2 = node._expr2.GetTypeOf(self._scope, null);
				if (t1 && t2 && t1 != eco.Interface.getNullType() && t2 != eco.Interface.getNullType())
				{
					if (node._expr2._exprType == eco.ExpressionType.LitArray)
					{
						if (!t1.IsArray() && t1 != eco.Interface.getObjectType())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t1._name, t2._name]), node);
						else
						{
							if (t1 != eco.Interface.getObjectType())
							{
								var arrType = t1;
								if (!arrType.CastsTo2(node._expr2, self._scope))
									self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
							}
						}

					}
					else if (node._expr2._exprType == eco.ExpressionType.Map)
					{
						if (!t1.IsMap() && t1 != eco.Interface.getObjectType() && !t1.IsInline() && !t1.IsDefined && !t1.IsClass())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
						else
						{
							if (t1 != eco.Interface.getObjectType())
							{
								if (t1.IsClass() || t1.IsInline() || t1.IsDefined)
								{
									if (!t1.CastsTo(node._expr2, self._scope))
										self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
								}
								else
								{
									var mapType = t1;
									if (!mapType.CastsTo(node._expr2, self._scope))
										self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
								}

							}
						}

					}
					else if (node._expr2._exprType == eco.ExpressionType.Function)
					{
						if (!t1.IsFunction() && t1 != eco.Interface.getObjectType())
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
						else if (t1 != eco.Interface.getObjectType())
						{
							var funcType = t1;
							var funcNode = node._expr2;
							var rightFuncType = funcNode.GetTypeOf(self._scope, null);
							if (!funcType.CastsTo2(funcNode, self._scope))
								self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [rightFuncType._name, funcType._name]), node);
						}
					}
					else
					{
						if (t2.DistanceTo(t1) < 0)
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [t2._name, t1._name]), node);
					}

				}
				break;
			}
			default:
			{
				self.VerifyExpression(node._expr1);
				self.VerifyExpression(node._expr2);
				var exprType = node.GetTypeOf(self._scope, null);
				if (!exprType || exprType == eco.Interface.getNullType())
					self.Error("Illegal operand types for '" + eco.TokenOp.GetOpName(node._op) + "'", node);
				break;
			}
		}
	};

	// void VerifyPreOp(PreOpExpressionNode)
	Verifier.prototype.VerifyPreOp = function(node) {
		var self = this;
		var exprType = node._expr1.GetTypeOf(self._scope, null);
		if (node._op == eco.OpType.Not)
		{
			self.VerifyExpression(node._expr1);
		}
		else if (node._op == eco.OpType.Sub)
		{
			self.VerifyExpression(node._expr1);
			if (exprType != eco.Interface.getIntType() && exprType != eco.Interface.getFloatType())
			{
				self.VerifyLValue(node._expr1);
				self.Error("Operator '-' expects int or float", node);
			}
		}
		else if (exprType != eco.Interface.getIntType() && exprType != eco.Interface.getFloatType())
		{
			self.VerifyLValue(node._expr1);
			self.Error("Operator '" + eco.TokenOp.GetOpName(node._op) + "' expects int or float", node);
		}
	};

	// void VerifyPostOp(PostOpExpressionNode)
	Verifier.prototype.VerifyPostOp = function(node) {
		var self = this;
		self.VerifyLValue(node._expr1);
		var exprType = node._expr1.GetTypeOf(self._scope, null);
		if (exprType != eco.Interface.getIntType() && exprType != eco.Interface.getFloatType())
			self.Error("Operator '" + eco.TokenOp.GetOpName(node._op) + "' expects int or float", node);
	};

	// void VerifyCondOp(CondOpExpressionNode)
	Verifier.prototype.VerifyCondOp = function(node) {
		var self = this;
		self.VerifyExpression(node._expr1);
		self.VerifyExpression(node._expr2);
		self.VerifyExpression(node._expr3);
		var condType = node._expr1.GetTypeOf(self._scope, null);
		if (!condType || condType == eco.Interface.getNullType())
			self.Error("Illegal condition", node._expr1);
		else if (condType == eco.Interface.getVoidType())
			self.Error("Cannot use void type in condition", node._expr1);
		var res = node.GetTypeOf(self._scope, null);
		if (!res)
			self.Error("Illegal condition operants", node);
	};

	// void VerifyPar(ParExpressionNode)
	Verifier.prototype.VerifyPar = function(node) {
		var self = this;
		self.VerifyExpression(node._sub);
	};

	// void VerifyNew(NewExpressionNode)
	Verifier.prototype.VerifyNew = function(node) {
		var self = this;
		var intr = node.GetTypeOf(self._scope, null);
		if (intr && (intr.IsArray() || intr.IsMap() || intr == eco.Interface.getObjectType()))
			return;
		if (!intr || intr == eco.Interface.getNullType() || (intr.GetSymbolType() != eco.SymbolType.Class && !intr.IsArray() && !intr.IsMap()))
			self.Error("Illegal type '" + node._newType._name + "'", node._newType);
		if (intr)
		{
			var call = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), "_New");
			call.setArgList(node._argList);
			self.VerifyArgList(call._argList);
			var found = intr ? intr.GetMethod(call, self._scope, null) : null;
			if (!found)
				self.Error(string_Format("Cannot find constructor in class '%{0}'", [intr._name]), node);
			if (found && !found.AccessibleFrom(self._scope._method))
				self.Error("'" + found.Signature() + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
		}
	};

	// void VerifyCall(CallExpressionNode)
	Verifier.prototype.VerifyCall = function(node) {
		var self = this;
		self.VerifyArgList(node._argList);
		if (node._isNative)
			return;
		var found = self._scope._method._owner.GetMethod(node, self._scope, function (dilemmas) {
			var ambigious = dilemmas[0].Signature();
			for (var d = 1; d < dilemmas.length; d++)
			{
				ambigious = ambigious + ", " + dilemmas[d].Signature();
			}

			self.Error(string_Format("Ambiguous method call. Could be: %{0}", [ambigious]), node);
		});
		if (!found)
		{
			var func = self._scope.GetItem(node._name);
			if (!func)
			{
				var member = self._scope._method._owner.GetMemberByName(node._name);
				if (!member)
					self.Error(string_Format("Cannot find method '%{0}()'", [node._name]), node);
				else
				{
					if (member._memberType == eco.MemberType.Field || member._memberType == eco.MemberType.Property)
					{
						var memberType = (member._type);
						var params = memberType._paramTypes;
						var args = node._argList;
						if (params.length != args.length)
							self.Error(string_Format("'%{0}' expects ", [member._name]) + params.length + " parameter" + (params.length != 1 ? "s" : ""), node);
						else
						{
							var paramTypeNames = "";
							if (params.length > 0)
							{
								if (paramTypeNames)
									paramTypeNames = params[0]._name;
								else
									paramTypeNames = "<unknown>";

								for (var p = 1; p < params.length; p++)
								{
									if (params[p])
										paramTypeNames = paramTypeNames + ", " + params[p]._name;
									else
										paramTypeNames = paramTypeNames + ", <unknown>";

								}

							}
							for (var p1 = 0; p1 < params.length; p1++)
							{
								var paramType = params[p1];
								var argType = args[p1].GetTypeOf(self._scope, null);
								if (argType.DistanceTo(paramType) < 0)
									self.Error(string_Format("'%{0}' expects (%{1})", [member._name, paramTypeNames]), node);
							}

						}

					}
					else if (member.IsMethod())
					{
						var methodMember = member;
						if (methodMember._parameters.length != node._argList.length)
							self.Error(string_Format("'%{0}' expects ", [member._name]) + methodMember._parameters.length + " parameter" + (methodMember._parameters.length != 1 ? "s" : ""), node);
						else
						{
							if (methodMember._parameters.length > 0)
							{
								var paramTypeNames1 = "";
								if (methodMember._parameters[0].Type)
									paramTypeNames1 = methodMember._parameters[0].Type._name;
								else
									paramTypeNames1 = "<unknown>";

								for (var p2 = 1; p2 < methodMember._parameters.length; p2++)
								{
									if (methodMember._parameters[p2].Type)
										paramTypeNames1 = paramTypeNames1 + ", " + methodMember._parameters[p2].Type._name;
									else
										paramTypeNames1 = paramTypeNames1 + ", <unknown>";

								}

								self.Error(string_Format("'%{0}' expects (%{1})", [member._name, paramTypeNames1]), node);
							}
						}

					}
					else
						self.Error(string_Format("Cannot find method '%{0}()'", [node._name]), node);

				}

			}
			else
			{
				var itemType = func.ItemType;
				if (!itemType)
					self.Error("Unrecognised type", node);
				else if (itemType.IsFunction())
				{
					var funcType = itemType;
					var params1 = funcType._paramTypes;
					var args1 = node._argList;
					if (params1.length != args1.length)
						self.Error("'" + node._name + "' expects " + params1.length + " parameter" + (params1.length != 1 ? "s" : ""), node);
					else
					{
						var paramTypeNames2 = "";
						if (params1.length > 0)
						{
							if (params1[0])
								paramTypeNames2 = params1[0]._name;
							else
								paramTypeNames2 = "<unknown>";

							for (var p3 = 1; p3 < params1.length; p3++)
							{
								if (params1[p3])
									paramTypeNames2 = paramTypeNames2 + ", " + params1[p3]._name;
								else
									paramTypeNames2 = paramTypeNames2 + ", <unknown>";

							}

						}
						for (var p4 = 0; p4 < params1.length; p4++)
						{
							var paramType1 = params1[p4];
							var argType1 = args1[p4].GetTypeOf(self._scope, null);
							if (argType1.DistanceTo(paramType1) < 0)
								self.Error(string_Format("'%{0}' expects (%{1})", [node._name, paramTypeNames2]), node);
						}

					}

				}
				else if (itemType != eco.Interface.getObjectType())
					self.Error("'" + node._name + "' is not a method or function", node);
			}

		}
		else
		{
			if (!found.AccessibleFrom(self._scope._method))
				self.Error("'" + found.Signature() + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
			if (self._scope._method._static && !found._static)
				self.Error("Cannot call non-static method '" + found.Signature() + "' from static method '" + self._scope._method.Signature() + "'", node);
		}

	};

	// void VerifyComplexCall(ComplexCallExpressionNode)
	Verifier.prototype.VerifyComplexCall = function(node) {
		var self = this;
		self.VerifyExpression(node._obj);
		var objType = node._obj.GetTypeOf(self._scope, null);
		if (objType && objType != eco.Interface.getNullType())
		{
			if (objType == eco.Interface.getObjectType())
				self.VerifyArgList(node._argList);
			else
			{
				self.VerifyArgList(node._argList);
				var funcType = objType;
				var params = funcType._paramTypes;
				var args = node._argList;
				if (params.length != args.length)
					self.Error("Function expects " + params.length + " parameter" + (params.length != 1 ? "s" : ""), node);
				else
				{
					var paramTypeNames = "";
					if (params.length > 0)
					{
						if (params[0])
							paramTypeNames = params[0]._name;
						else
							paramTypeNames = "<unknown>";

						for (var p = 1; p < params.length; p++)
						{
							if (params[p])
								paramTypeNames = paramTypeNames + ", " + params[p]._name;
							else
								paramTypeNames = paramTypeNames + ", <unknown>";

						}

					}
					for (var p1 = 0; p1 < params.length; p1++)
					{
						var paramType = params[p1];
						var argType = args[p1].GetTypeOf(self._scope, null);
						if (argType.DistanceTo(paramType) < 0)
							self.Error(string_Format("Function expects (%{0})", [paramTypeNames]), node);
					}

				}

			}

		}
		else
			self.Error("Cannot verify type of object", node);

	};

	// void VerifyBaseCall(BaseCallExpressionNode)
	Verifier.prototype.VerifyBaseCall = function(node) {
		var self = this;
		var baseClass = (self._scope._method._owner)._baseClass;
		if (!baseClass)
			self.Error("Cannot call base method. Base class does not exist", node);
		else
		{
			var found = baseClass.GetMethod(node, self._scope, function (dilemmas) {
				var ambigious = dilemmas[0].Signature();
				for (var d = 1; d < dilemmas.length; d++)
				{
					ambigious = ambigious + ", " + dilemmas[d].Signature();
				}

				self.Error(string_Format("Ambiguous method call. Could be: %{0}", [ambigious]), node);
			});
			if (!found)
				self.Error(string_Format("Cannot find method '%{0}'", [node._name]), node);
			else
			{
				self.VerifyArgList(node._argList);
				if (!found.AccessibleFrom(self._scope._method))
					self.Error("'" + found.Signature() + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
				if (self._scope._method._static && !found._static)
					self.Error("Cannot call non-static method '" + found.Signature() + "' from static method '" + self._scope._method.Signature() + "'", node);
			}

		}

	};

	// void VerifyMethodCall(MethodCallExpressionNode)
	Verifier.prototype.VerifyMethodCall = function(node) {
		var self = this;
		self.VerifyArgList(node._call._argList);
		var staticAccess = false;
		var etype = node._expr.GetTypeOf(self._scope, null);
		if (!etype || etype == eco.Interface.getNullType())
		{
			staticAccess = true;
			etype = node._expr.TryGetType(self._scope);
			if (!etype || etype == eco.Interface.getNullType())
			{
				self.Error(string_Format("Cannot find method '%{0}'", [node._call._name]), node);
			}
		}
		else
			self.VerifyExpression(node._expr);

		if (etype == eco.Interface.getObjectType())
			return;
		else if (etype)
		{
			var found = etype.GetMethod(node._call, self._scope, function (dilemmas) {
				var ambigious = dilemmas[0].Signature();
				for (var d = 1; d < dilemmas.length; d++)
				{
					ambigious = ambigious + ", " + dilemmas[d].Signature();
				}

				self.Error(string_Format("Ambiguous method call. Could be: %{0}", [ambigious]), node);
			});
			if (!found)
			{
				var access = eco.AccessExpressionNode._New4(new eco.AccessExpressionNode(), node._expr, node._call._name);
				var objtype = access.GetTypeOf(self._scope, null);
				if (objtype)
				{
					if (objtype == eco.Interface.getObjectType())
					{
					}
					else if (objtype.IsFunction())
					{
						var funcType = objtype;
						var params = funcType._paramTypes;
						var args = node._call._argList;
						if (params.length != args.length)
							self.Error("'" + node._call._name + "' expects " + params.length + " parameter" + (params.length != 1 ? "s" : ""), node);
						else
						{
							var paramTypeNames = "";
							if (params.length > 0)
							{
								if (params[0])
									paramTypeNames = params[0]._name;
								else
									paramTypeNames = "<unknown>";

								for (var p = 1; p < params.length; p++)
								{
									if (params[p])
										paramTypeNames = paramTypeNames + ", " + params[p]._name;
									else
										paramTypeNames = paramTypeNames + ", <unknown>";

								}

							}
							for (var p1 = 0; p1 < params.length; p1++)
							{
								var paramType = params[p1];
								var argType = args[p1].GetTypeOf(self._scope, null);
								if (argType.DistanceTo(paramType) < 0)
									self.Error(string_Format("'%{0} expects (%{1})'", [node._call._name, paramTypeNames]), node);
							}

						}

					}
					else
						self.Error(string_Format("Cannot call method on object of type '%{0}'", [objtype._name]), node);

				}
				else
				{
					var member = etype.GetMemberByName(node._call._name);
					if (!member)
						self.Error("Cannot find method '" + node._call.CallSignature(self._scope) + "' in '" + etype._name + "'", node);
					else
					{
						if (member.IsMethod())
						{
							var methodMember = member;
							if (methodMember._parameters.length != node._call._argList.length)
								self.Error(string_Format("'%{0}' expects ", [methodMember._name]) + methodMember._parameters.length + " parameter" + (methodMember._parameters.length != 1 ? "s" : ""), node);
							else
							{
								if (methodMember._parameters.length > 0)
								{
									var paramTypes = methodMember._parameters[0].Type._name;
									for (var p2 = 1; p2 < methodMember._parameters.length; p2++)
										paramTypes = paramTypes + ", " + methodMember._parameters[p2].Type._name;

									self.Error(string_Format("'%{0}' expects (%{1})", [methodMember._name, paramTypes]), node);
								}
							}

						}
					}

				}

			}
			else
			{
				if (!found.AccessibleFrom(self._scope._method))
					self.Error("'" + found.Signature() + "' is not accessible from '" + self._scope._method.Signature() + "'", node);
				if (staticAccess && !found._static)
					self.Error("'" + found.Signature() + "' is not static", node);
			}

		}
		else
			self.Error("Cannot find method '" + node._call.CallSignature(self._scope) + "'", node);

	};

	// void VerifyTypecast(TypecastExpressionNode)
	Verifier.prototype.VerifyTypecast = function(node) {
		var self = this;
		var typeNode = node._type;
		var expr = node._expr;
		self.VerifyExpression(expr);
		var toType = self._scope._method._owner.GetType(typeNode, null);
		var fromType = expr.GetTypeOf(self._scope, null);
		if (!toType || toType == eco.Interface.getNullType())
			self.Error("Unrecognised typecast type", typeNode);
		if (!fromType || fromType == eco.Interface.getNullType())
			self.Error("Illegal typecast expression", expr);
		if (expr._exprType == eco.ExpressionType.LitArray)
		{
			if (toType)
			{
				if (!toType.IsArray())
					self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);
				else
				{
					var arrayType = toType;
					if (!arrayType.CastsTo2(expr, self._scope))
						self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);
				}

			}
		}
		else if (expr._exprType == eco.ExpressionType.Map)
		{
			if (toType)
			{
				if (!toType.IsMap())
				{
					if (toType.IsInline() || toType.IsDefined)
					{
						if (!toType.CastsTo(expr, self._scope))
							self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);
					}
					else
						self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);

				}
				else
				{
					var mapType = toType;
					if (!mapType.CastsTo(expr, self._scope))
						self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);
				}

			}
		}
		else if (toType && fromType)
		{
			if (toType == eco.Interface.getStringType())
				return;
			if (toType.DistanceTo(fromType) < 0 && fromType.DistanceTo(toType) < 0)
				self.Error(string_Format("Cannot cast from '%{0}' to '%{1}'", [fromType._name, toType._name]), node);
		}
	};

	// void VerifyAssemblyExpr(AssemblyExpressionNode)
	Verifier.prototype.VerifyAssemblyExpr = function(node) {
		var self = this;
	};

	// void VerifyHTML(HTMLExpressionNode)
	Verifier.prototype.VerifyHTML = function(node) {
		var self = this;
		var exprType = node._elem;
		var exprElem = node._elemExpr;
		var attr = node._attr;
		var children = node._children;
		var clone = node._attrClone;
		if (!node.IsBasic())
		{
			if (exprElem)
			{
				var elemExprType = exprElem.GetTypeOf(self._scope, null);
				if (elemExprType != eco.Interface.getStringType())
					self.Error("Element type expression must be string", exprElem);
			}
			else if (exprType)
			{
				var templ = self._scope._method._owner.GetType(exprType, null);
				if (!templ)
					self.Error(string_Format("Cannot find template '%{0}'", [exprType._name]), node);
				else if (templ.GetSymbolType() != eco.SymbolType.Template && templ.GetSymbolType() != eco.SymbolType.ServerComponent)
				{
					self.Error(string_Format("'%{0}' is not a template or component", [exprType._name]), node);
				}
			}
		}
		for (var attrKey of Object.keys(attr))
			self.VerifyExpression(attr[attrKey]);

		for (var child of children)
			self.VerifyExpression(child);

		if (clone)
		{
			self.VerifyExpression(clone);
			var cloneType = clone.GetTypeOf(self._scope, null);
			if (cloneType)
			{
				if (!cloneType.IsMap())
					self.Error("HTML attribute clone must be map type", clone);
			}
			else
				self.Error("Illegal attribute clone type", clone);

		}
	};

	// void VerifyHTMLText(HTMLTextExpressionNode)
	Verifier.prototype.VerifyHTMLText = function(node) {
		var self = this;
		var textType = node._text.GetTypeOf(self._scope, null);
		if (textType != eco.Interface.getStringType())
			self.Error("Expected string", node);
		self.VerifyExpression(node._text);
	};

	// void VerifyHTMLCode(HTMLCodeExpressionNode)
	Verifier.prototype.VerifyHTMLCode = function(node) {
		var self = this;
		self.VerifyExpression(node._code);
	};

	// void VerifyArgList(ExpressionNode[])
	Verifier.prototype.VerifyArgList = function(args) {
		var self = this;
		if (args)
		{
			for (var arg of args)
				self.VerifyExpression(arg);

		}
	};

	// void Error(string,ParseNode)
	Verifier.prototype.Error = function(message, node) {
		var self = this;
		self._semanticAnalyser.Error2(self._curFileId, message, node);
	};

	// void AddScope()
	Verifier.prototype.AddScope = function() {
		var self = this;
		if (self._scope)
		{
			var newScope = eco.Scope._New1(new eco.Scope(), self._scope._method, self._scope);
			self._scope = newScope;
		}
	};

	// void AddScope(Method)
	Verifier.prototype.AddScope1 = function(method) {
		var self = this;
		if (self._scope)
		{
			var newScope = eco.Scope._New1(new eco.Scope(), method, self._scope);
			self._scope = newScope;
		}
	};

	// void PopScope()
	Verifier.prototype.PopScope = function() {
		var self = this;
		if (self._scope)
			self._scope = self._scope._parent;
	};

	return Verifier;
}());

/**

 */
eco.Symbol = (function() {
	function Symbol() {
	}

	// Constructor _New()
	Symbol._New = function(self) {
		self._packageId = 0;
		self._name = "";
		self._symbolType = null;
		self._namespace = null;
		self._startLine = 0;
		self._endLine = 0;
		self._startColumn = 0;
		self._endColumn = 0;
		self._fileId = "";
		self._imported = false;
		self._docs = null;
		return self;
	};

	// Constructor _New(string)
	Symbol._New1 = function(self, name) {
		self._packageId = 0;
		self._name = "";
		self._symbolType = null;
		self._namespace = null;
		self._startLine = 0;
		self._endLine = 0;
		self._startColumn = 0;
		self._endColumn = 0;
		self._fileId = "";
		self._imported = false;
		self._docs = null;
		self._name = name;
		self._symbolType = eco.SymbolType.Symbol;
		self._docs = null;
		self._imported = false;
		return self;
	};

	// int getPackageID()
	Symbol.prototype.getPackageID = function() {
		var self = this;
		return self._packageId;
	};

	// int setPackageID(int)
	Symbol.prototype.setPackageID = function(value) {
		var self = this;
		self._packageId = value;
	};

	// string getName()
	Symbol.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// string setName(string)
	Symbol.prototype.setName = function(value) {
		var self = this;
		self._name = value;
	};

	// string getFullName()
	Symbol.prototype.getFullName = function() {
		var self = this;
		var fullName = self._name;
		if (self._namespace && self._namespace._namespace)
			fullName = self._namespace.getFullName() + "." + self._name;
		return fullName;
	};

	// SymbolType getType()
	Symbol.prototype.getType = function() {
		var self = this;
		return self._symbolType;
	};

	// SymbolType setType(SymbolType)
	Symbol.prototype.setType = function(value) {
		var self = this;
		self._symbolType = value;
	};

	// SymbolType GetSymbolType()
	Symbol.prototype.GetSymbolType = function() {
		var self = this;
		return self._symbolType;
	};

	// Namespace getNamespace()
	Symbol.prototype.getNamespace = function() {
		var self = this;
		return self._namespace;
	};

	// Namespace setNamespace(Namespace)
	Symbol.prototype.setNamespace = function(value) {
		var self = this;
		self._namespace = value;
	};

	// int getStartLine()
	Symbol.prototype.getStartLine = function() {
		var self = this;
		return self._startLine;
	};

	// int setStartLine(int)
	Symbol.prototype.setStartLine = function(value) {
		var self = this;
		self._startLine = value;
	};

	// int getEndLine()
	Symbol.prototype.getEndLine = function() {
		var self = this;
		return self._endLine;
	};

	// int setEndLine(int)
	Symbol.prototype.setEndLine = function(value) {
		var self = this;
		self._endLine = value;
	};

	// int getStartColumn()
	Symbol.prototype.getStartColumn = function() {
		var self = this;
		return self._startColumn;
	};

	// int setStartColumn(int)
	Symbol.prototype.setStartColumn = function(value) {
		var self = this;
		self._startColumn = value;
	};

	// int getEndColumn()
	Symbol.prototype.getEndColumn = function() {
		var self = this;
		return self._endColumn;
	};

	// int setEndColumn(int)
	Symbol.prototype.setEndColumn = function(value) {
		var self = this;
		self._endColumn = value;
	};

	// string getFileID()
	Symbol.prototype.getFileID = function() {
		var self = this;
		return self._fileId;
	};

	// string setFileID(string)
	Symbol.prototype.setFileID = function(value) {
		var self = this;
		self._fileId = value;
	};

	// bool getImported()
	Symbol.prototype.getImported = function() {
		var self = this;
		return self._imported;
	};

	// SymbolDoc getDocs()
	Symbol.prototype.getDocs = function() {
		var self = this;
		return self._docs;
	};

	// SymbolDoc setDocs(SymbolDoc)
	Symbol.prototype.setDocs = function(value) {
		var self = this;
		self._docs = value;
	};

	// void RemoveFromNamespace()
	Symbol.prototype.RemoveFromNamespace = function() {
		var self = this;
		if (self._namespace)
			self._namespace.RemoveSymbol(self);
	};

	// Namespace GetRootNamespace()
	Symbol.prototype.GetRootNamespace = function() {
		var self = this;
		var cur = self;
		while (cur)
		{
			if (!cur._namespace)
				return cur;
			cur = cur._namespace;
		}

		return null;
	};

	// virtual string Signature()
	Symbol.prototype.Signature = function() {
		var self = this;
		return self._name;
	};

	// string GetSignatureTo(Namespace)
	Symbol.prototype.GetSignatureTo = function(ns) {
		var self = this;
		if (self._namespace && (self._namespace != ns) && self._namespace._namespace)
		{
			var sig = self._namespace.GetSignatureTo(ns) + "." + self.Signature();
			return sig;
		}
		else
		{
			var sig1 = self.Signature();
			return sig1;
		}

	};

	// virtual string CompiledName()
	Symbol.prototype.CompiledName = function() {
		var self = this;
		return self.Signature();
	};

	// virtual string DetailName()
	Symbol.prototype.DetailName = function() {
		var self = this;
		return self.Signature();
	};

	// virtual object Serialise()
	Symbol.prototype.Serialise = function() {
		var self = this;
		return self._name;
	};

	// virtual bool IsNamespace()
	Symbol.prototype.IsNamespace = function() {
		var self = this;
		return false;
	};

	return Symbol;
}());

/**

 */
eco.MethodParameter = (function() {
	function MethodParameter() {
	}

	// Constructor _New()
	MethodParameter._New = function(self) {
		self.Type = null;
		self.Name = "";
		self.Default = null;
		return self;
	};

	// Constructor _New(Interface,string,object)
	MethodParameter._New1 = function(self, type, name, defaultValue) {
		self.Type = null;
		self.Name = "";
		self.Default = null;
		self.Type = type;
		self.Name = name;
		self.Default = defaultValue;
		return self;
	};

	// object Serialise()
	MethodParameter.prototype.Serialise = function() {
		var self = this;
		var output = {"type": self.Type ? self.Type.SerialiseType() : null, "name": self.Name, "defaultValue": self.Default};
		return output;
	};

	return MethodParameter;
}());

/**

 */
eco.FileCompilerModel = (function(_base) {
	__extends(FileCompilerModel, _base);

	function FileCompilerModel() {
	}

	// Constructor _New()
	FileCompilerModel._New2 = function(self) {
		self = _base._New(self) || self;
		return self;
	};

	// Constructor _New(Compiler,string,string,CompilationTarget,string)
	FileCompilerModel._New3 = function(self, compiler, fileId, name, target, code) {
		self = _base._New1(self, compiler, fileId, name, target, code) || self;
		return self;
	};

	// virtual void BuildSkeleton()
	FileCompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._semanticAnalyser.BuildSkeleton(self.FileID, self.GetSymbolTableByTarget(), self._parser.ParseCodeFile().nodes);
		});
	};

	// virtual void Build()
	FileCompilerModel.prototype.Build = function() {
		var self = this;
		var symbolTable = self.GetSymbolTableByTarget();
		self.PrepareForBuild(function () {
			self._parser.CaptureExpressions = self.Target == eco.CompilationTarget.Server || self.Target == eco.CompilationTarget.Shared;
			var parseResult = self._parser.ParseCodeFile();
			var imports = parseResult.imports;
			var usings = parseResult.usings;
			var parseNodes = parseResult.nodes;
			var lineCount = self._parser.GetCurLine();
			symbolTable.SetLineCount(lineCount);
			self._semanticAnalyser.BuildSkeleton(self.FileID, symbolTable, parseNodes);
			self._compiler.ApplyImports();
			self._semanticAnalyser.UseNamespaces(self.FileID, symbolTable, usings);
			var buildResult = self._semanticAnalyser.BuildFull(self.FileID, symbolTable, parseNodes);
			var namespaces = buildResult.namespaces;
			namespaces.unshift(symbolTable);
			self.Imports = imports;
			self.Usings = usings;
			self.ParseNodes = parseNodes;
			self.Namespaces = namespaces;
			self.Methods = buildResult.methods;
			self.Properties = buildResult.properties;
			self.LineCount = lineCount;
		});
	};

	return FileCompilerModel;
}(eco.CompilerModel));

/**

 */
eco.ServerComponentCompilerModel = (function(_base) {
	__extends(ServerComponentCompilerModel, _base);

	function ServerComponentCompilerModel() {
	}

	// Constructor _New()
	ServerComponentCompilerModel._New2 = function(self) {
		self = _base._New(self) || self;
		return self;
	};

	// Constructor _New(Compiler,string,string,string)
	ServerComponentCompilerModel._New3 = function(self, compiler, fileId, name, code) {
		self = _base._New1(self, compiler, fileId, name, eco.CompilationTarget.Server, code) || self;
		self.ModelType = eco.CompilationModelType.Component;
		return self;
	};

	// virtual void BuildSkeleton()
	ServerComponentCompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [self._parser.ParseServerComponent(self.Name)]);
		});
	};

	// virtual void Build()
	ServerComponentCompilerModel.prototype.Build = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._parser.CaptureExpressions = true;
			self._parser.setCurrentFileName(self.Name + "-server.eco");
			var parseResult = self._parser.ParseServerComponent(self.Name);
			var lineCount = self._parser.GetCurLine();
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var buildResult = self._semanticAnalyser.BuildFull(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var namespaces = buildResult.namespaces;
			namespaces.unshift(self._compiler._serverSymbolTable);
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self.Usings = [];
			self.ParseNodes = [parseResult];
			self.Namespaces = namespaces;
			self.Methods = buildResult.methods;
			self.Properties = buildResult.properties;
			self.LineCount = lineCount;
		});
	};

	return ServerComponentCompilerModel;
}(eco.CompilerModel));

/**

 */
eco.ClientComponentCompilerModel = (function(_base) {
	__extends(ClientComponentCompilerModel, _base);

	function ClientComponentCompilerModel() {
	}

	// Constructor _New()
	ClientComponentCompilerModel._New2 = function(self) {
		self = _base._New(self) || self;
		return self;
	};

	// Constructor _New(Compiler,string,string,string)
	ClientComponentCompilerModel._New3 = function(self, compiler, fileId, name, code) {
		self = _base._New1(self, compiler, fileId, name, eco.CompilationTarget.Client, code) || self;
		self.ModelType = eco.CompilationModelType.Component;
		return self;
	};

	// virtual void BuildSkeleton()
	ClientComponentCompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._clientSymbolTable, [self._parser.ParseClientComponent(self.Name)]);
		});
	};

	// virtual void Build()
	ClientComponentCompilerModel.prototype.Build = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._parser.CaptureExpressions = false;
			self._parser.setCurrentFileName(self.Name + "-client.eco");
			var parseResult = self._parser.ParseClientComponent(self.Name);
			var lineCount = self._parser.GetCurLine();
			self._compiler._clientSymbolTable.SetLineCount(lineCount);
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._clientSymbolTable, [parseResult]);
			var buildResult = self._semanticAnalyser.BuildFull(self.FileID, self._compiler._clientSymbolTable, [parseResult]);
			var namespaces = buildResult.namespaces;
			namespaces.unshift(self._compiler._clientSymbolTable);
			self._compiler._clientSymbolTable.SetLineCount(lineCount);
			self.Usings = [];
			self.ParseNodes = [parseResult];
			self.Namespaces = namespaces;
			self.Methods = buildResult.methods;
			self.Properties = buildResult.properties;
			self.LineCount = lineCount;
		});
	};

	return ClientComponentCompilerModel;
}(eco.CompilerModel));

/**

 */
eco.InitialiserCompilerModel = (function(_base) {
	__extends(InitialiserCompilerModel, _base);

	function InitialiserCompilerModel() {
	}

	// Constructor _New()
	InitialiserCompilerModel._New2 = function(self) {
		self = _base._New(self) || self;
		return self;
	};

	// Constructor _New(Compiler,string,string,string)
	InitialiserCompilerModel._New3 = function(self, compiler, fileId, name, code) {
		self = _base._New1(self, compiler, fileId, name, eco.CompilationTarget.Server, code) || self;
		return self;
	};

	// virtual void BuildSkeleton()
	InitialiserCompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [self._parser.ParseInitialiser(self.Name)]);
		});
	};

	// virtual void Build()
	InitialiserCompilerModel.prototype.Build = function() {
		var self = this;
		self.PrepareForBuild(function () {
			var parseResult = self._parser.ParseInitialiser(self.Name);
			var lineCount = self._parser.GetCurLine();
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var buildResult = self._semanticAnalyser.BuildFull(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var namespaces = buildResult.namespaces;
			namespaces.unshift(self._compiler._serverSymbolTable);
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self.Usings = [];
			self.ParseNodes = [parseResult];
			self.Namespaces = namespaces;
			self.Methods = buildResult.methods;
			self.Properties = buildResult.properties;
			self.LineCount = lineCount;
		});
	};

	return InitialiserCompilerModel;
}(eco.CompilerModel));

/**

 */
eco.ServiceCompilerModel = (function(_base) {
	__extends(ServiceCompilerModel, _base);

	function ServiceCompilerModel() {
	}

	// Constructor _New()
	ServiceCompilerModel._New2 = function(self) {
		self = _base._New(self) || self;
		return self;
	};

	// Constructor _New(Compiler,string,string,string)
	ServiceCompilerModel._New3 = function(self, compiler, fileId, name, code) {
		self = _base._New1(self, compiler, fileId, name, eco.CompilationTarget.Server, code) || self;
		return self;
	};

	// virtual void BuildSkeleton()
	ServiceCompilerModel.prototype.BuildSkeleton = function() {
		var self = this;
		self.PrepareForBuild(function () {
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [self._parser.ParseService(self.Name)]);
		});
	};

	// virtual void Build()
	ServiceCompilerModel.prototype.Build = function() {
		var self = this;
		self.PrepareForBuild(function () {
			var parseResult = self._parser.ParseService(self.Name);
			var lineCount = self._parser.GetCurLine();
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self._semanticAnalyser.BuildSkeleton(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var buildResult = self._semanticAnalyser.BuildFull(self.FileID, self._compiler._serverSymbolTable, [parseResult]);
			var namespaces = buildResult.namespaces;
			namespaces.unshift(self._compiler._serverSymbolTable);
			self._compiler._serverSymbolTable.SetLineCount(lineCount);
			self.Usings = [];
			self.ParseNodes = [parseResult];
			self.Namespaces = namespaces;
			self.Methods = buildResult.methods;
			self.Properties = buildResult.properties;
			self.LineCount = lineCount;
		});
	};

	return ServiceCompilerModel;
}(eco.CompilerModel));

/**

 */
eco.JSTranslator = (function(_base) {
	__extends(JSTranslator, _base);

	function JSTranslator() {
	}

	// Constructor _New()
	JSTranslator._New2 = function(self) {
		self = _base._New(self) || self;
		self._target = null;
		self._imports = null;
		self._serverSymbolTable = null;
		self._namespaceDepth = 0;
		self._loopDepth = 0;
		self._scope = null;
		self._inPlugin = false;
		self._packageId = 0;
		return self;
	};

	// Constructor _New(int,string,CompilationTarget,ImportNode[],SymbolTable,SymbolTable,SymbolTable)
	JSTranslator._New3 = function(self, packageId, projectName, target, imports, symbolTable, serverSymbolTable, sharedSymbolTable) {
		self = _base._New1(self, projectName, symbolTable, sharedSymbolTable) || self;
		self._target = null;
		self._imports = null;
		self._serverSymbolTable = null;
		self._namespaceDepth = 0;
		self._loopDepth = 0;
		self._scope = null;
		self._inPlugin = false;
		self._packageId = 0;
		self._packageId = packageId;
		self._serverSymbolTable = serverSymbolTable;
		self._namespaceDepth = 0;
		self._inPlugin = false;
		self._target = target;
		self._imports = imports;
		self.AddCommonCode("var __extends = this.__extends || function (derived, base) {function __() { this.constructor = derived; } __.prototype = base.prototype; derived.prototype = new __();};");
		self.AddCommonCode("function __performAwait(responderType, responderMethod, args, cb) {\n\tvar xhttp = new XMLHttpRequest();\n\txhttp.onreadystatechange = function() {\n\t\tif (this.readyState == 4) {\n\t\t\ttry\n\t\t\t{\n\t\t\t\tvar res = JSON.parse(this.responseText);\n\t\t\t\tif (res && res.hasOwnProperty('__eco_error'))\n\t\t\t\t\tconsole.error(res['__eco_error']);\n\t\t\t\telse\n\t\t\t\t\tcb(res, this.status);\n\t\t\t}\n\t\t\tcatch(e)\n\t\t\t{\n\t\t\t\tconsole.error(e);\n\t\t\t\tconsole.error(this.responseText);\n\t\t\t}\n\t\t}\n\t};\n\n\txhttp.open(\"POST\", ((typeof __eco__inPlugin != 'undefined') && __eco__inPlugin) ? \"../index.php\" : \"index.php\", true);\n\txhttp.setRequestHeader(\"Content-type\", \"application/x-www-form-urlencoded\");\n\txhttp.send(\"__responder=\" + responderType + \"&__method=\" + responderMethod + \"&__args=\" + JSON.stringify(args).replace('&', '%26'));\n}\n");
		return self;
	};

	// virtual void CreateStart()
	JSTranslator.prototype.CreateStart = function() {
		var self = this;
		for (var imp of self._imports)
		{
			if (imp.AsNames.length > 1)
			{
				self.Write("const { " + imp.AsNames[0], false);
				for (var a = 1; a < imp.AsNames.length; a++)
					self.Write(", " + imp.AsNames[a], false);

				self.Write(" } = require(" + imp.ImportFile + ");", false);
				self.NewLine();
			}
			else
				self.WriteLine("const " + imp.AsNames[0] + " = require(" + imp.ImportFile + ");", true);

		}

		self.NewLine();
	};

	// virtual void CreateEnd()
	JSTranslator.prototype.CreateEnd = function() {
		var self = this;
		if (self._target == eco.CompilationTarget.Client)
		{
			var componentFound = false;
			for (var symbol of self._symbolTable.getSymbolArray())
			{
				if (symbol.GetSymbolType() == eco.SymbolType.ClientComponent)
				{
					var comp = symbol;
					if (comp._packageId == self._packageId)
					{
						if (!componentFound)
						{
							self.WriteLine("(function() {", true);
							self.Indent();
							self.NewLine();
							componentFound = true;
						}
						var qualifiedName = self.QualifyName(comp.GetSignatureTo(comp.GetRootNamespace()));
						var constr = comp.GetMember("_New()");
						self.WriteLine("// component " + comp._name, true);
						self.WriteLine("for (elem of document.querySelectorAll('[data-compclass=\"" + qualifiedName + "\"]'))", true);
						self.WriteLine("{", true);
						self.Indent();
						self.WriteLine("var inst = new " + qualifiedName + "();", true);
						self.WriteLine("inst.__elem__ = elem;", true);
						self.WriteLine(qualifiedName + "." + constr.CompiledName() + "(inst);", true);
						self.Outdent();
						self.WriteLine("}", true);
						self.NewLine();
					}
				}
			}

			if (componentFound)
			{
				self.Outdent();
				self.WriteLine("})();", true);
			}
			var main = self.getSymbolTable().GetSymbolBySignature(self._projectName, true);
			if (main && main.IsNamespace() && (main).IsInterface() && (main).IsClass())
			{
				var mainClass = main;
				var ctor = mainClass.GetMember("_New()");
				if (ctor)
				{
					self.Comment("Start by calling default constructor on " + mainClass._name);
					self.WriteLine(mainClass.getFullName() + "." + ctor.CompiledName() + "(new " + mainClass.getFullName() + "());", true);
				}
			}
		}
	};

	// virtual void TranslateNamespace(string,Namespace)
	JSTranslator.prototype.TranslateNamespace = function(name, symbol) {
		var self = this;
		var isTopLevel = (self._namespaceDepth == 0);
		self.Comment("Namespace " + name);
		self.WriteLine(string_Format("if (typeof %{0} == 'undefined') %{1} = {};", [symbol.getFullName(), symbol.getFullName()]), true);
	};

	// virtual void TranslateClientComponent(string,ClientComponent)
	JSTranslator.prototype.TranslateClientComponent = function(name, symbol) {
		var self = this;
		self._inPlugin = (symbol._fileId.length > ("plugin").length) && (symbol._fileId.substr(0, ("plugin").length) == "plugin");
		var isTopLevel = (self._namespaceDepth == 0);
		var hasBase = symbol._baseClass != null;
		var baseName = "";
		if (hasBase)
			baseName = symbol._baseClass.getFullName();
		self.DocComment(symbol);
		if (hasBase)
		{
			self.WriteLine(string_Format("var %{0} = (function(_base) {", [symbol.getFullName()]), true);
			self.Indent();
			self.WriteLine(string_Format("__extends(%{0}, _base);", [name]), true);
			self.NewLine();
			self.Outdent();
		}
		else
			self.WriteLine(string_Format("var %{0} = (function() {", [symbol.getFullName()]), true);

		self.Indent();
		self.WriteLine(string_Format("function %{0}() {", [name]), true);
		var members = symbol._members;
		var constructors = [];
		var fields = [];
		for (var member of members)
		{
			if (member._memberType == eco.MemberType.Constructor)
				constructors.push(member);
			else if (member._memberType == eco.MemberType.Field)
				fields.push(member);
		}

		self.WriteLine("}", true);
		self.NewLine();
		for (var field of fields)
		{
			if (field._static)
			{
				if (field._defaultValue)
				{
					self.Write(string_Format("%{0}.", [name]) + field._name + " = ", true);
					self.TranslateExpression(field._defaultValue);
					self.WriteLine(";", false);
				}
				else
					self.WriteLine(string_Format("%{0}.", [name]) + field._name + " = " + self.GetTypeDefaultLiteral1(field._type) + ";", true);

			}
		}

		for (var constr of constructors)
			self.TranslateConstructor(constr, symbol);

		for (var member1 of members)
		{
			if (member1._memberType == eco.MemberType.Method)
				self.TranslateMethod(member1, symbol);
		}

		self.WriteLine(string_Format("return %{0};", [name]), true);
		self.Outdent();
		if (hasBase)
			self.WriteLine(string_Format("}(%{0}));", [baseName]), true);
		else
			self.WriteLine("}());", true);

		self.NewLine();
		self._inPlugin = false;
	};

	// virtual void TranslateClass(string,Class)
	JSTranslator.prototype.TranslateClass = function(name, symbol) {
		var self = this;
		var isTopLevel = (self._namespaceDepth == 0);
		var hasBase = symbol._baseClass != null;
		var baseName = "";
		if (hasBase)
			baseName = symbol._baseClass.getFullName();
		self.DocComment(symbol);
		if (hasBase)
		{
			self.WriteLine(string_Format("%{0} = (function(_base) {", [symbol.getFullName()]), true);
			self.Indent();
			self.WriteLine(string_Format("__extends(%{0}, _base);", [name]), true);
			self.NewLine();
			self.Outdent();
		}
		else
			self.WriteLine(string_Format("%{0} = (function() {", [symbol.getFullName()]), true);

		self.Indent();
		self.WriteLine(string_Format("function %{0}() {", [name]), true);
		var members = symbol._members;
		var constructors = [];
		var fields = [];
		for (var member of members)
		{
			if (member._memberType == eco.MemberType.Constructor)
				constructors.push(member);
			else if (member._memberType == eco.MemberType.Field)
				fields.push(member);
		}

		self.WriteLine("}", true);
		self.NewLine();
		for (var field of fields)
		{
			if (field._static)
			{
				if (field._defaultValue)
				{
					self.Write(string_Format("%{0}.", [name]) + field._name + " = ", true);
					self.TranslateExpression(field._defaultValue);
					self.WriteLine(";", false);
				}
				else
					self.WriteLine(string_Format("%{0}.", [name]) + field._name + " = " + self.GetTypeDefaultLiteral1(field._type) + ";", true);

			}
		}

		for (var constr of constructors)
			self.TranslateConstructor(constr, symbol);

		for (var member1 of members)
		{
			if (member1._memberType == eco.MemberType.Method)
				self.TranslateMethod(member1, symbol);
		}

		self.WriteLine(string_Format("return %{0};", [name]), true);
		self.Outdent();
		if (hasBase)
			self.WriteLine(string_Format("}(%{0}));", [baseName]), true);
		else
			self.WriteLine("}());", true);

		self.NewLine();
	};

	// virtual void TranslateTemplate(string,Template)
	JSTranslator.prototype.TranslateTemplate = function(name, symbol) {
		var self = this;
		var isTopLevel = (self._namespaceDepth == 0);
		self.WriteLine(symbol.getFullName() + " = function(attr, children) {", true);
		var method = symbol._members[0];
		self._scope = eco.Scope._New1(new eco.Scope(), method, null);
		self.Indent();
		var paramCount = 0;
		var mergeString = "";
		for (var param of symbol._parameters)
			mergeString = mergeString + ((paramCount++ > 0) ? ", " : "") + param.Name + ": " + param.Default;

		self.WriteLine(string_Format("attr = map_Merge(attr, {%{0}});", [mergeString]), true);
		for (var param1 of symbol._parameters)
		{
			var scopeItem = self._scope.AddItem(param1.Type, param1.Name, false);
			self.WriteLine("var " + scopeItem.CompiledName() + " = attr[\"" + param1.Name + "\"];", true);
		}

		var statements = method._block._statements;
		for (var statement of statements)
			self.TranslateStatement(statement, true);

		self.Outdent();
		self._scope = null;
		self.WriteLine("};", true);
		self.NewLine();
	};

	// virtual void TranslateNativeClass(string,Class)
	JSTranslator.prototype.TranslateNativeClass = function(name, symbol) {
		var self = this;
		self.PushStack();
		name = symbol.CompiledName();
		if (symbol._members.length > 0)
			self.Comment("Class " + name);
		for (var member of symbol._members)
		{
			var method = member;
			self._scope = eco.Scope._New1(new eco.Scope(), method, null);
			if (method._inlineJS == "")
			{
				self.Write("function " + symbol.CompiledName() + "_" + method.CompiledName() + "(self", false);
				var params = method._parameters;
				for (var param of params)
				{
					var scopeItem = self._scope.GetItem(param.Name);
					self.Write(", " + scopeItem.CompiledName(), false);
				}

				self.WriteLine(") {", false);
				self.Indent();
				var block = method._block;
				if (block)
				{
					for (var stmt of block._statements)
						self.TranslateStatement(stmt, true);

				}
				self.Outdent();
				self.WriteLine("}", true);
				self.NewLine();
			}
			self._scope = null;
		}

		self.AddCommonCode(self.PopStack());
	};

	// virtual void TranslateEnum(string,Enum)
	JSTranslator.prototype.TranslateEnum = function(name, enm) {
		var self = this;
		self.WriteLine(enm.getFullName() + " = {", true);
		self.Indent();
		var count = 0;
		for (var key of Object.keys(enm._kv))
		{
			self.WriteLine(key + ": " + enm._kv[key] + (count < (Object.keys(enm._kv).length - 1) ? "," : ""), true);
			count++;
		}

		self.Outdent();
		self.WriteLine("};", true);
	};

	// void TranslateConstructor(Constructor,Class)
	JSTranslator.prototype.TranslateConstructor = function(constr, cls) {
		var self = this;
		self._scope = eco.Scope._New1(new eco.Scope(), constr, null);
		self.AddScope();
		self.DocComment1(constr);
		self.Write(cls._name + "." + constr.CompiledName() + " = function(self", true);
		var params = constr._parameters;
		for (var param of params)
		{
			var scopeItem = self._scope.GetItem(param.Name);
			self.Write(", " + scopeItem.CompiledName(), false);
		}

		self.WriteLine(") {", false);
		self.Indent();
		if (cls._baseClass)
		{
			if (constr._baseCall)
			{
				var foundConstr = cls._baseClass.GetMethod(constr._baseCall, self._scope, null);
				if (foundConstr)
				{
					self.Write("self = _base." + foundConstr.CompiledName(), true);
					self.TranslateArgListWithSelf(constr._baseCall._argList, foundConstr);
					self.WriteLine(" || self;", false);
				}
			}
			else
				self.WriteLine("self = _base." + cls._baseClass.BasicConstructor().CompiledName() + "(self) || self;", true);

		}
		var members = cls._members;
		for (var member of members)
		{
			if (member._memberType == eco.MemberType.Field && !member._static)
			{
				var field = member;
				if (field._defaultValue)
				{
					self.Write("self." + field._name + " = ", true);
					self.TranslateExpression(field._defaultValue);
					self.WriteLine(";", false);
				}
				else
					self.WriteLine("self." + field._name + " = " + self.GetTypeDefaultLiteral1(field._type) + ";", true);

			}
		}

		if (constr._block)
		{
			var statements = constr._block._statements;
			for (var statement of statements)
				self.TranslateStatement(statement, true);

		}
		self.WriteLine("return self;", true);
		self.Outdent();
		self.WriteLine("};", true);
		self.NewLine();
		self.PopScope();
		self._scope = null;
	};

	// void TranslateMethod(Method,Class)
	JSTranslator.prototype.TranslateMethod = function(method, cls) {
		var self = this;
		self._scope = eco.Scope._New1(new eco.Scope(), method, null);
		self.AddScope();
		var isStatic = method._static;
		self.DocComment1(method);
		self.Write(cls._name + (isStatic ? "" : ".prototype") + "." + method.CompiledName() + " = function(", true);
		var count = 0;
		var params = method._parameters;
		for (var param of params)
		{
			var scopeItem = self._scope.GetItem(param.Name);
			if (count > 0)
				self.Write(", ", false);
			self.Write(scopeItem.CompiledName(), false);
			count++;
		}

		self.WriteLine(") {", false);
		self.Indent();
		if (!isStatic)
			self.WriteLine("var self = this;", true);
		if (method._block)
		{
			var statements = method._block._statements;
			for (var statement of statements)
				self.TranslateStatement(statement, true);

		}
		self.Outdent();
		self.WriteLine("};", true);
		self.NewLine();
		self.PopScope();
		self._scope = null;
	};

	// string GetTypeDefaultLiteral(Interface)
	JSTranslator.prototype.GetTypeDefaultLiteral1 = function(type) {
		var self = this;
		if (type.IsEvent())
			return "[]";
		if (!type.IsBasic())
			return "null";
		switch (type._name)
		{
			case "bool":
				return "false";
			case "char":
				return "\"\"";
			case "int":
				return "0";
			case "float":
				return "0.0";
			case "string":
				return "\"\"";
		}
		return "null";
	};

	// void TranslateStatement(StatementNode,bool)
	JSTranslator.prototype.TranslateStatement = function(stmt, indentIf) {
		var self = this;
		switch (stmt._stmtType)
		{
			case eco.StatementType.Block:
				self.TranslateBlock(stmt);
				break;
			case eco.StatementType.VarDecl:
				self.TranslateVarDecl(stmt);
				break;
			case eco.StatementType.Return:
			{
				var ret = stmt;
				self.Write("return", true);
				if (ret._returnValue)
				{
					self.Write(" ", false);
					self.TranslateExpression(ret._returnValue);
				}
				self.Write(";", false);
				self.NewLine();
				break;
			}
			case eco.StatementType.If:
			{
				var ifStatement = stmt;
				self.Write("if (", indentIf);
				self.TranslateExpression(ifStatement._cond);
				self.WriteLine(")", false);
				if (ifStatement._then._stmtType == eco.StatementType.Block)
					self.TranslateStatement(ifStatement._then, true);
				else
				{
					self.Indent();
					self.TranslateStatement(ifStatement._then, true);
					self.Outdent();
				}

				if (ifStatement._else)
				{
					if (ifStatement._else._stmtType == eco.StatementType.If)
					{
						self.Write("else ", true);
						self.TranslateStatement(ifStatement._else, false);
					}
					else
					{
						self.WriteLine("else", true);
						if (ifStatement._else._stmtType == eco.StatementType.Block)
							self.TranslateStatement(ifStatement._else, true);
						else
						{
							self.Indent();
							self.TranslateStatement(ifStatement._else, true);
							self.Outdent();
						}

						self.NewLine();
					}

				}
				break;
			}
			case eco.StatementType.While:
			{
				var whileLoop = stmt;
				self.Write("while (", true);
				self.TranslateExpression(whileLoop._cond);
				self.WriteLine(")", false);
				self._loopDepth++;
				if (whileLoop._stmt._stmtType == eco.StatementType.Block)
					self.TranslateStatement(whileLoop._stmt, true);
				else
				{
					self.Indent();
					self.TranslateStatement(whileLoop._stmt, true);
					self.Outdent();
				}

				self._loopDepth--;
				self.NewLine();
				break;
			}
			case eco.StatementType.For:
			{
				var forLoop = stmt;
				self.Write("for (", true);
				var shouldIndent = self._shouldIndent;
				var shouldNewLine = self._shouldNewLine;
				self._shouldIndent = false;
				self._shouldNewLine = false;
				self.TranslateStatement(forLoop._init, true);
				self._shouldIndent = shouldIndent;
				self._shouldNewLine = shouldNewLine;
				self.Write(" ", false);
				self.TranslateExpression(forLoop._condition);
				self.Write("; ", false);
				self.TranslateExpression(forLoop._update);
				self.Write(")", false);
				self.NewLine();
				self._loopDepth++;
				if (forLoop._stmt._stmtType == eco.StatementType.Block)
					self.TranslateStatement(forLoop._stmt, true);
				else
				{
					self.Indent();
					self.TranslateStatement(forLoop._stmt, true);
					self.Outdent();
				}

				self._loopDepth--;
				self.NewLine();
				break;
			}
			case eco.StatementType.Foreach:
			{
				var forLoop1 = stmt;
				self.AddScope();
				var collectionType = forLoop1._collection.GetTypeOf(self._scope, null);
				if (!forLoop1._iterType2)
				{
					var iterType = null;
					if (forLoop1._iterType == eco.TypeNode.getVarType())
					{
						if (collectionType.IsArray())
							iterType = (collectionType)._elem;
						else if (collectionType.IsMap())
							iterType = (collectionType)._elem;
						else if (collectionType == eco.Interface.getObjectType())
							iterType = eco.Interface.getObjectType();
					}
					else
						iterType = self._scope._method._owner.GetType(forLoop1._iterType, null);

					var iterItem = self._scope.AddItem(iterType, forLoop1._iterName, false);
					self.Write("for (var " + iterItem.CompiledName() + " of ", true);
					self.TranslateExpression(forLoop1._collection);
					self.WriteLine(")", false);
					self._loopDepth++;
					if (forLoop1._statement._stmtType == eco.StatementType.Block)
						self.TranslateStatement(forLoop1._statement, true);
					else
					{
						self.Indent();
						self.TranslateStatement(forLoop1._statement, true);
						self.Outdent();
					}

					self._loopDepth--;
					self.NewLine();
				}
				else
				{
					var iterType1 = eco.Interface.getStringType();
					var iterType2 = null;
					if (forLoop1._iterType2 == eco.TypeNode.getVarType())
					{
						if (collectionType.IsMap())
							iterType2 = (collectionType)._elem;
						else if (collectionType == eco.Interface.getObjectType())
							iterType2 = eco.Interface.getObjectType();
					}
					else
						iterType2 = self._scope._method._owner.GetType(forLoop1._iterType2, null);

					var collectionItem = self._scope.AddItem(collectionType, "_collection", false);
					var iterItem1 = self._scope.AddItem(iterType1, forLoop1._iterName, false);
					var iterItem2 = self._scope.AddItem(iterType2, forLoop1._iterName2, false);
					self.Write("var " + collectionItem.CompiledName() + " = ", true);
					self.TranslateExpression(forLoop1._collection);
					self.WriteLine(";", false);
					self.WriteLine("for (var " + iterItem1.CompiledName() + " in " + collectionItem.CompiledName() + ")", true);
					self.WriteLine("{", true);
					self.Indent();
					self.WriteLine("var " + iterItem2.CompiledName() + " = " + collectionItem.CompiledName() + "[" + iterItem1.CompiledName() + "];", true);
					self._loopDepth++;
					if (forLoop1._statement._stmtType == eco.StatementType.Block)
					{
						var stmts = (forLoop1._statement)._statements;
						for (var stmt2 of stmts)
							self.TranslateStatement(stmt2, true);

					}
					else
						self.TranslateStatement(forLoop1._statement, true);

					self._loopDepth--;
					self.Outdent();
					self.WriteLine("}", true);
					self.NewLine();
				}

				self.PopScope();
				break;
			}
			case eco.StatementType.Break:
			{
				self.WriteLine("break;", true);
				break;
			}
			case eco.StatementType.Continue:
			{
				self.WriteLine("continue;", true);
				break;
			}
			case eco.StatementType.Assembly:
			{
				var assemblyNode = stmt;
				if (assemblyNode._targets.length == 0 || assemblyNode.HasTarget("JS"))
				{
					var items = [];
					self._scope.GetAllItems(items);
					self.Write("with({", true);
					var count = 0;
					for (var item of items)
					{
						if (count > 0)
							self.Write(", ", false);
						self.Write(item.Name + ": " + item.CompiledName(), false);
						count++;
					}

					self.WriteLine("})", false);
					self.WriteLine("{", true);
					self.Indent();
					self.WriteLine(assemblyNode._code, true);
					self.Outdent();
					self.WriteLine("}", true);
				}
				break;
			}
			case eco.StatementType.Target:
			{
				var targetNode = stmt;
				if (targetNode.HasTarget("JS"))
				{
					var stmts1 = targetNode._block._statements;
					for (var stmt3 of stmts1)
						self.TranslateStatement(stmt3, true);

				}
				break;
			}
			case eco.StatementType.TryCatch:
			{
				var tryCatchNode = stmt;
				self.WriteLine("try", true);
				self.TranslateBlock(tryCatchNode._tryBlock);
				self.WriteLine("catch (" + tryCatchNode._catchName + ")", true);
				self.AddScope();
				self._scope.AddItem(self._scope._method._owner.GetType(tryCatchNode._catchType, null), tryCatchNode._catchName, false);
				self.TranslateBlock(tryCatchNode._catchBlock);
				self.PopScope();
				break;
			}
			case eco.StatementType.Throw:
			{
				var throwNode = stmt;
				self.Write("throw ", true);
				self.TranslateExpression(throwNode._expr);
				self.WriteLine(";", false);
				break;
			}
			case eco.StatementType.Switch:
			{
				var switchNode = stmt;
				self.Write("switch (", true);
				self.TranslateExpression(switchNode._value);
				self.WriteLine(")", false);
				self.WriteLine("{", true);
				self.Indent();
				self.AddScope();
				for (var caseNode of switchNode._cases)
				{
					self.Write("case ", true);
					self.TranslateExpression(caseNode._value);
					self.WriteLine(":", false);
					for (var caseStmt of caseNode._statements)
					{
						if (caseStmt._stmtType != eco.StatementType.Block)
							self.Indent();
						self.TranslateStatement(caseStmt, true);
						if (caseStmt._stmtType != eco.StatementType.Block)
							self.Outdent();
					}

				}

				if (switchNode._defaultCase)
				{
					self.WriteLine("default:", true);
					for (var defaultStmt of switchNode._defaultCase._statements)
					{
						if (defaultStmt._stmtType != eco.StatementType.Block)
							self.Indent();
						self.TranslateStatement(defaultStmt, true);
						if (defaultStmt._stmtType != eco.StatementType.Block)
							self.Outdent();
					}

				}
				self.PopScope();
				self.Outdent();
				self.WriteLine("}", true);
				break;
			}
			case eco.StatementType.Await:
			{
				var awaitNode = stmt;
				var responderTypeNode = awaitNode._responder._parent;
				var responderName = awaitNode._responder._name;
				var responderType = self._serverSymbolTable.GetType(responderTypeNode, null);
				var callNode = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), responderName);
				for (var arg of awaitNode._argList)
					callNode._argList.push(arg);

				var responderMethod = responderType.GetMethod(callNode, self._scope, null);
				self.Write("__performAwait(\"" + self.QualifyName(responderType.getFullName()) + "\", \"" + responderMethod.CompiledName() + "\", [", true);
				var count1 = 0;
				for (var arg1 of awaitNode._argList)
				{
					if (count1 > 0)
						self.Write(", ", false);
					self.TranslateExpression(arg1);
					count1++;
				}

				self.Write("], function(", false);
				var statusVarName = "status";
				if (awaitNode._statusVarName != "")
					statusVarName = awaitNode._statusVarName;
				var resultType = self._scope._method._owner.GetType(awaitNode._resultType, null);
				var scopeResult = self._scope.AddItem(resultType, awaitNode._resultVarName, false);
				var scopeStatus = self._scope.AddItem(eco.Interface.getIntType(), statusVarName, false);
				self.Write(scopeResult.CompiledName() + ", " + scopeStatus.CompiledName(), false);
				self.WriteLine(") {", false);
				self.Indent();
				self.AddScope();
				var statements = awaitNode._block._statements;
				for (var statement of statements)
					self.TranslateStatement(statement, true);

				self.PopScope();
				self.Outdent();
				self.WriteLine("});", true);
				self.NewLine();
				break;
			}
			case eco.StatementType.Expression:
			{
				self.Write("", true);
				self.TranslateExpression(stmt);
				self.Write(";", false);
				self.NewLine();
				break;
			}
		}
	};

	// void TranslateBlock(BlockNode)
	JSTranslator.prototype.TranslateBlock = function(block) {
		var self = this;
		self.WriteLine("{", true);
		self.Indent();
		self.AddScope();
		var statements = block._statements;
		for (var statement of statements)
			self.TranslateStatement(statement, true);

		self.PopScope();
		self.Outdent();
		self.WriteLine("}", true);
	};

	// void TranslateVarDecl(VarDeclNode)
	JSTranslator.prototype.TranslateVarDecl = function(varDecl) {
		var self = this;
		var intr = null;
		var varType = varDecl._varType;
		if (varType == eco.TypeNode.getVarType())
			intr = varDecl._expr.GetTypeOf(self._scope, null);
		else
			intr = self._scope._method._owner.GetType(varDecl._varType, null);

		var item = self._scope.AddItem(intr, varDecl._name, false);
		item.Visible = false;
		self.Write("var " + item.CompiledName(), true);
		if (varDecl._expr)
		{
			self.Write(" = ", false);
			self.TranslateExpression(varDecl._expr);
			self.Write(";", false);
		}
		else
			self.Write(" = " + self.GetTypeDefaultLiteral1(intr) + ";", false);

		self.NewLine();
		item.Visible = true;
	};

	// void TranslateExpression(ExpressionNode)
	JSTranslator.prototype.TranslateExpression = function(expr) {
		var self = this;
		if (self.DebugMode && self._expressionLocations && expr._startLine > 1)
		{
			if (((self._expressionLocations)[self._currentFileID + ":" + expr._startLine] !== undefined))
			{
				self._expressionMappings["" + self._currentLine] = {"line": expr._startLine, "column": expr._startColumn, "file": self._currentFileID};
			}
		}
		switch (expr._exprType)
		{
			case eco.ExpressionType.None:
				break;
			case eco.ExpressionType.Lit:
				self.Write((expr)._lit._value, false);
				break;
			case eco.ExpressionType.Load:
			{
				var load = expr;
				if (load._native)
					self.Write(load._varName, false);
				else
				{
					var scopeItem = self._scope.GetItem(load._varName);
					if (scopeItem)
					{
						self.CurrentCaptureList().AddItem(scopeItem);
						self.Write(scopeItem.CompiledName(), false);
					}
					else
					{
						var cls = self._scope._method._owner;
						var found = cls.GetMember(load._varName);
						if (found)
						{
							if (found._memberType == eco.MemberType.Field)
							{
								var field = found;
								if (field._static)
									self.Write(self._scope._method._owner._name + "." + field._name, false);
								else
									self.Write("self." + found._name, false);

							}
							else if (found._memberType == eco.MemberType.Property)
							{
								var property = found;
								if (property._static)
									self.Write(self._scope._method._owner._name + ".get" + found.CompiledName() + "()", false);
								else
									self.Write("self.get" + found.CompiledName() + "()", false);

							}
						}
					}

				}

				break;
			}
			case eco.ExpressionType.Access:
			{
				var access = expr;
				var intr = access._expr.GetTypeOf(self._scope, null);
				if (intr == eco.Interface.getObjectType())
				{
					self.TranslateExpression(access._expr);
					self.Write(".", false);
					self.Write(access._field, false);
					return;
				}
				else if (intr && intr.IsMap())
				{
					self.TranslateExpression(access._expr);
					self.Write("[\"", false);
					self.Write(access._field, false);
					self.Write("\"]", false);
					return;
				}
				if (intr && intr != eco.Interface.getNullType() && intr.GetSymbolType() != eco.SymbolType.Enum)
					self.TranslateExpression(access._expr);
				else
				{
					if (!intr || intr == eco.Interface.getNullType())
						intr = access._expr.TryGetType(self._scope);
					if (intr.GetSymbolType() == eco.SymbolType.Enum)
					{
						var enm = intr;
						self.Write(enm.GetSignatureTo(enm.GetRootNamespace()) + "." + access._field, false);
						return;
					}
					else
						self.Write(intr.GetSignatureTo(intr.GetRootNamespace()), false);

				}

				var found1 = intr.GetMember(access._field);
				if (found1)
				{
					if (found1._memberType == eco.MemberType.Field)
					{
						self.Write(".", false);
						self.Write(access._field, false);
					}
					else if (found1._memberType == eco.MemberType.Property)
					{
						var getter = intr.GetMember("get" + found1.CompiledName() + "()");
						var isSimpleReturn = false;
						if (getter._block)
						{
							var statements = getter._block._statements;
							var isOnlyReturn = statements.length == 1 && statements[0]._stmtType == eco.StatementType.Return;
							if (isOnlyReturn)
							{
								var returnStatement = statements[0];
								var returnValue = returnStatement._returnValue;
								if (returnValue._exprType == eco.ExpressionType.Load)
								{
									isSimpleReturn = true;
									self.Write("." + (returnValue)._varName, false);
								}
							}
						}
						if (!isSimpleReturn)
							self.Write(".get" + found1.CompiledName() + "()", false);
					}
				}
				break;
			}
			case eco.ExpressionType.ArrayAccess:
			{
				var access1 = expr;
				var intr1 = access1._expr.GetTypeOf(self._scope, null);
				if (intr1 && (intr1.IsArray() || intr1.IsMap() || intr1 == eco.Interface.getStringType() || intr1 == eco.Interface.getObjectType()))
				{
					self.TranslateExpression(access1._expr);
					self.Write("[", false);
					self.TranslateExpression(access1._index);
					self.Write("]", false);
				}
				break;
			}
			case eco.ExpressionType.New:
			{
				var newNode = expr;
				if (newNode._isNative)
				{
					self.Write("new " + newNode._newType.getFullName(), false);
					self.TranslateArgList(newNode._argList, null);
				}
				else
				{
					var type = self._scope._method._owner.GetType(newNode._newType, null);
					if (type.IsArray())
					{
						self.Write("[]", false);
						return;
					}
					else if (type.IsMap())
					{
						self.Write("{}", false);
						return;
					}
					var cls1 = type;
					var call = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), "_New");
					call.setArgList(newNode._argList);
					var found2 = cls1.GetMethod(call, self._scope, null);
					var signature = cls1.GetSignatureTo(cls1.GetRootNamespace());
					self.Write(signature + "." + found2.CompiledName(), false);
					self.Write("(new " + signature + "()", false);
					var args = call._argList;
					if (args.length > 0)
					{
						for (var arg of args)
						{
							self.Write(", ", false);
							self.TranslateExpression(arg);
						}

						if (args.length < found2._parameters.length)
						{
							for (var a = args.length; a < found2._parameters.length; a++)
							{
								self.Write(", ", false);
								self.Write(found2._parameters[a].Default, false);
							}

						}
					}
					self.Write(")", false);
				}

				break;
			}
			case eco.ExpressionType.Call:
			{
				var call1 = expr;
				var found3 = self._scope._method._owner.GetMethod(call1, self._scope, null);
				if (!found3)
				{
					if (call1._isNative)
						self.Write(call1._name, false);
					else
					{
						var scopeItem1 = self._scope.GetItem(call1._name);
						if (scopeItem1)
							self.Write(scopeItem1.CompiledName(), false);
						else
						{
							var member = self._scope._method._owner.GetMember(call1._name);
							if (member && member._memberType == eco.MemberType.Field)
							{
								if (member._static)
									self.Write(self._scope._method._owner._name + "." + member._name, false);
								else
									self.Write("self." + member._name, false);

							}
						}

					}

					self.Write("(", false);
					var args1 = call1._argList;
					if (args1.length > 0)
					{
						self.TranslateExpression(args1[0]);
						for (var a1 = 1; a1 < args1.length; a1++)
						{
							self.Write(", ", false);
							self.TranslateExpression(args1[a1]);
						}

					}
					self.Write(")", false);
					return;
				}
				if (found3._static)
					self.Write(self._scope._method._owner._name, false);
				else
					self.Write("self", false);

				self.Write("." + found3.CompiledName(), false);
				self.TranslateArgList(call1._argList, found3);
				break;
			}
			case eco.ExpressionType.MethodCall:
			{
				var call2 = expr;
				var intr2 = call2._expr.GetTypeOf(self._scope, null);
				if (intr2)
				{
					if (intr2 == eco.Interface.getObjectType())
					{
						var method = intr2.GetMethod(call2._call, self._scope, null);
						if (method)
						{
							self.PushStack();
							self.TranslateExpression(call2._expr);
							var exprTrans = self.PopStack();
							var put = method._inlineJS.split("$t").join(exprTrans);
							var count = 1;
							for (var arg1 of call2._call._argList)
							{
								self.PushStack();
								self.TranslateExpression(arg1);
								var argTrans = self.PopStack();
								put = put.split("$" + count).join(argTrans);
								count++;
							}

							self.Write(put, false);
						}
						else
						{
							self.TranslateExpression(call2._expr);
							self.Write(".", false);
							self.Write(call2._call._name, false);
							self.TranslateArgList(call2._call._argList, null);
						}

					}
					else
					{
						var method1 = intr2.GetMethod(call2._call, self._scope, null);
						if (method1)
						{
							if (intr2.IsClass() && (intr2)._isNative)
							{
								if (method1._inlineJS == "")
								{
									self.Write(intr2.CompiledName() + "_" + method1.CompiledName() + "(", false);
									self.TranslateExpression(call2._expr);
									var args2 = call2._call._argList;
									for (var arg2 of args2)
									{
										self.Write(", ", false);
										self.TranslateExpression(arg2);
									}

									self.Write(")", false);
								}
								else
								{
									self.PushStack();
									self.TranslateExpression(call2._expr);
									var exprTrans1 = self.PopStack();
									var put1 = method1._inlineJS.split("$t").join(exprTrans1);
									var count1 = 1;
									for (var arg3 of call2._call._argList)
									{
										self.PushStack();
										self.TranslateExpression(arg3);
										var argTrans1 = self.PopStack();
										put1 = put1.split("$" + count1).join(argTrans1);
										count1++;
									}

									self.Write(put1, false);
								}

							}
							else if (!intr2.IsClass())
							{
								if (intr2.IsInline() || intr2.IsDefined)
								{
									self.TranslateExpression(call2._expr);
									self.Write(".", false);
									self.Write(method1._name, false);
									self.TranslateArgList(call2._call._argList, method1);
								}
							}
							else
							{
								self.TranslateExpression(call2._expr);
								self.Write(".", false);
								self.Write(method1.CompiledName(), false);
								self.TranslateArgList(call2._call._argList, method1);
							}

						}
						else
						{
							self.TranslateExpression(call2._expr);
							self.Write(".", false);
							self.Write(call2._call._name, false);
							self.TranslateArgList(call2._call._argList, null);
						}

					}

				}
				else
				{
					intr2 = call2._expr.TryGetType(self._scope);
					self.Write(intr2.GetSignatureTo(intr2.GetRootNamespace()) + ".", false);
					var found4 = intr2.GetMethod(call2._call, self._scope, null);
					if (found4)
					{
						self.Write(found4.CompiledName(), false);
						self.TranslateArgList(call2._call._argList, found4);
					}
					else
					{
						self.Write(call2._call._name, false);
						self.TranslateArgList(call2._call._argList, null);
					}

				}

				break;
			}
			case eco.ExpressionType.ComplexCall:
			{
				var complex = expr;
				self.TranslateExpression(complex._obj);
				self.Write("(", false);
				var args3 = complex._argList;
				if (args3.length > 0)
				{
					self.TranslateExpression(args3[0]);
					for (var a2 = 1; a2 < args3.length; a2++)
					{
						self.Write(", ", false);
						self.TranslateExpression(args3[a2]);
					}

				}
				self.Write(")", false);
				break;
			}
			case eco.ExpressionType.BaseCall:
			{
				var baseCall = expr;
				var baseClass = (self._scope._method._owner)._baseClass;
				var found5 = baseClass.GetMethod(baseCall, self._scope, null);
				self.Write("_base.prototype." + found5.CompiledName() + ".call", false);
				self.TranslateArgListWithSelf(baseCall._argList, found5);
				break;
			}
			case eco.ExpressionType.Function:
			{
				var func = expr;
				var translateFunction = function () {
					self.AddScope();
					self.Write("function (", false);
					var count2 = 0;
					for (var param of func._params)
					{
						var type1 = self._scope._method._owner.GetType(param.type, null);
						var scopeItem2 = self._scope.AddItem(type1, param.name, false);
						if (count2 > 0)
							self.Write(", ", false);
						self.Write(scopeItem2.CompiledName(), false);
						count2++;
					}

					self.WriteLine(") {", false);
					self.Indent();
					var block = func._block;
					for (var stmt of block._statements)
						self.TranslateStatement(stmt, true);

					self.Outdent();
					self.Write("}", true);
					self.PopScope();
				};
				if (self._loopDepth > 0)
				{
					var scopeSize = self._scope._size;
					self.PushCaptureList();
					self.PushStack();
					translateFunction();
					var funcContents = self.PopStack();
					var captured = self.PopCaptureList()._items;
					var external = [];
					for (var c of captured)
					{
						if (c.Index <= scopeSize)
							external.push(c);
					}

					var capturedList = "";
					var count3 = 0;
					for (var e of external)
					{
						if (count3 > 0)
							capturedList = capturedList + ", ";
						capturedList = capturedList + e.CompiledName();
						count3++;
					}

					self.WriteLine("(function(" + capturedList + ") {", false);
					self.Indent();
					self.Write("return ", true);
					self.Indent();
					self.Write(funcContents, false);
					self.Write(";", false);
					self.NewLine();
					self.Outdent();
					self.Outdent();
					self.Write("})(" + capturedList + ")", true);
				}
				else
				{
					translateFunction();
				}

				break;
			}
			case eco.ExpressionType.Par:
			{
				self.Write("(", false);
				self.TranslateExpression((expr)._sub);
				self.Write(")", false);
				break;
			}
			case eco.ExpressionType.Op:
			{
				var opExpr = expr;
				switch (opExpr._op)
				{
					case eco.OpType.Assign:
					{
						self.TranslateStore(opExpr._expr1, opExpr._expr2);
						break;
					}
					case eco.OpType.AAdd:
					case eco.OpType.ASub:
					case eco.OpType.AMul:
					case eco.OpType.ADiv:
					case eco.OpType.AExp:
					case eco.OpType.AMod:
					{
						var opType = eco.OpType.Add;
						switch (opExpr._op)
						{
							case eco.OpType.AAdd:
								opType = eco.OpType.Add;
								break;
							case eco.OpType.ASub:
								opType = eco.OpType.Sub;
								break;
							case eco.OpType.AMul:
								opType = eco.OpType.Mult;
								break;
							case eco.OpType.ADiv:
								opType = eco.OpType.Div;
								break;
							case eco.OpType.AExp:
								opType = eco.OpType.Exp;
								break;
							case eco.OpType.AMod:
								opType = eco.OpType.Mod;
								break;
							default:
								break;
						}
						var newOpNode = eco.OperatorExpressionNode._New4(new eco.OperatorExpressionNode(), opType);
						newOpNode.setExpression1(opExpr._expr1);
						newOpNode.setExpression2(opExpr._expr2);
						self.TranslateStore(opExpr._expr1, newOpNode);
						break;
					}
					default:
					{
						self.TranslateExpression(opExpr._expr1);
						self.Write(" ", false);
						self.Write(eco.TokenOp.GetOpName(opExpr._op), false);
						self.Write(" ", false);
						self.TranslateExpression(opExpr._expr2);
						break;
					}
				}
				break;
			}
			case eco.ExpressionType.PreOp:
			{
				var op = expr;
				self.Write(eco.TokenOp.GetOpName(op._op), false);
				self.TranslateExpression(op._expr1);
				break;
			}
			case eco.ExpressionType.PostOp:
			{
				var op1 = expr;
				self.TranslateExpression(op1._expr1);
				self.Write(eco.TokenOp.GetOpName(op1._op), false);
				break;
			}
			case eco.ExpressionType.CondOp:
			{
				var cond = expr;
				self.TranslateExpression(cond._expr1);
				self.Write(" ? ", false);
				self.TranslateExpression(cond._expr2);
				self.Write(" : ", false);
				self.TranslateExpression(cond._expr3);
				break;
			}
			case eco.ExpressionType.LitArray:
			{
				var litArray = expr;
				self.Write("[", false);
				var items = litArray._items;
				if (items.length > 0)
				{
					self.TranslateExpression(items[0]);
					for (var i = 1; i < items.length; i++)
					{
						self.Write(", ", false);
						self.TranslateExpression(items[i]);
					}

				}
				self.Write("]", false);
				break;
			}
			case eco.ExpressionType.Map:
			{
				var litMap = expr;
				self.Write("{", false);
				var items1 = litMap._items;
				var keys = Object.keys(items1);
				if (keys.length > 0)
				{
					self.Write('"' + keys[0] + '"' + ": ", false);
					self.TranslateExpression(items1[keys[0]]);
					for (var i1 = 1; i1 < keys.length; i1++)
					{
						self.Write(", ", false);
						self.Write('"' + keys[i1] + '"' + ": ", false);
						self.TranslateExpression(items1[keys[i1]]);
					}

				}
				self.Write("}", false);
				break;
			}
			case eco.ExpressionType.Typecast:
			{
				var typecast = expr;
				var toType = self._scope._method._owner.GetType(typecast._type, null);
				var fromType = typecast._expr.GetTypeOf(self._scope, null);
				var castFloatToInt = false;
				if (fromType == eco.Interface.getFloatType() && toType == eco.Interface.getIntType())
				{
					castFloatToInt = true;
					self.Write("Math.floor(", false);
				}
				self.TranslateExpression(typecast._expr);
				if (castFloatToInt)
					self.Write(")", false);
				break;
			}
			case eco.ExpressionType.Assembly:
			{
				var assembly = expr;
				self.Write(assembly._assembly, false);
				break;
			}
			case eco.ExpressionType.HTML:
			{
				self.TranslateHTML(expr);
				break;
			}
			case eco.ExpressionType.HTMLText:
			{
				self.TranslateHTMLText(expr);
				break;
			}
			case eco.ExpressionType.HTMLCode:
			{
				self.TranslateExpression((expr)._code);
				break;
			}
		}
	};

	// void TranslateHTML(HTMLExpressionNode)
	JSTranslator.prototype.TranslateHTML = function(html) {
		var self = this;
		var htmlClass = self._symbolTable.GetNamespaceBySignature("std", false).GetNamespaceBySignature("html", false).GetNamespaceBySignature("HTMLElement", false);
		var constr = htmlClass.GetMember("_New(string,map<object>,object)");
		var attr = html._attr;
		var clone = html._attrClone;
		var children = html._children;
		if (html.IsBasic())
		{
			self.Write("std.html.HTMLElement." + constr.CompiledName() + "(new std.html.HTMLElement(), \"" + html._elem._name + "\", ", false);
			if (clone)
				self.Write("Object.assign({", false);
			else
				self.Write("{", false);

			if (Object.keys(attr).length > 0)
			{
				self.Write("\"" + Object.keys(attr)[0] + "\": ", false);
				self.TranslateExpression(attr[Object.keys(attr)[0]]);
				for (var a = 1; a < Object.keys(attr).length; a++)
				{
					self.Write(", \"" + Object.keys(attr)[a] + "\": ", false);
					self.TranslateExpression(attr[Object.keys(attr)[a]]);
				}

			}
			if (clone)
			{
				self.Write("}, ", false);
				self.TranslateExpression(clone);
				self.Write("), ", false);
			}
			else
				self.Write("}, ", false);

			if (children.length > 0)
			{
				if (children[0]._exprType == eco.ExpressionType.HTMLCode)
				{
					var code = children[0];
					var ctype = code._code.GetTypeOf(self._scope, null);
					if (ctype.IsArray())
					{
						self.TranslateExpression(code._code);
						self.Write(")", false);
						return;
					}
				}
				self.Write("[", false);
				self.TranslateExpression(children[0]);
				for (var c = 1; c < children.length; c++)
				{
					self.Write(", ", false);
					self.TranslateExpression(children[c]);
				}

				self.Write("]", false);
			}
			else
				self.Write("[]", false);

			self.Write(")", false);
		}
		else
		{
			var found = self._scope._method._owner.GetInterfaceFromTypeNode(html._elem);
			if (found)
			{
				if (found.GetSymbolType() == eco.SymbolType.Template)
				{
					var templ = found;
					self.Write(found.getFullName() + "({", false);
					if (Object.keys(attr).length > 0)
					{
						self.Write("\"" + Object.keys(attr)[0] + "\": ", false);
						self.TranslateExpression(attr[Object.keys(attr)[0]]);
						for (var a1 = 1; a1 < Object.keys(attr).length; a1++)
						{
							self.Write(", \"" + Object.keys(attr)[a1] + "\": ", false);
							self.TranslateExpression(attr[Object.keys(attr)[a1]]);
						}

					}
					self.Write("}, [", false);
					if (children.length > 0)
					{
						self.TranslateExpression(children[0]);
						for (var c1 = 1; c1 < children.length; c1++)
						{
							self.Write(", ", false);
							self.TranslateExpression(children[c1]);
						}

					}
					self.Write("])", false);
				}
				else
				{
				}

			}
		}

	};

	// void TranslateHTMLText(HTMLTextExpressionNode)
	JSTranslator.prototype.TranslateHTMLText = function(html) {
		var self = this;
		var htmlClass = self._symbolTable.GetNamespaceBySignature("std", false).GetNamespaceBySignature("html", false).GetNamespaceBySignature("HTMLTextElement", false);
		var constr = htmlClass.GetMember("_New(string)");
		self.Write("std.html.HTMLTextElement." + constr.CompiledName() + "(new std.html.HTMLTextElement(), ", false);
		self.TranslateExpression(html._text);
		self.Write(")", false);
	};

	// void TranslateStore(ExpressionNode,ExpressionNode)
	JSTranslator.prototype.TranslateStore = function(dest, val) {
		var self = this;
		var intr = self._scope._method._owner;
		var prop = null;
		if (dest._exprType == eco.ExpressionType.Load)
		{
			var ldest = dest;
			var found = self._scope._method._owner.GetMember(ldest._varName);
			if (found && found._memberType == eco.MemberType.Property)
			{
				self.Write("self", false);
				prop = found;
			}
		}
		else if (dest._exprType == eco.ExpressionType.Access)
		{
			var staticAccess = false;
			var ldest1 = dest;
			intr = ldest1._expr.GetTypeOf(self._scope, null);
			if (!intr)
			{
				intr = ldest1._expr.TryGetType(self._scope);
				staticAccess = true;
			}
			if (intr)
			{
				var found1 = intr.GetMember(ldest1._field);
				if (found1 && found1._memberType == eco.MemberType.Property)
				{
					if (!staticAccess)
						self.TranslateExpression(ldest1._expr);
					else
						self.Write(intr.GetSignatureTo(self._scope._method._owner._namespace), false);

					prop = found1;
				}
			}
		}
		if (prop)
		{
			var found2 = intr.GetMember("set" + prop.CompiledName() + "(" + prop._type.Signature() + ")");
			self.Write("." + found2.CompiledName() + "(", false);
		}
		else
		{
			self.TranslateExpression(dest);
			self.Write(" = ", false);
		}

		self.TranslateExpression(val);
		if (prop)
			self.Write(")", false);
	};

	// void TranslateArgList(ExpressionNode[],Method)
	JSTranslator.prototype.TranslateArgList = function(args, call) {
		var self = this;
		self.Write("(", false);
		if (args.length > 0)
		{
			if (!call)
			{
				self.TranslateExpression(args[0]);
				for (var a = 1; a < args.length; a++)
				{
					self.Write(", ", false);
					self.TranslateExpression(args[a]);
				}

			}
			else
			{
				self.TranslateExpression(args[0]);
				for (var a1 = 1; a1 < args.length; a1++)
				{
					self.Write(", ", false);
					self.TranslateExpression(args[a1]);
				}

				if (args.length < call._parameters.length)
				{
					for (var a2 = args.length; a2 < call._parameters.length; a2++)
					{
						self.Write(", ", false);
						self.Write(call._parameters[a2].Default, false);
					}

				}
			}

		}
		else if (call && call._parameters && call._parameters.length > 0)
		{
			self.Write(call._parameters[0].Default, false);
			for (var a3 = 1; a3 < call._parameters.length; a3++)
			{
				self.Write(", ", false);
				self.Write(call._parameters[a3].Default, false);
			}

		}
		self.Write(")", false);
	};

	// void TranslateArgListWithSelf(ExpressionNode[],Method)
	JSTranslator.prototype.TranslateArgListWithSelf = function(args, call) {
		var self = this;
		self.Write("(self", false);
		for (var arg of args)
		{
			self.Write(", ", false);
			self.TranslateExpression(arg);
		}

		if (args.length < call._parameters.length)
		{
			for (var a = args.length; a < call._parameters.length; a++)
			{
				self.Write(", ", false);
				self.Write(call._parameters[a].Default, false);
			}

		}
		self.Write(")", false);
	};

	// void AddScope()
	JSTranslator.prototype.AddScope = function() {
		var self = this;
		if (self._scope)
		{
			var newScope = eco.Scope._New1(new eco.Scope(), self._scope._method, self._scope);
			self._scope = newScope;
		}
	};

	// void PopScope()
	JSTranslator.prototype.PopScope = function() {
		var self = this;
		if (self._scope)
			self._scope = self._scope._parent;
	};

	return JSTranslator;
}(eco.Translator));

/**

 */
eco.TokenAsm = (function(_base) {
	__extends(TokenAsm, _base);

	function TokenAsm() {
	}

	// Constructor _New()
	TokenAsm._New2 = function(self) {
		self = _base._New(self) || self;
		self._targs = [];
		return self;
	};

	/**

	 */
	TokenAsm._New3 = function(self, asmstr) {
		self = _base._New1(self, eco.TokenType.AsmStr, asmstr) || self;
		self._targs = [];
		return self;
	};

	// string[] getTargets()
	TokenAsm.prototype.getTargets = function() {
		var self = this;
		return self._targs;
	};

	return TokenAsm;
}(eco.Token));

/**

 */
eco.TokenOp = (function(_base) {
	__extends(TokenOp, _base);

	function TokenOp() {
	}

	// Constructor _New()
	TokenOp._New2 = function(self) {
		self = _base._New(self) || self;
		self._opType = null;
		return self;
	};

	/**

	 */
	TokenOp._New3 = function(self, op) {
		self = _base._New1(self, eco.TokenType.Operator, null) || self;
		self._opType = null;
		self._opType = op;
		return self;
	};

	/**

	 */
	TokenOp.prototype.IsPreOp = function() {
		var self = this;
		return self._opType == eco.OpType.Inc || self._opType == eco.OpType.Dec || self._opType == eco.OpType.Sub || self._opType == eco.OpType.Not;
	};

	/**

	 */
	TokenOp.prototype.IsPostOp = function() {
		var self = this;
		return self._opType == eco.OpType.Inc || self._opType == eco.OpType.Dec;
	};

	// OpType getOp()
	TokenOp.prototype.getOp = function() {
		var self = this;
		return self._opType;
	};

	/**

	 */
	TokenOp.GetOpName = function(op) {
		switch (op)
		{
			case eco.OpType.Mult:
				return "*";
			case eco.OpType.Div:
				return "/";
			case eco.OpType.Exp:
				return "^";
			case eco.OpType.Add:
				return "+";
			case eco.OpType.Sub:
				return "-";
			case eco.OpType.Mod:
				return "%";
			case eco.OpType.CmpGT:
				return ">";
			case eco.OpType.CmpLT:
				return "<";
			case eco.OpType.CmpGTE:
				return ">=";
			case eco.OpType.CmpLTE:
				return "<=";
			case eco.OpType.CmpEq:
				return "==";
			case eco.OpType.CmpNEq:
				return "!=";
			case eco.OpType.And:
				return "&&";
			case eco.OpType.Or:
				return "||";
			case eco.OpType.Not:
				return "!";
			case eco.OpType.Cond:
				return "?:";
			case eco.OpType.Inc:
				return "++";
			case eco.OpType.Dec:
				return "--";
			case eco.OpType.Assign:
				return "=";
			case eco.OpType.AAdd:
				return "+=";
			case eco.OpType.ASub:
				return "-=";
			case eco.OpType.AMul:
				return "*=";
			case eco.OpType.ADiv:
				return "/=";
			case eco.OpType.AExp:
				return "^=";
			case eco.OpType.AMod:
				return "%=";
			case eco.OpType.Connect:
				return "connect";
		}
		return "";
	};

	return TokenOp;
}(eco.Token));

/**

 */
eco.ImportNode = (function(_base) {
	__extends(ImportNode, _base);

	function ImportNode() {
	}

	// Constructor _New()
	ImportNode._New1 = function(self) {
		self = _base._New(self) || self;
		self.ImportFile = "";
		self.AsNames = null;
		return self;
	};

	// Constructor _New(string)
	ImportNode._New2 = function(self, importFile) {
		self = _base._New(self) || self;
		self.ImportFile = "";
		self.AsNames = null;
		self._astType = eco.ASTType.Import;
		self.ImportFile = importFile;
		self.AsNames = [];
		return self;
	};

	return ImportNode;
}(eco.ParseNode));

/**

 */
eco.NamespaceNode = (function(_base) {
	__extends(NamespaceNode, _base);

	function NamespaceNode() {
	}

	// Constructor _New()
	NamespaceNode._New1 = function(self) {
		self = _base._New(self) || self;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._name = "";
		self._children = [];
		self._usedNamespaces = [];
		self._docs = null;
		return self;
	};

	// Constructor _New(string)
	NamespaceNode._New2 = function(self, name) {
		self = _base._New(self) || self;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._name = "";
		self._children = [];
		self._usedNamespaces = [];
		self._docs = null;
		self._name = name;
		self._astType = eco.ASTType.Namespace;
		self._docs = null;
		return self;
	};

	// int getDefinitionEndLine()
	NamespaceNode.prototype.getDefinitionEndLine = function() {
		var self = this;
		return self._defEndLine;
	};

	// int setDefinitionEndLine(int)
	NamespaceNode.prototype.setDefinitionEndLine = function(value) {
		var self = this;
		self._defEndLine = value;
	};

	// int getDefinitionEndColumn()
	NamespaceNode.prototype.getDefinitionEndColumn = function() {
		var self = this;
		return self._defEndColumn;
	};

	// int setDefinitionEndColumn(int)
	NamespaceNode.prototype.setDefinitionEndColumn = function(value) {
		var self = this;
		self._defEndColumn = value;
	};

	// string getName()
	NamespaceNode.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// string setName(string)
	NamespaceNode.prototype.setName = function(value) {
		var self = this;
		self._name = value;
	};

	// NamespaceNode[] getChildren()
	NamespaceNode.prototype.getChildren = function() {
		var self = this;
		return self._children;
	};

	/**

	 */
	NamespaceNode.prototype.AddChild = function(node) {
		var self = this;
		self._children.push(node);
	};

	// TypeNode[] getUsedNamespaces()
	NamespaceNode.prototype.getUsedNamespaces = function() {
		var self = this;
		return self._usedNamespaces;
	};

	/**

	 */
	NamespaceNode.prototype.UseNamespace = function(node) {
		var self = this;
		self._usedNamespaces.push(node);
	};

	// SymbolDoc getDocs()
	NamespaceNode.prototype.getDocs = function() {
		var self = this;
		return self._docs;
	};

	// SymbolDoc setDocs(SymbolDoc)
	NamespaceNode.prototype.setDocs = function(value) {
		var self = this;
		self._docs = value;
	};

	return NamespaceNode;
}(eco.ParseNode));

/**

 */
eco.MemberNode = (function(_base) {
	__extends(MemberNode, _base);

	function MemberNode() {
	}

	// Constructor _New()
	MemberNode._New1 = function(self) {
		self = _base._New(self) || self;
		self._type = null;
		self._name = "";
		self._access = null;
		self._static = false;
		self._docs = null;
		return self;
	};

	// Constructor _New(TypeNode,string)
	MemberNode._New2 = function(self, type, name) {
		self = _base._New(self) || self;
		self._type = null;
		self._name = "";
		self._access = null;
		self._static = false;
		self._docs = null;
		self._type = type;
		self._name = name;
		self._docs = null;
		self._astType = eco.ASTType.Member;
		return self;
	};

	// TypeNode getType()
	MemberNode.prototype.getType1 = function() {
		var self = this;
		return self._type;
	};

	// string getName()
	MemberNode.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// MemberAccess getAccess()
	MemberNode.prototype.getAccess = function() {
		var self = this;
		return self._access;
	};

	// MemberAccess setAccess(MemberAccess)
	MemberNode.prototype.setAccess = function(value) {
		var self = this;
		self._access = value;
	};

	// bool getStatic()
	MemberNode.prototype.getStatic = function() {
		var self = this;
		return self._static;
	};

	// bool setStatic(bool)
	MemberNode.prototype.setStatic = function(value) {
		var self = this;
		self._static = value;
	};

	// SymbolDoc getDocs()
	MemberNode.prototype.getDocs = function() {
		var self = this;
		return self._docs;
	};

	// SymbolDoc setDocs(SymbolDoc)
	MemberNode.prototype.setDocs = function(value) {
		var self = this;
		self._docs = value;
	};

	// virtual bool IsField()
	MemberNode.prototype.IsField = function() {
		var self = this;
		return false;
	};

	// virtual bool IsMethod()
	MemberNode.prototype.IsMethod = function() {
		var self = this;
		return false;
	};

	// virtual bool IsProperty()
	MemberNode.prototype.IsProperty = function() {
		var self = this;
		return false;
	};

	// virtual bool IsConstructor()
	MemberNode.prototype.IsConstructor = function() {
		var self = this;
		return false;
	};

	// virtual bool IsServerRender()
	MemberNode.prototype.IsServerRender = function() {
		var self = this;
		return false;
	};

	// virtual bool IsTemplateMethod()
	MemberNode.prototype.IsTemplateMethod = function() {
		var self = this;
		return false;
	};

	return MemberNode;
}(eco.ParseNode));

/**

 */
eco.TypeNode = (function(_base) {
	__extends(TypeNode, _base);

	function TypeNode() {
	}

	TypeNode._varType = null;
	// Constructor _New()
	TypeNode._New1 = function(self) {
		self = _base._New(self) || self;
		self._parent = null;
		self._name = "";
		self._fullName = "";
		return self;
	};

	// Constructor _New(string)
	TypeNode._New2 = function(self, name) {
		self = _base._New(self) || self;
		self._parent = null;
		self._name = "";
		self._fullName = "";
		self._name = name;
		self._astType = eco.ASTType.Type;
		self._fullName = "";
		return self;
	};

	// TypeNode getParent()
	TypeNode.prototype.getParent = function() {
		var self = this;
		return self._parent;
	};

	// TypeNode setParent(TypeNode)
	TypeNode.prototype.setParent = function(value) {
		var self = this;
		self._parent = value;
	};

	// string getName()
	TypeNode.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// string getFullName()
	TypeNode.prototype.getFullName = function() {
		var self = this;
		if (self._fullName == "")
			self._fullName = self.GetFullName();
		return self._fullName;
	};

	// virtual string GetFullName()
	TypeNode.prototype.GetFullName = function() {
		var self = this;
		if (self._parent)
			return self._parent.getFullName() + "." + self._name;
		return self._name;
	};

	// static TypeNode getVarType()
	TypeNode.getVarType = function() {
		if (!TypeNode._varType)
			TypeNode._varType = eco.TypeNode._New2(new eco.TypeNode(), "var");
		return TypeNode._varType;
	};

	// virtual bool IsArray()
	TypeNode.prototype.IsArray = function() {
		var self = this;
		return false;
	};

	// virtual bool IsMap()
	TypeNode.prototype.IsMap = function() {
		var self = this;
		return false;
	};

	// virtual bool IsFunction()
	TypeNode.prototype.IsFunction = function() {
		var self = this;
		return false;
	};

	// virtual bool IsEvent()
	TypeNode.prototype.IsEvent = function() {
		var self = this;
		return false;
	};

	// virtual bool IsInline()
	TypeNode.prototype.IsInline = function() {
		var self = this;
		return false;
	};

	/**

	 */
	TypeNode.Generate = function(typeString) {
		var parts = typeString.split(".");
		var intr = eco.TypeNode._New2(new eco.TypeNode(), parts[0]);
		for (var i = 1; i < parts.length; i++)
		{
			var newType = eco.TypeNode._New2(new eco.TypeNode(), parts[i]);
			newType.setParent(intr);
			intr = newType;
		}

		return intr;
	};

	return TypeNode;
}(eco.ParseNode));

/**

 */
eco.StatementNode = (function(_base) {
	__extends(StatementNode, _base);

	function StatementNode() {
	}

	// Constructor _New()
	StatementNode._New1 = function(self) {
		self = _base._New(self) || self;
		self._stmtType = null;
		self._astType = eco.ASTType.Statement;
		return self;
	};

	// StatementType getStmtType()
	StatementNode.prototype.getStmtType = function() {
		var self = this;
		return self._stmtType;
	};

	return StatementNode;
}(eco.ParseNode));

/**

 */
eco.Parser = (function(_base) {
	__extends(Parser, _base);

	function Parser() {
	}

	// Constructor _New()
	Parser._New1 = function(self) {
		self = _base._New(self) || self;
		self._currentNamespace = null;
		self.CaptureExpressions = false;
		self.OnClearExpressions = null;
		self.OnExpressionCreated = null;
		self._alertLine = 0;
		self._alertColumn = 0;
		self._dotAccessAlertCb = null;
		self._typeAlertCb = null;
		self._loadAlertCb = null;
		self._loadMemberlertCb = null;
		self._scope = null;
		self._lastDocComment = null;
		self._context = null;
		self._inService = false;
		self._context = [];
		self._inService = false;
		return self;
	};

	// void ClearAlerts()
	Parser.prototype.ClearAlerts = function() {
		var self = this;
		self._dotAccessAlertCb = null;
		self._typeAlertCb = null;
		self._loadAlertCb = null;
		self._loadMemberlertCb = null;
	};

	// void AlertOnDotAccess(int,int,function<Interface>:object)
	Parser.prototype.AlertOnDotAccess = function(line, col, cb) {
		var self = this;
		self._alertLine = line;
		self._alertColumn = col;
		self._dotAccessAlertCb = cb;
	};

	// void AlertOnType(int,int,function<Namespace, ParserContext, bool>:object)
	Parser.prototype.AlertOnType = function(line, col, cb) {
		var self = this;
		self._alertLine = line;
		self._alertColumn = col;
		self._typeAlertCb = cb;
	};

	// void AlertOnLoad(int,int,function<ScopeItem[]>:object)
	Parser.prototype.AlertOnLoad = function(line, col, cb) {
		var self = this;
		self._alertLine = line;
		self._alertColumn = col;
		self._loadAlertCb = cb;
	};

	// void AlertOnLoadMember(int,int,function<Member[]>:object)
	Parser.prototype.AlertOnLoadMember = function(line, col, cb) {
		var self = this;
		self._alertLine = line;
		self._alertColumn = col;
		self._loadMemberlertCb = cb;
	};

	// Namespace getCurrentNamespace()
	Parser.prototype.getCurrentNamespace = function() {
		var self = this;
		return self._currentNamespace;
	};

	// Namespace setCurrentNamespace(Namespace)
	Parser.prototype.setCurrentNamespace = function(value) {
		var self = this;
		self._currentNamespace = value;
	};

	// bool InContext(ParserContext)
	Parser.prototype.InContext = function(context) {
		var self = this;
		for (var ctx of self._context)
			if (ctx == context)
				return true;

		return false;
	};

	// object ParseCodeFile()
	Parser.prototype.ParseCodeFile = function() {
		var self = this;
		self._context = [];
		self._scope = null;
		self._lastDocComment = null;
		var usings = [];
		var nodes = [];
		var imports = [];
		if (self.CaptureExpressions)
		{
			if (self.OnClearExpressions)
				self.OnClearExpressions();
			eco.ExpressionNode.OnCreatedAndSet = self.OnExpressionCreated;
		}
		self.AddContext(eco.ParserContext.Namespace);
		while (self.Check())
		{
			if (self.Check1(eco.TokenType.DocComment))
				self._lastDocComment = eco.SymbolDoc._New1(new eco.SymbolDoc(), self.Accept()._value);
			else if (self.Check1(eco.TokenType.K_Import))
			{
				self.Accept();
				var file = self.Accept1(eco.TokenType.String, true)._value;
				self.Accept1(eco.TokenType.K_As, false);
				var importNode = eco.ImportNode._New2(new eco.ImportNode(), file);
				if (self.Check1(eco.TokenType.BraceOpen))
				{
					self.Accept();
					importNode.AsNames.push(self.Accept1(eco.TokenType.Ident, true)._value);
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						importNode.AsNames.push(self.Accept1(eco.TokenType.Ident, true)._value);
					}

					self.Accept1(eco.TokenType.BraceClose, false);
				}
				else
					importNode.AsNames.push(self.Accept1(eco.TokenType.Ident, true)._value);

				self.Accept1(eco.TokenType.Semicolon, false);
				imports.push(importNode);
			}
			else if (self.Check1(eco.TokenType.K_Using))
			{
				self.Accept();
				self.AddContext(eco.ParserContext.Using);
				usings.push(self.ParseType());
				self.PopContext();
				self.Accept1(eco.TokenType.Semicolon, true);
			}
			else if (self.Check1(eco.TokenType.K_Package))
				nodes.push(self.ParseNamespace());
			else if (self.Check1(eco.TokenType.K_Interface))
				nodes.push(self.ParseInterface());
			else if (self.Check1(eco.TokenType.K_Class))
				nodes.push(self.ParseClass());
			else if (self.Check1(eco.TokenType.K_Enum))
				nodes.push(self.ParseEnum());
			else if (self.Check1(eco.TokenType.K_Template))
				nodes.push(self.ParseTemplate());
			else if (self.Check1(eco.TokenType.K_Typedef))
			{
				self.Accept();
				var state = self.SaveState();
				var typeDef = eco.TypedefNode._New6(new eco.TypedefNode(), self.Accept1(eco.TokenType.Ident, true)._value);
				typeDef.setOtherType(self.ParseTypeFull());
				typeDef.SetFromState(state);
				self.Accept1(eco.TokenType.Semicolon, false);
				nodes.push(typeDef);
			}
			else
				self.Error("Expected symbol");

		}

		self.PopContext();
		return {"usings": usings, "nodes": nodes, "imports": imports};
	};

	// ComponentServerNode ParseServerComponent(string)
	Parser.prototype.ParseServerComponent = function(name) {
		var self = this;
		self._context = [];
		self._scope = null;
		self._lastDocComment = null;
		var comp = eco.ComponentServerNode._New6(new eco.ComponentServerNode(), name);
		while (self.Check1(eco.TokenType.K_Using))
		{
			self.Accept();
			self.AddContext(eco.ParserContext.Using);
			comp.AddComponentUsing(self.ParseType());
			self.PopContext();
			self.Accept1(eco.TokenType.Semicolon, true);
		}

		var startLine = self._curLine;
		var startCol = self._curCol;
		self.Accept1(eco.TokenType.K_Class, true);
		comp.setStartLine(startLine);
		comp.setStartColumn(startCol);
		comp.setDefinitionEndLine(self._curLine);
		comp.setDefinitionEndColumn(self._curCol);
		if (self.Check1(eco.TokenType.Colon))
		{
			self.Accept();
			comp.setBaseClass(self.ParseType());
		}
		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			comp.Implement(self.ParseType());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				comp.Implement(self.ParseType());
			}

			self.Accept1(eco.TokenType.SquareClose, true);
		}
		var access = eco.MemberAccess.Public;
		self.Accept1(eco.TokenType.BraceOpen, true);
		comp.AddMember(self.ParseComponentServerRenderMember());
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.K_Public))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Public;
			}
			else if (self.Check1(eco.TokenType.K_Protected))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Protected;
			}
			else if (self.Check1(eco.TokenType.K_Private))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Private;
			}
			else
				self.ParseMember(comp, access);

		}

		self.Accept1(eco.TokenType.BraceClose, true);
		comp.setEndLine(self._curLine);
		comp.setEndColumn(self._curCol);
		return comp;
	};

	// ComponentClientNode ParseClientComponent(string)
	Parser.prototype.ParseClientComponent = function(name) {
		var self = this;
		self._context = [];
		self._scope = null;
		self._lastDocComment = null;
		var comp = eco.ComponentClientNode._New6(new eco.ComponentClientNode(), name);
		while (self.Check1(eco.TokenType.K_Using))
		{
			self.Accept();
			self.AddContext(eco.ParserContext.Using);
			comp.AddComponentUsing(self.ParseType());
			self.PopContext();
			self.Accept1(eco.TokenType.Semicolon, true);
		}

		var startLine = self._curLine;
		var startCol = self._curCol;
		self.Accept1(eco.TokenType.K_Class, true);
		comp.setStartLine(startLine);
		comp.setStartColumn(startCol);
		comp.setDefinitionEndLine(self._curLine);
		comp.setDefinitionEndColumn(self._curCol);
		if (self.Check1(eco.TokenType.Colon))
		{
			self.Accept();
			comp.setBaseClass(self.ParseType());
		}
		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			comp.Implement(self.ParseType());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				comp.Implement(self.ParseType());
			}

			self.Accept1(eco.TokenType.SquareClose, true);
		}
		var access = eco.MemberAccess.Public;
		self.Accept1(eco.TokenType.BraceOpen, true);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.K_Public))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Public;
			}
			else if (self.Check1(eco.TokenType.K_Protected))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Protected;
			}
			else if (self.Check1(eco.TokenType.K_Private))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Private;
			}
			else
				self.ParseMember(comp, access);

		}

		self.Accept1(eco.TokenType.BraceClose, true);
		comp.setEndLine(self._curLine);
		comp.setEndColumn(self._curCol);
		return comp;
	};

	/**

	 */
	Parser.prototype.ParseInitialiser = function(name) {
		var self = this;
		self._context = [];
		self._scope = null;
		self._lastDocComment = null;
		var init = eco.InitialiserNode._New6(new eco.InitialiserNode(), name);
		while (self.Check1(eco.TokenType.K_Using))
		{
			self.Accept();
			self.AddContext(eco.ParserContext.Using);
			init.AddInitialiserUsing(self.ParseType());
			self.PopContext();
			self.Accept1(eco.TokenType.Semicolon, true);
		}

		var startLine = self._curLine;
		var startCol = self._curCol;
		self.Accept1(eco.TokenType.K_Class, true);
		init.setStartLine(startLine);
		init.setStartColumn(startCol);
		init.setDefinitionEndLine(self._curLine);
		init.setDefinitionEndColumn(self._curCol);
		if (self.Check1(eco.TokenType.Colon))
		{
			self.Accept();
			init.setBaseClass(self.ParseType());
		}
		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			init.Implement(self.ParseType());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				init.Implement(self.ParseType());
			}

			self.Accept1(eco.TokenType.SquareClose, true);
		}
		var access = eco.MemberAccess.Public;
		self.Accept1(eco.TokenType.BraceOpen, true);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.K_Public))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Public;
			}
			else if (self.Check1(eco.TokenType.K_Protected))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Protected;
			}
			else if (self.Check1(eco.TokenType.K_Private))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Private;
			}
			else
				self.ParseMember(init, access);

		}

		self.Accept1(eco.TokenType.BraceClose, true);
		init.setEndLine(self._curLine);
		init.setEndColumn(self._curCol);
		return init;
	};

	/**

	 */
	Parser.prototype.ParseService = function(name) {
		var self = this;
		self._context = [];
		self._scope = null;
		self._lastDocComment = null;
		self._inService = true;
		var serv = eco.ServiceNode._New6(new eco.ServiceNode(), name);
		while (self.Check1(eco.TokenType.K_Using))
		{
			self.Accept();
			self.AddContext(eco.ParserContext.Using);
			serv.AddServiceUsing(self.ParseType());
			self.PopContext();
			self.Accept1(eco.TokenType.Semicolon, true);
		}

		var startLine = self._curLine;
		var startCol = self._curCol;
		self.Accept1(eco.TokenType.K_Class, true);
		serv.setStartLine(startLine);
		serv.setStartColumn(startCol);
		serv.setDefinitionEndLine(self._curLine);
		serv.setDefinitionEndColumn(self._curCol);
		if (self.Check1(eco.TokenType.Colon))
		{
			self.Accept();
			serv.setBaseClass(self.ParseType());
		}
		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			serv.Implement(self.ParseType());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				serv.Implement(self.ParseType());
			}

			self.Accept1(eco.TokenType.SquareClose, true);
		}
		var access = eco.MemberAccess.Public;
		self.Accept1(eco.TokenType.BraceOpen, true);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.K_Public))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Public;
			}
			else if (self.Check1(eco.TokenType.K_Protected))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Protected;
			}
			else if (self.Check1(eco.TokenType.K_Private))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Private;
			}
			else
				self.ParseMember(serv, access);

		}

		self.Accept1(eco.TokenType.BraceClose, true);
		serv.setEndLine(self._curLine);
		serv.setEndColumn(self._curCol);
		self._inService = false;
		return serv;
	};

	// BlockNode ParseMethodBody(Method)
	Parser.prototype.ParseMethodBody = function(method) {
		var self = this;
		self._context = [];
		self._lastDocComment = null;
		self._scope = eco.Scope._New1(new eco.Scope(), method, null);
		self.AddContext(eco.ParserContext.Member);
		if (!method._isPropMethod || method._propMethodIsBlock)
		{
			var state = eco.LexerState._New1(new eco.LexerState(), method._defStartPosition - 1, method._defStartLine, method._defStartColumn);
			self.RestoreState(state);
			self._oldPos = state.Position;
			self._oldCol = state.Column;
			self._oldLine = state.Line;
			self._lineStart = self._curPos + 1 - self._curCol + 1;
			var node = self.ParseBlock();
			method.setBlock(node);
			method.setDefinitionStartPosition(state.Position + 1);
			method.setDefinitionStartLine(state.Line);
			method.setDefinitionStartColumn(state.Column);
			return node;
		}
		else
		{
			console.log("MAKE IT RE-PARSE INLINE GETTERS AND SETTERS");
			return null;
		}

		self.PopContext();
	};

	// NamespaceNode ParseNamespace()
	Parser.prototype.ParseNamespace = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var startLine = self._curLine;
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.NamespaceNode._New2(new eco.NamespaceNode(), name);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		self.Accept1(eco.TokenType.BraceOpen, true);
		self.AddContext(eco.ParserContext.Namespace);
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace.GetSymbolBySignature(name, false);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.DocComment))
				self._lastDocComment = eco.SymbolDoc._New1(new eco.SymbolDoc(), self.Accept()._value);
			else if (self.Check1(eco.TokenType.K_Using))
			{
				self.Accept();
				self.AddContext(eco.ParserContext.Using);
				node.UseNamespace(self.ParseType());
				self.PopContext();
				self.Accept1(eco.TokenType.Semicolon, true);
			}
			else if (self.Check1(eco.TokenType.K_Package))
				node.AddChild(self.ParseNamespace());
			else if (self.Check1(eco.TokenType.K_Interface))
				node.AddChild(self.ParseInterface());
			else if (self.Check1(eco.TokenType.K_Class))
				node.AddChild(self.ParseClass());
			else if (self.Check1(eco.TokenType.K_Enum))
				node.AddChild(self.ParseEnum());
			else if (self.Check1(eco.TokenType.K_Template))
				node.AddChild(self.ParseTemplate());
			else if (self.Check1(eco.TokenType.K_Typedef))
			{
				self.Accept();
				var state = self.SaveState();
				var typeDef = eco.TypedefNode._New6(new eco.TypedefNode(), self.Accept1(eco.TokenType.Ident, true)._value);
				typeDef.setOtherType(self.ParseTypeFull());
				typeDef.SetFromState(state);
				self.Accept1(eco.TokenType.Semicolon, false);
				node.AddChild(typeDef);
			}
			else
				self.Error("Expected symbol");

		}

		self.PopContext();
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace._namespace;
		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// TemplateNode ParseTemplate()
	Parser.prototype.ParseTemplate = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var startLine = self._curLine;
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.TemplateNode._New6(new eco.TemplateNode(), name);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		node.setDocs(self._lastDocComment);
		self._lastDocComment = null;
		self.Accept1(eco.TokenType.ParOpen, true);
		if (!self.Check1(eco.TokenType.ParClose))
		{
			var intr = self.ParseTypeFull();
			var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
			self.Accept2(eco.OpType.Assign, true);
			var defaultValue = self.ParseExpression();
			node.AddParameter(intr, name1, defaultValue);
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				intr = self.ParseTypeFull();
				name1 = self.Accept1(eco.TokenType.Ident, true)._value;
				self.Accept2(eco.OpType.Assign, true);
				defaultValue = self.ParseExpression();
				node.AddParameter(intr, name1, defaultValue);
			}

		}
		self.Accept1(eco.TokenType.ParClose, true);
		self.Check();
		var mainMethod = eco.TemplateRenderNode._New6(new eco.TemplateRenderNode(), eco.TypeNode.Generate("std.html.HTMLElement"), name);
		mainMethod.setBlock(self.ParseBlock());
		mainMethod.AddParam(eco.ArrayTypeNode._New4(new eco.ArrayTypeNode(), null), "children", null);
		mainMethod.AddParam(eco.MapTypeNode._New4(new eco.MapTypeNode(), null), "attr", null);
		node.setMainMethod(mainMethod);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// InterfaceNode ParseInterface2()
	Parser.prototype.ParseInterface2 = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var startLine = self._curLine;
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.InterfaceNode._New4(new eco.InterfaceNode(), name);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		node.setDocs(self._lastDocComment);
		self._lastDocComment = null;
		self.Accept1(eco.TokenType.BraceOpen, true);
		self.AddContext(eco.ParserContext.Interface);
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace.GetSymbolBySignature(name, false);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			var doc = null;
			if (self.Check1(eco.TokenType.DocComment))
				doc = eco.SymbolDoc._New1(new eco.SymbolDoc(), self.Accept()._value);
			var startLine1 = self._curLine;
			var startCol = self._curCol;
			var type = self.ParseTypeFull();
			var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
			if (self.Check1(eco.TokenType.ParOpen))
			{
				self.Accept();
				var method = eco.MethodNode._New4(new eco.MethodNode(), type, name1);
				node.AddMember(method);
				method.setStartLine(startLine1);
				method.setStartColumn(startCol);
				method.setDocs(doc);
				while (!self.Check1(eco.TokenType.ParClose))
				{
					var pType = self.ParseTypeFull();
					var pName = self.Accept1(eco.TokenType.Ident, true)._value;
					method.AddParam(pType, pName, null);
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						pType = self.ParseTypeFull();
						pName = self.Accept1(eco.TokenType.Ident, true)._value;
						method.AddParam(pType, pName, null);
					}

				}

				self.Accept1(eco.TokenType.ParClose, true);
				self.Accept1(eco.TokenType.Semicolon, true);
				method.setEndLine(self._curLine);
				method.setEndColumn(self._curCol);
			}
			else
			{
				self.Accept1(eco.TokenType.Semicolon, true);
				var fieldNode = eco.FieldNode._New4(new eco.FieldNode(), type, name1);
				fieldNode.setStartLine(startLine1);
				fieldNode.setStartColumn(startCol);
				fieldNode.setDocs(doc);
				node.AddMember(fieldNode);
			}

		}

		self.PopContext();
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace._namespace;
		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// InterfaceNode ParseInterface()
	Parser.prototype.ParseInterface = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var state = self.SaveState();
		var oldPos = self._oldPos;
		var oldLineStart = self._lineStart;
		var startLine = self._curLine;
		try
		{
			var returnType = self.ParseTypeFull();
			var name = self.Accept1(eco.TokenType.Ident, true)._value;
			var typeDefNode = eco.TypedefNode._New6(new eco.TypedefNode(), name);
			typeDefNode.setStartLine(startLine);
			typeDefNode.setStartColumn(curCol);
			var otherType = eco.FunctionTypeNode._New3(new eco.FunctionTypeNode());
			otherType.setReturnType(returnType);
			typeDefNode.setOtherType(otherType);
			self.Accept1(eco.TokenType.ParOpen, true);
			if (!self.Check1(eco.TokenType.ParClose))
			{
				var paramType = self.ParseTypeFull();
				if (self.Check1(eco.TokenType.Ident))
				{
					var paramName = self.Accept()._value;
					otherType.AddParam(paramType, paramName);
				}
				else
					otherType.AddParamType(paramType);

				while (self.Check1(eco.TokenType.Comma))
				{
					self.Accept();
					var paramType2 = self.ParseTypeFull();
					if (self.Check1(eco.TokenType.Ident))
					{
						var paramName1 = self.Accept()._value;
						otherType.AddParam(paramType2, paramName1);
					}
					else
						otherType.AddParamType(paramType2);

				}

			}
			self.Accept1(eco.TokenType.ParClose, true);
			self.Accept1(eco.TokenType.Semicolon, false);
			return typeDefNode;
		}
		catch (e)
		{
			self.RestoreState(state);
			self.Revert(oldPos);
			self._lineStart = oldLineStart;
		}
		var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.InterfaceNode._New4(new eco.InterfaceNode(), name1);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		node.setDocs(self._lastDocComment);
		self._lastDocComment = null;
		self.Accept1(eco.TokenType.BraceOpen, true);
		self.AddContext(eco.ParserContext.Interface);
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace.GetSymbolBySignature(name1, false);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			var doc = null;
			if (self.Check1(eco.TokenType.DocComment))
				doc = eco.SymbolDoc._New1(new eco.SymbolDoc(), self.Accept()._value);
			var startLine1 = self._curLine;
			var startCol = self._curCol;
			var type = self.ParseTypeFull();
			var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
			if (self.Check1(eco.TokenType.ParOpen))
			{
				self.Accept();
				var method = eco.MethodNode._New4(new eco.MethodNode(), type, name1);
				node.AddMember(method);
				method.setStartLine(startLine1);
				method.setStartColumn(startCol);
				method.setDocs(doc);
				while (!self.Check1(eco.TokenType.ParClose))
				{
					var pType = self.ParseTypeFull();
					var pName = self.Accept1(eco.TokenType.Ident, true)._value;
					method.AddParam(pType, pName, null);
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						pType = self.ParseTypeFull();
						pName = self.Accept1(eco.TokenType.Ident, true)._value;
						method.AddParam(pType, pName, null);
					}

				}

				self.Accept1(eco.TokenType.ParClose, true);
				self.Accept1(eco.TokenType.Semicolon, true);
				method.setEndLine(self._curLine);
				method.setEndColumn(self._curCol);
			}
			else
			{
				self.Accept1(eco.TokenType.Semicolon, true);
				var fieldNode = eco.FieldNode._New4(new eco.FieldNode(), type, name1);
				fieldNode.setStartLine(startLine1);
				fieldNode.setStartColumn(startCol);
				fieldNode.setDocs(doc);
				node.AddMember(fieldNode);
			}

		}

		self.PopContext();
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace._namespace;
		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// ClassNode ParseClass()
	Parser.prototype.ParseClass = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var startLine = self._curLine;
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.ClassNode._New4(new eco.ClassNode(), name);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		node.setDocs(self._lastDocComment);
		self._lastDocComment = null;
		self.AddContext(eco.ParserContext.ClassInfo);
		if (self.Check1(eco.TokenType.Colon))
		{
			self.Accept();
			node.setBaseClass(self.ParseType());
		}
		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			node.Implement(self.ParseType());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				node.Implement(self.ParseType());
			}

			self.Accept1(eco.TokenType.SquareClose, true);
		}
		self.PopContext();
		var access = eco.MemberAccess.Public;
		self.Accept1(eco.TokenType.BraceOpen, true);
		self.AddContext(eco.ParserContext.Class);
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace.GetSymbolBySignature(name, false);
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			if (self.Check1(eco.TokenType.K_Public))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Public;
			}
			else if (self.Check1(eco.TokenType.K_Protected))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Protected;
			}
			else if (self.Check1(eco.TokenType.K_Private))
			{
				self.Accept();
				self.Accept1(eco.TokenType.Colon, true);
				access = eco.MemberAccess.Private;
			}
			else
				self.ParseMember(node, access);

		}

		self.PopContext();
		if (self._currentNamespace)
			self._currentNamespace = self._currentNamespace._namespace;
		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// EnumNode ParseEnum()
	Parser.prototype.ParseEnum = function() {
		var self = this;
		var curCol = self._curCol;
		self.Accept();
		var startLine = self._curLine;
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		var node = eco.EnumNode._New4(new eco.EnumNode(), name);
		node.setStartLine(startLine);
		node.setStartColumn(curCol);
		node.setDefinitionEndLine(self._curLine);
		node.setDefinitionEndColumn(self._curCol);
		node.setDocs(self._lastDocComment);
		self._lastDocComment = null;
		self.Accept1(eco.TokenType.BraceOpen, true);
		var curValue = 0;
		while (!self.Check1(eco.TokenType.BraceClose))
		{
			var key = self.Accept1(eco.TokenType.Ident, true)._value;
			if (self.Check2(eco.OpType.Assign))
			{
				self.Accept();
				curValue = self.Accept1(eco.TokenType.Int, true)._value;
				node._kv[key] = curValue++;
			}
			else
				node._kv[key] = curValue++;

			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				var key2 = self.Accept1(eco.TokenType.Ident, true)._value;
				if (self.Check2(eco.OpType.Assign))
				{
					self.Accept();
					curValue = self.Accept1(eco.TokenType.Int, true)._value;
					node._kv[key2] = curValue++;
				}
				else
					node._kv[key2] = curValue++;

			}

		}

		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		return node;
	};

	// ServerRenderNode ParseComponentServerRenderMember()
	Parser.prototype.ParseComponentServerRenderMember = function() {
		var self = this;
		var startLine = self._curLine;
		var startCol = self._curCol;
		var renderName = self.Accept1(eco.TokenType.Ident, true)._value;
		if (renderName != "Render")
		{
			var tmp = self._curCol;
			self._curCol = startCol - renderName.length - 1;
			self.Error2("Expected 'Render()' method", self._curLine, self._curCol + renderName.length + 1);
			self._curCol = tmp;
		}
		var node = eco.ServerRenderNode._New5(new eco.ServerRenderNode());
		node.setAccess(eco.MemberAccess.Public);
		node.setStartLine(startLine);
		node.setStartColumn(startCol - renderName.length - 1);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		self.Accept1(eco.TokenType.ParOpen, true);
		if (!self.Check1(eco.TokenType.ParClose))
		{
			var pType = self.ParseTypeFull();
			var pName = self.Accept1(eco.TokenType.Ident, true)._value;
			self.Accept2(eco.OpType.Assign, true);
			var pDefault = self.ParseLiteral();
			node.AddParam(pType, pName, pDefault);
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				pType = self.ParseTypeFull();
				pName = self.Accept1(eco.TokenType.Ident, true)._value;
				self.Accept2(eco.OpType.Assign, true);
				pDefault = self.ParseLiteral();
				node.AddParam(pType, pName, pDefault);
			}

		}
		self.Accept1(eco.TokenType.ParClose, true);
		self.Check();
		self.AddContext(eco.ParserContext.Member);
		node.setBlock(self.ParseBlock());
		self.PopContext();
		return node;
	};

	// void ParseMember(ClassNode,MemberAccess)
	Parser.prototype.ParseMember = function(cls, access) {
		var self = this;
		self.AddContext(eco.ParserContext.Member);
		var isConstr = false;
		var isStatic = false;
		var isVirtual = false;
		var startLine = self._curLine;
		var startCol = self._curCol;
		var docComment = null;
		if (self.Check1(eco.TokenType.DocComment))
			docComment = eco.SymbolDoc._New1(new eco.SymbolDoc(), self.Accept()._value);
		if (self.Check1(eco.TokenType.K_Static))
		{
			self.Accept();
			isStatic = true;
		}
		else
		{
			if (self._inService)
				self.Error("All members in a service must be static");
		}

		if (self.Check1(eco.TokenType.K_Virtual))
		{
			self.Accept();
			isVirtual = true;
			if (self._inService)
				self.Error("Cannot have virtual members in a service");
		}
		if (self.Check1(eco.TokenType.Ident) || self.Check1(eco.TokenType.K_New))
		{
			if (self.Check1(eco.TokenType.K_New))
			{
				self.Accept();
				isConstr = true;
				if (isStatic)
					self.Error("Cannot have static constructors");
				if (self._inService)
					self.Error("Services cannot have constructors");
			}
			var intr = null;
			var name = "";
			if (!isConstr)
			{
				intr = self.ParseTypeFull();
				name = self.Accept1(eco.TokenType.Ident, true)._value;
			}
			var endLine = self._curLine;
			var endCol = self._curCol;
			if (self.Check1(eco.TokenType.ParOpen))
			{
				var node = null;
				if (isConstr)
					node = eco.ConstructorNode._New5(new eco.ConstructorNode());
				else
					node = eco.MethodNode._New4(new eco.MethodNode(), intr, name);

				cls.AddMember(node);
				node.setAccess(access);
				node.setStatic(isStatic);
				node.setVirtual(isVirtual);
				node.setStartLine(startLine);
				node.setStartColumn(startCol);
				node.setEndLine(endLine);
				node.setEndColumn(endCol);
				node.setDocs(docComment);
				self.Accept();
				if (!self.Check1(eco.TokenType.ParClose))
				{
					var startDefaults = false;
					var defaultValue = null;
					var pType = self.ParseTypeFull();
					var pName = self.Accept1(eco.TokenType.Ident, true)._value;
					if (self.Check2(eco.OpType.Assign))
					{
						self.Accept();
						defaultValue = self.ParseLiteral();
						startDefaults = true;
					}
					node.AddParam(pType, pName, defaultValue);
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						pType = self.ParseTypeFull();
						pName = self.Accept1(eco.TokenType.Ident, true)._value;
						defaultValue = null;
						if (!self.Check2(eco.OpType.Assign))
						{
							if (startDefaults)
								self.Error("Expected default parameter value for '" + pName + "'");
						}
						else
						{
							self.Accept();
							defaultValue = self.ParseLiteral();
							startDefaults = true;
						}

						node.AddParam(pType, pName, defaultValue);
					}

				}
				self.Accept1(eco.TokenType.ParClose, true);
				if (self.Check1(eco.TokenType.K_Alias))
				{
					self.Accept();
					node.setAliased(true);
				}
				if (isConstr)
				{
					node.setStartColumn(node._startColumn - 4);
					if (self.Check1(eco.TokenType.Colon))
					{
						self.Accept();
						var state = self.SaveState();
						var constr = node;
						self.Accept1(eco.TokenType.K_Base, true);
						var baseCall = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), "_New");
						baseCall.SetFromState(state);
						baseCall.setArgList(self.ParseArgList());
						constr.setBaseCall(baseCall);
					}
				}
				self.Check();
				node.setBlock(self.ParseBlock());
			}
			else if (isConstr)
				self.Error("Expected '('");
			else if (self.Check1(eco.TokenType.Colon) || self.Check1(eco.TokenType.BraceOpen))
			{
				if (isVirtual)
					self.Error("Cannot have virtual properties");
				var node1 = eco.PropertyNode._New4(new eco.PropertyNode(), intr, name);
				node1.setAccess(access);
				node1.setStatic(isStatic);
				cls.AddMember(node1);
				node1.setStartLine(startLine);
				node1.setStartColumn(startCol);
				node1.setDocs(docComment);
				if (self.Check1(eco.TokenType.Colon))
				{
					self.Accept();
					var fieldAccess = eco.MemberAccess.Public;
					if (self.Check1(eco.TokenType.K_Public))
					{
						self.Accept();
						fieldAccess = eco.MemberAccess.Public;
					}
					else if (self.Check1(eco.TokenType.K_Protected))
					{
						self.Accept();
						fieldAccess = eco.MemberAccess.Protected;
					}
					else if (self.Check1(eco.TokenType.K_Private))
					{
						self.Accept();
						fieldAccess = eco.MemberAccess.Private;
					}
					var fieldName = self.Accept1(eco.TokenType.Ident, true)._value;
					node1.setFieldName(fieldName);
					var field = eco.FieldNode._New4(new eco.FieldNode(), intr, fieldName);
					field.setAccess(fieldAccess);
					field.setStatic(isStatic);
					if (self.Check2(eco.OpType.Assign))
					{
						self.Accept();
						field.setDefault(self.ParseExpression());
					}
					cls.AddMember(field);
				}
				self.Accept1(eco.TokenType.BraceOpen, true);
				if (self.Check1(eco.TokenType.K_Get))
				{
					self.Accept();
					var oldCol = self._oldCol;
					var oldPos = self._oldPos;
					if (self.Check1(eco.TokenType.BraceOpen))
					{
						node1.setGetter(self.ParseBlock());
						node1.setGetterIsBlock(true);
					}
					else
					{
						var block = eco.BlockNode._New2(new eco.BlockNode());
						block.setStartLine(self._oldLine);
						block.setStartColumn(self._oldCol);
						block.setStartPosition(self._oldPos);
						block.AddStatement(self.ParseStatement());
						block.setEndLine(self._curLine);
						block.setEndColumn(self._curCol);
						block.setEndPosition(self._curPos - 1);
						node1.setGetter(block);
						node1.setGetterIsBlock(false);
					}

				}
				if (self.Check1(eco.TokenType.K_Set))
				{
					self.Accept();
					var oldCol1 = self._oldCol;
					var oldPos1 = self._oldPos;
					if (self.Check1(eco.TokenType.BraceOpen))
					{
						node1.setSetter(self.ParseBlock());
						node1.setSetterIsBlock(true);
					}
					else
					{
						var block1 = eco.BlockNode._New2(new eco.BlockNode());
						block1.setStartLine(self._oldLine);
						block1.setStartColumn(self._oldCol);
						block1.setStartPosition(self._oldPos);
						block1.AddStatement(self.ParseStatement());
						block1.setEndLine(self._curLine);
						block1.setEndColumn(self._curCol);
						block1.setEndPosition(self._curPos - 1);
						node1.setSetter(block1);
						node1.setSetterIsBlock(false);
					}

				}
				self.Accept1(eco.TokenType.BraceClose, true);
				node1.setEndLine(self._curLine);
				node1.setEndColumn(self._curCol);
			}
			else
			{
				if (isVirtual)
					self.Error("Cannot have virtual fields");
				var node2 = eco.FieldNode._New4(new eco.FieldNode(), intr, name);
				cls.AddMember(node2);
				node2.setAccess(access);
				node2.setStatic(isStatic);
				node2.setStartLine(startLine);
				node2.setStartColumn(startCol);
				node2.setEndLine(self._curLine);
				node2.setEndColumn(self._curCol);
				node2.setDocs(docComment);
				if (self.Check2(eco.OpType.Assign))
				{
					self.Accept();
					node2.setDefault(self.ParseExpression());
				}
				while (self.Check1(eco.TokenType.Comma))
				{
					self.Accept();
					name = self.Accept1(eco.TokenType.Ident, true)._value;
					node2 = eco.FieldNode._New4(new eco.FieldNode(), intr, name);
					cls.AddMember(node2);
					node2.setAccess(access);
					node2.setStatic(isStatic);
					if (self.Check2(eco.OpType.Assign))
					{
						self.Accept();
						node2.setDefault(self.ParseExpression());
					}
				}

				self.Accept1(eco.TokenType.Semicolon, true);
			}

		}
		else
			self.Error("Expected member");

		self.PopContext();
	};

	// TypeNode ParseType()
	Parser.prototype.ParseType = function() {
		var self = this;
		var startLine = self._curLine;
		var startCol = self._curCol;
		if (self._typeAlertCb)
		{
			if (self._scope)
			{
				if ((self._oldLine == self._alertLine && self._oldCol == self._alertColumn) || (self._curLine == self._alertLine && self._curCol == self._alertColumn + 1))
					self._typeAlertCb(self._scope._method._owner._namespace, self.CurrentContext(), true);
			}
			else
			{
				if ((self._oldLine == self._alertLine && ((self._oldCol == self._alertColumn) || (self._oldCol == self._alertColumn - 1))) || (self._curLine == self._alertLine && self._curCol == self._alertColumn + 1))
					self._typeAlertCb(self._currentNamespace, self.CurrentContext(), false);
			}

		}
		var name = self.Accept1(eco.TokenType.Ident, true)._value;
		if (self._typeAlertCb && self._curLine == self._alertLine && self._curCol == self._alertColumn + 1)
		{
			if (self._scope)
				self._typeAlertCb(self._scope._method._owner._namespace, self.CurrentContext(), true);
			else if (self._currentNamespace)
				self._typeAlertCb(self._currentNamespace, self.CurrentContext(), false);
		}
		if (name == "map")
		{
			var elem = null;
			if (self.Check2(eco.OpType.CmpLT))
			{
				self.Accept();
				elem = self.ParseTypeFull();
				self.Accept2(eco.OpType.CmpGT, true);
			}
			return eco.MapTypeNode._New4(new eco.MapTypeNode(), elem);
		}
		if (name == "array")
			return eco.ArrayTypeNode._New4(new eco.ArrayTypeNode(), null);
		else if (name == "function")
		{
			var node = eco.FunctionTypeNode._New3(new eco.FunctionTypeNode());
			self.Accept2(eco.OpType.CmpLT, true);
			if (!self.Check2(eco.OpType.CmpGT))
			{
				var paramType = self.ParseTypeFull();
				if (self.Check1(eco.TokenType.Ident))
				{
					var paramName = self.Accept1(eco.TokenType.Ident, true)._value;
					node.AddParam(paramType, paramName);
				}
				else
					node.AddParamType(paramType);

				while (self.Check1(eco.TokenType.Comma))
				{
					self.Accept();
					paramType = self.ParseTypeFull();
					if (self.Check1(eco.TokenType.Ident))
					{
						var paramName1 = self.Accept1(eco.TokenType.Ident, true)._value;
						node.AddParam(paramType, paramName1);
					}
					else
						node.AddParamType(paramType);

				}

			}
			self.Accept2(eco.OpType.CmpGT, true);
			if (self.Check1(eco.TokenType.Colon))
			{
				self.Accept();
				node.setReturnType(self.ParseTypeFull());
			}
			return node;
		}
		else if (name == "event")
		{
			var node1 = eco.EventTypeNode._New3(new eco.EventTypeNode());
			self.Accept2(eco.OpType.CmpLT, true);
			if (!self.Check2(eco.OpType.CmpGT))
			{
				node1.AddParamType(self.ParseTypeFull());
				while (self.Check1(eco.TokenType.Comma))
				{
					self.Accept();
					node1.AddParamType(self.ParseTypeFull());
				}

			}
			self.Accept2(eco.OpType.CmpGT, true);
			if (self._scope)
			{
				var dummy = self._scope._method._owner.GetType(node1, null);
			}
			return node1;
		}
		else if (name == "type")
		{
			self.Accept1(eco.TokenType.BraceOpen, false);
			var typeNode = eco.InlineInterfaceNode._New3(new eco.InlineInterfaceNode());
			var parseMemberNode = function () {
				var memberType = self.ParseTypeFull();
				var memberName = self.Accept1(eco.TokenType.Ident, true)._value;
				var memberNode = null;
				if (self.Check1(eco.TokenType.ParOpen))
				{
					self.Accept();
					var methodNode = eco.MethodNode._New4(new eco.MethodNode(), memberType, memberName);
					memberNode = methodNode;
					var paramCount = 1;
					if (!self.Check1(eco.TokenType.ParClose))
					{
						var paramType1 = self.ParseTypeFull();
						var paramName2 = "";
						if (self.Check1(eco.TokenType.Ident))
							paramName2 = self.Accept1(eco.TokenType.Ident, true)._value;
						else
							paramName2 = "v1";

						methodNode.AddParam(paramType1, paramName2, null);
						while (self.Check1(eco.TokenType.Comma))
						{
							self.Accept();
							paramType1 = self.ParseTypeFull();
							if (self.Check1(eco.TokenType.Ident))
								paramName2 = self.Accept1(eco.TokenType.Ident, true)._value;
							else
								paramName2 = "v" + paramCount;

							paramCount++;
							methodNode.AddParam(paramType1, paramName2, null);
						}

					}
					self.Accept1(eco.TokenType.ParClose, true);
				}
				else
					memberNode = eco.FieldNode._New4(new eco.FieldNode(), memberType, memberName);

				self.Accept1(eco.TokenType.Semicolon, true);
				return memberNode;
			};
			var member = parseMemberNode();
			if (member)
			{
				typeNode.AddMember(member);
				while (!self.Check1(eco.TokenType.BraceClose))
				{
					member = parseMemberNode();
					if (member)
						typeNode.AddMember(member);
					else
					{
						self.Find('}');
						return null;
					}

				}

			}
			else
			{
				self.Find('}');
				return null;
			}

			self.Accept1(eco.TokenType.BraceClose, true);
			return typeNode;
		}
		var node2 = eco.TypeNode._New2(new eco.TypeNode(), name);
		node2.setStartLine(startLine);
		node2.setStartColumn(startCol);
		while (self.Check1(eco.TokenType.Dot))
		{
			self.AddContext(eco.ParserContext.Type);
			self.Accept();
			if (self._typeAlertCb && self._curLine == self._alertLine && self._curCol == self._alertColumn)
			{
				if (self._scope)
				{
					var ns = self._scope._method._owner.GetNamespaceFromTypeNode(node2);
					self._typeAlertCb(ns, self.CurrentContext(), true);
				}
				else if (self._currentNamespace)
				{
					var ns1 = self._currentNamespace.GetNamespaceFromTypeNode(node2);
					self._typeAlertCb(ns1, self.CurrentContext(), false);
				}
			}
			name = self.Accept1(eco.TokenType.Ident, true)._value;
			var newNode = eco.TypeNode._New2(new eco.TypeNode(), name);
			newNode.setParent(node2);
			newNode.setStartLine(node2._startLine);
			newNode.setStartColumn(node2._startColumn);
			node2 = newNode;
			self.PopContext();
		}

		node2.setEndLine(self._curLine);
		node2.setEndColumn(self._curCol);
		return node2;
	};

	// TypeNode ParseTypeFull()
	Parser.prototype.ParseTypeFull = function() {
		var self = this;
		var elem = null;
		if (self.Check1(eco.TokenType.ParOpen))
		{
			self.Accept();
			elem = self.ParseTypeFull();
			self.Accept1(eco.TokenType.ParClose, true);
		}
		else
			elem = self.ParseType();

		if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			var node = eco.ArrayTypeNode._New4(new eco.ArrayTypeNode(), elem);
			self.Accept1(eco.TokenType.SquareClose, true);
			while (self.Check1(eco.TokenType.SquareOpen))
			{
				self.Accept();
				node = eco.ArrayTypeNode._New4(new eco.ArrayTypeNode(), node);
				self.Accept1(eco.TokenType.SquareClose, true);
			}

			return node;
		}
		else
			return elem;

	};

	// StatementNode ParseStatement()
	Parser.prototype.ParseStatement = function() {
		var self = this;
		try
		{
			var state = self.SaveState();
			var oldPos = self._oldPos;
			var oldLineStart = self._lineStart;
			var token = self.Check();
			if (!token)
				self.Error("Unexpected end of file");
			switch (token._tokType)
			{
				case eco.TokenType.Semicolon:
				{
					self.Accept();
					return eco.ExpressionNode._New2(new eco.ExpressionNode());
				}
				case eco.TokenType.K_If:
				{
					self.Accept();
					var ifStatement = eco.IfNode._New2(new eco.IfNode());
					self.Accept1(eco.TokenType.ParOpen, false);
					ifStatement.setCondition(self.ParseExpression());
					self.Accept1(eco.TokenType.ParClose, false);
					ifStatement.setThen(self.ParseStatement());
					if (self.Check1(eco.TokenType.K_Else))
					{
						self.Accept();
						ifStatement.setElse(self.ParseStatement());
					}
					ifStatement.SetFromState(state);
					return ifStatement;
				}
				case eco.TokenType.K_While:
				{
					self.Accept();
					var whileLoop = eco.WhileNode._New2(new eco.WhileNode());
					self.Accept1(eco.TokenType.ParOpen, false);
					whileLoop.setCondition(self.ParseExpression());
					self.Accept1(eco.TokenType.ParClose, false);
					whileLoop.setStatement(self.ParseStatement());
					whileLoop.SetFromState(state);
					return whileLoop;
				}
				case eco.TokenType.K_For:
				{
					self.Accept();
					var forLoop = eco.ForNode._New2(new eco.ForNode());
					self.Accept1(eco.TokenType.ParOpen, false);
					forLoop.setInit(self.ParseStatement());
					forLoop.setCondition(self.ParseExpression());
					self.Accept1(eco.TokenType.Semicolon, false);
					forLoop.setUpdate(self.ParseExpression());
					self.Accept1(eco.TokenType.ParClose, false);
					forLoop.setStatement(self.ParseStatement());
					forLoop.SetFromState(state);
					return forLoop;
				}
				case eco.TokenType.K_Foreach:
				{
					self.Accept();
					var forLoop1 = eco.ForeachNode._New2(new eco.ForeachNode());
					self.Accept1(eco.TokenType.ParOpen, false);
					var iterType = null;
					if (self.Check1(eco.TokenType.K_Var))
					{
						self.Accept();
						iterType = eco.TypeNode.getVarType();
					}
					else
						iterType = self.ParseTypeFull();

					var iterName = self.Accept1(eco.TokenType.Ident, true)._value;
					var iterType2 = null;
					var iterName2 = "";
					if (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						if (self.Check1(eco.TokenType.K_Var))
						{
							self.Accept();
							iterType2 = eco.TypeNode.getVarType();
						}
						else
							iterType2 = self.ParseTypeFull();

						iterName2 = self.Accept1(eco.TokenType.Ident, true)._value;
					}
					self.Accept1(eco.TokenType.K_In, false);
					var collection = self.ParseExpression();
					self.Accept1(eco.TokenType.ParClose, false);
					self.AddScope();
					if (self._scope)
					{
						if (iterType == eco.TypeNode.getVarType())
						{
							var collectionType = collection.GetTypeOf(self._scope, null);
							if (collectionType)
							{
								if (collectionType.IsArray())
								{
									var collectionArray = collectionType;
									self._scope.AddItem(collectionArray._elem, iterName, false);
								}
								else if (collectionType.IsMap())
								{
									var collectionMap = collectionType;
									self._scope.AddItem(eco.Interface.getStringType(), iterName, false);
								}
							}
						}
						else
						{
							var actualIterType = self._scope._method._owner.GetType(iterType, null);
							self._scope.AddItem(actualIterType, iterName, false);
						}

						if (iterType2)
						{
							if (iterType2 == eco.TypeNode.getVarType())
							{
								var collectionType1 = collection.GetTypeOf(self._scope, null);
								if (collectionType1.IsMap())
								{
									var collectionMap1 = collectionType1;
									self._scope.AddItem(collectionMap1._elem, iterName2, false);
								}
							}
							else
							{
								var actualIterType1 = self._scope._method._owner.GetType(iterType2, null);
								self._scope.AddItem(actualIterType1, iterName2, false);
							}

						}
					}
					var stmt = self.ParseStatement();
					self.PopScope();
					forLoop1.setIteratorType(iterType);
					forLoop1.setIteratorName(iterName);
					forLoop1.setIteratorType2(iterType2);
					forLoop1.setIteratorName2(iterName2);
					forLoop1.setCollection(collection);
					forLoop1.setStatement(stmt);
					forLoop1.SetFromState(state);
					return forLoop1;
				}
				case eco.TokenType.K_Break:
				{
					self.Accept();
					var brk = eco.BreakNode._New2(new eco.BreakNode());
					self.Accept1(eco.TokenType.Semicolon, false);
					brk.SetFromState(state);
					return brk;
				}
				case eco.TokenType.K_Continue:
				{
					self.Accept();
					var cnt = eco.ContinueNode._New2(new eco.ContinueNode());
					self.Accept1(eco.TokenType.Semicolon, false);
					cnt.SetFromState(state);
					return cnt;
				}
				case eco.TokenType.AsmStr:
				{
					var state2 = self.SaveState();
					var asmToken = self.Accept();
					var code = asmToken._value;
					var stmt1 = eco.AssemblyNode._New2(new eco.AssemblyNode());
					stmt1.SetFromState(state2);
					stmt1.setCode(code);
					for (var target of asmToken._targs)
						stmt1.AddTarget(target);

					stmt1.SetFromState(state2);
					return stmt1;
				}
				case eco.TokenType.K_Target:
				{
					self.Accept();
					var state3 = self.SaveState();
					var targetNode = eco.TargetNode._New2(new eco.TargetNode());
					targetNode.SetFromState(state3);
					var target1 = self.Accept1(eco.TokenType.Ident, true)._value;
					targetNode.AddTarget(target1);
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						target1 = self.Accept1(eco.TokenType.Ident, true)._value;
						targetNode.AddTarget(target1);
					}

					targetNode.setBlock(self.ParseBlock());
					targetNode.SetFromState(state3);
					return targetNode;
				}
				case eco.TokenType.K_Try:
				{
					self.Accept();
					var tryCatch = eco.TryCatchNode._New2(new eco.TryCatchNode());
					tryCatch.setTryBlock(self.ParseBlock());
					self.Accept1(eco.TokenType.K_Catch, true);
					self.Accept1(eco.TokenType.ParOpen, false);
					tryCatch.setCatchType(self.ParseType());
					tryCatch.setCatchName(self.Accept1(eco.TokenType.Ident, true)._value);
					self.Accept1(eco.TokenType.ParClose, false);
					if (self._scope)
					{
						self.AddScope();
						self._scope.AddItem(self._scope._method._owner.GetType(tryCatch._catchType, null), tryCatch._catchName, false);
					}
					tryCatch.setCatchBlock(self.ParseBlock());
					if (self._scope)
						self.PopScope();
					tryCatch.SetFromState(state);
					return tryCatch;
				}
				case eco.TokenType.K_Throw:
				{
					self.Accept();
					var throwNode = eco.ThrowNode._New2(new eco.ThrowNode());
					throwNode.setExpression(self.ParseExpression());
					self.Accept1(eco.TokenType.Semicolon, false);
					throwNode.SetFromState(state);
					return throwNode;
				}
				case eco.TokenType.K_Switch:
				{
					self.Accept();
					var switchNode = eco.SwitchCaseNode._New2(new eco.SwitchCaseNode());
					self.Accept1(eco.TokenType.ParOpen, false);
					switchNode.setValue(self.ParseExpression());
					self.Accept1(eco.TokenType.ParClose, false);
					self.Accept1(eco.TokenType.BraceOpen, false);
					self.AddScope();
					while (self.Check1(eco.TokenType.K_Case))
					{
						self.Accept();
						var caseNode = eco.CaseNode._New2(new eco.CaseNode());
						switchNode.AddCase(caseNode);
						caseNode.setValue(self.ParseExpression());
						self.Accept1(eco.TokenType.Colon, false);
						var check = self.Check();
						while (check._tokType != eco.TokenType.K_Case && check._tokType != eco.TokenType.K_Default && check._tokType != eco.TokenType.BraceClose)
						{
							caseNode.AddStatement(self.ParseStatement());
							check = self.Check();
						}

						if (self.Check1(eco.TokenType.K_Default))
						{
							self.Accept();
							self.Accept1(eco.TokenType.Colon, false);
							var defaultNode = eco.DefaultNode._New2(new eco.DefaultNode());
							switchNode.setDefaultCase(defaultNode);
							var check2 = self.Check();
							while (check2._tokType != eco.TokenType.BraceClose)
							{
								defaultNode.AddStatement(self.ParseStatement());
								check2 = self.Check();
							}

						}
					}

					self.PopScope();
					self.Accept1(eco.TokenType.BraceClose, false);
					switchNode.SetFromState(state);
					return switchNode;
				}
				case eco.TokenType.BraceOpen:
				{
					self.AddScope();
					var block = self.ParseBlock();
					self.PopScope();
					return block;
				}
				case eco.TokenType.K_Return:
				{
					self.Accept();
					var ret = eco.ReturnNode._New2(new eco.ReturnNode());
					ret.SetFromState(state);
					if (!self.Check1(eco.TokenType.Semicolon))
						ret.setReturnValue(self.ParseExpression());
					self.Accept1(eco.TokenType.Semicolon, false);
					return ret;
				}
				case eco.TokenType.K_Var:
				{
					self.Accept();
					var curPos = self._curPos;
					var curLine = self._curLine;
					var curCol = self._curCol;
					var name = self.Accept1(eco.TokenType.Ident, true)._value;
					var decl = eco.VarDeclNode._New3(new eco.VarDeclNode(), name);
					decl.SetFromState(state);
					decl.setStartLine(curLine);
					decl.setStartColumn(curCol);
					decl.setStartPosition(curPos);
					decl.setEndLine(self._curLine);
					decl.setEndColumn(self._curCol);
					decl.setEndPosition(self._curPos);
					decl.setVarType(eco.TypeNode.getVarType());
					self.Accept2(eco.OpType.Assign, false);
					decl.setExpr(self.ParseExpression());
					self.Accept1(eco.TokenType.Semicolon, false);
					if (self._scope)
						self._scope.AddItem(decl._expr.GetTypeOf(self._scope, null), name, false);
					return decl;
				}
				case eco.TokenType.K_Await:
				{
					self.Accept();
					var oldState = self.SaveOldState();
					var state4 = self.SaveState();
					var responder = eco.TypeNode._New2(new eco.TypeNode(), self.Accept1(eco.TokenType.Ident, true)._value);
					responder.SetFromState(state4);
					while (self.Check1(eco.TokenType.Dot))
					{
						self.Accept();
						state4 = self.SaveState();
						var newResponder = eco.TypeNode._New2(new eco.TypeNode(), self.Accept1(eco.TokenType.Ident, true)._value);
						newResponder.setParent(responder);
						responder = newResponder;
						responder.SetFromState(state4);
					}

					var awaitNode = eco.AwaitNode._New2(new eco.AwaitNode());
					awaitNode.setResponder(responder);
					awaitNode.SetFromState(oldState);
					self.Accept1(eco.TokenType.ParOpen, true);
					if (!self.Check1(eco.TokenType.ParClose))
					{
						awaitNode._argList.push(self.ParseExpression());
						while (self.Check1(eco.TokenType.Comma))
						{
							self.Accept();
							awaitNode._argList.push(self.ParseExpression());
						}

					}
					self.Accept1(eco.TokenType.ParClose, true);
					self.Accept1(eco.TokenType.SquareOpen, true);
					awaitNode.setResultType(self.ParseTypeFull());
					awaitNode.setResultVarName(self.Accept1(eco.TokenType.Ident, true)._value);
					if (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						awaitNode.setStatusVarName(self.Accept1(eco.TokenType.Ident, true)._value);
					}
					self.Accept1(eco.TokenType.SquareClose, true);
					awaitNode.setBlock(self.ParseBlock());
					return awaitNode;
				}
				case eco.TokenType.ParOpen:
				case eco.TokenType.Ident:
				{
					try
					{
						var type = self.ParseTypeFull();
						var varState = self.SaveState();
						var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
						var decl1 = eco.VarDeclNode._New3(new eco.VarDeclNode(), name1);
						decl1.SetFromState(varState);
						decl1.setVarType(type);
						if (self.Check2(eco.OpType.Assign))
						{
							self.Accept();
							try
							{
								decl1.setExpr(self.ParseExpression());
							}
							catch (e)
							{
								self.Find(';');
							}
						}
						self.Accept1(eco.TokenType.Semicolon, true);
						if (self._scope)
							self._scope.AddItem(self._scope._method._owner.GetType(type, null), name1, false);
						return decl1;
					}
					catch (e)
					{
						self.RestoreState(state);
						self.Revert(oldPos);
						self._lineStart = oldLineStart;
					}
				}
				default:
				{
					var expr = self.ParseExpression();
					self.Accept1(eco.TokenType.Semicolon, false);
					return expr;
				}
			}
		}
		catch (err)
		{
			throw err;
		}
		return null;
	};

	// BlockNode ParseBlock()
	Parser.prototype.ParseBlock = function() {
		var self = this;
		var oldCol = self._curCol;
		var oldPos = self._curPos;
		self.Accept1(eco.TokenType.BraceOpen, true);
		var node = eco.BlockNode._New2(new eco.BlockNode());
		node.setStartLine(self._oldLine);
		node.setStartColumn(oldCol + 1);
		node.setStartPosition(oldPos);
		while (!self.Check1(eco.TokenType.BraceClose))
			node.AddStatement(self.ParseStatement());

		self.Accept1(eco.TokenType.BraceClose, true);
		node.setEndLine(self._curLine);
		node.setEndColumn(self._curCol);
		node.setEndPosition(self._curPos - 1);
		return node;
	};

	// LitExpressionNode ParseLiteral()
	Parser.prototype.ParseLiteral = function() {
		var self = this;
		var state = self.SaveState();
		var token = self.Check();
		switch (token._tokType)
		{
			case eco.TokenType.K_This:
			case eco.TokenType.K_True:
			case eco.TokenType.K_False:
			case eco.TokenType.K_Null:
			case eco.TokenType.Char:
			case eco.TokenType.Int:
			case eco.TokenType.Float:
			case eco.TokenType.String:
			{
				var expr = eco.LitExpressionNode._New4(new eco.LitExpressionNode(), self.Accept());
				expr.SetFromState(state);
				return expr;
			}
			default:
				self.Error("Expected literal value");
		}
		return null;
	};

	// ExpressionNode ParseExpression()
	Parser.prototype.ParseExpression = function() {
		var self = this;
		var value = self.ParseExpression2();
		if (self.Check2(eco.OpType.Cond))
		{
			self.Accept();
			var state = self.SaveState();
			var cond = eco.CondOpExpressionNode._New5(new eco.CondOpExpressionNode());
			cond.SetFromState(state);
			cond.setExpression1(value);
			cond.setExpression2(self.ParseExpression());
			self.Accept1(eco.TokenType.Colon, true);
			cond.setExpression3(self.ParseExpression());
			value = cond;
		}
		return value;
	};

	// ExpressionNode ParseExpression2()
	Parser.prototype.ParseExpression2 = function() {
		var self = this;
		var value = self.ParseValue();
		var state = self.SaveOldState();
		var op = null;
		var subExpr = null;
		var opNode = null;
		if (self.Check1(eco.TokenType.Operator))
		{
			var op1 = self.Check();
			if (op1._opType != eco.OpType.Cond)
			{
				op1 = self.Accept();
				opNode = eco.OperatorExpressionNode._New4(new eco.OperatorExpressionNode(), op1._opType);
				opNode.SetFromState(state);
				opNode.setExpression1(value);
				subExpr = self.ParseExpression2();
				opNode.setExpression2(subExpr);
				value = opNode;
			}
		}
		if (subExpr && subExpr._exprType == eco.ExpressionType.Op)
		{
			var opSub = subExpr;
			if (opNode._op < opSub._op)
			{
				var move = opSub._expr1;
				opNode.setExpression2(move);
				opSub.setExpression1(opNode);
				value = subExpr;
			}
		}
		return value;
	};

	// ExpressionNode ParseValue()
	Parser.prototype.ParseValue = function() {
		var self = this;
		var isNative = false;
		var supportsNative = false;
		var token = self.Check();
		var oldState = self.SaveOldState();
		var state = self.SaveOldState();
		if (!token)
			self.Error1("Reached end of file", oldState);
		if (token._tokType == eco.TokenType.Operator)
		{
			var op = token;
			if (op.IsPreOp())
			{
				self.Accept();
				var preop = eco.PreOpExpressionNode._New6(new eco.PreOpExpressionNode(), op._opType, self.ParseValue());
				preop.SetFromState(state);
				return preop;
			}
			else if (op._opType == eco.OpType.CmpLT)
			{
				return self.ParseHTML();
			}
		}
		if (token._tokType == eco.TokenType.Colon)
		{
			self.Accept();
			isNative = true;
			token = self.Check();
		}
		var expr = null;
		switch (token._tokType)
		{
			case eco.TokenType.K_This:
			{
				self.Accept();
				if (isNative)
				{
					supportsNative = true;
					expr = eco.LoadExpressionNode._New4(new eco.LoadExpressionNode(), "this", false);
					(expr).setIsNative(true);
					expr.SetFromState(state);
				}
				else
				{
					expr = eco.LoadExpressionNode._New4(new eco.LoadExpressionNode(), "this", false);
					expr.SetFromState(state);
				}

				break;
			}
			case eco.TokenType.K_True:
			case eco.TokenType.K_False:
			case eco.TokenType.K_Null:
			case eco.TokenType.Char:
			case eco.TokenType.Int:
			case eco.TokenType.Float:
			{
				expr = eco.LitExpressionNode._New4(new eco.LitExpressionNode(), self.Accept());
				expr.SetFromState(state);
				break;
			}
			case eco.TokenType.String:
			{
				return self.FormatString(self.Accept());
			}
			case eco.TokenType.ParOpen:
			{
				self.Accept();
				var oldPos = self._oldPos;
				try
				{
					var toType = self.ParseTypeFull();
					self.Accept1(eco.TokenType.ParClose, true);
					var typecast = self.ParseValue();
					expr = eco.TypecastExpressionNode._New4(new eco.TypecastExpressionNode(), toType, typecast);
					expr.SetFromState(state);
				}
				catch (e)
				{
					self.Revert(oldPos);
					expr = eco.ParExpressionNode._New4(new eco.ParExpressionNode(), self.ParseExpression());
					expr.SetFromState(state);
					self.Accept1(eco.TokenType.ParClose, true);
				}
				break;
			}
			case eco.TokenType.K_Base:
			{
				self.Accept();
				self.Accept1(eco.TokenType.Dot, true);
				if (self._dotAccessAlertCb && self._scope)
				{
					if ((self._curLine == self._alertLine) && (self._curCol == self._alertColumn))
					{
						var type = self._scope._method._owner;
						if (type)
							self._dotAccessAlertCb(type);
					}
				}
				var name = self.Accept1(eco.TokenType.Ident, true)._value;
				expr = eco.BaseCallExpressionNode._New6(new eco.BaseCallExpressionNode(), name);
				expr.SetFromState(state);
				(expr).setArgList(self.ParseArgList());
				break;
			}
			case eco.TokenType.Ident:
			{
				var varName = self.Accept1(eco.TokenType.Ident, true)._value;
				if (varName == "function")
				{
					expr = eco.FunctionExpressionNode._New3(new eco.FunctionExpressionNode());
					var funcExpr = expr;
					funcExpr.SetFromState(state);
					self.AddScope();
					self.Accept1(eco.TokenType.ParOpen, true);
					if (!self.Check1(eco.TokenType.ParClose))
					{
						var intr = self.ParseTypeFull();
						var name1 = self.Accept1(eco.TokenType.Ident, true)._value;
						funcExpr.AddParam(intr, name1);
						if (self._scope)
							self._scope.AddItem(self._scope._method._owner.GetType(intr, null), name1, false);
						while (self.Check1(eco.TokenType.Comma))
						{
							self.Accept();
							intr = self.ParseTypeFull();
							name1 = self.Accept1(eco.TokenType.Ident, true)._value;
							funcExpr.AddParam(intr, name1);
							if (self._scope)
								self._scope.AddItem(self._scope._method._owner.GetType(intr, null), name1, false);
						}

					}
					self.Accept1(eco.TokenType.ParClose, true);
					if (self.Check1(eco.TokenType.Colon))
					{
						self.Accept();
						funcExpr.setReturnType(self.ParseTypeFull());
					}
					self.Check();
					funcExpr.setBlock(self.ParseBlock());
					self.PopScope();
				}
				else
				{
					supportsNative = true;
					if (self._scope)
					{
						if (self._curLine == self._alertLine && self._curCol == self._alertColumn + 1)
						{
							if (self._loadAlertCb)
								self._loadAlertCb(self._scope.GetItemsStartingWith(varName));
							if (self._loadMemberlertCb)
								self._loadMemberlertCb(self._scope._method._owner.GetAllMembers());
							if (self._typeAlertCb)
							{
								self.AddContext(eco.ParserContext.Member);
								self._typeAlertCb(self._scope._method._owner._namespace, self.CurrentContext(), false);
								self.PopContext();
							}
						}
					}
					if (self.Check1(eco.TokenType.ParOpen))
					{
						expr = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), varName);
						(expr).setIsNative(isNative);
						expr.SetFromState(state);
						(expr).setArgList(self.ParseArgList());
					}
					else
					{
						expr = eco.LoadExpressionNode._New4(new eco.LoadExpressionNode(), varName, false);
						(expr).setIsNative(isNative);
						expr.SetFromState(state);
					}

				}

				break;
			}
			case eco.TokenType.K_New:
			{
				self.Accept();
				self.AddContext(eco.ParserContext.New);
				var newIsNative = false;
				if (self.Check1(eco.TokenType.Colon))
				{
					self.Accept();
					newIsNative = true;
				}
				var newType = self.ParseTypeFull();
				expr = eco.NewExpressionNode._New4(new eco.NewExpressionNode(), newType);
				expr.SetFromState(state);
				(expr).setIsNative(newIsNative);
				if (self.Check1(eco.TokenType.ParOpen))
					(expr).setArgList(self.ParseArgList());
				self.PopContext();
				break;
			}
			case eco.TokenType.SquareOpen:
			{
				self.Accept();
				var litArray = eco.LitArrayExpressionNode._New3(new eco.LitArrayExpressionNode());
				expr = litArray;
				expr.SetFromState(state);
				if (!self.Check1(eco.TokenType.SquareClose))
				{
					litArray._items.push(self.ParseExpression());
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						litArray._items.push(self.ParseExpression());
					}

				}
				self.Accept1(eco.TokenType.SquareClose, true);
				break;
			}
			case eco.TokenType.BraceOpen:
			{
				self.Accept();
				var litMap = eco.LitMapExpressionNode._New3(new eco.LitMapExpressionNode());
				expr = litMap;
				expr.SetFromState(state);
				if (!self.Check1(eco.TokenType.BraceClose))
				{
					var key = "";
					if (self.Check1(eco.TokenType.Ident))
						key = self.Accept1(eco.TokenType.Ident, true)._value;
					else if (self.Check1(eco.TokenType.String))
					{
						var tkey = self.Accept1(eco.TokenType.String, true)._value;
						tkey = tkey.substr(1, tkey.length - 2);
						key = tkey;
					}
					else if (self.Check())
						self.Error("Unexpected token '" + eco.Token.GetTokenName(self.Check()._tokType) + "', expected identifier or string");
					else
						self.Error("Unexpected token. Expected identifier or string");

					self.Accept1(eco.TokenType.Colon, true);
					var value = self.ParseExpression();
					litMap._items[key] = value;
					while (self.Check1(eco.TokenType.Comma))
					{
						self.Accept();
						if (self.Check1(eco.TokenType.Ident))
							key = self.Accept1(eco.TokenType.Ident, true)._value;
						else if (self.Check1(eco.TokenType.String))
						{
							var tkey1 = self.Accept1(eco.TokenType.String, true)._value;
							tkey1 = tkey1.substr(1, tkey1.length - 2);
							key = tkey1;
						}
						else if (self.Check())
							self.Error("Unexpected token '" + eco.Token.GetTokenName(self.Check()._tokType) + "', expected identifier or string");
						else
							self.Error("Unexpected token. Expected identifier or string");

						self.Accept1(eco.TokenType.Colon, true);
						value = self.ParseExpression();
						litMap._items[key] = value;
					}

				}
				self.Accept1(eco.TokenType.BraceClose, true);
				break;
			}
			case eco.TokenType.AsmStr:
			{
				expr = eco.AssemblyExpressionNode._New4(new eco.AssemblyExpressionNode(), self.Accept()._value);
				expr.SetFromState(state);
				break;
			}
			default:
			{
				self.RestoreState(oldState);
				self.Error1("Unexpected token '" + eco.Token.GetTokenName(token._tokType) + "'. Expected value", state);
			}
		}
		if (isNative && !supportsNative)
			self.Error1("Illegal native expression", state);
		while (self.Check1(eco.TokenType.Dot) || self.Check1(eco.TokenType.SquareOpen) || self.Check1(eco.TokenType.ParOpen))
		{
			if (self.Check1(eco.TokenType.Dot))
			{
				var dot = self.Accept();
				if (self._dotAccessAlertCb && self._scope)
				{
					if ((self._curLine == self._alertLine) && (self._curCol == self._alertColumn))
					{
						var type1 = expr.GetTypeOf(self._scope, self);
						if (type1)
							self._dotAccessAlertCb(type1);
					}
				}
				if (self._typeAlertCb && self._scope)
				{
					if (self._scope && self._curLine == self._alertLine && self._curCol == self._alertColumn)
					{
						var typeNode = eco.TypeNode.Generate(expr.GenerateTypeString());
						var ns = self._scope._method._owner.GetNamespaceFromTypeNode(typeNode);
						if (ns)
						{
							self.AddContext(eco.ParserContext.Type);
							self._typeAlertCb(ns, self.CurrentContext(), false);
							self.PopContext();
						}
					}
				}
				state = self.SaveState();
				var token1 = self.Accept();
				if (token1._tokType != eco.TokenType.Ident)
				{
					if (token1._tokType >= eco.TokenType.KW_Start && token1._tokType <= eco.TokenType.KW_End)
						token1 = eco.Token._New1(new eco.Token(), eco.TokenType.Ident, eco.Token.GetTokenName(token1._tokType));
					else
						self.Error1("Expected identifier", state);

				}
				var name2 = token1._value;
				if (self.Check1(eco.TokenType.ParOpen))
				{
					var call = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), name2);
					call.SetFromState(state);
					var methodCall = eco.MethodCallExpressionNode._New4(new eco.MethodCallExpressionNode(), expr, call);
					call.setArgList(self.ParseArgList());
					expr = methodCall;
				}
				else
				{
					var acc = eco.AccessExpressionNode._New4(new eco.AccessExpressionNode(), expr, name2);
					acc.SetFromState(state);
					expr = acc;
				}

				expr.SetFromState(state);
			}
			else if (self.Check1(eco.TokenType.SquareOpen))
			{
				self.Accept();
				var index = self.ParseExpression();
				self.Accept1(eco.TokenType.SquareClose, true);
				var access = eco.ArrayAccessExpressionNode._New4(new eco.ArrayAccessExpressionNode(), expr, index);
				expr = access;
			}
			else if (self.Check1(eco.TokenType.ParOpen))
			{
				var call1 = eco.ComplexCallExpressionNode._New4(new eco.ComplexCallExpressionNode(), expr);
				call1.SetFromState(state);
				call1.setArgList(self.ParseArgList());
				expr = call1;
			}
		}

		token = self.Check1(eco.TokenType.Operator);
		if (token)
		{
			var op1 = token;
			if (op1.IsPostOp())
			{
				state = self.SaveState();
				self.Accept();
				var postOp = eco.PostOpExpressionNode._New6(new eco.PostOpExpressionNode(), op1._opType, expr);
				postOp.SetFromState(state);
				return postOp;
			}
		}
		return expr;
	};

	// ExpressionNode[] ParseArgList()
	Parser.prototype.ParseArgList = function() {
		var self = this;
		var args = [];
		self.Accept1(eco.TokenType.ParOpen, true);
		if (!self.Check1(eco.TokenType.ParClose))
		{
			args.push(self.ParseExpression());
			while (self.Check1(eco.TokenType.Comma))
			{
				self.Accept();
				args.push(self.ParseExpression());
			}

		}
		self.Accept1(eco.TokenType.ParClose, true);
		return args;
	};

	// HTMLExpressionNode ParseHTML()
	Parser.prototype.ParseHTML = function() {
		var self = this;
		var state = self.SaveState();
		self.Accept();
		var html = null;
		var elemType = null;
		var isExprType = false;
		if (self.Check1(eco.TokenType.Ident))
		{
			elemType = self.ParseType();
			html = eco.HTMLExpressionNode._New4(new eco.HTMLExpressionNode(), elemType);
		}
		else if (self.Check1(eco.TokenType.SquareOpen))
		{
			self.Accept();
			isExprType = true;
			html = eco.HTMLExpressionNode._New5(new eco.HTMLExpressionNode(), self.ParseExpression());
			self.Accept1(eco.TokenType.SquareClose, true);
		}
		else
			self.Error("Unexpected token '" + eco.Token.GetTokenName(self.Check()._tokType) + "'. Expected HTML element");

		html.SetFromState(state);
		var curPos = self.GetCurPos();
		if (!self.Check2(eco.OpType.CmpGT))
		{
			var foundClone = false;
			while (self.Check1(eco.TokenType.Ident) || self.Check1(eco.TokenType.String) || self.Check1(eco.TokenType.K_Class) || self.Check1(eco.TokenType.K_For) || self.Check1(eco.TokenType.BraceOpen))
			{
				if (self.Check1(eco.TokenType.BraceOpen))
				{
					if (foundClone)
						self.Error("Element already has attribute clone");
					else
					{
						foundClone = true;
						self.Accept();
						html.setAttributeClone(self.ParseExpression());
						self.Accept1(eco.TokenType.BraceClose, true);
						curPos = self.GetCurPos();
					}

				}
				else
				{
					var key = "";
					if (self.Check1(eco.TokenType.Ident))
					{
						self.Revert(self.GetCurPos() - (self.Check()._value).length);
						key = self.AcceptHTMLAttr()._value;
					}
					else if (self.Check1(eco.TokenType.String))
						key = self.Accept()._value;
					else if (self.Check1(eco.TokenType.K_Class))
					{
						self.Accept();
						key = "class";
					}
					else if (self.Check1(eco.TokenType.K_For))
					{
						self.Accept();
						key = "for";
					}
					self.Accept2(eco.OpType.Assign, true);
					var value = self.ParseValue();
					curPos = self.GetCurPos();
					if (key == "styling")
					{
						if (value._exprType != eco.ExpressionType.Lit || (value)._lit._tokType != eco.TokenType.String)
							self.Error4("Element styling attribute must be literal string", value);
						else
							html._attr[key] = eco.LitExpressionNode._New4(new eco.LitExpressionNode(), eco.Token._New1(new eco.Token(), eco.TokenType.String, "\"_est" + eco.Namespace.AddStyling((value)._lit._value) + "\""));

					}
					else if (key == "style")
					{
						if (value._exprType != eco.ExpressionType.Lit || (value)._lit._tokType != eco.TokenType.String)
							html._attr[key] = value;
						else
						{
							html._attr["styling"] = eco.LitExpressionNode._New4(new eco.LitExpressionNode(), eco.Token._New1(new eco.Token(), eco.TokenType.String, "\"_est" + eco.Namespace.AddStyling((value)._lit._value) + "\""));
						}

					}
					else
						html._attr[key] = value;

				}

			}

		}
		if (self.Check2(eco.OpType.CmpGT))
		{
			self.Accept();
			curPos = self.GetCurPos();
			var curLine = self.GetCurLine();
			while (self.HasNext() && !self.Check1(eco.TokenType.MClose))
			{
				if (self.Check2(eco.OpType.CmpLT))
				{
					html.AddChild(self.ParseHTML());
					curPos = self.GetCurPos();
					curLine = self.GetCurLine();
				}
				else if (self.Check1(eco.TokenType.BraceOpen))
				{
					self.Accept();
					var val = self.ParseExpression();
					self.Accept1(eco.TokenType.BraceClose, true);
					var code = eco.HTMLCodeExpressionNode._New7(new eco.HTMLCodeExpressionNode(), val);
					html.AddChild(code);
				}
				else
				{
					self.Revert(curPos);
					self.SetCurLine(curLine);
					var val1 = self.FormatString(self.AcceptHTMLText());
					curPos = self.GetCurPos() + 1;
					curLine = self.GetCurLine();
					var text = eco.HTMLTextExpressionNode._New7(new eco.HTMLTextExpressionNode(), val1);
					html.AddChild(text);
				}

			}

			self.Accept1(eco.TokenType.MClose, true);
			if (!isExprType)
			{
				if (self.Accept1(eco.TokenType.Ident, true)._value != elemType._name)
					self.Error("Expected </" + elemType._name + ">");
			}
			self.Accept2(eco.OpType.CmpGT, true);
		}
		else
		{
			self.Accept1(eco.TokenType.MSelfClose, true);
		}

		return html;
	};

	// ExpressionNode FormatString(Token)
	Parser.prototype.FormatString = function(input) {
		var self = this;
		var str = input._value;
		var vars = [];
		var variable = "";
		var nstr = "";
		var invar = false;
		for (var c = 0; c < str.length; c++)
		{
			if (!invar)
			{
				if (c < str.length - 2)
				{
					if (str[c] == '$' && str[c + 1] == '{')
					{
						invar = true;
						nstr = nstr + "%{";
						c++;
						continue;
					}
				}
				nstr = nstr + str[c];
			}
			else
			{
				if (str[c] == '}')
				{
					nstr = nstr + ("" + vars.length);
					nstr = nstr + "}";
					invar = false;
					vars.push(variable);
					variable = "";
				}
				else
					variable = variable + str[c];

			}

		}

		if (vars.length == 0)
		{
			return eco.LitExpressionNode._New4(new eco.LitExpressionNode(), input);
		}
		else
		{
			var stringLiteral = eco.LitExpressionNode._New4(new eco.LitExpressionNode(), eco.Token._New1(new eco.Token(), eco.TokenType.String, nstr));
			var formatCall = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), "Format");
			var args = eco.LitArrayExpressionNode._New3(new eco.LitArrayExpressionNode());
			formatCall._argList.push(args);
			for (var arg of vars)
				args._items.push(eco.TypecastExpressionNode._New4(new eco.TypecastExpressionNode(), eco.TypeNode.Generate("string"), self.CreateLoadExpression(arg)));

			return eco.MethodCallExpressionNode._New4(new eco.MethodCallExpressionNode(), stringLiteral, formatCall);
		}

	};

	// ExpressionNode CreateLoadExpression(string)
	Parser.prototype.CreateLoadExpression = function(input) {
		var self = this;
		var hasDot = false;
		for (var c of input)
		{
			if (c == '.')
			{
				hasDot = true;
				break;
			}
		}

		if (hasDot)
		{
			var tokens = [];
			var token = "";
			for (var c1 of input)
			{
				if (c1 == '.')
				{
					tokens.push(token);
					token = "";
				}
				else
					token = token + c1;

			}

			tokens.push(token);
			var expr = eco.LoadExpressionNode._New4(new eco.LoadExpressionNode(), tokens[0], false);
			for (var t = 1; t < tokens.length; t++)
			{
				var access = eco.AccessExpressionNode._New4(new eco.AccessExpressionNode(), expr, tokens[t]);
				expr = access;
			}

			return expr;
		}
		else
			return eco.LoadExpressionNode._New4(new eco.LoadExpressionNode(), input, false);

	};

	// void AddScope()
	Parser.prototype.AddScope = function() {
		var self = this;
		if (self._scope)
			self._scope = eco.Scope._New1(new eco.Scope(), self._scope._method, self._scope);
	};

	// void PopScope()
	Parser.prototype.PopScope = function() {
		var self = this;
		if (self._scope)
			self._scope = self._scope._parent;
	};

	// void AddContext(ParserContext)
	Parser.prototype.AddContext = function(context) {
		var self = this;
		self._context.push(context);
	};

	// ParserContext PopContext()
	Parser.prototype.PopContext = function() {
		var self = this;
		var last = self._context[self._context.length - 1];
		self._context.pop();
		return last;
	};

	// ParserContext CurrentContext()
	Parser.prototype.CurrentContext = function() {
		var self = this;
		return self._context[self._context.length - 1];
	};

	return Parser;
}(eco.Lexer));

/**

 */
eco.Namespace = (function(_base) {
	__extends(Namespace, _base);

	function Namespace() {
	}

	Namespace._currentPckId = 0;
	Namespace._stylingClasses = [];
	Namespace._eventTypes = [];
	Namespace._namespacesCheckedForNamespace = {};
	Namespace._namespacesCheckedForSymbol = {};
	// Constructor _New()
	Namespace._New2 = function(self) {
		self = _base._New(self) || self;
		self._symbols = null;
		self._spansMultipleFiles = false;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._usings = null;
		self._methodCache = null;
		self._symbolCache = null;
		self._namespaceCache = null;
		self._typeCache = null;
		return self;
	};

	// Constructor _New(string)
	Namespace._New3 = function(self, name) {
		self = _base._New1(self, name) || self;
		self._symbols = null;
		self._spansMultipleFiles = false;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._usings = null;
		self._methodCache = null;
		self._symbolCache = null;
		self._namespaceCache = null;
		self._typeCache = null;
		self._symbolType = eco.SymbolType.Namespace;
		self._symbols = {};
		self._usings = [];
		self._symbolCache = {};
		self._namespaceCache = {};
		self._typeCache = {};
		self._methodCache = {};
		return self;
	};

	// static void ClearStaticData()
	Namespace.ClearStaticData = function() {
		Namespace._namespacesCheckedForSymbol = {};
		Namespace._namespacesCheckedForNamespace = {};
		if (Namespace._eventTypes)
		{
			for (var eventType of Namespace._eventTypes)
				eventType.RemoveFromNamespace();

		}
		Namespace._eventTypes = [];
	};

	// static void SetCurrentPackageID(int)
	Namespace.SetCurrentPackageID = function(id) {
		Namespace._currentPckId = id;
	};

	// static int getCurrentPackageID()
	Namespace.getCurrentPackageID = function() {
		return Namespace._currentPckId;
	};

	// static void ClearStylingClasses()
	Namespace.ClearStylingClasses = function() {
		Namespace._stylingClasses = [];
	};

	// static string[] getStylingClasses()
	Namespace.getStylingClasses = function() {
		return Namespace._stylingClasses;
	};

	// static string AddStyling(string)
	Namespace.AddStyling = function(style) {
		Namespace._stylingClasses.push(style);
		return Namespace._currentPckId + "_" + (Namespace._stylingClasses.length - 1);
	};

	// static EventType[] getEventTypes()
	Namespace.getEventTypes = function() {
		return Namespace._eventTypes;
	};

	// map<Symbol> getSymbols()
	Namespace.prototype.getSymbols = function() {
		var self = this;
		return self._symbols;
	};

	// Symbol[] getSymbolArray()
	Namespace.prototype.getSymbolArray = function() {
		var self = this;
		var arr = [];
		for (var key of Object.keys(self._symbols))
			arr.push(self._symbols[key]);

		return arr;
	};

	// void CollectVisibleNamespaces(Namespace[])
	Namespace.prototype.CollectVisibleNamespaces = function(visible) {
		var self = this;
		var addSymbol = function (symbol) {
			if (symbol)
			{
				var found = false;
				for (var ns of visible)
				{
					if (ns == symbol)
					{
						found = true;
						break;
					}
				}

				if (!found && symbol.IsNamespace())
				{
					var ns1 = symbol;
					if (ns1._symbolType == eco.SymbolType.Class)
					{
						if (!(ns1)._isNative)
							visible.push(ns1);
					}
					else
						visible.push(ns1);

				}
			}
		};
		for (var key of Object.keys(self._symbols))
		{
			var symbol1 = self._symbols[key];
			addSymbol(symbol1);
		}

	};

	// bool getSpansMultipleFiles()
	Namespace.prototype.getSpansMultipleFiles = function() {
		var self = this;
		return self._spansMultipleFiles;
	};

	// bool setSpansMultipleFiles(bool)
	Namespace.prototype.setSpansMultipleFiles = function(value) {
		var self = this;
		self._spansMultipleFiles = value;
	};

	// int getDefinitionEndLine()
	Namespace.prototype.getDefinitionEndLine = function() {
		var self = this;
		return self._defEndLine;
	};

	// int setDefinitionEndLine(int)
	Namespace.prototype.setDefinitionEndLine = function(value) {
		var self = this;
		self._defEndLine = value;
	};

	// int getDefinitionEndColumn()
	Namespace.prototype.getDefinitionEndColumn = function() {
		var self = this;
		return self._defEndColumn;
	};

	// int setDefinitionEndColumn(int)
	Namespace.prototype.setDefinitionEndColumn = function(value) {
		var self = this;
		self._defEndColumn = value;
	};

	// Namespace[] getUsings()
	Namespace.prototype.getUsings = function() {
		var self = this;
		return self._usings;
	};

	// void UseNamespace(Namespace)
	Namespace.prototype.UseNamespace = function(ns) {
		var self = this;
		var fullName = ns.getFullName();
		for (var used of self._usings)
			if (used.getFullName() == fullName)
				return;

		self._usings.push(ns);
	};

	// virtual bool SetSymbol(Symbol,bool)
	Namespace.prototype.SetSymbol = function(symbol, copyIfNamespace) {
		var self = this;
		var signature = symbol.Signature();
		if (copyIfNamespace)
		{
			if (symbol.GetSymbolType() == eco.SymbolType.Namespace)
			{
				var ns = symbol;
				var copy = eco.Namespace._New3(new eco.Namespace(), ns._name);
				copy.setStartLine(ns._startLine);
				copy.setEndLine(ns._endLine);
				copy.setStartColumn(ns._startColumn);
				copy.setEndColumn(ns._endColumn);
				copy.setFileID(ns._fileId);
				copy._imported = ns._imported;
				copy.setDocs(ns._docs);
				copy.setDefinitionEndLine(ns._defEndLine);
				copy.setDefinitionEndColumn(ns._defEndColumn);
				for (var used of ns._usings)
					copy.UseNamespace(used);

				for (var sym of ns.getSymbolArray())
					copy.SetSymbol(sym, true);

				symbol = copy;
			}
		}
		self._symbols[signature] = symbol;
		symbol.setNamespace(self);
		return true;
	};

	// void RemoveSymbol(Symbol)
	Namespace.prototype.RemoveSymbol = function(symbol) {
		var self = this;
		var signature = symbol.Signature();
		if (((self._symbols)[signature] !== undefined))
		{
			with({self: self, symbol: symbol, signature: signature})
			{
				 delete this._symbols[signature]; 
			}
		}
	};

	// void SetLineCount(int)
	Namespace.prototype.SetLineCount = function(lineCount) {
		var self = this;
		self.setStartLine(0);
		self.setStartColumn(0);
		self.setEndLine(lineCount + 1);
		self.setEndColumn(1);
	};

	// void ClearCache()
	Namespace.prototype.ClearCache = function() {
		var self = this;
		self._symbolCache = {};
		self._namespaceCache = {};
		self._typeCache = {};
		self._methodCache = {};
		if (self._namespace)
			self._namespace.ClearCache();
	};

	// void ClearAll()
	Namespace.prototype.ClearAll = function() {
		var self = this;
		self._typeCache = {};
		self._namespaceCache = {};
		self._symbolCache = {};
		self._usings = [];
		if (self._symbols)
		{
			for (var key of Object.keys(self._symbols))
			{
				var symbol = self._symbols[key];
				if (!symbol._imported)
				{
					if (symbol._symbolType == eco.SymbolType.Class)
					{
						if (!(symbol)._isNative)
							self.RemoveSymbol(symbol);
					}
					else
						self.RemoveSymbol(symbol);

				}
			}

		}
	};

	// void RefreshFile(string)
	Namespace.prototype.RefreshFile = function(fileId) {
		var self = this;
		self._typeCache = {};
		self._namespaceCache = {};
		self._symbolCache = {};
		self._usings = [];
		if (self._symbols)
		{
			for (var key of Object.keys(self._symbols))
			{
				var symbol = self._symbols[key];
				if (symbol.IsNamespace())
				{
					(symbol)._namespaceCache = {};
					(symbol)._typeCache = {};
					(symbol)._symbolCache = {};
				}
				if (symbol._fileId == fileId)
				{
					if (!symbol._imported)
					{
						if (symbol._symbolType == eco.SymbolType.Namespace)
						{
							if (!(symbol)._spansMultipleFiles)
								self.RemoveSymbol(self._symbols[key]);
						}
					}
				}
			}

		}
	};

	// virtual Symbol GetSymbolBySignature(string,bool)
	Namespace.prototype.GetSymbolBySignature = function(signature, local) {
		var self = this;
		Namespace._namespacesCheckedForSymbol[self.getFullName()] = true;
		if (((self._symbols)[signature] !== undefined))
		{
			Namespace._namespacesCheckedForSymbol = {};
			return self._symbols[signature];
		}
		if (!local)
		{
			var found = null;
			if (self._namespace && !((Namespace._namespacesCheckedForSymbol)[self._namespace.getFullName()] !== undefined))
				found = self._namespace.GetSymbolBySignature(signature, false);
			if (found)
			{
				Namespace._namespacesCheckedForSymbol = {};
				return found;
			}
			for (var used of self._usings)
			{
				if (used && !((Namespace._namespacesCheckedForSymbol)[used.getFullName()] !== undefined))
				{
					found = used.GetSymbolBySignature(signature, false);
					if (found)
					{
						Namespace._namespacesCheckedForSymbol = {};
						return found;
					}
				}
			}

		}
		map_Omit(Namespace._namespacesCheckedForSymbol, [self.getFullName()]);
		return null;
	};

	// virtual Namespace GetNamespaceBySignature(string,bool)
	Namespace.prototype.GetNamespaceBySignature = function(signature, local) {
		var self = this;
		if (signature == self.Signature())
			return self;
		Namespace._namespacesCheckedForNamespace[self.getFullName()] = true;
		if (((self._symbols)[signature] !== undefined) && self._symbols[signature].IsNamespace())
		{
			Namespace._namespacesCheckedForNamespace = {};
			return self._symbols[signature];
		}
		if (!local)
		{
			var found = null;
			if (self._namespace && !((Namespace._namespacesCheckedForNamespace)[self._namespace.getFullName()] !== undefined))
				found = self._namespace.GetNamespaceBySignature(signature, false);
			if (found)
			{
				Namespace._namespacesCheckedForNamespace = {};
				return found;
			}
			for (var used of self._usings)
			{
				if (used && !((Namespace._namespacesCheckedForNamespace)[used.getFullName()] !== undefined))
				{
					found = used.GetNamespaceBySignature(signature, false);
					if (found)
					{
						Namespace._namespacesCheckedForNamespace = {};
						return found;
					}
				}
			}

		}
		map_Omit(Namespace._namespacesCheckedForNamespace, [self.getFullName()]);
		return null;
	};

	// Interface GetInterfaceFromTypeNode(TypeNode)
	Namespace.prototype.GetInterfaceFromTypeNode = function(node) {
		var self = this;
		var name = node.getFullName();
		var found = self.GetNamespaceFromTypeNode(node);
		if (found && found.IsInterface())
		{
			self._typeCache[name] = found;
			var intr = found;
			if (intr.IsTypedef())
				return (intr)._otherType;
			return intr;
		}
		return null;
	};

	// Namespace GetNamespaceFromTypeNode(TypeNode)
	Namespace.prototype.GetNamespaceFromTypeNode = function(node) {
		var self = this;
		var ns = self;
		if (node._parent)
			ns = self.GetNamespaceFromTypeNode(node._parent);
		Namespace._namespacesCheckedForNamespace = {};
		return ns ? ns.GetNamespaceBySignature(node._name, false) : null;
	};

	// Interface GetType(TypeNode,function<TypeNode>:object)
	Namespace.prototype.GetType = function(node, onError) {
		var self = this;
		if (!node)
			return null;
		if (!node._parent && ((eco.Interface.BasicTypes())[node._name] !== undefined))
			return eco.Interface.BasicTypes()[node._name];
		var name = node.getFullName();
		if (node.IsArray())
		{
			if ((node)._elem)
			{
				var elem = self.GetType((node)._elem, onError);
				if (elem)
				{
					var type = elem.getArrayOf();
					self._typeCache[name] = type;
					return type;
				}
				var type1 = eco.Interface.getNullType().getArrayOf();
				self._typeCache[name] = type1;
				return type1;
			}
			var type2 = eco.Interface.getObjectType().getArrayOf();
			self._typeCache[name] = type2;
			return type2;
		}
		else if (node.IsMap())
		{
			if ((node)._elem)
			{
				var elem1 = self.GetType((node)._elem, onError);
				if (elem1)
				{
					var type3 = elem1.getMapOf();
					self._typeCache[name] = type3;
					return type3;
				}
				var type4 = eco.Interface.getNullType().getMapOf();
				self._typeCache[name] = type4;
				return type4;
			}
			var type5 = eco.Interface.getObjectType().getMapOf();
			self._typeCache[name] = type5;
			return type5;
		}
		else if (node.IsFunction())
		{
			var funcNode = node;
			var func = eco.FunctionType._New6(new eco.FunctionType());
			var paramCount = 0;
			for (var paramTypeNode of funcNode._paramTypes)
			{
				var paramType = self.GetType(paramTypeNode, onError);
				func.AddParam(paramType, funcNode._paramNames[paramCount]);
				paramCount++;
			}

			if (funcNode._retType)
				func.setReturnType(self.GetType(funcNode._retType, onError));
			self._typeCache[name] = func;
			return func;
		}
		else if (node.IsEvent())
		{
			var eventNode = node;
			var evnt = eco.EventType._New8(new eco.EventType());
			for (var paramTypeNode1 of eventNode._paramTypes)
			{
				var paramType1 = self.GetType(paramTypeNode1, onError);
				evnt.AddParamType(paramType1);
			}

			Namespace._eventTypes.push(evnt);
			eco.EcoStdLib.CreateEventMethods(evnt);
			self._typeCache[name] = evnt;
			return evnt;
		}
		else if (node.IsInline())
		{
			var inlineNode = node;
			var inlineType = eco.InlineInterface._New6(new eco.InlineInterface());
			for (var member of inlineNode._members)
			{
				var createMember = (function(member, onError) {
					return function () {
					var memberType = member._type;
					var memberName = member._name;
					if (member.IsField())
					{
						return eco.Field._New5(new eco.Field(), self.GetType(memberType, onError), memberName);
					}
					else if (member.IsMethod())
					{
						var methodNode = member;
						var methodMember = eco.Method._New5(new eco.Method(), self.GetType(memberType, onError), memberName);
						for (var parameter of methodNode._params)
						{
							var paramType2 = parameter.type;
							var paramName = parameter.name;
							methodMember.AddParameter(self.GetType(paramType2, onError), paramName, null);
						}

						return methodMember;
					}
				};
				})(member, onError);
				inlineType.AddMember(createMember());
			}

			self._typeCache[name] = inlineType;
			return inlineType;
		}
		var found = self.GetInterfaceFromTypeNode(node);
		if (!found && onError)
			onError(node);
		return found;
	};

	// void RefreshSpan()
	Namespace.prototype.RefreshSpan = function() {
		var self = this;
		self._spansMultipleFiles = false;
		for (var key of Object.keys(self._symbols))
		{
			if (self._symbols[key]._symbolType == eco.SymbolType.Namespace)
				(self._symbols[key]).RefreshSpan();
		}

	};

	// virtual bool IsNamespace()
	Namespace.prototype.IsNamespace = function() {
		var self = this;
		return true;
	};

	// virtual bool IsInterface()
	Namespace.prototype.IsInterface = function() {
		var self = this;
		return false;
	};

	// virtual bool IsSymbolTable()
	Namespace.prototype.IsSymbolTable = function() {
		var self = this;
		return false;
	};

	/**

	 */
	Namespace.prototype.Serialise = function() {
		var self = this;
		var symbols = {};
		for (var symbol of self.getSymbolArray())
		{
			symbols[symbol._name] = symbol.Serialise();
		}

		return {"type": "namespace", "symbols": symbols};
	};

	/**

	 */
	Namespace.ImportSkeleton = function(name, symbols, parent, sharedImport) {
		var imported = eco.Namespace._New3(new eco.Namespace(), name);
		imported._imported = true;
		imported.setNamespace(parent);
		if (sharedImport)
		{
			var sharedSymbols = sharedImport.getSymbolArray();
			for (var symbol of sharedSymbols)
				imported.SetSymbol(symbol, false);

		}
		var subSymbols = symbols["symbols"];
		for (var key of Object.keys(subSymbols))
		{
			var symbol1 = subSymbols[key];
			var type = symbol1["type"];
			switch (type)
			{
				case "package":
				case "namespace":
				{
					imported.SetSymbol(Namespace.ImportSkeleton(key, symbol1, imported, null), false);
					break;
				}
				case "interface":
				{
					imported.SetSymbol(eco.Interface.ImportSkeleton1(key, symbol1, imported), false);
					break;
				}
				case "class":
				{
					imported.SetSymbol(eco.Class.ImportSkeleton2(key, symbol1, imported), false);
					break;
				}
				case "template":
				{
					imported.SetSymbol(eco.Template.ImportSkeleton3(key, symbol1, imported), false);
					break;
				}
				case "server-comp":
				{
					imported.SetSymbol(eco.ServerComponent.ImportSkeleton3(key, symbol1, imported), false);
					break;
				}
				case "client-comp":
				{
					imported.SetSymbol(eco.ClientComponent.ImportSkeleton3(key, symbol1, imported), false);
					break;
				}
				case "init":
				{
					imported.SetSymbol(eco.Initialiser.ImportSkeleton3(key, symbol1, imported), false);
					break;
				}
				case "service":
				{
					imported.SetSymbol(eco.Service.ImportSkeleton3(key, symbol1, imported), false);
					break;
				}
				case "enum":
				{
					imported.SetSymbol(eco.Enum.ImportEnum(key, symbol1, imported), false);
					break;
				}
			}
		}

		return imported;
	};

	/**

	 */
	Namespace.ImportFull = function(name, ns, symbol) {
		var subSymbols = symbol["symbols"];
		for (var key of Object.keys(subSymbols))
		{
			var child = subSymbols[key];
			switch (child["type"])
			{
				case "package":
				case "namespace":
				{
					Namespace.ImportFull(key, ns._symbols[key], child);
					break;
				}
				case "interface":
				{
					eco.Interface.ImportFull1(ns._symbols[key], child);
					break;
				}
				case "class":
				{
					eco.Class.ImportFull2(ns._symbols[key], child);
					break;
				}
				case "template":
				{
					eco.Template.ImportFull3(ns._symbols[key], child);
					break;
				}
				case "server-comp":
				{
					eco.ServerComponent.ImportFull3(ns._symbols[key], child);
					break;
				}
				case "client-comp":
				{
					eco.ClientComponent.ImportFull3(ns._symbols[key], child);
					break;
				}
				case "init":
				{
					eco.Initialiser.ImportFull3(ns._symbols[key], child);
					break;
				}
				case "service":
				{
					eco.Service.ImportFull3(ns._symbols[key], child);
					break;
				}
			}
		}

	};

	return Namespace;
}(eco.Symbol));

/**

 */
eco.Member = (function(_base) {
	__extends(Member, _base);

	function Member() {
	}

	// Constructor _New()
	Member._New2 = function(self) {
		self = _base._New(self) || self;
		self._memberType = null;
		self._owner = null;
		self._type = null;
		self._access = null;
		self._static = false;
		self._implementing = null;
		return self;
	};

	// Constructor _New(Interface,string)
	Member._New3 = function(self, type, name) {
		self = _base._New1(self, name) || self;
		self._memberType = null;
		self._owner = null;
		self._type = null;
		self._access = null;
		self._static = false;
		self._implementing = null;
		self._symbolType = eco.SymbolType.Member;
		self._type = type;
		self._access = eco.MemberAccess.Public;
		return self;
	};

	// MemberType getMemberType()
	Member.prototype.getMemberType = function() {
		var self = this;
		return self._memberType;
	};

	// Interface getOwner()
	Member.prototype.getOwner = function() {
		var self = this;
		return self._owner;
	};

	// Interface setOwner(Interface)
	Member.prototype.setOwner = function(value) {
		var self = this;
		self._owner = value;
	};

	// Interface getType()
	Member.prototype.getType1 = function() {
		var self = this;
		return self._type;
	};

	// MemberAccess getAccess()
	Member.prototype.getAccess = function() {
		var self = this;
		return self._access;
	};

	// MemberAccess setAccess(MemberAccess)
	Member.prototype.setAccess = function(value) {
		var self = this;
		self._access = value;
	};

	// bool getStatic()
	Member.prototype.getStatic = function() {
		var self = this;
		return self._static;
	};

	// bool setStatic(bool)
	Member.prototype.setStatic = function(value) {
		var self = this;
		self._static = value;
	};

	// Member getImplementing()
	Member.prototype.getImplementing = function() {
		var self = this;
		return self._implementing;
	};

	// Member setImplementing(Member)
	Member.prototype.setImplementing = function(value) {
		var self = this;
		self._implementing = value;
	};

	// bool AccessibleFrom(Method)
	Member.prototype.AccessibleFrom = function(method) {
		var self = this;
		var intr = method._owner;
		switch (self._access)
		{
			case eco.MemberAccess.Public:
				return true;
			case eco.MemberAccess.Private:
				return intr == self._owner;
			case eco.MemberAccess.Protected:
			{
				if (intr.GetSymbolType() != eco.SymbolType.Class && intr.GetSymbolType() != eco.SymbolType.Symbol)
					return false;
				var cls = intr;
				return cls.DistanceTo(self._owner) >= 0;
			}
			default:
				return false;
		}
	};

	// virtual bool IsField()
	Member.prototype.IsField = function() {
		var self = this;
		return false;
	};

	// virtual bool IsMethod()
	Member.prototype.IsMethod = function() {
		var self = this;
		return false;
	};

	// virtual bool IsProperty()
	Member.prototype.IsProperty = function() {
		var self = this;
		return false;
	};

	// virtual bool IsConstructor()
	Member.prototype.IsConstructor = function() {
		var self = this;
		return false;
	};

	return Member;
}(eco.Symbol));

// Class JSServerTranslator : JSTranslator
eco.JSServerTranslator = (function(_base) {
	__extends(JSServerTranslator, _base);

	function JSServerTranslator() {
	}

	// Constructor _New()
	JSServerTranslator._New = function(self) {
		self = _base._New2(self) || self;
		return self;
	};

	// Constructor _New(int,string,CompilationTarget,ImportNode[],SymbolTable,SymbolTable)
	JSServerTranslator._New1 = function(self, packageId, projectName, target, imports, symbolTable, sharedSymbolTable) {
		self = _base._New3(self, packageId, projectName, target, imports, symbolTable, symbolTable, sharedSymbolTable) || self;
		return self;
	};

	// void CreateStart()
	JSServerTranslator.prototype.CreateStart = function() {
		var self = this;
		_base.prototype.CreateStart.call(self);
		if (self.DebugMode)
		{
			self.Comment("Extend console");
			self.WriteLine("var __console_log = console.log;", true);
			self.WriteLine("console.log = function(msg) {", true);
			self.Indent();
			self.WriteLine("process.send({stdout: msg, stderr: ''});", true);
			self.WriteLine("__console_log(msg);", true);
			self.Outdent();
			self.WriteLine("};\n", true);
			self.WriteLine("var __console_error = console.error;", true);
			self.WriteLine("console.error = function(msg) {", true);
			self.Indent();
			self.WriteLine("process.send({stdout: '', stderr: msg});", true);
			self.WriteLine("__console_error(msg);", true);
			self.Outdent();
			self.WriteLine("};\n", true);
		}
	};

	// void CreateEnd()
	JSServerTranslator.prototype.CreateEnd = function() {
		var self = this;
		if (self._target == eco.CompilationTarget.Server)
		{
			self.Comment("Node exports");
			self.WriteLine("module.exports = {", true);
			self.WriteLine("};\n\n", true);
			var main = self.getSymbolTable().GetSymbolBySignature(self._projectName, true);
			if (main && main.IsNamespace() && (main).IsInterface() && (main).IsClass())
			{
				var mainClass = main;
				var ctor = mainClass.GetMember("_New()");
				if (ctor)
				{
					self.Comment("Start by calling default constructor on " + mainClass._name);
					self.WriteLine("try", true);
					self.WriteLine("{", true);
					self.Indent();
					self.WriteLine(mainClass.getFullName() + "." + ctor.CompiledName() + "(new " + mainClass.getFullName() + "());", true);
					self.Outdent();
					self.WriteLine("}", true);
					self.WriteLine("catch (e)", true);
					self.WriteLine("{", true);
					self.Indent();
					self.WriteLine("console.error(e.stack);", true);
					self.Outdent();
					self.WriteLine("}", true);
				}
			}
		}
	};

	return JSServerTranslator;
}(eco.JSTranslator));

/**

 */
eco.InterfaceNode = (function(_base) {
	__extends(InterfaceNode, _base);

	function InterfaceNode() {
	}

	// Constructor _New()
	InterfaceNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._members = [];
		return self;
	};

	// Constructor _New(string)
	InterfaceNode._New4 = function(self, name) {
		self = _base._New2(self, name) || self;
		self._members = [];
		self._astType = eco.ASTType.Interface;
		return self;
	};

	// MemberNode[] getMembers()
	InterfaceNode.prototype.getMembers = function() {
		var self = this;
		return self._members;
	};

	// void AddMember(MemberNode)
	InterfaceNode.prototype.AddMember = function(member) {
		var self = this;
		self._members.push(member);
	};

	return InterfaceNode;
}(eco.NamespaceNode));

/**

 */
eco.ClassNode = (function(_base) {
	__extends(ClassNode, _base);

	function ClassNode() {
	}

	// Constructor _New()
	ClassNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._baseClass = null;
		self._interaces = null;
		self._members = null;
		self._isNative = false;
		return self;
	};

	// Constructor _New(string)
	ClassNode._New4 = function(self, name) {
		self = _base._New2(self, name) || self;
		self._baseClass = null;
		self._interaces = null;
		self._members = null;
		self._isNative = false;
		self._astType = eco.ASTType.Class;
		self._interaces = [];
		self._members = [];
		self._isNative = false;
		return self;
	};

	// TypeNode getBaseClass()
	ClassNode.prototype.getBaseClass = function() {
		var self = this;
		return self._baseClass;
	};

	// TypeNode setBaseClass(TypeNode)
	ClassNode.prototype.setBaseClass = function(value) {
		var self = this;
		self._baseClass = value;
	};

	// TypeNode[] getInterfaces()
	ClassNode.prototype.getInterfaces = function() {
		var self = this;
		return self._interaces;
	};

	// MemberNode[] getMembers()
	ClassNode.prototype.getMembers = function() {
		var self = this;
		return self._members;
	};

	// void AddMember(MemberNode)
	ClassNode.prototype.AddMember = function(member) {
		var self = this;
		self._members.push(member);
	};

	// bool getIsNative()
	ClassNode.prototype.getIsNative = function() {
		var self = this;
		return self._isNative;
	};

	// bool setIsNative(bool)
	ClassNode.prototype.setIsNative = function(value) {
		var self = this;
		self._isNative = value;
	};

	// void Implement(TypeNode)
	ClassNode.prototype.Implement = function(intrface) {
		var self = this;
		self._interaces.push(intrface);
	};

	return ClassNode;
}(eco.NamespaceNode));

/**

 */
eco.EnumNode = (function(_base) {
	__extends(EnumNode, _base);

	function EnumNode() {
	}

	// Constructor _New()
	EnumNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._kv = {};
		return self;
	};

	// Constructor _New(string)
	EnumNode._New4 = function(self, name) {
		self = _base._New2(self, name) || self;
		self._kv = {};
		self._astType = eco.ASTType.Enum;
		return self;
	};

	// map<int> getKVPairs()
	EnumNode.prototype.getKVPairs = function() {
		var self = this;
		return self._kv;
	};

	return EnumNode;
}(eco.NamespaceNode));

/**

 */
eco.FieldNode = (function(_base) {
	__extends(FieldNode, _base);

	function FieldNode() {
	}

	// Constructor _New()
	FieldNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._defaultValue = null;
		return self;
	};

	// Constructor _New(TypeNode,string)
	FieldNode._New4 = function(self, type, name) {
		self = _base._New2(self, type, name) || self;
		self._defaultValue = null;
		self._astType = eco.ASTType.Field;
		return self;
	};

	// virtual bool IsField()
	FieldNode.prototype.IsField = function() {
		var self = this;
		return true;
	};

	// ExpressionNode getDefault()
	FieldNode.prototype.getDefault = function() {
		var self = this;
		return self._defaultValue;
	};

	// ExpressionNode setDefault(ExpressionNode)
	FieldNode.prototype.setDefault = function(value) {
		var self = this;
		self._defaultValue = value;
	};

	return FieldNode;
}(eco.MemberNode));

/**

 */
eco.MethodNode = (function(_base) {
	__extends(MethodNode, _base);

	function MethodNode() {
	}

	// Constructor _New()
	MethodNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._virtual = false;
		self._aliased = false;
		self._params = null;
		self._block = null;
		return self;
	};

	// Constructor _New(TypeNode,string)
	MethodNode._New4 = function(self, type, name) {
		self = _base._New2(self, type, name) || self;
		self._virtual = false;
		self._aliased = false;
		self._params = null;
		self._block = null;
		self._astType = eco.ASTType.Method;
		self._params = [];
		return self;
	};

	// bool getVirtual()
	MethodNode.prototype.getVirtual = function() {
		var self = this;
		return self._virtual;
	};

	// bool setVirtual(bool)
	MethodNode.prototype.setVirtual = function(value) {
		var self = this;
		self._virtual = value;
	};

	// bool getAliased()
	MethodNode.prototype.getAliased = function() {
		var self = this;
		return self._aliased;
	};

	// bool setAliased(bool)
	MethodNode.prototype.setAliased = function(value) {
		var self = this;
		self._aliased = value;
	};

	// object[] getParams()
	MethodNode.prototype.getParams = function() {
		var self = this;
		return self._params;
	};

	// void AddParam(TypeNode,string,LitExpressionNode)
	MethodNode.prototype.AddParam = function(type, name, defaultValue) {
		var self = this;
		self._params.push({"type": type, "name": name, "defaultValue": defaultValue});
	};

	// BlockNode getBlock()
	MethodNode.prototype.getBlock = function() {
		var self = this;
		return self._block;
	};

	// BlockNode setBlock(BlockNode)
	MethodNode.prototype.setBlock = function(value) {
		var self = this;
		self._block = value;
	};

	// virtual bool IsMethod()
	MethodNode.prototype.IsMethod = function() {
		var self = this;
		return true;
	};

	return MethodNode;
}(eco.MemberNode));

/**

 */
eco.PropertyNode = (function(_base) {
	__extends(PropertyNode, _base);

	function PropertyNode() {
	}

	// Constructor _New()
	PropertyNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._fieldName = "";
		self._getter = null;
		self._getterIsBlock = false;
		self._setter = null;
		self._setterIsBlock = false;
		return self;
	};

	// Constructor _New(TypeNode,string)
	PropertyNode._New4 = function(self, type, name) {
		self = _base._New2(self, type, name) || self;
		self._fieldName = "";
		self._getter = null;
		self._getterIsBlock = false;
		self._setter = null;
		self._setterIsBlock = false;
		self._astType = eco.ASTType.Property;
		return self;
	};

	// string getFieldName()
	PropertyNode.prototype.getFieldName = function() {
		var self = this;
		return self._fieldName;
	};

	// string setFieldName(string)
	PropertyNode.prototype.setFieldName = function(value) {
		var self = this;
		self._fieldName = value;
	};

	// StatementNode getGetter()
	PropertyNode.prototype.getGetter = function() {
		var self = this;
		return self._getter;
	};

	// StatementNode setGetter(StatementNode)
	PropertyNode.prototype.setGetter = function(value) {
		var self = this;
		self._getter = value;
	};

	// bool getGetterIsBlock()
	PropertyNode.prototype.getGetterIsBlock = function() {
		var self = this;
		return self._getterIsBlock;
	};

	// bool setGetterIsBlock(bool)
	PropertyNode.prototype.setGetterIsBlock = function(value) {
		var self = this;
		self._getterIsBlock = value;
	};

	// StatementNode getSetter()
	PropertyNode.prototype.getSetter = function() {
		var self = this;
		return self._setter;
	};

	// StatementNode setSetter(StatementNode)
	PropertyNode.prototype.setSetter = function(value) {
		var self = this;
		self._setter = value;
	};

	// bool getSetterIsBlock()
	PropertyNode.prototype.getSetterIsBlock = function() {
		var self = this;
		return self._setterIsBlock;
	};

	// bool setSetterIsBlock(bool)
	PropertyNode.prototype.setSetterIsBlock = function(value) {
		var self = this;
		self._setterIsBlock = value;
	};

	// virtual bool IsProperty()
	PropertyNode.prototype.IsProperty = function() {
		var self = this;
		return true;
	};

	return PropertyNode;
}(eco.MemberNode));

/**

 */
eco.InlineInterfaceNode = (function(_base) {
	__extends(InlineInterfaceNode, _base);

	function InlineInterfaceNode() {
	}

	// Constructor _New()
	InlineInterfaceNode._New3 = function(self) {
		self = _base._New2(self, "type{}") || self;
		self._members = null;
		self._astType = eco.ASTType.InlineType;
		self._members = [];
		return self;
	};

	// MemberNode[] getMembers()
	InlineInterfaceNode.prototype.getMembers = function() {
		var self = this;
		return self._members;
	};

	// void AddMember(MemberNode)
	InlineInterfaceNode.prototype.AddMember = function(member) {
		var self = this;
		self._members.push(member);
		self._name = "type{";
		var getMemberName = function (member2) {
			var name = member2._type.getFullName() + " " + member2._name;
			if (member2.IsMethod())
			{
				name = name + "(";
				var methodMember = member2;
				if (methodMember._params.length > 0)
				{
					name = name + (methodMember._params[0].type).getFullName() + " " + methodMember._params[0].name;
					for (var p = 1; p < methodMember._params.length; p++)
					{
						name = name + ", " + (methodMember._params[p].type).getFullName() + " " + methodMember._params[p].name;
					}

				}
				name = name + ")";
			}
			return name;
		};
		self._name = self._name + getMemberName(self._members[0]);
		for (var m = 1; m < self._members.length; m++)
			self._name = self._name + ", " + getMemberName(self._members[m]);

		self._name = self._name + "}";
	};

	// virtual bool IsInline()
	InlineInterfaceNode.prototype.IsInline = function() {
		var self = this;
		return true;
	};

	return InlineInterfaceNode;
}(eco.TypeNode));

/**

 */
eco.ArrayTypeNode = (function(_base) {
	__extends(ArrayTypeNode, _base);

	function ArrayTypeNode() {
	}

	// Constructor _New()
	ArrayTypeNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._elem = null;
		return self;
	};

	// Constructor _New(TypeNode)
	ArrayTypeNode._New4 = function(self, elem) {
		self = _base._New2(self, elem ? (elem.getFullName() + "[]") : "array") || self;
		self._elem = null;
		self._elem = elem;
		self._astType = eco.ASTType.ArrayType;
		return self;
	};

	// TypeNode getElem()
	ArrayTypeNode.prototype.getElem = function() {
		var self = this;
		return self._elem;
	};

	// virtual bool IsArray()
	ArrayTypeNode.prototype.IsArray = function() {
		var self = this;
		return true;
	};

	return ArrayTypeNode;
}(eco.TypeNode));

/**

 */
eco.MapTypeNode = (function(_base) {
	__extends(MapTypeNode, _base);

	function MapTypeNode() {
	}

	// Constructor _New()
	MapTypeNode._New3 = function(self) {
		self = _base._New1(self) || self;
		self._elem = null;
		return self;
	};

	// Constructor _New(TypeNode)
	MapTypeNode._New4 = function(self, elem) {
		self = _base._New2(self, elem ? ("map<" + elem.getFullName() + ">") : "map") || self;
		self._elem = null;
		self._elem = elem;
		self._astType = eco.ASTType.MapType;
		return self;
	};

	// TypeNode getElem()
	MapTypeNode.prototype.getElem = function() {
		var self = this;
		return self._elem;
	};

	// virtual bool IsMap()
	MapTypeNode.prototype.IsMap = function() {
		var self = this;
		return true;
	};

	return MapTypeNode;
}(eco.TypeNode));

/**

 */
eco.EventTypeNode = (function(_base) {
	__extends(EventTypeNode, _base);

	function EventTypeNode() {
	}

	// Constructor _New()
	EventTypeNode._New3 = function(self) {
		self = _base._New2(self, "event") || self;
		self._paramTypes = [];
		self._astType = eco.ASTType.EventType;
		return self;
	};

	// TypeNode[] getParamTypes()
	EventTypeNode.prototype.getParamTypes = function() {
		var self = this;
		return self._paramTypes;
	};

	// void AddParamType(TypeNode)
	EventTypeNode.prototype.AddParamType = function(type) {
		var self = this;
		self._paramTypes.push(type);
	};

	// virtual string GetFullName()
	EventTypeNode.prototype.GetFullName = function() {
		var self = this;
		var fullName = "event<";
		var count = 0;
		for (var p of self._paramTypes)
		{
			if (count > 0)
				fullName = fullName + ",";
			fullName = fullName + p.getFullName();
			count++;
		}

		fullName = fullName + ">";
		return fullName;
	};

	// virtual bool IsEvent()
	EventTypeNode.prototype.IsEvent = function() {
		var self = this;
		return true;
	};

	return EventTypeNode;
}(eco.TypeNode));

/**

 */
eco.FunctionTypeNode = (function(_base) {
	__extends(FunctionTypeNode, _base);

	function FunctionTypeNode() {
	}

	// Constructor _New()
	FunctionTypeNode._New3 = function(self) {
		self = _base._New2(self, "function") || self;
		self._retType = null;
		self._paramTypes = [];
		self._paramNames = [];
		self._astType = eco.ASTType.FunctionType;
		return self;
	};

	// TypeNode getReturnType()
	FunctionTypeNode.prototype.getReturnType = function() {
		var self = this;
		return self._retType;
	};

	// TypeNode setReturnType(TypeNode)
	FunctionTypeNode.prototype.setReturnType = function(value) {
		var self = this;
		self._retType = value;
	};

	// TypeNode[] getParamTypes()
	FunctionTypeNode.prototype.getParamTypes = function() {
		var self = this;
		return self._paramTypes;
	};

	// string[] getParamNames()
	FunctionTypeNode.prototype.getParamNames = function() {
		var self = this;
		return self._paramNames;
	};

	// void AddParamType(TypeNode)
	FunctionTypeNode.prototype.AddParamType = function(type) {
		var self = this;
		self._paramTypes.push(type);
		self._paramNames.push("v" + self._paramTypes.length);
	};

	// void AddParam(TypeNode,string)
	FunctionTypeNode.prototype.AddParam = function(type, name) {
		var self = this;
		self._paramTypes.push(type);
		self._paramNames.push(name);
	};

	// virtual string GetFullName()
	FunctionTypeNode.prototype.GetFullName = function() {
		var self = this;
		var fullName = "function<";
		var count = 0;
		for (var p of self._paramTypes)
		{
			if (count > 0)
				fullName = fullName + ",";
			fullName = fullName + p.getFullName();
			count++;
		}

		fullName = fullName + ">";
		if (self._retType)
			fullName = fullName + ":" + self._retType.getFullName();
		return fullName;
	};

	// virtual bool IsFunction()
	FunctionTypeNode.prototype.IsFunction = function() {
		var self = this;
		return true;
	};

	return FunctionTypeNode;
}(eco.TypeNode));

/**

 */
eco.BlockNode = (function(_base) {
	__extends(BlockNode, _base);

	function BlockNode() {
	}

	// Constructor _New()
	BlockNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._statements = null;
		self._stmtType = eco.StatementType.Block;
		self._statements = [];
		return self;
	};

	// StatementNode[] getStatements()
	BlockNode.prototype.getStatements = function() {
		var self = this;
		return self._statements;
	};

	// void AddStatement(StatementNode)
	BlockNode.prototype.AddStatement = function(stmt) {
		var self = this;
		self._statements.push(stmt);
	};

	return BlockNode;
}(eco.StatementNode));

/**

 */
eco.VarDeclNode = (function(_base) {
	__extends(VarDeclNode, _base);

	function VarDeclNode() {
	}

	// Constructor _New()
	VarDeclNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._name = "";
		self._varType = null;
		self._expr = null;
		return self;
	};

	// Constructor _New(string)
	VarDeclNode._New3 = function(self, name) {
		self = _base._New1(self) || self;
		self._name = "";
		self._varType = null;
		self._expr = null;
		self._stmtType = eco.StatementType.VarDecl;
		self._name = name;
		return self;
	};

	// string getName()
	VarDeclNode.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// TypeNode getVarType()
	VarDeclNode.prototype.getVarType = function() {
		var self = this;
		return self._varType;
	};

	// TypeNode setVarType(TypeNode)
	VarDeclNode.prototype.setVarType = function(value) {
		var self = this;
		self._varType = value;
	};

	// ExpressionNode getExpr()
	VarDeclNode.prototype.getExpr = function() {
		var self = this;
		return self._expr;
	};

	// ExpressionNode setExpr(ExpressionNode)
	VarDeclNode.prototype.setExpr = function(value) {
		var self = this;
		self._expr = value;
	};

	return VarDeclNode;
}(eco.StatementNode));

/**

 */
eco.ReturnNode = (function(_base) {
	__extends(ReturnNode, _base);

	function ReturnNode() {
	}

	// Constructor _New()
	ReturnNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._returnValue = null;
		self._stmtType = eco.StatementType.Return;
		self._returnValue = null;
		return self;
	};

	// ExpressionNode getReturnValue()
	ReturnNode.prototype.getReturnValue = function() {
		var self = this;
		return self._returnValue;
	};

	// ExpressionNode setReturnValue(ExpressionNode)
	ReturnNode.prototype.setReturnValue = function(value) {
		var self = this;
		self._returnValue = value;
	};

	return ReturnNode;
}(eco.StatementNode));

/**

 */
eco.IfNode = (function(_base) {
	__extends(IfNode, _base);

	function IfNode() {
	}

	// Constructor _New()
	IfNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._cond = null;
		self._then = null;
		self._else = null;
		self._stmtType = eco.StatementType.If;
		return self;
	};

	// ExpressionNode getCondition()
	IfNode.prototype.getCondition = function() {
		var self = this;
		return self._cond;
	};

	// ExpressionNode setCondition(ExpressionNode)
	IfNode.prototype.setCondition = function(value) {
		var self = this;
		self._cond = value;
	};

	// StatementNode getThen()
	IfNode.prototype.getThen = function() {
		var self = this;
		return self._then;
	};

	// StatementNode setThen(StatementNode)
	IfNode.prototype.setThen = function(value) {
		var self = this;
		self._then = value;
	};

	// StatementNode getElse()
	IfNode.prototype.getElse = function() {
		var self = this;
		return self._else;
	};

	// StatementNode setElse(StatementNode)
	IfNode.prototype.setElse = function(value) {
		var self = this;
		self._else = value;
	};

	return IfNode;
}(eco.StatementNode));

/**

 */
eco.WhileNode = (function(_base) {
	__extends(WhileNode, _base);

	function WhileNode() {
	}

	// Constructor _New()
	WhileNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._cond = null;
		self._stmt = null;
		self._stmtType = eco.StatementType.While;
		return self;
	};

	// ExpressionNode getCondition()
	WhileNode.prototype.getCondition = function() {
		var self = this;
		return self._cond;
	};

	// ExpressionNode setCondition(ExpressionNode)
	WhileNode.prototype.setCondition = function(value) {
		var self = this;
		self._cond = value;
	};

	// StatementNode getStatement()
	WhileNode.prototype.getStatement = function() {
		var self = this;
		return self._stmt;
	};

	// StatementNode setStatement(StatementNode)
	WhileNode.prototype.setStatement = function(value) {
		var self = this;
		self._stmt = value;
	};

	return WhileNode;
}(eco.StatementNode));

/**

 */
eco.ForNode = (function(_base) {
	__extends(ForNode, _base);

	function ForNode() {
	}

	// Constructor _New()
	ForNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._init = null;
		self._condition = null;
		self._update = null;
		self._stmt = null;
		self._stmtType = eco.StatementType.For;
		return self;
	};

	// StatementNode getInit()
	ForNode.prototype.getInit = function() {
		var self = this;
		return self._init;
	};

	// StatementNode setInit(StatementNode)
	ForNode.prototype.setInit = function(value) {
		var self = this;
		self._init = value;
	};

	// ExpressionNode getCondition()
	ForNode.prototype.getCondition = function() {
		var self = this;
		return self._condition;
	};

	// ExpressionNode setCondition(ExpressionNode)
	ForNode.prototype.setCondition = function(value) {
		var self = this;
		self._condition = value;
	};

	// ExpressionNode getUpdate()
	ForNode.prototype.getUpdate = function() {
		var self = this;
		return self._update;
	};

	// ExpressionNode setUpdate(ExpressionNode)
	ForNode.prototype.setUpdate = function(value) {
		var self = this;
		self._update = value;
	};

	// StatementNode getStatement()
	ForNode.prototype.getStatement = function() {
		var self = this;
		return self._stmt;
	};

	// StatementNode setStatement(StatementNode)
	ForNode.prototype.setStatement = function(value) {
		var self = this;
		self._stmt = value;
	};

	return ForNode;
}(eco.StatementNode));

// Class ForeachNode : StatementNode
eco.ForeachNode = (function(_base) {
	__extends(ForeachNode, _base);

	function ForeachNode() {
	}

	// Constructor _New()
	ForeachNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._iterType = null;
		self._iterType2 = null;
		self._iterName = "";
		self._iterName2 = "";
		self._collection = null;
		self._statement = null;
		self._stmtType = eco.StatementType.Foreach;
		return self;
	};

	// TypeNode getIteratorType()
	ForeachNode.prototype.getIteratorType = function() {
		var self = this;
		return self._iterType;
	};

	// TypeNode setIteratorType(TypeNode)
	ForeachNode.prototype.setIteratorType = function(value) {
		var self = this;
		self._iterType = value;
	};

	// TypeNode getIteratorType2()
	ForeachNode.prototype.getIteratorType2 = function() {
		var self = this;
		return self._iterType2;
	};

	// TypeNode setIteratorType2(TypeNode)
	ForeachNode.prototype.setIteratorType2 = function(value) {
		var self = this;
		self._iterType2 = value;
	};

	// string getIteratorName()
	ForeachNode.prototype.getIteratorName = function() {
		var self = this;
		return self._iterName;
	};

	// string setIteratorName(string)
	ForeachNode.prototype.setIteratorName = function(value) {
		var self = this;
		self._iterName = value;
	};

	// string getIteratorName2()
	ForeachNode.prototype.getIteratorName2 = function() {
		var self = this;
		return self._iterName2;
	};

	// string setIteratorName2(string)
	ForeachNode.prototype.setIteratorName2 = function(value) {
		var self = this;
		self._iterName2 = value;
	};

	// ExpressionNode getCollection()
	ForeachNode.prototype.getCollection = function() {
		var self = this;
		return self._collection;
	};

	// ExpressionNode setCollection(ExpressionNode)
	ForeachNode.prototype.setCollection = function(value) {
		var self = this;
		self._collection = value;
	};

	// StatementNode getStatement()
	ForeachNode.prototype.getStatement = function() {
		var self = this;
		return self._statement;
	};

	// StatementNode setStatement(StatementNode)
	ForeachNode.prototype.setStatement = function(value) {
		var self = this;
		self._statement = value;
	};

	return ForeachNode;
}(eco.StatementNode));

/**

 */
eco.BreakNode = (function(_base) {
	__extends(BreakNode, _base);

	function BreakNode() {
	}

	// Constructor _New()
	BreakNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._stmtType = eco.StatementType.Break;
		return self;
	};

	return BreakNode;
}(eco.StatementNode));

/**

 */
eco.ContinueNode = (function(_base) {
	__extends(ContinueNode, _base);

	function ContinueNode() {
	}

	// Constructor _New()
	ContinueNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._stmtType = eco.StatementType.Continue;
		return self;
	};

	return ContinueNode;
}(eco.StatementNode));

/**

 */
eco.AssemblyNode = (function(_base) {
	__extends(AssemblyNode, _base);

	function AssemblyNode() {
	}

	// Constructor _New()
	AssemblyNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._code = "";
		self._targets = null;
		self._stmtType = eco.StatementType.Assembly;
		self._targets = [];
		return self;
	};

	// string getCode()
	AssemblyNode.prototype.getCode = function() {
		var self = this;
		return self._code;
	};

	// string setCode(string)
	AssemblyNode.prototype.setCode = function(value) {
		var self = this;
		self._code = value;
	};

	// string[] getTargets()
	AssemblyNode.prototype.getTargets = function() {
		var self = this;
		return self._targets;
	};

	// void AddTarget(string)
	AssemblyNode.prototype.AddTarget = function(target) {
		var self = this;
		self._targets.push(target);
	};

	// bool HasTarget(string)
	AssemblyNode.prototype.HasTarget = function(target) {
		var self = this;
		for (var t of self._targets)
			if (t == target)
				return true;

		return false;
	};

	return AssemblyNode;
}(eco.StatementNode));

/**

 */
eco.TargetNode = (function(_base) {
	__extends(TargetNode, _base);

	function TargetNode() {
	}

	// Constructor _New()
	TargetNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._targets = null;
		self._block = null;
		self._stmtType = eco.StatementType.Target;
		self._targets = [];
		return self;
	};

	// string[] getTargets()
	TargetNode.prototype.getTargets = function() {
		var self = this;
		return self._targets;
	};

	// void AddTarget(string)
	TargetNode.prototype.AddTarget = function(target) {
		var self = this;
		self._targets.push(target);
	};

	// bool HasTarget(string)
	TargetNode.prototype.HasTarget = function(target) {
		var self = this;
		for (var t of self._targets)
			if (t == target)
				return true;

		return false;
	};

	// BlockNode getBlock()
	TargetNode.prototype.getBlock = function() {
		var self = this;
		return self._block;
	};

	// BlockNode setBlock(BlockNode)
	TargetNode.prototype.setBlock = function(value) {
		var self = this;
		self._block = value;
	};

	return TargetNode;
}(eco.StatementNode));

/**

 */
eco.TryCatchNode = (function(_base) {
	__extends(TryCatchNode, _base);

	function TryCatchNode() {
	}

	// Constructor _New()
	TryCatchNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._tryBlock = null;
		self._catchBlock = null;
		self._catchType = null;
		self._catchName = "";
		self._stmtType = eco.StatementType.TryCatch;
		return self;
	};

	// BlockNode getTryBlock()
	TryCatchNode.prototype.getTryBlock = function() {
		var self = this;
		return self._tryBlock;
	};

	// BlockNode setTryBlock(BlockNode)
	TryCatchNode.prototype.setTryBlock = function(value) {
		var self = this;
		self._tryBlock = value;
	};

	// BlockNode getCatchBlock()
	TryCatchNode.prototype.getCatchBlock = function() {
		var self = this;
		return self._catchBlock;
	};

	// BlockNode setCatchBlock(BlockNode)
	TryCatchNode.prototype.setCatchBlock = function(value) {
		var self = this;
		self._catchBlock = value;
	};

	// TypeNode getCatchType()
	TryCatchNode.prototype.getCatchType = function() {
		var self = this;
		return self._catchType;
	};

	// TypeNode setCatchType(TypeNode)
	TryCatchNode.prototype.setCatchType = function(value) {
		var self = this;
		self._catchType = value;
	};

	// string getCatchName()
	TryCatchNode.prototype.getCatchName = function() {
		var self = this;
		return self._catchName;
	};

	// string setCatchName(string)
	TryCatchNode.prototype.setCatchName = function(value) {
		var self = this;
		self._catchName = value;
	};

	return TryCatchNode;
}(eco.StatementNode));

/**

 */
eco.ThrowNode = (function(_base) {
	__extends(ThrowNode, _base);

	function ThrowNode() {
	}

	// Constructor _New()
	ThrowNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._expr = null;
		self._stmtType = eco.StatementType.Throw;
		return self;
	};

	// ExpressionNode getExpression()
	ThrowNode.prototype.getExpression = function() {
		var self = this;
		return self._expr;
	};

	// ExpressionNode setExpression(ExpressionNode)
	ThrowNode.prototype.setExpression = function(value) {
		var self = this;
		self._expr = value;
	};

	return ThrowNode;
}(eco.StatementNode));

/**

 */
eco.CaseNode = (function(_base) {
	__extends(CaseNode, _base);

	function CaseNode() {
	}

	// Constructor _New()
	CaseNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._value = null;
		self._statements = null;
		self._stmtType = eco.StatementType.Case;
		self._statements = [];
		return self;
	};

	// ExpressionNode getValue()
	CaseNode.prototype.getValue = function() {
		var self = this;
		return self._value;
	};

	// ExpressionNode setValue(ExpressionNode)
	CaseNode.prototype.setValue = function(value) {
		var self = this;
		self._value = value;
	};

	// StatementNode[] getStatements()
	CaseNode.prototype.getStatements = function() {
		var self = this;
		return self._statements;
	};

	// void AddStatement(StatementNode)
	CaseNode.prototype.AddStatement = function(statement) {
		var self = this;
		self._statements.push(statement);
	};

	return CaseNode;
}(eco.StatementNode));

/**

 */
eco.DefaultNode = (function(_base) {
	__extends(DefaultNode, _base);

	function DefaultNode() {
	}

	// Constructor _New()
	DefaultNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._statements = null;
		self._stmtType = eco.StatementType.Default;
		self._statements = [];
		return self;
	};

	// StatementNode[] getStatements()
	DefaultNode.prototype.getStatements = function() {
		var self = this;
		return self._statements;
	};

	// void AddStatement(StatementNode)
	DefaultNode.prototype.AddStatement = function(statement) {
		var self = this;
		self._statements.push(statement);
	};

	return DefaultNode;
}(eco.StatementNode));

/**

 */
eco.SwitchCaseNode = (function(_base) {
	__extends(SwitchCaseNode, _base);

	function SwitchCaseNode() {
	}

	// Constructor _New()
	SwitchCaseNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._value = null;
		self._cases = null;
		self._defaultCase = null;
		self._stmtType = eco.StatementType.Switch;
		self._cases = [];
		return self;
	};

	// ExpressionNode getValue()
	SwitchCaseNode.prototype.getValue = function() {
		var self = this;
		return self._value;
	};

	// ExpressionNode setValue(ExpressionNode)
	SwitchCaseNode.prototype.setValue = function(value) {
		var self = this;
		self._value = value;
	};

	// CaseNode[] getCases()
	SwitchCaseNode.prototype.getCases = function() {
		var self = this;
		return self._cases;
	};

	// void AddCase(CaseNode)
	SwitchCaseNode.prototype.AddCase = function(caseNode) {
		var self = this;
		self._cases.push(caseNode);
	};

	// DefaultNode getDefaultCase()
	SwitchCaseNode.prototype.getDefaultCase = function() {
		var self = this;
		return self._defaultCase;
	};

	// DefaultNode setDefaultCase(DefaultNode)
	SwitchCaseNode.prototype.setDefaultCase = function(value) {
		var self = this;
		self._defaultCase = value;
	};

	return SwitchCaseNode;
}(eco.StatementNode));

/**

 */
eco.AwaitNode = (function(_base) {
	__extends(AwaitNode, _base);

	function AwaitNode() {
	}

	// Constructor _New()
	AwaitNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._responder = null;
		self._argList = null;
		self._resultType = null;
		self._resultVarName = "";
		self._statusVarName = "";
		self._block = null;
		self._stmtType = eco.StatementType.Await;
		self._argList = [];
		self._statusVarName = "";
		return self;
	};

	// TypeNode getResponder()
	AwaitNode.prototype.getResponder = function() {
		var self = this;
		return self._responder;
	};

	// TypeNode setResponder(TypeNode)
	AwaitNode.prototype.setResponder = function(value) {
		var self = this;
		self._responder = value;
	};

	// ExpressionNode[] getArgList()
	AwaitNode.prototype.getArgList = function() {
		var self = this;
		return self._argList;
	};

	// TypeNode getResultType()
	AwaitNode.prototype.getResultType = function() {
		var self = this;
		return self._resultType;
	};

	// TypeNode setResultType(TypeNode)
	AwaitNode.prototype.setResultType = function(value) {
		var self = this;
		self._resultType = value;
	};

	// string getResultVarName()
	AwaitNode.prototype.getResultVarName = function() {
		var self = this;
		return self._resultVarName;
	};

	// string setResultVarName(string)
	AwaitNode.prototype.setResultVarName = function(value) {
		var self = this;
		self._resultVarName = value;
	};

	// string getStatusVarName()
	AwaitNode.prototype.getStatusVarName = function() {
		var self = this;
		return self._statusVarName;
	};

	// string setStatusVarName(string)
	AwaitNode.prototype.setStatusVarName = function(value) {
		var self = this;
		self._statusVarName = value;
	};

	// BlockNode getBlock()
	AwaitNode.prototype.getBlock = function() {
		var self = this;
		return self._block;
	};

	// BlockNode setBlock(BlockNode)
	AwaitNode.prototype.setBlock = function(value) {
		var self = this;
		self._block = value;
	};

	return AwaitNode;
}(eco.StatementNode));

/**

 */
eco.ExpressionNode = (function(_base) {
	__extends(ExpressionNode, _base);

	function ExpressionNode() {
	}

	ExpressionNode.OnCreatedAndSet = null;
	// Constructor _New()
	ExpressionNode._New2 = function(self) {
		self = _base._New1(self) || self;
		self._exprType = null;
		self._symbolType = null;
		self._stmtType = eco.StatementType.Expression;
		self._exprType = eco.ExpressionType.None;
		return self;
	};

	// ExpressionType getExprType()
	ExpressionNode.prototype.getExprType = function() {
		var self = this;
		return self._exprType;
	};

	// Interface getSymbolType()
	ExpressionNode.prototype.getSymbolType = function() {
		var self = this;
		return self._symbolType;
	};

	// Interface setSymbolType(Interface)
	ExpressionNode.prototype.setSymbolType = function(value) {
		var self = this;
		self._symbolType = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	ExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return null;
	};

	// virtual Interface TryGetType(Scope)
	ExpressionNode.prototype.TryGetType = function(scope) {
		var self = this;
		return null;
	};

	// virtual string GenerateTypeString()
	ExpressionNode.prototype.GenerateTypeString = function() {
		var self = this;
		return "";
	};

	// virtual void SetFromState(LexerState)
	ExpressionNode.prototype.SetFromState = function(state) {
		var self = this;
		_base.prototype.SetFromState.call(self, state);
		if (ExpressionNode.OnCreatedAndSet)
			ExpressionNode.OnCreatedAndSet(self);
	};

	return ExpressionNode;
}(eco.StatementNode));

/**

 */
eco.Interface = (function(_base) {
	__extends(Interface, _base);

	function Interface() {
	}

	Interface._voidType = null;
	Interface._boolType = null;
	Interface._charType = null;
	Interface._intType = null;
	Interface._floatType = null;
	Interface._stringType = null;
	Interface._objectType = null;
	Interface._nullType = null;
	Interface._pckInterface = null;
	Interface._entryPoint = null;
	Interface._basicTypes = null;
	Interface._typeIdCount = 0;
	// Constructor _New()
	Interface._New4 = function(self) {
		self = _base._New2(self) || self;
		self._members = null;
		self.IsDefined = false;
		self._arrayOf = null;
		self._mapOf = null;
		self._typeId = 0;
		return self;
	};

	// Constructor _New(string)
	Interface._New5 = function(self, name) {
		self = _base._New3(self, name) || self;
		self._members = null;
		self.IsDefined = false;
		self._arrayOf = null;
		self._mapOf = null;
		self._typeId = 0;
		self._symbolType = eco.SymbolType.Interface;
		self._members = [];
		self._typeId = ++Interface._typeIdCount;
		return self;
	};

	// static void ResetCount()
	Interface.ResetCount = function() {
		Interface._typeIdCount = 0;
	};

	// static Interface[] GetBuiltInTypes()
	Interface.GetBuiltInTypes = function() {
		return [Interface.getVoidType(), Interface.getBoolType(), Interface.getCharType(), Interface.getIntType(), Interface.getFloatType(), Interface.getStringType(), Interface.getObjectType()];
	};

	// Member[] getMembers()
	Interface.prototype.getMembers = function() {
		var self = this;
		return self._members;
	};

	// virtual Member[] GetAllMembers()
	Interface.prototype.GetAllMembers = function() {
		var self = this;
		return self._members;
	};

	// virtual Member GetMember(string)
	Interface.prototype.GetMember = function(signature) {
		var self = this;
		for (var member of self._members)
			if (member.Signature() == signature)
				return member;

		return null;
	};

	// virtual Member GetMemberByName(string)
	Interface.prototype.GetMemberByName = function(name) {
		var self = this;
		for (var member of self._members)
			if (member._name == name)
				return member;

		return null;
	};

	// virtual Member[] GetMembersByName(string)
	Interface.prototype.GetMembersByName = function(name) {
		var self = this;
		var members = [];
		for (var member of self._members)
			if (member._name == name)
				members.push(member);

		return members;
	};

	// virtual bool AddMember(Member)
	Interface.prototype.AddMember = function(member) {
		var self = this;
		var found = self.GetMember(member.Signature());
		self._members.push(member);
		member.setOwner(self);
		return found == null;
	};

	// virtual int GetOverload(string)
	Interface.prototype.GetOverload = function(name) {
		var self = this;
		var overload = 0;
		for (var member of self._members)
		{
			if (member.IsMethod() && (member._name == name || member.CompiledName() == name))
				overload++;
		}

		return overload;
	};

	// void ClearMembers()
	Interface.prototype.ClearMembers = function() {
		var self = this;
		self._members = [];
	};

	// virtual bool CastsTo(LitMapExpressionNode,Scope)
	Interface.prototype.CastsTo = function(mapNode, scope) {
		var self = this;
		if (!self.IsInline() && !self.IsClass() && !self.IsDefined)
			return false;
		for (var member of self.getMembers())
		{
			if (!member._type)
				return false;
			if (!((mapNode._items)[member._name] !== undefined))
				return false;
			var mapItem = mapNode._items[member._name];
			if (member.IsMethod())
			{
				if (mapItem._exprType != eco.ExpressionType.Function)
					return false;
				var valueFuncType = mapItem.GetTypeOf(scope, null);
				if (!valueFuncType)
					return false;
				if (!valueFuncType._return || valueFuncType._return.DistanceTo(member._type) < 0)
					return false;
				var methodMember = member;
				if (valueFuncType._paramTypes.length != methodMember._parameters.length)
					return false;
				for (var p = 0; p < valueFuncType._paramTypes.length; p++)
				{
					if (!valueFuncType._paramTypes[p] || !methodMember._parameters[p].Type)
						return false;
					if (valueFuncType._paramTypes[p].DistanceTo(methodMember._parameters[p].Type) < 0)
						return false;
				}

			}
			else
			{
				var valueType = mapItem.GetTypeOf(scope, null);
				if (!valueType)
					return false;
				if (member._type.IsInline())
				{
					if (mapItem._exprType != eco.ExpressionType.Map)
						return false;
					var inlineMemberType = member._type;
					if (!inlineMemberType.CastsTo(mapItem, scope))
						return false;
				}
				else if (valueType.DistanceTo(member._type) < 0)
					return false;
			}

		}

		return true;
	};

	// virtual int DistanceTo(Interface)
	Interface.prototype.DistanceTo = function(intr) {
		var self = this;
		if (!intr)
			return -1;
		if (intr == self)
			return 0;
		if (intr == eco.Interface.getObjectType())
			return 1;
		if (self == eco.Interface.getNullType() && intr.IsComplex())
			return 1;
		if (self.IsComplex() && (intr == eco.Interface.getNullType()))
			return 1;
		if (self == eco.Interface.getNullType() && intr.IsComplex())
			return 1;
		if (self == eco.Interface.getIntType() && intr == eco.Interface.getFloatType())
			return 1;
		if (self == eco.Interface.getFloatType() && intr == eco.Interface.getIntType())
			return 1;
		if (self == eco.Interface.getCharType() && intr == eco.Interface.getIntType())
			return 1;
		if (self == eco.Interface.getIntType() && intr == eco.Interface.getCharType())
			return 1;
		if (self == eco.Interface.getCharType() && intr == eco.Interface.getStringType())
			return 1;
		if (self.IsArray() && intr.IsArray())
			return (self)._elem.DistanceTo((intr)._elem);
		if (self.IsMap() && intr.IsMap())
			return (self)._elem.DistanceTo((intr)._elem);
		if (self.getFullName() == intr.getFullName())
			return 0;
		return -1;
	};

	// virtual Interface GetCommon(Interface)
	Interface.prototype.GetCommon = function(intr) {
		var self = this;
		if (!intr)
			return null;
		if (intr == self)
			return self;
		if (intr.DistanceTo(self) >= 0)
			return self;
		if (self.DistanceTo(intr) >= 0)
			return intr;
		return null;
	};

	// Method GetMethodBySignature(string)
	Interface.prototype.GetMethodBySignature = function(sig) {
		var self = this;
		for (var member of self._members)
			if (member.IsMethod() && member.Signature() == sig)
				return member;

		return null;
	};

	// virtual Method GetMethod(CallExpressionNode,Scope,function<Method[]>:object)
	Interface.prototype.GetMethod = function(call, scope, onCompete) {
		var self = this;
		var sig = call.Signature(scope);
		if (((self._methodCache)[sig] !== undefined))
			return self._methodCache[sig];
		var methods = [];
		for (var member of self._members)
			if (member.IsMethod())
				methods.push(member);

		var foundMatches = [];
		for (var method of methods)
		{
			var match = method.GetMatch(call, scope);
			if (match >= 0)
				foundMatches.push({"method": method, "score": match});
		}

		if (foundMatches.length == 0)
			return null;
		for (var count = 0; count < 1000; count++)
		{
			var winners = [];
			for (var match1 of foundMatches)
			{
				if (match1.score == count)
					winners.push(match1.method);
			}

			if (winners.length > 0)
			{
				if (winners.length > 1)
				{
					if (onCompete)
						onCompete(winners);
					return null;
				}
				self._methodCache[sig] = winners[0];
				return winners[0];
			}
		}

		return null;
	};

	// bool IsBasic()
	Interface.prototype.IsBasic = function() {
		var self = this;
		return self == Interface._voidType || self == Interface._boolType || self == Interface._charType || self == Interface._intType || self == Interface._floatType || self == Interface._objectType || self == Interface._stringType || self == Interface._nullType;
	};

	// virtual bool IsArray()
	Interface.prototype.IsArray = function() {
		var self = this;
		return false;
	};

	// virtual bool IsMap()
	Interface.prototype.IsMap = function() {
		var self = this;
		return false;
	};

	// virtual bool IsFunction()
	Interface.prototype.IsFunction = function() {
		var self = this;
		return false;
	};

	// virtual bool IsEvent()
	Interface.prototype.IsEvent = function() {
		var self = this;
		return false;
	};

	// virtual bool IsComplex()
	Interface.prototype.IsComplex = function() {
		var self = this;
		return false;
	};

	// virtual bool IsInline()
	Interface.prototype.IsInline = function() {
		var self = this;
		return false;
	};

	// virtual bool IsInterface()
	Interface.prototype.IsInterface = function() {
		var self = this;
		return true;
	};

	// virtual bool IsClass()
	Interface.prototype.IsClass = function() {
		var self = this;
		return false;
	};

	// virtual bool IsEnum()
	Interface.prototype.IsEnum = function() {
		var self = this;
		return false;
	};

	// virtual bool IsTypedef()
	Interface.prototype.IsTypedef = function() {
		var self = this;
		return false;
	};

	// ArrayType getArrayOf()
	Interface.prototype.getArrayOf = function() {
		var self = this;
		if (!self._arrayOf)
		{
			self._arrayOf = eco.ArrayType._New9(new eco.ArrayType(), self);
			eco.EcoStdLib.CreateArrayMethods(self._arrayOf);
		}
		return self._arrayOf;
	};

	// MapType getMapOf()
	Interface.prototype.getMapOf = function() {
		var self = this;
		if (!self._mapOf)
		{
			self._mapOf = eco.MapType._New9(new eco.MapType(), self);
			eco.EcoStdLib.CreateMapMethods(self._mapOf);
		}
		return self._mapOf;
	};

	// static Interface getVoidType()
	Interface.getVoidType = function() {
		if (!Interface._voidType)
			Interface._voidType = eco.Interface._New5(new eco.Interface(), "void");
		return Interface._voidType;
	};

	// static Interface getBoolType()
	Interface.getBoolType = function() {
		if (!Interface._boolType)
			Interface._boolType = eco.Interface._New5(new eco.Interface(), "bool");
		return Interface._boolType;
	};

	// static Interface getCharType()
	Interface.getCharType = function() {
		if (!Interface._charType)
			Interface._charType = eco.Interface._New5(new eco.Interface(), "char");
		return Interface._charType;
	};

	// static Interface getIntType()
	Interface.getIntType = function() {
		if (!Interface._intType)
			Interface._intType = eco.Interface._New5(new eco.Interface(), "int");
		return Interface._intType;
	};

	// static Interface getFloatType()
	Interface.getFloatType = function() {
		if (!Interface._floatType)
			Interface._floatType = eco.Interface._New5(new eco.Interface(), "float");
		return Interface._floatType;
	};

	// static Interface getStringType()
	Interface.getStringType = function() {
		if (!Interface._stringType)
		{
			Interface._stringType = eco.Class._New7(new eco.Class(), "string");
			(Interface._stringType).setIsNative(true);
			eco.EcoStdLib.CreateStringMethods(Interface._stringType);
		}
		return Interface._stringType;
	};

	// static Interface getObjectType()
	Interface.getObjectType = function() {
		if (!Interface._objectType)
		{
			Interface._objectType = eco.Interface._New5(new eco.Interface(), "object");
			eco.EcoStdLib.CreateObjectMethods(Interface._objectType);
		}
		return Interface._objectType;
	};

	// static Interface getNullType()
	Interface.getNullType = function() {
		if (!Interface._nullType)
			Interface._nullType = eco.Interface._New5(new eco.Interface(), "null");
		return Interface._nullType;
	};

	// static Interface getPackageInterface()
	Interface.getPackageInterface = function() {
		if (!Interface._pckInterface)
		{
			Interface._pckInterface = eco.Interface._New5(new eco.Interface(), "IPackageInitialiser");
			Interface._pckInterface._imported = true;
			eco.EcoStdLib.CreatePackageInitialiserMethods(Interface._pckInterface);
		}
		return Interface._pckInterface;
	};

	// static Interface getEntryPoint()
	Interface.getEntryPoint = function() {
		if (!Interface._entryPoint)
		{
			Interface._entryPoint = eco.Interface._New5(new eco.Interface(), "IEntryPoint");
			Interface._entryPoint._imported = true;
			eco.EcoStdLib.CreateEntryPointMethods(Interface._entryPoint);
		}
		return Interface._entryPoint;
	};

	/**

	 */
	Interface.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "interface"};
		var methods = [];
		for (var member of self._members)
			methods.push(member.Serialise());

		output["methods"] = methods;
		return output;
	};

	/**

	 */
	Interface.prototype.SerialiseType = function() {
		var self = this;
		if (self.IsBasic())
			return {"type": "basic", "name": self._name};
		return {"type": "interface", "name": self.getFullName()};
	};

	/**

	 */
	Interface.ImportSkeleton1 = function(name, symbol, parent) {
		var intr = eco.Interface._New5(new eco.Interface(), name);
		intr.setNamespace(parent);
		intr._imported = true;
		return intr;
	};

	/**

	 */
	Interface.ImportFull1 = function(intr, symbol) {
		var methods = symbol["methods"];
		for (var method of methods)
			intr.AddMember(eco.Method.ImportMethod(method, intr));

	};

	// static map<Interface> BasicTypes()
	Interface.BasicTypes = function() {
		if (!Interface._basicTypes)
		{
			Interface._basicTypes = {};
			Interface._basicTypes = {"void": eco.Interface.getVoidType(), "bool": eco.Interface.getBoolType(), "char": eco.Interface.getCharType(), "int": eco.Interface.getIntType(), "float": eco.Interface.getFloatType(), "object": eco.Interface.getObjectType(), "string": eco.Interface.getStringType()};
		}
		return Interface._basicTypes;
	};

	// static Interface ImportType(object,Interface)
	Interface.ImportType = function(node, from) {
		var typeType = node["type"];
		if (typeType == "basic")
			return Interface.BasicTypes()[node["name"]];
		else if (typeType == "class" || typeType == "interface" || typeType == "enum")
		{
			if (node["name"] == "string")
				return eco.Interface.getStringType();
			else
				return from.GetType(eco.TypeNode.Generate(node["name"]), null);

		}
		else if (typeType == "array")
			return Interface.ImportType(node["elem"], from).getArrayOf();
		else if (typeType == "map")
			return Interface.ImportType(node["elem"], from).getMapOf();
		else if (typeType == "function")
		{
			var func = eco.FunctionType._New6(new eco.FunctionType());
			func.setReturnType(Interface.ImportType(node["return"], from));
			var params = node["params"];
			for (var param of params)
				func.AddParamType(Interface.ImportType(param, from));

			return func;
		}
		else if (typeType == "event")
		{
			var evt = eco.EventType._New8(new eco.EventType());
			var params1 = node["params"];
			for (var param1 of params1)
				evt.AddParamType(Interface.ImportType(param1, from));

			eco.EcoStdLib.CreateEventMethods(evt);
			return evt;
		}
		return null;
	};

	return Interface;
}(eco.Namespace));

/**

 */
eco.Field = (function(_base) {
	__extends(Field, _base);

	function Field() {
	}

	// Constructor _New()
	Field._New4 = function(self) {
		self = _base._New2(self) || self;
		self._defaultValue = null;
		return self;
	};

	// Constructor _New(Interface,string)
	Field._New5 = function(self, type, name) {
		self = _base._New3(self, type, name) || self;
		self._defaultValue = null;
		self._memberType = eco.MemberType.Field;
		return self;
	};

	// ExpressionNode getDefault()
	Field.prototype.getDefault = function() {
		var self = this;
		return self._defaultValue;
	};

	// ExpressionNode setDefault(ExpressionNode)
	Field.prototype.setDefault = function(value) {
		var self = this;
		self._defaultValue = value;
	};

	// virtual object Serialise()
	Field.prototype.Serialise = function() {
		var self = this;
		return {"memberType": "field", "type": self._type ? self._type.SerialiseType() : null, "name": self._name, "access": self._access, "static": self._static};
	};

	// virtual bool IsField()
	Field.prototype.IsField = function() {
		var self = this;
		return true;
	};

	// static Field ImportField(object,Interface)
	Field.ImportField = function(symbol, from) {
		var field = eco.Field._New5(new eco.Field(), eco.Interface.ImportType(symbol["type"], from), symbol["name"]);
		field.setAccess((symbol["access"]));
		field.setStatic(symbol["static"]);
		return field;
	};

	return Field;
}(eco.Member));

/**

 */
eco.Method = (function(_base) {
	__extends(Method, _base);

	function Method() {
	}

	// Constructor _New()
	Method._New4 = function(self) {
		self = _base._New2(self) || self;
		self._defStartLine = 0;
		self._defStartColumn = 0;
		self._defStartPosition = 0;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._defEndPosition = 0;
		self._block = null;
		self._overload = 0;
		self._virtual = false;
		self._override = null;
		self._isPropMethod = false;
		self._propMethodIsBlock = false;
		self._aliased = false;
		self._parameters = null;
		self._minArgsNeeded = 0;
		self._usings = null;
		self._inlinePHP = "";
		self._inlineJS = "";
		return self;
	};

	// Constructor _New(Interface,string)
	Method._New5 = function(self, type, name) {
		self = _base._New3(self, type, name) || self;
		self._defStartLine = 0;
		self._defStartColumn = 0;
		self._defStartPosition = 0;
		self._defEndLine = 0;
		self._defEndColumn = 0;
		self._defEndPosition = 0;
		self._block = null;
		self._overload = 0;
		self._virtual = false;
		self._override = null;
		self._isPropMethod = false;
		self._propMethodIsBlock = false;
		self._aliased = false;
		self._parameters = null;
		self._minArgsNeeded = 0;
		self._usings = null;
		self._inlinePHP = "";
		self._inlineJS = "";
		self._memberType = eco.MemberType.Method;
		self._parameters = [];
		self._minArgsNeeded = 0;
		self._inlinePHP = "";
		self._inlineJS = "";
		self._usings = [];
		return self;
	};

	// int getDefinitionStartLine()
	Method.prototype.getDefinitionStartLine = function() {
		var self = this;
		return self._defStartLine;
	};

	// int setDefinitionStartLine(int)
	Method.prototype.setDefinitionStartLine = function(value) {
		var self = this;
		self._defStartLine = value;
	};

	// int getDefinitionStartColumn()
	Method.prototype.getDefinitionStartColumn = function() {
		var self = this;
		return self._defStartColumn;
	};

	// int setDefinitionStartColumn(int)
	Method.prototype.setDefinitionStartColumn = function(value) {
		var self = this;
		self._defStartColumn = value;
	};

	// int getDefinitionStartPosition()
	Method.prototype.getDefinitionStartPosition = function() {
		var self = this;
		return self._defStartPosition;
	};

	// int setDefinitionStartPosition(int)
	Method.prototype.setDefinitionStartPosition = function(value) {
		var self = this;
		self._defStartPosition = value;
	};

	// int getDefinitionEndLine()
	Method.prototype.getDefinitionEndLine = function() {
		var self = this;
		return self._defEndLine;
	};

	// int setDefinitionEndLine(int)
	Method.prototype.setDefinitionEndLine = function(value) {
		var self = this;
		self._defEndLine = value;
	};

	// int getDefinitionEndColumn()
	Method.prototype.getDefinitionEndColumn = function() {
		var self = this;
		return self._defEndColumn;
	};

	// int setDefinitionEndColumn(int)
	Method.prototype.setDefinitionEndColumn = function(value) {
		var self = this;
		self._defEndColumn = value;
	};

	// int getDefinitionEndPosition()
	Method.prototype.getDefinitionEndPosition = function() {
		var self = this;
		return self._defEndPosition;
	};

	// int setDefinitionEndPosition(int)
	Method.prototype.setDefinitionEndPosition = function(value) {
		var self = this;
		self._defEndPosition = value;
	};

	// BlockNode getBlock()
	Method.prototype.getBlock = function() {
		var self = this;
		return self._block;
	};

	// BlockNode setBlock(BlockNode)
	Method.prototype.setBlock = function(value) {
		var self = this;
		self._block = value;
		self._defStartLine = value._startLine;
		self._defStartColumn = value._startColumn;
		self._defStartPosition = value._startPosition;
		self._defEndLine = value._endLine;
		self._defEndColumn = value._endColumn;
		self._defEndPosition = value._endPosition;
	};

	// int getOverload()
	Method.prototype.getOverload = function() {
		var self = this;
		return self._overload;
	};

	// int setOverload(int)
	Method.prototype.setOverload = function(value) {
		var self = this;
		self._overload = value;
	};

	// bool getVirtual()
	Method.prototype.getVirtual = function() {
		var self = this;
		return self._virtual;
	};

	// bool setVirtual(bool)
	Method.prototype.setVirtual = function(value) {
		var self = this;
		self._virtual = value;
	};

	// Method getOverride()
	Method.prototype.getOverride = function() {
		var self = this;
		return self._override;
	};

	// Method setOverride(Method)
	Method.prototype.setOverride = function(value) {
		var self = this;
		self._override = value;
	};

	// bool DoesOverride(Method)
	Method.prototype.DoesOverride = function(method) {
		var self = this;
		if (self._override == method)
			return true;
		if (!self._override)
			return false;
		else
			return self._override.DoesOverride(method);

	};

	// bool getIsPropertyMethod()
	Method.prototype.getIsPropertyMethod = function() {
		var self = this;
		return self._isPropMethod;
	};

	// bool setIsPropertyMethod(bool)
	Method.prototype.setIsPropertyMethod = function(value) {
		var self = this;
		self._isPropMethod = value;
	};

	// bool getPropertyMethodIsBlock()
	Method.prototype.getPropertyMethodIsBlock = function() {
		var self = this;
		return self._propMethodIsBlock;
	};

	// bool setPropertyMethodIsBlock(bool)
	Method.prototype.setPropertyMethodIsBlock = function(value) {
		var self = this;
		self._propMethodIsBlock = value;
	};

	// bool getAliased()
	Method.prototype.getAliased = function() {
		var self = this;
		return self._aliased;
	};

	// bool setAliased(bool)
	Method.prototype.setAliased = function(value) {
		var self = this;
		self._aliased = value;
	};

	// MethodParameter[] getParameters()
	Method.prototype.getParameters = function() {
		var self = this;
		return self._parameters;
	};

	// int getMinimumArgsNeeded()
	Method.prototype.getMinimumArgsNeeded = function() {
		var self = this;
		return self._minArgsNeeded;
	};

	// bool AddParameter(Interface,string,object)
	Method.prototype.AddParameter = function(type, name, defaultValue) {
		var self = this;
		var found = false;
		for (var param of self._parameters)
			if (param.Name == name)
			{
				found = true;
				break;
			}

		if (!defaultValue)
			self._minArgsNeeded++;
		self._parameters.push(eco.MethodParameter._New1(new eco.MethodParameter(), type, name, defaultValue));
		return !found;
	};

	// Namespace[] getUsings()
	Method.prototype.getUsings = function() {
		var self = this;
		return self._usings;
	};

	// void CopyUsingsFromSymbolTable(SymbolTable)
	Method.prototype.CopyUsingsFromSymbolTable = function(symbolTable) {
		var self = this;
		for (var used of symbolTable._usings)
			self._usings.push(used);

	};

	// int GetMatch(CallExpressionNode,Scope)
	Method.prototype.GetMatch = function(call, scope) {
		var self = this;
		if (self._name != call._name)
			return -2;
		if (!call._argList)
		{
			if (self._minArgsNeeded == 0)
				return 0;
			else
				return -1;

		}
		if (call._argList.length < self._minArgsNeeded)
			return -1;
		var diff = 0;
		for (var p = 0; p < call._argList.length; p++)
		{
			if (p >= self._parameters.length)
				return -1;
			var arg = call._argList[p];
			var pType = self._parameters[p].Type;
			if (pType == eco.Interface.getObjectType())
				diff++;
			else if (arg._exprType == eco.ExpressionType.LitArray)
			{
				var litArray = arg;
				if (!pType.IsArray())
					return -1;
				var parr = pType;
				if (!parr.CastsTo2(litArray, scope))
					return -1;
				diff++;
			}
			else if (arg._exprType == eco.ExpressionType.Map)
			{
				var litMap = arg;
				if (pType.IsClass() || pType.IsInline() || pType.IsDefined)
				{
					var inlineParamType = pType;
					if (!inlineParamType.CastsTo(litMap, scope))
						return -1;
				}
				else
				{
					if (!pType.IsMap())
						return -1;
					var pmap = pType;
					if (!pmap.CastsTo(litMap, scope))
						return -1;
				}

				diff++;
			}
			else if (arg._exprType == eco.ExpressionType.Function)
			{
				if (!pType || !pType.IsFunction())
					return -1;
				var argFunc = arg;
				var paramFunc = pType;
				if (!paramFunc.CastsTo2(argFunc, scope))
					return -1;
				diff++;
			}
			else
			{
				var aType = arg.GetTypeOf(scope, null);
				if (!pType || !aType)
					return -1;
				var dist = aType.DistanceTo(pType);
				if (dist < 0)
					return -1;
				diff = diff + dist;
			}

		}

		return diff;
	};

	// virtual string CompiledName()
	Method.prototype.CompiledName = function() {
		var self = this;
		if (self._override)
			return self._override.CompiledName();
		if (self._overload == 0)
			return self._name;
		if (eco.Lexer.IsDigit(self._name[self._name.length - 1]))
			return self._name + "_" + self._overload;
		return self._name + self._overload;
	};

	// virtual string Signature()
	Method.prototype.Signature = function() {
		var self = this;
		var signature = self._name + "(";
		var count = 0;
		for (var param of self._parameters)
		{
			if (count > 0)
				signature = signature + ",";
			if (param.Type)
				signature = signature + param.Type.Signature();
			else
				signature = signature + "unknown";

			count++;
		}

		signature = signature + ")";
		return signature;
	};

	// virtual string DetailName()
	Method.prototype.DetailName = function() {
		var self = this;
		var signature = self._name + "(";
		var count = 0;
		for (var param of self._parameters)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param.Type)
				signature = signature + param.Type.DetailName();
			else
				signature = signature + "unknown";

			signature = signature + " " + param.Name;
			count++;
		}

		signature = signature + ")";
		return signature;
	};

	// string GetInsertSnippet()
	Method.prototype.GetInsertSnippet = function() {
		var self = this;
		if (self._docs)
			return self._docs.GetMethodInsertSnippet(self);
		var snippet = self._name + "(";
		var counter = {"count": 1};
		for (var param of self._parameters)
		{
			if (counter["count"] > 1)
				snippet = snippet + ", ";
			if (param.Type.IsFunction())
				snippet = snippet + (param.Type).GetInsertSnippet(counter);
			else
				snippet = snippet + '${' + ("" + counter["count"]) + ':' + param.Name + '}';

			counter["count"] = counter["count"] + 1;
		}

		snippet = snippet + ")";
		if (self._type == eco.Interface.getVoidType())
			snippet = snippet + ";";
		return snippet;
	};

	// virtual object Serialise()
	Method.prototype.Serialise = function() {
		var self = this;
		var params = [];
		for (var param of self._parameters)
			if (param)
				params.push(param.Serialise());
			else
				params.push(null);


		return {"memberType": "method", "type": self._type ? self._type.SerialiseType() : null, "params": params, "name": self._name, "access": self._access, "static": self._static, "virtual": self._virtual, "overload": self._overload};
	};

	// static Method ImportMethod(object,Interface)
	Method.ImportMethod = function(symbol, from) {
		var method = eco.Method._New5(new eco.Method(), eco.Interface.ImportType(symbol["type"], from), symbol["name"]);
		method.setAccess((symbol["access"]));
		method.setStatic(symbol["static"]);
		method.setVirtual(symbol["virtual"]);
		var params = symbol["params"];
		for (var param of params)
			method.AddParameter(eco.Interface.ImportType(param["type"], from), param["name"], param["defaultValue"]);

		return method;
	};

	// virtual bool IsMethod()
	Method.prototype.IsMethod = function() {
		var self = this;
		return true;
	};

	// virtual bool IsServerRender()
	Method.prototype.IsServerRender = function() {
		var self = this;
		return false;
	};

	// virtual bool IsTemplateMethod()
	Method.prototype.IsTemplateMethod = function() {
		var self = this;
		return false;
	};

	// static Method Create(Interface,string,map<object>[],map<object>,SymbolDoc)
	Method.Create = function(returnType, name, params, code, doc) {
		var method = eco.Method._New5(new eco.Method(), returnType, name);
		for (var param of params)
			method.AddParameter(param["type"], param["name"], null);

		if (((code)["block"] !== undefined))
		{
			var parser = eco.Parser._New1(new eco.Parser());
			parser.SetContent(code["block"]);
			method.setBlock(parser.ParseBlock());
		}
		if (((code)["js"] !== undefined))
			method._inlineJS = code["js"];
		if (((code)["php"] !== undefined))
			method._inlinePHP = code["php"];
		if (doc)
			method.setDocs(doc);
		return method;
	};

	// static Method CreateStatic(Interface,string,map<object>[],map<object>,SymbolDoc)
	Method.CreateStatic = function(returnType, name, params, code, doc) {
		var method = Method.Create(returnType, name, params, code, doc);
		method.setStatic(true);
		return method;
	};

	// string getInlinePHP()
	Method.prototype.getInlinePHP = function() {
		var self = this;
		return self._inlinePHP;
	};

	// string getInlineJS()
	Method.prototype.getInlineJS = function() {
		var self = this;
		return self._inlineJS;
	};

	return Method;
}(eco.Member));

/**

 */
eco.Property = (function(_base) {
	__extends(Property, _base);

	function Property() {
	}

	// Constructor _New()
	Property._New4 = function(self) {
		self = _base._New2(self) || self;
		self._getter = null;
		self._setter = null;
		return self;
	};

	// Constructor _New(Interface,string)
	Property._New5 = function(self, type, name) {
		self = _base._New3(self, type, name) || self;
		self._getter = null;
		self._setter = null;
		self._memberType = eco.MemberType.Property;
		return self;
	};

	// Method getGetter()
	Property.prototype.getGetter = function() {
		var self = this;
		return self._getter;
	};

	// Method setGetter(Method)
	Property.prototype.setGetter = function(value) {
		var self = this;
		self._setter = value;
	};

	// Method getSetter()
	Property.prototype.getSetter = function() {
		var self = this;
		return self._setter;
	};

	// Method setSetter(Method)
	Property.prototype.setSetter = function(value) {
		var self = this;
		self._setter = value;
	};

	// virtual object Serialise()
	Property.prototype.Serialise = function() {
		var self = this;
		return {"memberType": "property", "type": self._type ? self._type.SerialiseType() : null, "name": self._name, "access": self._access, "static": self._static};
	};

	// static Property ImportProperty(object,Interface)
	Property.ImportProperty = function(symbol, from) {
		var property = eco.Property._New5(new eco.Property(), eco.Interface.ImportType(symbol["type"], from), symbol["name"]);
		property.setAccess((symbol["access"]));
		property.setStatic(symbol["static"]);
		return property;
	};

	// virtual bool IsProperty()
	Property.prototype.IsProperty = function() {
		var self = this;
		return true;
	};

	return Property;
}(eco.Member));

/**

 */
eco.SymbolTable = (function(_base) {
	__extends(SymbolTable, _base);

	function SymbolTable() {
	}

	// Constructor _New()
	SymbolTable._New4 = function(self) {
		self = _base._New2(self) || self;
		return self;
	};

	// Constructor _New(string)
	SymbolTable._New5 = function(self, name) {
		self = _base._New3(self, name) || self;
		self._symbolType = eco.SymbolType.SymbolTable;
		self.SetSymbol(eco.Interface.getObjectType().getArrayOf(), false);
		self.SetSymbol(eco.Interface.getObjectType().getMapOf(), false);
		self.SetSymbol(eco.Interface.getStringType(), false);
		return self;
	};

	/**

	 */
	SymbolTable.prototype.UseNamespaces = function(ns) {
		var self = this;
		for (var n of ns)
			self.UseNamespace(n);

	};

	/**

	 */
	SymbolTable.prototype.ClearUsings = function() {
		var self = this;
		self._usings = [];
	};

	/**

	 */
	SymbolTable.prototype.Serialise = function() {
		var self = this;
		var symbols = {};
		for (var symbol of self.getSymbolArray())
		{
			if (symbol.IsNamespace())
			{
				if ((symbol).IsInterface())
				{
					if ((symbol).IsClass())
					{
						if (!(symbol)._isNative)
							symbols[symbol._name] = symbol.Serialise();
					}
					else
						symbols[symbol._name] = symbol.Serialise();

				}
				else
					symbols[symbol._name] = symbol.Serialise();

			}
			else
				symbols[symbol._name] = symbol.Serialise();

		}

		return {"type": "package", "symbols": symbols};
	};

	/**

	 */
	SymbolTable.Import = function(name, symbol, sharedImport) {
		var symbolTable = eco.Namespace.ImportSkeleton(name, symbol, null, sharedImport);
		eco.Namespace.ImportFull(name, symbolTable, symbol);
		return symbolTable;
	};

	// static SymbolTable Import(string,SymbolTable,object,SymbolTable)
	SymbolTable.Import1 = function(name, into, symbol, sharedImport) {
		var symbolTable = eco.Namespace.ImportSkeleton(name, symbol, null, sharedImport);
		symbolTable.setName(symbolTable._name + "-import");
		eco.Namespace.ImportFull(name, symbolTable, symbol);
		for (var symbol2 of symbolTable.getSymbolArray())
			into.SetSymbol(symbol2, true);

		return symbolTable;
	};

	// virtual bool IsSymbolTable()
	SymbolTable.prototype.IsSymbolTable = function() {
		var self = this;
		return true;
	};

	return SymbolTable;
}(eco.Namespace));

/**

 */
eco.TypedefNode = (function(_base) {
	__extends(TypedefNode, _base);

	function TypedefNode() {
	}

	// Constructor _New()
	TypedefNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._otherType = null;
		return self;
	};

	// Constructor _New(string)
	TypedefNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._otherType = null;
		self._astType = eco.ASTType.Typedef;
		return self;
	};

	// TypeNode getOtherType()
	TypedefNode.prototype.getOtherType = function() {
		var self = this;
		return self._otherType;
	};

	// TypeNode setOtherType(TypeNode)
	TypedefNode.prototype.setOtherType = function(value) {
		var self = this;
		self._otherType = value;
	};

	return TypedefNode;
}(eco.InterfaceNode));

/**

 */
eco.ComponentServerNode = (function(_base) {
	__extends(ComponentServerNode, _base);

	function ComponentServerNode() {
	}

	// Constructor _New()
	ComponentServerNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._compUsings = null;
		return self;
	};

	// Constructor _New(string)
	ComponentServerNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._compUsings = null;
		self._astType = eco.ASTType.ServerComponent;
		self._compUsings = [];
		return self;
	};

	// TypeNode[] getComponentUsings()
	ComponentServerNode.prototype.getComponentUsings = function() {
		var self = this;
		return self._compUsings;
	};

	// void AddComponentUsing(TypeNode)
	ComponentServerNode.prototype.AddComponentUsing = function(used) {
		var self = this;
		self._compUsings.push(used);
	};

	return ComponentServerNode;
}(eco.ClassNode));

/**

 */
eco.ComponentClientNode = (function(_base) {
	__extends(ComponentClientNode, _base);

	function ComponentClientNode() {
	}

	// Constructor _New()
	ComponentClientNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._compUsings = null;
		return self;
	};

	// Constructor _New(string)
	ComponentClientNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._compUsings = null;
		self._astType = eco.ASTType.ClientComponent;
		self._compUsings = [];
		return self;
	};

	// TypeNode[] getComponentUsings()
	ComponentClientNode.prototype.getComponentUsings = function() {
		var self = this;
		return self._compUsings;
	};

	// void AddComponentUsing(TypeNode)
	ComponentClientNode.prototype.AddComponentUsing = function(used) {
		var self = this;
		self._compUsings.push(used);
	};

	return ComponentClientNode;
}(eco.ClassNode));

/**

 */
eco.InitialiserNode = (function(_base) {
	__extends(InitialiserNode, _base);

	function InitialiserNode() {
	}

	// Constructor _New()
	InitialiserNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._initUsings = null;
		return self;
	};

	// Constructor _New(string)
	InitialiserNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._initUsings = null;
		self._astType = eco.ASTType.Initialiser;
		self._initUsings = [];
		return self;
	};

	// TypeNode[] getInitUsings()
	InitialiserNode.prototype.getInitUsings = function() {
		var self = this;
		return self._initUsings;
	};

	// void AddInitialiserUsing(TypeNode)
	InitialiserNode.prototype.AddInitialiserUsing = function(used) {
		var self = this;
		self._initUsings.push(used);
	};

	return InitialiserNode;
}(eco.ClassNode));

/**

 */
eco.ServiceNode = (function(_base) {
	__extends(ServiceNode, _base);

	function ServiceNode() {
	}

	// Constructor _New()
	ServiceNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._serviceUsings = null;
		return self;
	};

	// Constructor _New(string)
	ServiceNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._serviceUsings = null;
		self._astType = eco.ASTType.Service;
		self._serviceUsings = [];
		return self;
	};

	// TypeNode[] getServiceUsings()
	ServiceNode.prototype.getServiceUsings = function() {
		var self = this;
		return self._serviceUsings;
	};

	// void AddServiceUsing(TypeNode)
	ServiceNode.prototype.AddServiceUsing = function(used) {
		var self = this;
		self._serviceUsings.push(used);
	};

	return ServiceNode;
}(eco.ClassNode));

/**

 */
eco.TemplateNode = (function(_base) {
	__extends(TemplateNode, _base);

	function TemplateNode() {
	}

	// Constructor _New()
	TemplateNode._New5 = function(self) {
		self = _base._New3(self) || self;
		self._parameters = null;
		self._mainMethod = null;
		return self;
	};

	// Constructor _New(string)
	TemplateNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._parameters = null;
		self._mainMethod = null;
		self._astType = eco.ASTType.Template;
		self._parameters = [];
		return self;
	};

	// object[] getParameters()
	TemplateNode.prototype.getParameters = function() {
		var self = this;
		return self._parameters;
	};

	// void AddParameter(TypeNode,string,ExpressionNode)
	TemplateNode.prototype.AddParameter = function(type, name, defaultValue) {
		var self = this;
		self._parameters.push({"type": type, "name": name, "defaultValue": defaultValue});
	};

	// MethodNode getMainMethod()
	TemplateNode.prototype.getMainMethod = function() {
		var self = this;
		return self._mainMethod;
	};

	// MethodNode setMainMethod(MethodNode)
	TemplateNode.prototype.setMainMethod = function(value) {
		var self = this;
		self._mainMethod = value;
	};

	return TemplateNode;
}(eco.ClassNode));

/**

 */
eco.ConstructorNode = (function(_base) {
	__extends(ConstructorNode, _base);

	function ConstructorNode() {
	}

	// Constructor _New()
	ConstructorNode._New5 = function(self) {
		self = _base._New4(self, null, "new") || self;
		self._baseCall = null;
		return self;
	};

	// CallExpressionNode getBaseCall()
	ConstructorNode.prototype.getBaseCall = function() {
		var self = this;
		return self._baseCall;
	};

	// CallExpressionNode setBaseCall(CallExpressionNode)
	ConstructorNode.prototype.setBaseCall = function(value) {
		var self = this;
		self._baseCall = value;
	};

	// virtual bool IsConstructor()
	ConstructorNode.prototype.IsConstructor = function() {
		var self = this;
		return true;
	};

	return ConstructorNode;
}(eco.MethodNode));

/**

 */
eco.ServerRenderNode = (function(_base) {
	__extends(ServerRenderNode, _base);

	function ServerRenderNode() {
	}

	// Constructor _New()
	ServerRenderNode._New5 = function(self) {
		self = _base._New4(self, null, "Render") || self;
		return self;
	};

	// virtual bool IsServerRender()
	ServerRenderNode.prototype.IsServerRender = function() {
		var self = this;
		return true;
	};

	return ServerRenderNode;
}(eco.MethodNode));

/**

 */
eco.TemplateRenderNode = (function(_base) {
	__extends(TemplateRenderNode, _base);

	function TemplateRenderNode() {
	}

	// Constructor _New()
	TemplateRenderNode._New5 = function(self) {
		self = _base._New3(self) || self;
		return self;
	};

	// Constructor _New(TypeNode,string)
	TemplateRenderNode._New6 = function(self, type, name) {
		self = _base._New4(self, type, name) || self;
		return self;
	};

	// virtual bool IsTemplateMethod()
	TemplateRenderNode.prototype.IsTemplateMethod = function() {
		var self = this;
		return true;
	};

	return TemplateRenderNode;
}(eco.MethodNode));

/**

 */
eco.LitExpressionNode = (function(_base) {
	__extends(LitExpressionNode, _base);

	function LitExpressionNode() {
	}

	// Constructor _New()
	LitExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._lit = null;
		return self;
	};

	// Constructor _New(Token)
	LitExpressionNode._New4 = function(self, lit) {
		self = _base._New2(self) || self;
		self._lit = null;
		self._exprType = eco.ExpressionType.Lit;
		self._lit = lit;
		return self;
	};

	// Token getLiteral()
	LitExpressionNode.prototype.getLiteral = function() {
		var self = this;
		return self._lit;
	};

	// Token setLiteral(Token)
	LitExpressionNode.prototype.setLiteral = function(value) {
		var self = this;
		self._lit = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	LitExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		switch (self._lit._tokType)
		{
			case eco.TokenType.Bool:
				return eco.Interface.getBoolType();
			case eco.TokenType.Char:
				return eco.Interface.getCharType();
			case eco.TokenType.Int:
				return eco.Interface.getIntType();
			case eco.TokenType.Float:
				return eco.Interface.getFloatType();
			case eco.TokenType.String:
				return eco.Interface.getStringType();
			case eco.TokenType.AsmStr:
				return eco.Interface.getObjectType();
			case eco.TokenType.K_This:
				return scope._method._owner;
			case eco.TokenType.K_True:
				return eco.Interface.getBoolType();
			case eco.TokenType.K_False:
				return eco.Interface.getBoolType();
			case eco.TokenType.K_Null:
				return eco.Interface.getNullType();
		}
	};

	return LitExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.LoadExpressionNode = (function(_base) {
	__extends(LoadExpressionNode, _base);

	function LoadExpressionNode() {
	}

	// Constructor _New()
	LoadExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._varName = "";
		self._beingDefined = false;
		self._native = false;
		return self;
	};

	// Constructor _New(string,bool)
	LoadExpressionNode._New4 = function(self, varName, defined) {
		self = _base._New2(self) || self;
		self._varName = "";
		self._beingDefined = false;
		self._native = false;
		self._exprType = eco.ExpressionType.Load;
		self._varName = varName;
		self._beingDefined = defined;
		return self;
	};

	// string getVarName()
	LoadExpressionNode.prototype.getVarName = function() {
		var self = this;
		return self._varName;
	};

	// string setVarName(string)
	LoadExpressionNode.prototype.setVarName = function(value) {
		var self = this;
		self._varName = value;
	};

	// bool getIsBeingDefined()
	LoadExpressionNode.prototype.getIsBeingDefined = function() {
		var self = this;
		return self._beingDefined;
	};

	// bool getIsNative()
	LoadExpressionNode.prototype.getIsNative = function() {
		var self = this;
		return self._native;
	};

	// bool setIsNative(bool)
	LoadExpressionNode.prototype.setIsNative = function(value) {
		var self = this;
		self._native = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	LoadExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		if (self._native)
			return eco.Interface.getObjectType();
		var found = scope.GetItem(self._varName);
		if (found)
			return found.ItemType;
		var owner = scope._method._owner;
		var members = owner.GetAllMembers();
		for (var member of members)
		{
			if (member._name == self._varName && (member.IsField() || member.IsProperty()))
				return member._type;
		}

		return null;
	};

	// virtual Interface TryGetType(Scope)
	LoadExpressionNode.prototype.TryGetType = function(scope) {
		var self = this;
		var typeNode = eco.TypeNode._New2(new eco.TypeNode(), self._varName);
		return scope._method._owner.GetType(typeNode, null);
	};

	// virtual string GenerateTypeString()
	LoadExpressionNode.prototype.GenerateTypeString = function() {
		var self = this;
		return self._varName;
	};

	return LoadExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.AccessExpressionNode = (function(_base) {
	__extends(AccessExpressionNode, _base);

	function AccessExpressionNode() {
	}

	// Constructor _New()
	AccessExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._field = "";
		return self;
	};

	// Constructor _New(ExpressionNode,string)
	AccessExpressionNode._New4 = function(self, expr, field) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._field = "";
		self._exprType = eco.ExpressionType.Access;
		self._expr = expr;
		self._field = field;
		return self;
	};

	// ExpressionNode getExpression()
	AccessExpressionNode.prototype.getExpression = function() {
		var self = this;
		return self._expr;
	};

	// ExpressionNode setExpression(ExpressionNode)
	AccessExpressionNode.prototype.setExpression = function(value) {
		var self = this;
		self._expr = value;
	};

	// string getField()
	AccessExpressionNode.prototype.getField = function() {
		var self = this;
		return self._field;
	};

	// string setField(string)
	AccessExpressionNode.prototype.setField = function(value) {
		var self = this;
		self._field = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	AccessExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var exprType = self._expr.GetTypeOf(scope, parser);
		if (exprType == eco.Interface.getObjectType())
			return eco.Interface.getObjectType();
		if (!exprType || exprType == eco.Interface.getNullType())
		{
			exprType = self._expr.TryGetType(scope);
			if (!exprType)
				return null;
		}
		if (exprType.IsMap())
			return (exprType)._elem;
		if (exprType.IsEnum())
		{
			var enumType = exprType;
			if (!((enumType._kv)[self._field] !== undefined))
				return null;
			return exprType;
		}
		if (exprType.IsClass())
		{
			var cur = exprType;
			while (cur)
			{
				var members = cur._members;
				for (var member of members)
				{
					if ((member.IsField() || member.IsProperty()) && member._name == self._field)
						return member._type;
				}

				cur = cur._baseClass;
			}

		}
		if (exprType.IsInline() || exprType.IsDefined)
		{
			var members1 = (exprType)._members;
			for (var member1 of members1)
			{
				if ((member1.IsField() || member1.IsProperty()) && member1._name == self._field)
					return member1._type;
			}

		}
		return null;
	};

	// virtual Interface TryGetType(Scope)
	AccessExpressionNode.prototype.TryGetType = function(scope) {
		var self = this;
		var type1 = self._expr.TryGetType(scope);
		if (!type1)
		{
			var cur = self;
			var str = "";
			while (cur)
			{
				if (cur._exprType == eco.ExpressionType.Load)
				{
					str = (cur)._varName + "." + str;
					cur = null;
				}
				else if (cur._exprType == eco.ExpressionType.Access)
				{
					str = (cur)._field + "." + str;
					cur = (cur)._expr;
				}
				else
					return null;

			}

			str = str.substr(0, str.length - 1);
			var typeNode = eco.TypeNode.Generate(str);
			var type = scope._method._owner.GetType(typeNode, null);
			return type;
		}
		var typeNode1 = eco.TypeNode._New2(new eco.TypeNode(), self._field);
		var type1 = type1.GetType(typeNode1, null);
		return type1;
	};

	// virtual string GenerateTypeString()
	AccessExpressionNode.prototype.GenerateTypeString = function() {
		var self = this;
		var first = self._expr.GenerateTypeString();
		if (first == "")
			return "";
		return first + "." + self._field;
	};

	return AccessExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.ArrayAccessExpressionNode = (function(_base) {
	__extends(ArrayAccessExpressionNode, _base);

	function ArrayAccessExpressionNode() {
	}

	// Constructor _New()
	ArrayAccessExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._index = null;
		return self;
	};

	// Constructor _New(ExpressionNode,ExpressionNode)
	ArrayAccessExpressionNode._New4 = function(self, expr, index) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._index = null;
		self._exprType = eco.ExpressionType.ArrayAccess;
		self._expr = expr;
		self._index = index;
		return self;
	};

	// ExpressionNode getExpr()
	ArrayAccessExpressionNode.prototype.getExpr = function() {
		var self = this;
		return self._expr;
	};

	// ExpressionNode getIndex()
	ArrayAccessExpressionNode.prototype.getIndex = function() {
		var self = this;
		return self._index;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	ArrayAccessExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var exprType = self._expr.GetTypeOf(scope, parser);
		if (exprType == eco.Interface.getObjectType())
			return eco.Interface.getObjectType();
		if (exprType == eco.Interface.getStringType())
			return eco.Interface.getCharType();
		if (!exprType)
			return null;
		if (!exprType.IsArray() && !exprType.IsMap())
			return null;
		if (exprType.IsArray())
			return (exprType)._elem;
		else if (exprType.IsMap())
			return (exprType)._elem;
		return null;
	};

	return ArrayAccessExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.NewExpressionNode = (function(_base) {
	__extends(NewExpressionNode, _base);

	function NewExpressionNode() {
	}

	// Constructor _New()
	NewExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._newType = null;
		self._argList = null;
		self._isNative = false;
		return self;
	};

	// Constructor _New(TypeNode)
	NewExpressionNode._New4 = function(self, type) {
		self = _base._New2(self) || self;
		self._newType = null;
		self._argList = null;
		self._isNative = false;
		self._exprType = eco.ExpressionType.New;
		self._newType = type;
		return self;
	};

	// TypeNode getNewType()
	NewExpressionNode.prototype.getNewType = function() {
		var self = this;
		return self._newType;
	};

	// ExpressionNode[] getArgList()
	NewExpressionNode.prototype.getArgList = function() {
		var self = this;
		return self._argList;
	};

	// ExpressionNode[] setArgList(ExpressionNode[])
	NewExpressionNode.prototype.setArgList = function(value) {
		var self = this;
		self._argList = value;
	};

	// bool getIsNative()
	NewExpressionNode.prototype.getIsNative = function() {
		var self = this;
		return self._isNative;
	};

	// bool setIsNative(bool)
	NewExpressionNode.prototype.setIsNative = function(value) {
		var self = this;
		self._isNative = value;
	};

	// CallExpressionNode CreateCall()
	NewExpressionNode.prototype.CreateCall = function() {
		var self = this;
		var call = eco.CallExpressionNode._New4(new eco.CallExpressionNode(), "_New");
		call.setArgList(self._argList);
		return call;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	NewExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		if (self._isNative)
			return eco.Interface.getObjectType();
		var found = scope._method._owner.GetType(self._newType, null);
		if (found)
			return found;
	};

	return NewExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.CallExpressionNode = (function(_base) {
	__extends(CallExpressionNode, _base);

	function CallExpressionNode() {
	}

	// Constructor _New()
	CallExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._name = "";
		self._isNative = false;
		self._argList = null;
		return self;
	};

	// Constructor _New(string)
	CallExpressionNode._New4 = function(self, name) {
		self = _base._New2(self) || self;
		self._name = "";
		self._isNative = false;
		self._argList = null;
		self._exprType = eco.ExpressionType.Call;
		self._name = name;
		self._argList = [];
		return self;
	};

	// string getName()
	CallExpressionNode.prototype.getName = function() {
		var self = this;
		return self._name;
	};

	// string Signature(Scope)
	CallExpressionNode.prototype.Signature = function(scope) {
		var self = this;
		var sig = self._name + "(";
		if (self._argList && self._argList.length > 0)
		{
			var pType = self._argList[0].GetTypeOf(scope, null);
			if (pType)
				sig = sig + pType.getFullName();
			else
				sig = sig + "unknown";

			for (var i = 1; i < self._argList.length; i++)
			{
				pType = self._argList[i].GetTypeOf(scope, null);
				if (pType)
					sig = sig + "," + pType.getFullName();
				else
					sig = sig + ",unknown";

			}

		}
		return sig + ")";
	};

	// bool getIsNative()
	CallExpressionNode.prototype.getIsNative = function() {
		var self = this;
		return self._isNative;
	};

	// bool setIsNative(bool)
	CallExpressionNode.prototype.setIsNative = function(value) {
		var self = this;
		self._isNative = value;
	};

	// ExpressionNode[] getArgList()
	CallExpressionNode.prototype.getArgList = function() {
		var self = this;
		return self._argList;
	};

	// ExpressionNode[] setArgList(ExpressionNode[])
	CallExpressionNode.prototype.setArgList = function(value) {
		var self = this;
		self._argList = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	CallExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		if (self._isNative)
			return eco.Interface.getObjectType();
		var owner = scope._method._owner;
		var found = owner.GetMethod(self, scope, function (competes) {
			if (parser)
			{
				var list = "";
				var count = 0;
				for (var method of competes)
				{
					if (count > 0)
						list = list + ", ";
					list = list + method.Signature();
					count++;
				}

				parser.Error4("Ambiguous method call between " + list, self);
			}
		});
		if (found)
			return found._type;
		var scopeFunc = scope.GetItem(self._name);
		if (scopeFunc)
		{
			var sType = scopeFunc.ItemType;
			if (!sType)
				return null;
			if (sType == eco.Interface.getObjectType())
				return sType;
			if (sType.IsFunction())
				return (sType)._return;
		}
		var field = scope._method._owner.GetMember(self._name);
		if (field && field._type.IsFunction())
			return (field._type)._return;
		return null;
	};

	// string CallSignature(Scope)
	CallExpressionNode.prototype.CallSignature = function(scope) {
		var self = this;
		var callSignature = self._name + "(";
		var count = 0;
		for (var arg of self._argList)
		{
			if (count > 0)
				callSignature = callSignature + ", ";
			var argType = arg.GetTypeOf(scope, null);
			if (argType)
				callSignature = callSignature + argType.Signature();
			else
				callSignature = callSignature + "<unknown>";

			count++;
		}

		callSignature = callSignature + ")";
		return callSignature;
	};

	return CallExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.MethodCallExpressionNode = (function(_base) {
	__extends(MethodCallExpressionNode, _base);

	function MethodCallExpressionNode() {
	}

	// Constructor _New()
	MethodCallExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._call = null;
		return self;
	};

	// Constructor _New(ExpressionNode,CallExpressionNode)
	MethodCallExpressionNode._New4 = function(self, expr, call) {
		self = _base._New2(self) || self;
		self._expr = null;
		self._call = null;
		self._exprType = eco.ExpressionType.MethodCall;
		self._expr = expr;
		self._call = call;
		return self;
	};

	// ExpressionNode getExpr()
	MethodCallExpressionNode.prototype.getExpr = function() {
		var self = this;
		return self._expr;
	};

	// CallExpressionNode getCall()
	MethodCallExpressionNode.prototype.getCall = function() {
		var self = this;
		return self._call;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	MethodCallExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var exprType = self._expr.GetTypeOf(scope, parser);
		if (exprType == eco.Interface.getObjectType())
			return eco.Interface.getObjectType();
		if (!exprType || exprType == eco.Interface.getNullType())
		{
			exprType = self._expr.TryGetType(scope);
			if (!exprType)
				return null;
		}
		var found = exprType.GetMethod(self._call, scope, function (competes) {
			if (parser)
			{
				var list = "";
				var count = 0;
				for (var method of competes)
				{
					if (count > 0)
						list = list + ", ";
					list = list + method.Signature();
					count++;
				}

				parser.Error4("Ambiguous method call between " + list, self._call);
			}
		});
		if (found)
			return found._type;
		var field = exprType.GetMember(self._call._name);
		if (field && field._type.IsFunction())
			return (field._type)._return;
		return null;
	};

	return MethodCallExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.ComplexCallExpressionNode = (function(_base) {
	__extends(ComplexCallExpressionNode, _base);

	function ComplexCallExpressionNode() {
	}

	// Constructor _New()
	ComplexCallExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._obj = null;
		self._argList = null;
		return self;
	};

	// Constructor _New(ExpressionNode)
	ComplexCallExpressionNode._New4 = function(self, obj) {
		self = _base._New2(self) || self;
		self._obj = null;
		self._argList = null;
		self._exprType = eco.ExpressionType.ComplexCall;
		self._obj = obj;
		return self;
	};

	// ExpressionNode getObject()
	ComplexCallExpressionNode.prototype.getObject = function() {
		var self = this;
		return self._obj;
	};

	// ExpressionNode[] getArgList()
	ComplexCallExpressionNode.prototype.getArgList = function() {
		var self = this;
		return self._argList;
	};

	// ExpressionNode[] setArgList(ExpressionNode[])
	ComplexCallExpressionNode.prototype.setArgList = function(value) {
		var self = this;
		self._argList = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	ComplexCallExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var objType = self._obj.GetTypeOf(scope, parser);
		if (!objType)
			return null;
		if (objType == eco.Interface.getObjectType())
			return eco.Interface.getObjectType();
		if (objType.IsFunction())
			return (objType)._return;
		return null;
	};

	return ComplexCallExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.FunctionExpressionNode = (function(_base) {
	__extends(FunctionExpressionNode, _base);

	function FunctionExpressionNode() {
	}

	// Constructor _New()
	FunctionExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._params = null;
		self._return = null;
		self._block = null;
		self._exprType = eco.ExpressionType.Function;
		self._params = [];
		return self;
	};

	// object[] getParams()
	FunctionExpressionNode.prototype.getParams = function() {
		var self = this;
		return self._params;
	};

	// void AddParam(TypeNode,string)
	FunctionExpressionNode.prototype.AddParam = function(type, name) {
		var self = this;
		self._params.push({"type": type, "name": name});
	};

	// TypeNode getReturnType()
	FunctionExpressionNode.prototype.getReturnType = function() {
		var self = this;
		return self._return;
	};

	// TypeNode setReturnType(TypeNode)
	FunctionExpressionNode.prototype.setReturnType = function(value) {
		var self = this;
		self._return = value;
	};

	// BlockNode getBlock()
	FunctionExpressionNode.prototype.getBlock = function() {
		var self = this;
		return self._block;
	};

	// BlockNode setBlock(BlockNode)
	FunctionExpressionNode.prototype.setBlock = function(value) {
		var self = this;
		self._block = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	FunctionExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var funcType = eco.FunctionType._New6(new eco.FunctionType());
		if (self._return)
			funcType.setReturnType(scope._method._owner.GetType(self._return, null));
		for (var param of self._params)
		{
			var pTypeNode = param.type;
			var pName = param.name;
			var pType = scope._method._owner.GetType(pTypeNode, null);
			funcType.AddParam(pType, pName);
		}

		return funcType;
	};

	return FunctionExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.OperatorExpressionNode = (function(_base) {
	__extends(OperatorExpressionNode, _base);

	function OperatorExpressionNode() {
	}

	// Constructor _New()
	OperatorExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._op = null;
		self._expr1 = null;
		self._expr2 = null;
		return self;
	};

	// Constructor _New(OpType)
	OperatorExpressionNode._New4 = function(self, op) {
		self = _base._New2(self) || self;
		self._op = null;
		self._expr1 = null;
		self._expr2 = null;
		self._exprType = eco.ExpressionType.Op;
		self._op = op;
		return self;
	};

	// OpType getOperator()
	OperatorExpressionNode.prototype.getOperator = function() {
		var self = this;
		return self._op;
	};

	// ExpressionNode getExpression1()
	OperatorExpressionNode.prototype.getExpression1 = function() {
		var self = this;
		return self._expr1;
	};

	// ExpressionNode setExpression1(ExpressionNode)
	OperatorExpressionNode.prototype.setExpression1 = function(value) {
		var self = this;
		self._expr1 = value;
	};

	// ExpressionNode getExpression2()
	OperatorExpressionNode.prototype.getExpression2 = function() {
		var self = this;
		return self._expr2;
	};

	// ExpressionNode setExpression2(ExpressionNode)
	OperatorExpressionNode.prototype.setExpression2 = function(value) {
		var self = this;
		self._expr2 = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	OperatorExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var t1 = self._expr1.GetTypeOf(scope, parser);
		if (!t1 || t1 == eco.Interface.getVoidType())
			return null;
		var t2 = self._expr2.GetTypeOf(scope, parser);
		if (!t2 || t2 == eco.Interface.getVoidType())
			return null;
		switch (self._op)
		{
			case eco.OpType.CmpGT:
			case eco.OpType.CmpLT:
			case eco.OpType.CmpGTE:
			case eco.OpType.CmpLTE:
			case eco.OpType.CmpEq:
			case eco.OpType.CmpNEq:
			case eco.OpType.And:
			case eco.OpType.Or:
				return eco.Interface.getBoolType();
		}
		if (t1 == eco.Interface.getObjectType() || t2 == eco.Interface.getObjectType())
			return eco.Interface.getObjectType();
		switch (self._op)
		{
			case eco.OpType.Mult:
			case eco.OpType.Div:
			case eco.OpType.Exp:
			case eco.OpType.Sub:
			case eco.OpType.Mod:
			{
				if (t1 != eco.Interface.getIntType() && t1 != eco.Interface.getFloatType())
					return null;
				if (t2 != eco.Interface.getIntType() && t2 != eco.Interface.getFloatType())
					return null;
				if (t1 == eco.Interface.getFloatType() || t2 == eco.Interface.getFloatType())
					return eco.Interface.getFloatType();
				else
					return eco.Interface.getIntType();

				break;
			}
			case eco.OpType.Add:
			{
				if (t1 != eco.Interface.getIntType() && t1 != eco.Interface.getFloatType() && t1 != eco.Interface.getCharType() && t1 != eco.Interface.getStringType())
					return null;
				if (t2 != eco.Interface.getIntType() && t2 != eco.Interface.getFloatType() && t2 != eco.Interface.getCharType() && t2 != eco.Interface.getStringType())
					return null;
				if (t1 == eco.Interface.getStringType() || t2 == eco.Interface.getStringType())
					return eco.Interface.getStringType();
				else if (t1 == eco.Interface.getFloatType() || t2 == eco.Interface.getFloatType())
					return eco.Interface.getFloatType();
				else
					return eco.Interface.getIntType();

				break;
			}
			case eco.OpType.Assign:
			case eco.OpType.AAdd:
			case eco.OpType.ASub:
			case eco.OpType.AMul:
			case eco.OpType.ADiv:
			case eco.OpType.AExp:
			case eco.OpType.AMod:
			{
				if (t2.DistanceTo(t1) < 0)
					return null;
				else
					return t2;

			}
			default:
				break;
		}
		return null;
	};

	return OperatorExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.ParExpressionNode = (function(_base) {
	__extends(ParExpressionNode, _base);

	function ParExpressionNode() {
	}

	// Constructor _New()
	ParExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._sub = null;
		return self;
	};

	// Constructor _New(ExpressionNode)
	ParExpressionNode._New4 = function(self, sub) {
		self = _base._New2(self) || self;
		self._sub = null;
		self._exprType = eco.ExpressionType.Par;
		self._sub = sub;
		return self;
	};

	// ExpressionNode getSubExpr()
	ParExpressionNode.prototype.getSubExpr = function() {
		var self = this;
		return self._sub;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	ParExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return self._sub.GetTypeOf(scope, parser);
	};

	return ParExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.LitArrayExpressionNode = (function(_base) {
	__extends(LitArrayExpressionNode, _base);

	function LitArrayExpressionNode() {
	}

	// Constructor _New()
	LitArrayExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._items = null;
		self._exprType = eco.ExpressionType.LitArray;
		self._items = [];
		return self;
	};

	// ExpressionNode[] getItems()
	LitArrayExpressionNode.prototype.getItems = function() {
		var self = this;
		return self._items;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	LitArrayExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		if (self._items.length == 0)
			return eco.Interface.getObjectType().getArrayOf();
		var common = self._items[0].GetTypeOf(scope, parser);
		for (var i = 1; i < self._items.length; i++)
		{
			var itemType = self._items[i].GetTypeOf(scope, parser);
			if (itemType)
			{
				var common1 = itemType.GetCommon(common);
				if (!common1)
				{
					common1 = eco.Interface.getObjectType();
					break;
				}
			}
			else
			{
				common = eco.Interface.getObjectType();
				break;
			}

		}

		if (common)
			return common.getArrayOf();
		return null;
	};

	return LitArrayExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.LitMapExpressionNode = (function(_base) {
	__extends(LitMapExpressionNode, _base);

	function LitMapExpressionNode() {
	}

	// Constructor _New()
	LitMapExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._items = null;
		self._exprType = eco.ExpressionType.Map;
		self._items = {};
		return self;
	};

	// map<ExpressionNode> getItems()
	LitMapExpressionNode.prototype.getItems = function() {
		var self = this;
		return self._items;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	LitMapExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var keys = Object.keys(self._items);
		if (keys.length == 0)
			return eco.Interface.getObjectType().getMapOf();
		var inlineType = eco.InlineInterface._New6(new eco.InlineInterface());
		for (var key of keys)
		{
			var itemType = self._items[key].GetTypeOf(scope, parser);
			if (itemType)
			{
				{
					var fieldMember = eco.Field._New5(new eco.Field(), itemType, key);
					inlineType.AddMember(fieldMember);
				}
			}
		}

		return inlineType;
	};

	return LitMapExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.TypecastExpressionNode = (function(_base) {
	__extends(TypecastExpressionNode, _base);

	function TypecastExpressionNode() {
	}

	// Constructor _New()
	TypecastExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._type = null;
		self._expr = null;
		return self;
	};

	// Constructor _New(TypeNode,ExpressionNode)
	TypecastExpressionNode._New4 = function(self, type, expr) {
		self = _base._New2(self) || self;
		self._type = null;
		self._expr = null;
		self._exprType = eco.ExpressionType.Typecast;
		self._type = type;
		self._expr = expr;
		return self;
	};

	// TypeNode getToType()
	TypecastExpressionNode.prototype.getToType = function() {
		var self = this;
		return self._type;
	};

	// ExpressionNode getExpr()
	TypecastExpressionNode.prototype.getExpr = function() {
		var self = this;
		return self._expr;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	TypecastExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return scope._method._owner.GetType(self._type, null);
	};

	return TypecastExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.AssemblyExpressionNode = (function(_base) {
	__extends(AssemblyExpressionNode, _base);

	function AssemblyExpressionNode() {
	}

	// Constructor _New()
	AssemblyExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._assembly = "";
		return self;
	};

	// Constructor _New(string)
	AssemblyExpressionNode._New4 = function(self, assembly) {
		self = _base._New2(self) || self;
		self._assembly = "";
		self._exprType = eco.ExpressionType.Assembly;
		self._assembly = assembly;
		return self;
	};

	// string getAssembly()
	AssemblyExpressionNode.prototype.getAssembly = function() {
		var self = this;
		return self._assembly;
	};

	return AssemblyExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.HTMLExpressionNode = (function(_base) {
	__extends(HTMLExpressionNode, _base);

	function HTMLExpressionNode() {
	}

	HTMLExpressionNode._basicTags = null;
	// Constructor _New()
	HTMLExpressionNode._New3 = function(self) {
		self = _base._New2(self) || self;
		self._elem = null;
		self._elemExpr = null;
		self._children = null;
		self._attr = null;
		self._attrClone = null;
		self._exprType = eco.ExpressionType.HTML;
		self._children = [];
		self._attr = {};
		return self;
	};

	// Constructor _New(TypeNode)
	HTMLExpressionNode._New4 = function(self, elem) {
		self = _base._New2(self) || self;
		self._elem = null;
		self._elemExpr = null;
		self._children = null;
		self._attr = null;
		self._attrClone = null;
		self._exprType = eco.ExpressionType.HTML;
		self._elem = elem;
		self._children = [];
		self._attr = {};
		return self;
	};

	// Constructor _New(ExpressionNode)
	HTMLExpressionNode._New5 = function(self, elemExpression) {
		self = _base._New2(self) || self;
		self._elem = null;
		self._elemExpr = null;
		self._children = null;
		self._attr = null;
		self._attrClone = null;
		self._exprType = eco.ExpressionType.HTML;
		self._elemExpr = elemExpression;
		self._children = [];
		self._attr = {};
		return self;
	};

	// static string[] getBasicTags()
	HTMLExpressionNode.getBasicTags = function() {
		if (!HTMLExpressionNode._basicTags)
		{
			HTMLExpressionNode._basicTags = ["none", "html", "head", "title", "base", "link", "meta", "style", "script", "noscript", "body", "section", "nav", "article", "aside", "h1", "h2", "h3", "h4", "h5", "h6", "hgroup", "header", "footer", "address", "p", "hr", "pre", "blockquote", "ol", "ul", "li", "dl", "dt", "dd", "figure", "figcaption", "div", "a", "em", "strong", "small", "s", "cite", "q", "dfn", "abbr", "data", "time", "code", "var", "samp", "kbd", "sub", "sup", "i", "b", "u", "mark", "ruby", "rt", "rp", "bdi", "bdo", "span", "br", "wbr", "ins", "del", "img", "iframe", "embed", "object", "param", "video", "audio", "source", "track", "canvas", "map", "area", "table", "caption", "colgroup", "col", "tbody", "thead", "tfoot", "tr", "td", "th", "form", "fieldset", "legend", "label", "input", "button", "select", "datalist", "optgroup", "option", "textarea", "keygen", "output", "progress", "meter", "details", "summary", "command", "menu", "dialog", "center"];
		}
		return HTMLExpressionNode._basicTags;
	};

	// bool IsBasic()
	HTMLExpressionNode.prototype.IsBasic = function() {
		var self = this;
		if (!self._elem)
			return false;
		for (var tag of HTMLExpressionNode.getBasicTags())
			if (tag == self._elem._name)
				return true;

		return false;
	};

	// TypeNode getElem()
	HTMLExpressionNode.prototype.getElem = function() {
		var self = this;
		return self._elem;
	};

	// ExpressionNode getElemExpression()
	HTMLExpressionNode.prototype.getElemExpression = function() {
		var self = this;
		return self._elemExpr;
	};

	// HTMLExpressionNode[] getChildren()
	HTMLExpressionNode.prototype.getChildren = function() {
		var self = this;
		return self._children;
	};

	// void AddChild(HTMLExpressionNode)
	HTMLExpressionNode.prototype.AddChild = function(child) {
		var self = this;
		self._children.push(child);
	};

	// map<ExpressionNode> getAttributes()
	HTMLExpressionNode.prototype.getAttributes = function() {
		var self = this;
		return self._attr;
	};

	// ExpressionNode getAttributeClone()
	HTMLExpressionNode.prototype.getAttributeClone = function() {
		var self = this;
		return self._attrClone;
	};

	// ExpressionNode setAttributeClone(ExpressionNode)
	HTMLExpressionNode.prototype.setAttributeClone = function(value) {
		var self = this;
		self._attrClone = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	HTMLExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return scope._method._owner.GetRootNamespace().GetNamespaceBySignature("std", false).GetNamespaceBySignature("html", false).GetNamespaceBySignature("HTMLElement", false);
	};

	return HTMLExpressionNode;
}(eco.ExpressionNode));

/**

 */
eco.TypeDef = (function(_base) {
	__extends(TypeDef, _base);

	function TypeDef() {
	}

	// Constructor _New()
	TypeDef._New4 = function(self) {
		self = _base._New4(self) || self;
		self._otherType = null;
		return self;
	};

	// Constructor _New(string)
	TypeDef._New5 = function(self, name) {
		self = _base._New5(self, name) || self;
		self._otherType = null;
		self._symbolType = eco.SymbolType.Typedef;
		return self;
	};

	// Interface getOtherType()
	TypeDef.prototype.getOtherType = function() {
		var self = this;
		return self._otherType;
	};

	// Interface setOtherType(Interface)
	TypeDef.prototype.setOtherType = function(value) {
		var self = this;
		self._otherType = value;
	};

	// bool IsTypedef()
	TypeDef.prototype.IsTypedef = function() {
		var self = this;
		return true;
	};

	return TypeDef;
}(eco.Interface));

/**

 */
eco.InlineInterface = (function(_base) {
	__extends(InlineInterface, _base);

	function InlineInterface() {
	}

	// Constructor _New()
	InlineInterface._New6 = function(self) {
		self = _base._New5(self, "type") || self;
		return self;
	};

	// virtual bool AddMember(Member)
	InlineInterface.prototype.AddMember = function(member) {
		var self = this;
		if (!member)
			return false;
		var res = _base.prototype.AddMember.call(self, member);
		self.setName("type{");
		var getMemberName = function (mem) {
			var name = (mem._type ? mem._type.getFullName() : "<unknown>") + " " + mem._name;
			if (mem.IsMethod())
			{
				name = name + "(";
				var methodMember = mem;
				if (methodMember._parameters.length > 0)
				{
					name = name + (methodMember._parameters[0].Type ? methodMember._parameters[0].Type.getFullName() : "<unknown>") + " " + methodMember._parameters[0].Name;
					for (var p = 1; p < methodMember._parameters.length; p++)
					{
						name = name + ", " + (methodMember._parameters[p].Type ? methodMember._parameters[p].Type.getFullName() : "<unknown>") + " " + methodMember._parameters[p].Name;
					}

				}
				name = name + ")";
			}
			return name;
		};
		self.setName(self.getName() + getMemberName(self.getMembers()[0]));
		for (var m = 1; m < self.getMembers().length; m++)
			self.setName(self.getName() + ", " + getMemberName(self.getMembers()[m]));

		self.setName(self.getName() + "}");
		return res;
	};

	// virtual bool IsInline()
	InlineInterface.prototype.IsInline = function() {
		var self = this;
		return true;
	};

	// virtual int DistanceTo(Interface)
	InlineInterface.prototype.DistanceTo = function(type) {
		var self = this;
		if (!type)
			return -1;
		if (type == eco.Interface.getObjectType())
			return 1;
		if (type.IsMap())
		{
			var mapType = type;
			var elem = mapType._elem;
			if (!elem)
				return -1;
			for (var member of self.getMembers())
			{
				if (!member._type)
					return -1;
				if (member._type.DistanceTo(elem) < 0)
					return -1;
			}

			return 1;
		}
		else if (type.IsClass() || type.IsInline() || type.IsDefined)
		{
			var dist = 1;
			for (var member1 of type._members)
			{
				if (type.IsClass() && !member1.IsField())
					continue;
				if (!member1._type)
					return -1;
				var found = self.GetMember(member1.Signature());
				if (!found)
				{
					found = self.GetMemberByName(member1._name);
					if (!found)
						return -1;
					else
					{
						if (member1.IsMethod() && !found._type.IsFunction())
							return -1;
						else
						{
							var methodMember = member1;
							var foundFuncType = found._type;
							if (!foundFuncType._return)
								return -1;
							if (foundFuncType._return.DistanceTo(member1._type) < 0)
								return -1;
							if (foundFuncType._paramTypes.length != methodMember._parameters.length)
								return -1;
							for (var p = 0; p < methodMember._parameters.length; p++)
							{
								if (!foundFuncType._paramTypes[p] || !methodMember._parameters[p].Type)
									return -1;
								if (foundFuncType._paramTypes[p].DistanceTo(methodMember._parameters[p].Type) < 0)
									return -1;
							}

						}

					}

				}
				else
				{
					if (!found._type)
						return -1;
					else if (found._type.DistanceTo(member1._type) < 0)
						return -1;
				}

				dist++;
			}

			return dist;
		}
		else
			return -1;

		return 1;
	};

	return InlineInterface;
}(eco.Interface));

/**

 */
eco.Class = (function(_base) {
	__extends(Class, _base);

	function Class() {
	}

	// Constructor _New()
	Class._New6 = function(self) {
		self = _base._New4(self) || self;
		self._baseClass = null;
		self._subClasses = null;
		self._interfaces = null;
		self._isNative = false;
		self._hasSerialisationMethods = false;
		return self;
	};

	// Constructor _New(string)
	Class._New7 = function(self, name) {
		self = _base._New5(self, name) || self;
		self._baseClass = null;
		self._subClasses = null;
		self._interfaces = null;
		self._isNative = false;
		self._hasSerialisationMethods = false;
		self._symbolType = eco.SymbolType.Class;
		self._interfaces = [];
		self._isNative = false;
		self._subClasses = [];
		return self;
	};

	// Class getBaseClass()
	Class.prototype.getBaseClass = function() {
		var self = this;
		return self._baseClass;
	};

	// Class setBaseClass(Class)
	Class.prototype.setBaseClass = function(value) {
		var self = this;
		self._baseClass = value;
		self._subClasses.push(value);
	};

	// Class[] getSubClasses()
	Class.prototype.getSubClasses = function() {
		var self = this;
		return self._subClasses;
	};

	// int getClassDepth()
	Class.prototype.getClassDepth = function() {
		var self = this;
		if (!self._baseClass)
			return 0;
		var depth = 0;
		var cur = self._baseClass;
		while (cur)
		{
			depth++;
			cur = cur._baseClass;
		}

		return depth;
	};

	// Interface[] getInterfaces()
	Class.prototype.getInterfaces = function() {
		var self = this;
		return self._interfaces;
	};

	// void AddInterface(Interface)
	Class.prototype.AddInterface = function(i) {
		var self = this;
		if (!self._interfaces.includes(i))
			self._interfaces.push(i);
	};

	// bool getIsNative()
	Class.prototype.getIsNative = function() {
		var self = this;
		return self._isNative;
	};

	// bool setIsNative(bool)
	Class.prototype.setIsNative = function(value) {
		var self = this;
		self._isNative = value;
	};

	// virtual bool CastsTo(LitMapExpressionNode,Scope)
	Class.prototype.CastsTo = function(mapNode, scope) {
		var self = this;
		if (!self.IsInline() && !self.IsClass() && !self.IsDefined)
			return false;
		for (var member of self.getMembers())
		{
			if (!member.IsField())
				continue;
			if (!member._type)
				return false;
			if (!((mapNode._items)[member._name] !== undefined))
				return false;
			var mapItem = mapNode._items[member._name];
			if (member.IsMethod())
			{
				if (mapItem._exprType != eco.ExpressionType.Function)
					return false;
				var valueFuncType = mapItem.GetTypeOf(scope, null);
				if (!valueFuncType)
					return false;
				if (!valueFuncType._return || valueFuncType._return.DistanceTo(member._type) < 0)
					return false;
				var methodMember = member;
				if (valueFuncType._paramTypes.length != methodMember._parameters.length)
					return false;
				for (var p = 0; p < valueFuncType._paramTypes.length; p++)
				{
					if (!valueFuncType._paramTypes[p] || !methodMember._parameters[p].Type)
						return false;
					if (valueFuncType._paramTypes[p].DistanceTo(methodMember._parameters[p].Type) < 0)
						return false;
				}

			}
			else
			{
				var valueType = mapItem.GetTypeOf(scope, null);
				if (!valueType)
					return false;
				if (member._type.IsClass() || member._type.IsInline() || member._type.IsDefined)
				{
					if (mapItem._exprType != eco.ExpressionType.Map)
						return false;
					if (!member._type.CastsTo(mapItem, scope))
						return false;
				}
				else if (valueType.DistanceTo(member._type) < 0)
					return false;
			}

		}

		return true;
	};

	// virtual int DistanceTo(Interface)
	Class.prototype.DistanceTo = function(type) {
		var self = this;
		if (!type)
			return -1;
		if (type == eco.Interface.getNullType() || type == eco.Interface.getObjectType())
			return 1;
		if (type.IsInline())
		{
			var inlineType = type;
			for (var inlineMember of inlineType._members)
			{
				var inlineSig = inlineMember.Signature();
				var found = self.GetMember(inlineSig);
				if (found)
				{
					if (!found._type || found._type.DistanceTo(inlineMember._type) < 0)
						return -1;
				}
				else
					return -1;

			}

			return 1;
		}
		var dist = 0;
		var cur = self;
		while (cur)
		{
			if (cur == type)
				return dist;
			else
			{
				for (var intr of cur._interfaces)
				{
					var tmp = intr.DistanceTo(type);
					if (tmp >= 0)
						return tmp + 1;
				}

			}

			dist++;
			cur = cur._baseClass;
		}

		for (var intr1 of self._interfaces)
		{
			dist = intr1.DistanceTo(type);
			if (dist >= 0)
				return dist + 1;
		}

		if (type.getFullName() == self.getFullName())
			return 0;
		return -1;
	};

	// virtual Interface GetCommon(Interface)
	Class.prototype.GetCommon = function(type) {
		var self = this;
		var common = _base.prototype.GetCommon.call(self, type);
		if (common)
			return common;
		var baseClass = self._baseClass;
		while (baseClass)
		{
			if (type.DistanceTo(baseClass) >= 0)
				return baseClass;
			baseClass = baseClass._baseClass;
		}

		return null;
	};

	// virtual Method GetMethod(CallExpressionNode,Scope,function<Method[]>:object)
	Class.prototype.GetMethod = function(call, scope, onCompete) {
		var self = this;
		var found = _base.prototype.GetMethod.call(self, call, scope, onCompete);
		if (found)
			return found;
		if (self._baseClass)
			return self._baseClass.GetMethod(call, scope, onCompete);
		return null;
	};

	// virtual bool IsComplex()
	Class.prototype.IsComplex = function() {
		var self = this;
		return true;
	};

	// virtual bool IsClass()
	Class.prototype.IsClass = function() {
		var self = this;
		return true;
	};

	// bool IsComponent()
	Class.prototype.IsComponent = function() {
		var self = this;
		return self.IsServerComponent() || self.IsClientComponent();
	};

	// virtual bool IsServerComponent()
	Class.prototype.IsServerComponent = function() {
		var self = this;
		return false;
	};

	// virtual bool IsClientComponent()
	Class.prototype.IsClientComponent = function() {
		var self = this;
		return false;
	};

	// virtual bool IsInitialiser()
	Class.prototype.IsInitialiser = function() {
		var self = this;
		return false;
	};

	// virtual bool IsService()
	Class.prototype.IsService = function() {
		var self = this;
		return false;
	};

	// bool getHasSerialisationMethods()
	Class.prototype.getHasSerialisationMethods = function() {
		var self = this;
		return self._hasSerialisationMethods;
	};

	// bool setHasSerialisationMethods(bool)
	Class.prototype.setHasSerialisationMethods = function(value) {
		var self = this;
		self._hasSerialisationMethods = value;
	};

	// Constructor BasicConstructor()
	Class.prototype.BasicConstructor = function() {
		var self = this;
		for (var member of self._members)
		{
			if (member.IsConstructor())
			{
				var constr = member;
				if (constr._parameters.length == 0)
					return constr;
			}
		}

		return null;
	};

	// virtual Member[] GetAllMembers()
	Class.prototype.GetAllMembers = function() {
		var self = this;
		var members = [];
		if (self._baseClass)
			members = self._baseClass.GetAllMembers();
		for (var member of self._members)
			members.push(member);

		return members;
	};

	// Member[] GetMembersAccessibleFrom(Method)
	Class.prototype.GetMembersAccessibleFrom = function(method) {
		var self = this;
		var members = [];
		if (self._baseClass)
			members = self._baseClass.GetMembersAccessibleFrom(method);
		for (var member of self._members)
			if (member.AccessibleFrom(method))
				members.push(member);

		return members;
	};

	// virtual bool AddMember(Member)
	Class.prototype.AddMember = function(member) {
		var self = this;
		var found = self.GetMember(member.Signature());
		self._members.push(member);
		member.setOwner(self);
		if (member.IsMethod())
			(member).setOverload(self.GetOverload(member._name) - 1);
		if (found)
		{
			if (found._owner == self)
				return false;
			if (found.IsMethod())
			{
				var method = found;
				if (!method.IsConstructor())
				{
					if (method._virtual)
					{
						(member).setVirtual(true);
						(member).setOverride(method);
						(member).setOverload(0);
					}
					else
						(member).setOverload(method._overload + 1);

				}
			}
		}
		return true;
	};

	// virtual Member GetMember(string)
	Class.prototype.GetMember = function(signature) {
		var self = this;
		var found = _base.prototype.GetMember.call(self, signature);
		if (found)
			return found;
		if (self._baseClass)
			return self._baseClass.GetMember(signature);
		return null;
	};

	// Member GetMemberFromTop(string)
	Class.prototype.GetMemberFromTop = function(signature) {
		var self = this;
		if (self._baseClass)
		{
			var found = self._baseClass.GetMemberFromTop(signature);
			if (found)
				return found;
		}
		var found1 = _base.prototype.GetMember.call(self, signature);
		if (found1)
			return found1;
		return null;
	};

	// virtual Member GetMemberByName(string)
	Class.prototype.GetMemberByName = function(name) {
		var self = this;
		var found = _base.prototype.GetMemberByName.call(self, name);
		if (found)
			return found;
		if (self._baseClass)
			return self._baseClass.GetMemberByName(name);
		return null;
	};

	// virtual Member[] GetMembersByName(string)
	Class.prototype.GetMembersByName = function(name) {
		var self = this;
		var members = _base.prototype.GetMembersByName.call(self, name);
		if (self._baseClass)
		{
			var baseMembers = self._baseClass.GetMembersByName(name);
			for (var baseMember of baseMembers)
				members.unshift(baseMember);

		}
		return members;
	};

	// virtual int GetOverload(string)
	Class.prototype.GetOverload = function(name) {
		var self = this;
		var overload = _base.prototype.GetOverload.call(self, name);
		if (self._baseClass)
			overload = overload + self._baseClass.GetOverload(name);
		return overload;
	};

	/**

	 */
	Class.prototype.SerialiseType = function() {
		var self = this;
		return {"type": "class", "name": self.getFullName()};
	};

	/**

	 */
	Class.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "class", "isNative": self._isNative};
		if (self._baseClass)
			output["baseClass"] = self._baseClass.getFullName();
		if (self._interfaces.length > 0)
		{
			var interfaceJson = [];
			for (var intr of self._interfaces)
				interfaceJson.push(intr.getFullName());

			output["interfaces"] = interfaceJson;
		}
		var members = [];
		for (var member of self._members)
			members.push(member.Serialise());

		output["members"] = members;
		return output;
	};

	/**

	 */
	Class.ImportSkeleton2 = function(name, symbol, parent) {
		var cls = eco.Class._New7(new eco.Class(), name);
		cls.setNamespace(parent);
		cls._imported = true;
		return cls;
	};

	/**

	 */
	Class.ImportFull2 = function(cls, symbol) {
		if ((((symbol))["isNative"] !== undefined) && symbol["isNative"])
			cls.setIsNative(true);
		if ((((symbol))["baseClass"] !== undefined))
		{
			var baseName = symbol["baseClass"];
			cls.setBaseClass(cls.GetRootNamespace().GetInterfaceFromTypeNode(eco.TypeNode.Generate(baseName)));
		}
		if ((((symbol))["interfaces"] !== undefined))
		{
			var interfaceNames = symbol["interfaces"];
			for (var interfaceName of interfaceNames)
			{
				var parts = interfaceName.split(".");
				var firstPart = parts[0];
				parts.splice(0, 1);
				var typeNode = eco.TypeNode._New2(new eco.TypeNode(), firstPart);
				while (parts.length > 0)
				{
					firstPart = parts[0];
					parts.splice(0, 1);
					var newNode = eco.TypeNode._New2(new eco.TypeNode(), firstPart);
					newNode.setParent(typeNode);
					typeNode = newNode;
				}

				cls.AddInterface(cls.GetInterfaceFromTypeNode(typeNode));
			}

		}
		var members = symbol["members"];
		for (var member of members)
		{
			var memberType = member["memberType"];
			if (memberType == "field")
				cls.AddMember(eco.Field.ImportField(member, cls));
			else if (memberType == "method")
				cls.AddMember(eco.Method.ImportMethod(member, cls));
			else if (memberType == "constructor")
				cls.AddMember(eco.Constructor.ImportConstructor(member, cls));
			else if (memberType == "property")
				cls.AddMember(eco.Property.ImportProperty(member, cls));
		}

	};

	return Class;
}(eco.Interface));

/**

 */
eco.FunctionType = (function(_base) {
	__extends(FunctionType, _base);

	function FunctionType() {
	}

	// Constructor _New()
	FunctionType._New6 = function(self) {
		self = _base._New5(self, "function<>") || self;
		self._return = null;
		self._paramTypes = null;
		self._paramNames = null;
		self._return = eco.Interface.getObjectType();
		self._paramTypes = [];
		self._paramNames = [];
		return self;
	};

	// Interface getReturnType()
	FunctionType.prototype.getReturnType = function() {
		var self = this;
		return self._return;
	};

	// Interface setReturnType(Interface)
	FunctionType.prototype.setReturnType = function(value) {
		var self = this;
		self._return = value;
		self._name = "function<";
		var count = 0;
		for (var ptype of self._paramTypes)
		{
			if (count > 0)
				self._name = self._name + ",";
			if (ptype)
				self._name = self._name + ptype._name;
			else
				self._name = self._name + "(unknown)";

			count++;
		}

		self._name = self._name + ">";
		if (self._return)
		{
			if (self._return != eco.Interface.getVoidType())
				self._name = self._name + ":" + self._return._name;
		}
		else
			self._name = self._name + ":<unknown>";

	};

	// Interface[] getParamTypes()
	FunctionType.prototype.getParamTypes = function() {
		var self = this;
		return self._paramTypes;
	};

	// string[] getParamNames()
	FunctionType.prototype.getParamNames = function() {
		var self = this;
		return self._paramNames;
	};

	// void AddParamType(Interface)
	FunctionType.prototype.AddParamType = function(type) {
		var self = this;
		if (type._name == "Faba")
			console.trace();
		self._paramTypes.push(type);
		self._paramNames.push("p" + self._paramTypes.length);
		self._name = "function<";
		var count = 0;
		for (var ptype of self._paramTypes)
		{
			if (count > 0)
				self._name = self._name + ",";
			if (ptype)
				self._name = self._name + ptype._name;
			else
				self._name = self._name + "(unknown)";

			count++;
		}

		self._name = self._name + ">";
		if (self._return)
		{
			if (self._return != eco.Interface.getVoidType())
				self._name = self._name + ":" + self._return._name;
		}
		else
			self._name = self._name + ":<unknown>";

	};

	// void AddParam(Interface,string)
	FunctionType.prototype.AddParam = function(type, name) {
		var self = this;
		self._paramTypes.push(type);
		self._paramNames.push(name);
		self._name = "function<";
		var count = 0;
		for (var ptype of self._paramTypes)
		{
			if (count > 0)
				self._name = self._name + ",";
			if (ptype)
				self._name = self._name + ptype._name;
			else
				self._name = self._name + "(unknown)";

			count++;
		}

		self._name = self._name + ">";
		if (self._return)
		{
			if (self._return != eco.Interface.getVoidType())
				self._name = self._name + ":" + self._return._name;
		}
		else
			self._name = self._name + ":<unknown>";

	};

	// virtual int DistanceTo(Interface)
	FunctionType.prototype.DistanceTo = function(type) {
		var self = this;
		if (!type)
			return -1;
		if (type == eco.Interface.getObjectType())
			return 1;
		if (!type.IsFunction())
			return -1;
		var funcType = type;
		if (!funcType._return)
			return -1;
		if (funcType._return != eco.Interface.getObjectType() && funcType._return.DistanceTo(self.getReturnType()) < 0)
			return -1;
		var params = funcType._paramTypes;
		var args = self._paramTypes;
		if (params.length != args.length)
			return -1;
		var diff = 0;
		for (var p = 0; p < params.length; p++)
		{
			if (!args[p])
				return -1;
			var dist = args[p].DistanceTo(params[p]);
			if (dist < 0)
				return -1;
			diff = diff + dist;
		}

		return diff;
	};

	// bool CastsTo(FunctionTypeNode,Scope)
	FunctionType.prototype.CastsTo1 = function(func, scope) {
		var self = this;
		if (self._paramTypes.length != func._paramTypes.length)
			return false;
		var returnType = eco.Interface.getObjectType();
		if (func._retType)
			returnType = scope._method._owner.GetType(func._retType, null);
		if (!returnType)
			return false;
		if (self._return && returnType.DistanceTo(self._return) < 0)
			return false;
		for (var p = 0; p < func._paramTypes.length; p++)
		{
			var paramType = self._paramTypes[p];
			var argType = scope._method._owner.GetType(func._paramTypes[p], null);
			if (argType.DistanceTo(paramType) < 0)
				return false;
		}

		return true;
	};

	// bool CastsTo(FunctionExpressionNode,Scope)
	FunctionType.prototype.CastsTo2 = function(func, scope) {
		var self = this;
		if (self._paramTypes.length != func._params.length)
			return false;
		var returnType = eco.Interface.getObjectType();
		if (func._return)
			returnType = scope._method._owner.GetType(func._return, null);
		if (!returnType)
			return false;
		if (returnType.DistanceTo(self._return) < 0)
			return false;
		for (var p = 0; p < func._params.length; p++)
		{
			var paramType = self._paramTypes[p];
			var argType = scope._method._owner.GetType(func._params[p].type, null);
			if (argType.DistanceTo(paramType) < 0)
				return false;
		}

		return true;
	};

	// virtual string CompiledName()
	FunctionType.prototype.CompiledName = function() {
		var self = this;
		var signature = "function_";
		var count = 0;
		for (var param of self._paramTypes)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param)
				signature = signature + param.CompiledName();
			else
				signature = signature + "(unknown)";

			count++;
		}

		return signature + ((self._return && self._return != eco.Interface.getVoidType()) ? ("__" + self._return.CompiledName()) : "");
	};

	// virtual string DetailName()
	FunctionType.prototype.DetailName = function() {
		var self = this;
		var signature = "function<";
		var count = 0;
		for (var param of self._paramTypes)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param)
				signature = signature + param.DetailName();
			else
				signature = signature + "(unknown)";

			count++;
		}

		return signature + ">" + ((self._return && self._return != eco.Interface.getVoidType()) ? (":" + self._return.DetailName()) : "");
	};

	// virtual string Signature()
	FunctionType.prototype.Signature = function() {
		var self = this;
		var signature = "function<";
		var count = 0;
		for (var param of self._paramTypes)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param)
				signature = signature + param.Signature();
			else
				signature = signature + "(unknown)";

			count++;
		}

		return signature + ">" + ((self._return && self._return != eco.Interface.getVoidType()) ? (":" + self._return.DetailName()) : "");
	};

	// string GetInsertSnippet(object)
	FunctionType.prototype.GetInsertSnippet = function(counter) {
		var self = this;
		var snippet = "function(";
		counter.count = counter.count + 1;
		var count = 0;
		var startCount = counter.count;
		for (var p = 0; p < self._paramTypes.length; p++)
		{
			var param = self._paramTypes[p];
			if (counter.count > startCount)
				snippet = snippet + ", ";
			if (param)
				snippet = snippet + param.Signature() + ' ${' + counter.count + ":" + self._paramNames[p] + "}";
			else
				snippet = snippet + "unknown " + ' ${' + counter.count + ":" + self._paramNames[p] + "}";

			counter.count = counter.count + 1;
			count++;
		}

		snippet = snippet + ")";
		if (self._return && self._return != eco.Interface.getVoidType() && self._return != eco.Interface.getObjectType())
			snippet = snippet + ":" + self._return.Signature();
		return snippet + " {$" + counter.count + "}";
	};

	// virtual object SerialiseType()
	FunctionType.prototype.SerialiseType = function() {
		var self = this;
		var paramTypes = [];
		for (var param of self._paramTypes)
			if (param)
				paramTypes.push(param.SerialiseType());
			else
				paramTypes.push(null);


		return {"type": "function", "return": self._return ? self._return.SerialiseType() : null, "params": paramTypes};
	};

	// virtual bool IsComplex()
	FunctionType.prototype.IsComplex = function() {
		var self = this;
		return true;
	};

	// virtual bool IsFunction()
	FunctionType.prototype.IsFunction = function() {
		var self = this;
		return true;
	};

	// static FunctionType Create(Interface[],Interface)
	FunctionType.Create = function(paramTypes, returnType) {
		if (!returnType)
			returnType = eco.Interface.getVoidType();
		var funcType = eco.FunctionType._New6(new eco.FunctionType());
		funcType.setReturnType(returnType);
		for (var param of paramTypes)
			funcType.AddParamType(param);

		return funcType;
	};

	return FunctionType;
}(eco.Interface));

/**

 */
eco.Enum = (function(_base) {
	__extends(Enum, _base);

	function Enum() {
	}

	// Constructor _New()
	Enum._New6 = function(self) {
		self = _base._New4(self) || self;
		self._kv = {};
		return self;
	};

	// Constructor _New(string)
	Enum._New7 = function(self, name) {
		self = _base._New5(self, name) || self;
		self._kv = {};
		self._symbolType = eco.SymbolType.Enum;
		return self;
	};

	// map<int> getKVPairs()
	Enum.prototype.getKVPairs = function() {
		var self = this;
		return self._kv;
	};

	/**

	 */
	Enum.prototype.Serialise = function() {
		var self = this;
		var kvs = {};
		for (var key of Object.keys(self._kv))
			kvs[key] = self._kv[key];

		return {"type": "enum", "kvpairs": kvs};
	};

	/**

	 */
	Enum.prototype.SerialiseType = function() {
		var self = this;
		return {"type": "enum", "name": self.getFullName()};
	};

	/**

	 */
	Enum.ImportEnum = function(name, symbol, parent) {
		var enm = eco.Enum._New7(new eco.Enum(), name);
		enm.setNamespace(parent);
		enm._imported = true;
		var kv = symbol["kvpairs"];
		for (var key of Object.keys(kv))
			enm._kv[key] = kv[key];

		return enm;
	};

	// virtual bool IsEnum()
	Enum.prototype.IsEnum = function() {
		var self = this;
		return true;
	};

	return Enum;
}(eco.Interface));

/**

 */
eco.TemplateRender = (function(_base) {
	__extends(TemplateRender, _base);

	function TemplateRender() {
	}

	// Constructor _New()
	TemplateRender._New6 = function(self) {
		self = _base._New4(self) || self;
		self._templ = null;
		return self;
	};

	// Constructor _New(string,Template)
	TemplateRender._New7 = function(self, name, templ) {
		self = _base._New5(self, eco.Interface.getObjectType(), name) || self;
		self._templ = null;
		self._memberType = eco.MemberType.TemplateRender;
		self._parameters = [];
		self._templ = templ;
		return self;
	};

	// Template getTempl()
	TemplateRender.prototype.getTempl = function() {
		var self = this;
		return self._templ;
	};

	// Template setTempl(Template)
	TemplateRender.prototype.setTempl = function(value) {
		var self = this;
		self._templ = value;
	};

	// virtual bool IsTemplateMethod()
	TemplateRender.prototype.IsTemplateMethod = function() {
		var self = this;
		return true;
	};

	return TemplateRender;
}(eco.Method));

/**

 */
eco.ServerRender = (function(_base) {
	__extends(ServerRender, _base);

	function ServerRender() {
	}

	// Constructor _New()
	ServerRender._New6 = function(self) {
		self = _base._New5(self, eco.Interface.getObjectType(), "Render") || self;
		self._memberType = eco.MemberType.ServerRender;
		self._parameters = [];
		return self;
	};

	// virtual object Serialise()
	ServerRender.prototype.Serialise = function() {
		var self = this;
		var params = [];
		for (var param of self._parameters)
			if (param)
				params.push(param.Serialise());
			else
				params.push(null);


		return {"memberType": "server-render", "type": null, "params": params, "overload": self._overload};
	};

	// static ServerRender ImportServerRender(object,Interface)
	ServerRender.ImportServerRender = function(symbol, from) {
		var method = eco.ServerRender._New6(new eco.ServerRender());
		var params = symbol["params"];
		for (var param of params)
			method.AddParameter(eco.Interface.ImportType(param["type"], from), param["name"], param["defaultValue"]);

		return method;
	};

	// virtual bool IsServerRender()
	ServerRender.prototype.IsServerRender = function() {
		var self = this;
		return true;
	};

	return ServerRender;
}(eco.Method));

/**

 */
eco.Constructor = (function(_base) {
	__extends(Constructor, _base);

	function Constructor() {
	}

	// Constructor _New()
	Constructor._New6 = function(self) {
		self = _base._New5(self, null, "_New") || self;
		self._baseCall = null;
		self._memberType = eco.MemberType.Constructor;
		self._parameters = [];
		return self;
	};

	// CallExpressionNode getBaseCall()
	Constructor.prototype.getBaseCall = function() {
		var self = this;
		return self._baseCall;
	};

	// CallExpressionNode setBaseCall(CallExpressionNode)
	Constructor.prototype.setBaseCall = function(value) {
		var self = this;
		self._baseCall = value;
	};

	// virtual string DetailName()
	Constructor.prototype.DetailName = function() {
		var self = this;
		var signature = "new(";
		var count = 0;
		for (var param of self._parameters)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param.Type)
				signature = signature + param.Type.DetailName();
			else
				signature = signature + "unknown";

			signature = signature + " " + param.Name;
			count++;
		}

		signature = signature + ")";
		return signature;
	};

	// string ConstructorDetailName()
	Constructor.prototype.ConstructorDetailName = function() {
		var self = this;
		var signature = self._owner._name + "(";
		var count = 0;
		for (var param of self._parameters)
		{
			if (count > 0)
				signature = signature + ", ";
			if (param.Type)
				signature = signature + param.Type.DetailName();
			else
				signature = signature + "unknown";

			signature = signature + " " + param.Name;
			count++;
		}

		signature = signature + ")";
		return signature;
	};

	// string GetInsertSnippet()
	Constructor.prototype.GetInsertSnippet1 = function() {
		var self = this;
		var snippet = self._owner._name + "(";
		var counter = {"count": 1};
		for (var param of self._parameters)
		{
			if (counter["count"] > 1)
				snippet = snippet + ", ";
			if (param.Type.IsFunction())
				snippet = snippet + (param.Type).GetInsertSnippet(counter);
			else
				snippet = snippet + '${' + ("" + counter["count"]) + ':' + param.Name + '}';

			counter["count"] = counter["count"] + 1;
		}

		return snippet + ")";
	};

	// virtual object Serialise()
	Constructor.prototype.Serialise = function() {
		var self = this;
		var params = [];
		for (var param of self._parameters)
			if (param)
				params.push(param.Serialise());
			else
				params.push(null);


		return {"memberType": "constructor", "params": params, "name": self._name, "access": self._access, "overload": self._overload};
	};

	// static Constructor ImportConstructor(object,Interface)
	Constructor.ImportConstructor = function(symbol, from) {
		var constr = eco.Constructor._New6(new eco.Constructor());
		constr.setAccess((symbol["access"]));
		var params = symbol["params"];
		for (var param of params)
			constr.AddParameter(eco.Interface.ImportType(param["type"], from), param["name"], null);

		return constr;
	};

	// virtual bool IsConstructor()
	Constructor.prototype.IsConstructor = function() {
		var self = this;
		return true;
	};

	return Constructor;
}(eco.Method));

/**

 */
eco.BaseCallExpressionNode = (function(_base) {
	__extends(BaseCallExpressionNode, _base);

	function BaseCallExpressionNode() {
	}

	// Constructor _New()
	BaseCallExpressionNode._New5 = function(self) {
		self = _base._New3(self) || self;
		return self;
	};

	// Constructor _New(string)
	BaseCallExpressionNode._New6 = function(self, name) {
		self = _base._New4(self, name) || self;
		self._exprType = eco.ExpressionType.BaseCall;
		return self;
	};

	return BaseCallExpressionNode;
}(eco.CallExpressionNode));

/**

 */
eco.PreOpExpressionNode = (function(_base) {
	__extends(PreOpExpressionNode, _base);

	function PreOpExpressionNode() {
	}

	// Constructor _New()
	PreOpExpressionNode._New5 = function(self) {
		self = _base._New3(self) || self;
		return self;
	};

	// Constructor _New(OpType,ExpressionNode)
	PreOpExpressionNode._New6 = function(self, op, expr) {
		self = _base._New4(self, op) || self;
		self._exprType = eco.ExpressionType.PreOp;
		self._expr1 = expr;
		return self;
	};

	// ExpressionNode getExpression()
	PreOpExpressionNode.prototype.getExpression = function() {
		var self = this;
		return self._expr1;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	PreOpExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return self._expr1.GetTypeOf(scope, parser);
	};

	return PreOpExpressionNode;
}(eco.OperatorExpressionNode));

/**

 */
eco.PostOpExpressionNode = (function(_base) {
	__extends(PostOpExpressionNode, _base);

	function PostOpExpressionNode() {
	}

	// Constructor _New()
	PostOpExpressionNode._New5 = function(self) {
		self = _base._New3(self) || self;
		return self;
	};

	// Constructor _New(OpType,ExpressionNode)
	PostOpExpressionNode._New6 = function(self, op, expr) {
		self = _base._New4(self, op) || self;
		self._exprType = eco.ExpressionType.PostOp;
		self._expr1 = expr;
		return self;
	};

	// ExpressionNode getExpression()
	PostOpExpressionNode.prototype.getExpression = function() {
		var self = this;
		return self._expr1;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	PostOpExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return self._expr1.GetTypeOf(scope, parser);
	};

	return PostOpExpressionNode;
}(eco.OperatorExpressionNode));

/**

 */
eco.CondOpExpressionNode = (function(_base) {
	__extends(CondOpExpressionNode, _base);

	function CondOpExpressionNode() {
	}

	// Constructor _New()
	CondOpExpressionNode._New5 = function(self) {
		self = _base._New4(self, eco.OpType.Cond) || self;
		self._expr3 = null;
		self._exprType = eco.ExpressionType.CondOp;
		return self;
	};

	// ExpressionNode getExpression3()
	CondOpExpressionNode.prototype.getExpression3 = function() {
		var self = this;
		return self._expr3;
	};

	// ExpressionNode setExpression3(ExpressionNode)
	CondOpExpressionNode.prototype.setExpression3 = function(value) {
		var self = this;
		self._expr3 = value;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	CondOpExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		var t1 = self._expr2.GetTypeOf(scope, parser);
		var t2 = self._expr3.GetTypeOf(scope, parser);
		return t1.GetCommon(t2);
	};

	return CondOpExpressionNode;
}(eco.OperatorExpressionNode));

/**

 */
eco.HTMLTextExpressionNode = (function(_base) {
	__extends(HTMLTextExpressionNode, _base);

	function HTMLTextExpressionNode() {
	}

	// Constructor _New()
	HTMLTextExpressionNode._New6 = function(self) {
		self = _base._New3(self) || self;
		self._text = null;
		return self;
	};

	// Constructor _New(ExpressionNode)
	HTMLTextExpressionNode._New7 = function(self, text) {
		self = _base._New3(self) || self;
		self._text = null;
		self._exprType = eco.ExpressionType.HTMLText;
		self._text = text;
		return self;
	};

	// ExpressionNode getText()
	HTMLTextExpressionNode.prototype.getText = function() {
		var self = this;
		return self._text;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	HTMLTextExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return self._text.GetTypeOf(scope, parser);
	};

	return HTMLTextExpressionNode;
}(eco.HTMLExpressionNode));

/**

 */
eco.HTMLCodeExpressionNode = (function(_base) {
	__extends(HTMLCodeExpressionNode, _base);

	function HTMLCodeExpressionNode() {
	}

	// Constructor _New()
	HTMLCodeExpressionNode._New6 = function(self) {
		self = _base._New3(self) || self;
		self._code = null;
		return self;
	};

	// Constructor _New(ExpressionNode)
	HTMLCodeExpressionNode._New7 = function(self, code) {
		self = _base._New3(self) || self;
		self._code = null;
		self._exprType = eco.ExpressionType.HTMLCode;
		self._code = code;
		return self;
	};

	// ExpressionNode getCode()
	HTMLCodeExpressionNode.prototype.getCode = function() {
		var self = this;
		return self._code;
	};

	// virtual Interface GetTypeOf(Scope,Parser)
	HTMLCodeExpressionNode.prototype.GetTypeOf = function(scope, parser) {
		var self = this;
		return self._code.GetTypeOf(scope, parser);
	};

	return HTMLCodeExpressionNode;
}(eco.HTMLExpressionNode));

/**

 */
eco.Template = (function(_base) {
	__extends(Template, _base);

	function Template() {
	}

	// Constructor _New()
	Template._New8 = function(self) {
		self = _base._New6(self) || self;
		self._parameters = null;
		return self;
	};

	// Constructor _New(string)
	Template._New9 = function(self, name) {
		self = _base._New7(self, name) || self;
		self._parameters = null;
		self._symbolType = eco.SymbolType.Template;
		self._parameters = [];
		return self;
	};

	// MethodParameter[] getParameters()
	Template.prototype.getParameters = function() {
		var self = this;
		return self._parameters;
	};

	// void AddParameter(Interface,string,object)
	Template.prototype.AddParameter = function(type, name, defaultValue) {
		var self = this;
		self._parameters.push(eco.MethodParameter._New1(new eco.MethodParameter(), type, name, defaultValue));
	};

	// virtual object Serialise()
	Template.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "template"};
		output["method"] = self._members[0].Serialise();
		var attrs = [];
		for (var attr of self._parameters)
			attrs.push(attr.Serialise());

		output["attrs"] = attrs;
		return output;
	};

	/**

	 */
	Template.ImportSkeleton3 = function(name, symbol, parent) {
		var templ = eco.Template._New9(new eco.Template(), name);
		templ.setNamespace(parent);
		templ._imported = true;
		return templ;
	};

	/**

	 */
	Template.ImportFull3 = function(templ, symbol) {
		var attrs = symbol["attrs"];
		for (var attr of attrs)
			templ.AddParameter(eco.Interface.ImportType(attr["type"], templ), attr["name"], attr["defaultValue"]);

		templ.AddMember(eco.Method.ImportMethod(symbol["method"], templ));
	};

	return Template;
}(eco.Class));

/**

 */
eco.ArrayType = (function(_base) {
	__extends(ArrayType, _base);

	function ArrayType() {
	}

	// Constructor _New()
	ArrayType._New8 = function(self) {
		self = _base._New6(self) || self;
		self._elem = null;
		return self;
	};

	// Constructor _New(Interface)
	ArrayType._New9 = function(self, elem) {
		self = _base._New7(self, elem._name + "[]") || self;
		self._elem = null;
		self._elem = elem;
		self._isNative = true;
		return self;
	};

	// Interface getElem()
	ArrayType.prototype.getElem = function() {
		var self = this;
		return self._elem;
	};

	// virtual int DistanceTo(Interface)
	ArrayType.prototype.DistanceTo = function(type) {
		var self = this;
		if (type == eco.Interface.getObjectType())
			return 1;
		if (type.IsArray())
			return self._elem.DistanceTo((type)._elem);
		return -1;
	};

	// bool CastsTo(LitArrayExpressionNode,Scope)
	ArrayType.prototype.CastsTo2 = function(node, scope) {
		var self = this;
		var elem = self._elem;
		for (var item of node._items)
		{
			var itemType = item.GetTypeOf(scope, null);
			if (!itemType || itemType.DistanceTo(elem) < 0)
				return false;
		}

		return true;
	};

	// virtual string CompiledName()
	ArrayType.prototype.CompiledName = function() {
		var self = this;
		return "array";
	};

	// virtual string DetailName()
	ArrayType.prototype.DetailName = function() {
		var self = this;
		return self._elem.DetailName() + "[]";
	};

	// virtual object SerialiseType()
	ArrayType.prototype.SerialiseType = function() {
		var self = this;
		return {"type": "array", "elem": self._elem ? self._elem.SerialiseType() : null};
	};

	// virtual bool IsComplex()
	ArrayType.prototype.IsComplex = function() {
		var self = this;
		return true;
	};

	// virtual bool IsArray()
	ArrayType.prototype.IsArray = function() {
		var self = this;
		return true;
	};

	return ArrayType;
}(eco.Class));

/**

 */
eco.MapType = (function(_base) {
	__extends(MapType, _base);

	function MapType() {
	}

	// Constructor _New()
	MapType._New8 = function(self) {
		self = _base._New6(self) || self;
		self._elem = null;
		return self;
	};

	// Constructor _New(Interface)
	MapType._New9 = function(self, elem) {
		self = _base._New7(self, "map<" + elem._name + ">") || self;
		self._elem = null;
		self._elem = elem;
		self._isNative = true;
		return self;
	};

	// Interface getElem()
	MapType.prototype.getElem = function() {
		var self = this;
		return self._elem;
	};

	// virtual int DistanceTo(Interface)
	MapType.prototype.DistanceTo = function(type) {
		var self = this;
		if (type == eco.Interface.getObjectType())
			return 1;
		if (type.IsMap())
			return self._elem.DistanceTo((type)._elem);
		return -1;
	};

	// virtual bool CastsTo(LitMapExpressionNode,Scope)
	MapType.prototype.CastsTo = function(node, scope) {
		var self = this;
		var elem = self._elem;
		for (var key of Object.keys(node._items))
		{
			var val = node._items[key];
			var itemType = val.GetTypeOf(scope, null);
			if (!itemType || itemType.DistanceTo(elem) < 0)
				return false;
		}

		return true;
	};

	// virtual string CompiledName()
	MapType.prototype.CompiledName = function() {
		var self = this;
		return "map";
	};

	// virtual string DetailName()
	MapType.prototype.DetailName = function() {
		var self = this;
		return "map<" + self._elem.DetailName() + ">";
	};

	// virtual object SerialiseType()
	MapType.prototype.SerialiseType = function() {
		var self = this;
		return {"type": "map", "elem": self._elem ? self._elem.SerialiseType() : null};
	};

	// virtual bool IsComplex()
	MapType.prototype.IsComplex = function() {
		var self = this;
		return true;
	};

	// virtual bool IsMap()
	MapType.prototype.IsMap = function() {
		var self = this;
		return true;
	};

	return MapType;
}(eco.Class));

/**

 */
eco.EventType = (function(_base) {
	__extends(EventType, _base);

	function EventType() {
	}

	// Constructor _New()
	EventType._New8 = function(self) {
		self = _base._New7(self, "event") || self;
		self._paramTypes = null;
		self._paramTypes = [];
		self._isNative = true;
		return self;
	};

	// virtual string CompiledName()
	EventType.prototype.CompiledName = function() {
		var self = this;
		return "event";
	};

	// virtual string DetailName()
	EventType.prototype.DetailName = function() {
		var self = this;
		var signature = "event<";
		var count = 0;
		for (var paramType of self._paramTypes)
		{
			if (count > 0)
				signature = signature + ",";
			signature = signature + paramType.DetailName();
			count++;
		}

		return signature + ">";
	};

	// virtual string Signature()
	EventType.prototype.Signature = function() {
		var self = this;
		var signature = "event<";
		var count = 0;
		for (var paramType of self._paramTypes)
		{
			if (count > 0)
				signature = signature + ",";
			signature = signature + paramType.Signature();
			count++;
		}

		return signature + ">";
	};

	// Interface[] getParamTypes()
	EventType.prototype.getParamTypes = function() {
		var self = this;
		return self._paramTypes;
	};

	// void AddParamType(Interface)
	EventType.prototype.AddParamType = function(type) {
		var self = this;
		self._paramTypes.push(type);
	};

	// virtual int DistanceTo(Interface)
	EventType.prototype.DistanceTo = function(type) {
		var self = this;
		if (type == eco.Interface.getObjectType())
			return 1;
		if (!type.IsEvent())
			return -1;
		var eventType = type;
		var params = eventType._paramTypes;
		var args = self._paramTypes;
		if (params.length != args.length)
			return -1;
		var diff = 0;
		for (var p = 0; p < params.length; p++)
		{
			var dist = args[p].DistanceTo(params[p]);
			if (dist < 0)
				return -1;
			diff = diff + dist;
		}

		return diff;
	};

	// virtual object SerialiseType()
	EventType.prototype.SerialiseType = function() {
		var self = this;
		var paramTypes = [];
		for (var param of self._paramTypes)
			if (param)
				paramTypes.push(param.SerialiseType());
			else
				paramTypes.push(null);


		return {"type": "event", "params": paramTypes};
	};

	// virtual bool IsComplex()
	EventType.prototype.IsComplex = function() {
		var self = this;
		return true;
	};

	// virtual bool IsEvent()
	EventType.prototype.IsEvent = function() {
		var self = this;
		return true;
	};

	return EventType;
}(eco.Class));

/**

 */
eco.ServerComponent = (function(_base) {
	__extends(ServerComponent, _base);

	function ServerComponent() {
	}

	// Constructor _New()
	ServerComponent._New8 = function(self) {
		self = _base._New6(self) || self;
		self._renderMethod = null;
		return self;
	};

	// Constructor _New(string)
	ServerComponent._New9 = function(self, name) {
		self = _base._New7(self, name) || self;
		self._renderMethod = null;
		self._symbolType = eco.SymbolType.ServerComponent;
		return self;
	};

	// ServerRender getRenderMethod()
	ServerComponent.prototype.getRenderMethod = function() {
		var self = this;
		return self._renderMethod;
	};

	// ServerRender setRenderMethod(ServerRender)
	ServerComponent.prototype.setRenderMethod = function(value) {
		var self = this;
		self._renderMethod = value;
	};

	// virtual object Serialise()
	ServerComponent.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "server-comp"};
		var usings = [];
		for (var used of self._usings)
			usings.push(used.getFullName());

		output["usings"] = usings;
		if (self._baseClass)
			output["baseClass"] = self._baseClass.getFullName();
		if (self._interfaces.length > 0)
		{
			var interfaceJson = [];
			for (var intr of self._interfaces)
				interfaceJson.push(intr.getFullName());

			output["interfaces"] = interfaceJson;
		}
		var members = [];
		for (var member of self._members)
			members.push(member.Serialise());

		output["members"] = members;
		return output;
	};

	/**

	 */
	ServerComponent.ImportSkeleton3 = function(name, symbol, parent) {
		var comp = eco.ServerComponent._New9(new eco.ServerComponent(), name);
		comp.setNamespace(parent);
		comp._imported = true;
		return comp;
	};

	/**

	 */
	ServerComponent.ImportFull3 = function(comp, symbol) {
		var usings = symbol["usings"];
		for (var used of usings)
			comp.UseNamespace(comp.GetNamespaceFromTypeNode(eco.TypeNode.Generate(used)));

		if ((((symbol))["baseClass"] !== undefined))
		{
			var baseName = symbol["baseClass"];
			comp.setBaseClass(comp.GetInterfaceFromTypeNode(eco.TypeNode.Generate(baseName)));
		}
		if ((((symbol))["interfaces"] !== undefined))
		{
			var interfaces = symbol["interfaces"];
			for (var intr of interfaces)
				comp.AddInterface(comp.GetInterfaceFromTypeNode(eco.TypeNode.Generate(intr)));

		}
		var members = symbol["members"];
		for (var member of members)
		{
			var memberType = member["memberType"];
			if (memberType == "field")
				comp.AddMember(eco.Field.ImportField(member, comp));
			else if (memberType == "method")
				comp.AddMember(eco.Method.ImportMethod(member, comp));
			else if (memberType == "server-render")
			{
				var serverRender = eco.ServerRender.ImportServerRender(member, comp);
				comp.AddMember(serverRender);
				comp.setRenderMethod(serverRender);
			}
			else if (memberType == "constructor")
				comp.AddMember(eco.Constructor.ImportConstructor(member, comp));
			else if (memberType == "property")
				comp.AddMember(eco.Property.ImportProperty(member, comp));
		}

	};

	// virtual bool IsServerComponent()
	ServerComponent.prototype.IsServerComponent = function() {
		var self = this;
		return true;
	};

	return ServerComponent;
}(eco.Class));

/**

 */
eco.Initialiser = (function(_base) {
	__extends(Initialiser, _base);

	function Initialiser() {
	}

	// Constructor _New()
	Initialiser._New8 = function(self) {
		self = _base._New6(self) || self;
		return self;
	};

	// Constructor _New(string)
	Initialiser._New9 = function(self, name) {
		self = _base._New7(self, name) || self;
		self._symbolType = eco.SymbolType.Initialiser;
		return self;
	};

	// virtual object Serialise()
	Initialiser.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "init"};
		var usings = [];
		for (var used of self._usings)
			usings.push(used.getFullName());

		output["usings"] = usings;
		if (self._baseClass)
			output["baseClass"] = self._baseClass.getFullName();
		if (self._interfaces.length > 0)
		{
			var interfaceJson = [];
			for (var intr of self._interfaces)
				interfaceJson.push(intr.getFullName());

			output["interfaces"] = interfaceJson;
		}
		var members = [];
		for (var member of self._members)
			members.push(member.Serialise());

		output["members"] = members;
		return output;
	};

	// static Initialiser ImportSkeleton(string,object,Namespace)
	Initialiser.ImportSkeleton3 = function(name, symbol, parent) {
		var init = eco.Initialiser._New9(new eco.Initialiser(), name);
		init.setNamespace(parent);
		init._imported = true;
		return init;
	};

	// static void ImportFull(Initialiser,object)
	Initialiser.ImportFull3 = function(init, symbol) {
		var usings = symbol["usings"];
		for (var used of usings)
			init.UseNamespace(init.GetNamespaceFromTypeNode(eco.TypeNode.Generate(used)));

		if ((((symbol))["baseClass"] !== undefined))
		{
			var baseName = symbol["baseClass"];
			init.setBaseClass(init.GetInterfaceFromTypeNode(eco.TypeNode.Generate(baseName)));
		}
		if ((((symbol))["interfaces"] !== undefined))
		{
			var interfaces = symbol["interfaces"];
			for (var intr of interfaces)
				init.AddInterface(init.GetInterfaceFromTypeNode(eco.TypeNode.Generate(intr)));

		}
		var members = symbol["members"];
		for (var member of members)
		{
			var memberType = member["memberType"];
			if (memberType == "field")
				init.AddMember(eco.Field.ImportField(member, init));
			else if (memberType == "method")
				init.AddMember(eco.Method.ImportMethod(member, init));
			else if (memberType == "constructor")
				init.AddMember(eco.Constructor.ImportConstructor(member, init));
			else if (memberType == "property")
				init.AddMember(eco.Property.ImportProperty(member, init));
		}

	};

	// virtual bool IsInitialiser()
	Initialiser.prototype.IsInitialiser = function() {
		var self = this;
		return true;
	};

	return Initialiser;
}(eco.Class));

/**

 */
eco.Service = (function(_base) {
	__extends(Service, _base);

	function Service() {
	}

	// Constructor _New()
	Service._New8 = function(self) {
		self = _base._New6(self) || self;
		return self;
	};

	// Constructor _New(string)
	Service._New9 = function(self, name) {
		self = _base._New7(self, name) || self;
		self._symbolType = eco.SymbolType.Service;
		return self;
	};

	// virtual object Serialise()
	Service.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "service"};
		var usings = [];
		for (var used of self._usings)
			usings.push(used.getFullName());

		output["usings"] = usings;
		if (self._baseClass)
			output["baseClass"] = self._baseClass.getFullName();
		if (self._interfaces.length > 0)
		{
			var interfaceJson = [];
			for (var intr of self._interfaces)
				interfaceJson.push(intr.getFullName());

			output["interfaces"] = interfaceJson;
		}
		var members = [];
		for (var member of self._members)
			members.push(member.Serialise());

		output["members"] = members;
		return output;
	};

	// static Service ImportSkeleton(string,object,Namespace)
	Service.ImportSkeleton3 = function(name, symbol, parent) {
		var serv = eco.Service._New9(new eco.Service(), name);
		serv.setNamespace(parent);
		serv._imported = true;
		return serv;
	};

	// static void ImportFull(Service,object)
	Service.ImportFull3 = function(serv, symbol) {
		var usings = symbol["usings"];
		for (var used of usings)
			serv.UseNamespace(serv.GetNamespaceFromTypeNode(eco.TypeNode.Generate(used)));

		if ((((symbol))["baseClass"] !== undefined))
		{
			var baseName = symbol["baseClass"];
			serv.setBaseClass(serv.GetInterfaceFromTypeNode(eco.TypeNode.Generate(baseName)));
		}
		if ((((symbol))["interfaces"] !== undefined))
		{
			var interfaces = symbol["interfaces"];
			for (var intr of interfaces)
				serv.AddInterface(serv.GetInterfaceFromTypeNode(eco.TypeNode.Generate(intr)));

		}
		var members = symbol["members"];
		for (var member of members)
		{
			var memberType = member["memberType"];
			if (memberType == "field")
				serv.AddMember(eco.Field.ImportField(member, serv));
			else if (memberType == "method")
				serv.AddMember(eco.Method.ImportMethod(member, serv));
			else if (memberType == "constructor")
				serv.AddMember(eco.Constructor.ImportConstructor(member, serv));
			else if (memberType == "property")
				serv.AddMember(eco.Property.ImportProperty(member, serv));
		}

	};

	// virtual bool IsService()
	Service.prototype.IsService = function() {
		var self = this;
		return true;
	};

	return Service;
}(eco.Class));

/**

 */
eco.ClientComponent = (function(_base) {
	__extends(ClientComponent, _base);

	function ClientComponent() {
	}

	// Constructor _New()
	ClientComponent._New8 = function(self) {
		self = _base._New6(self) || self;
		return self;
	};

	// Constructor _New(string)
	ClientComponent._New9 = function(self, name) {
		self = _base._New7(self, name) || self;
		self._symbolType = eco.SymbolType.ClientComponent;
		return self;
	};

	// virtual object Serialise()
	ClientComponent.prototype.Serialise = function() {
		var self = this;
		var output = {"type": "client-comp"};
		var usings = [];
		for (var used of self._usings)
			usings.push(used.getFullName());

		output["usings"] = usings;
		if (self._baseClass)
			output["baseClass"] = self._baseClass.getFullName();
		if (self._interfaces.length > 0)
		{
			var interfaceJson = [];
			for (var intr of self._interfaces)
				interfaceJson.push(intr.getFullName());

			output["interfaces"] = interfaceJson;
		}
		var members = [];
		for (var member of self._members)
			members.push(member.Serialise());

		output["members"] = members;
		return output;
	};

	/**

	 */
	ClientComponent.ImportSkeleton3 = function(name, symbol, parent) {
		var comp = eco.ClientComponent._New9(new eco.ClientComponent(), name);
		comp.setNamespace(parent);
		comp._imported = true;
		return comp;
	};

	/**

	 */
	ClientComponent.ImportFull3 = function(comp, symbol) {
		var usings = symbol["usings"];
		for (var used of usings)
			comp.UseNamespace(comp.GetNamespaceFromTypeNode(eco.TypeNode.Generate(used)));

		if ((((symbol))["baseClass"] !== undefined))
		{
			var baseName = symbol["baseClass"];
			comp.setBaseClass(comp.GetInterfaceFromTypeNode(eco.TypeNode.Generate(baseName)));
		}
		if ((((symbol))["interfaces"] !== undefined))
		{
			var interfaces = symbol["interfaces"];
			for (var intr of interfaces)
				comp.AddInterface(comp.GetInterfaceFromTypeNode(eco.TypeNode.Generate(intr)));

		}
		var members = symbol["members"];
		for (var member of members)
		{
			var memberType = member["memberType"];
			if (memberType == "field")
				comp.AddMember(eco.Field.ImportField(member, comp));
			else if (memberType == "method")
				comp.AddMember(eco.Method.ImportMethod(member, comp));
			else if (memberType == "constructor")
				comp.AddMember(eco.Constructor.ImportConstructor(member, comp));
			else if (memberType == "property")
				comp.AddMember(eco.Property.ImportProperty(member, comp));
		}

	};

	// virtual bool IsClientComponent()
	ClientComponent.prototype.IsClientComponent = function() {
		var self = this;
		return true;
	};

	return ClientComponent;
}(eco.Class));

eco.CompilationTarget = {
	Client: 0,
	Server: 1,
	Shared: 2
};
eco.CompilationModelType = {
	File: 0,
	Component: 1
};
eco.TokenType = {
	None: 0,
	DocComment: 1,
	Ident: 2,
	Bool: 3,
	Char: 4,
	Int: 5,
	Float: 6,
	String: 7,
	AsmStr: 8,
	Operator: 9,
	BraceOpen: 10,
	BraceClose: 11,
	ParOpen: 12,
	ParClose: 13,
	SquareOpen: 14,
	SquareClose: 15,
	Comma: 16,
	Dot: 17,
	Arrow: 18,
	Colon: 19,
	Semicolon: 20,
	Amp: 21,
	At: 22,
	MClose: 23,
	MSelfClose: 24,
	Dollar: 25,
	KW_Start: 26,
	K_Target: 27,
	K_Targets: 28,
	K_Excludes: 29,
	K_Import: 30,
	K_Using: 31,
	K_Typedef: 32,
	K_Package: 33,
	K_Template: 34,
	K_Native: 35,
	K_Class: 36,
	K_Interface: 37,
	K_Enum: 38,
	K_Public: 39,
	K_Protected: 40,
	K_Private: 41,
	K_Static: 42,
	K_Virtual: 43,
	K_Get: 44,
	K_Set: 45,
	K_Alias: 46,
	K_Ajax: 47,
	K_Router: 48,
	K_Routes: 49,
	K_As: 50,
	K_Var: 51,
	K_Return: 52,
	K_True: 53,
	K_False: 54,
	K_Null: 55,
	K_This: 56,
	K_Self: 57,
	K_Base: 58,
	K_New: 59,
	K_If: 60,
	K_Else: 61,
	K_For: 62,
	K_Foreach: 63,
	K_In: 64,
	K_While: 65,
	K_Switch: 66,
	K_Case: 67,
	K_Default: 68,
	K_Break: 69,
	K_Continue: 70,
	K_Try: 71,
	K_Catch: 72,
	K_Throw: 73,
	K_Print: 74,
	K_Await: 75,
	KW_End: 76
};
eco.OpType = {
	Mult: 0,
	Div: 1,
	Exp: 2,
	Add: 3,
	Sub: 4,
	Mod: 5,
	CmpGT: 6,
	CmpLT: 7,
	CmpGTE: 8,
	CmpLTE: 9,
	CmpEq: 10,
	CmpNEq: 11,
	And: 12,
	Or: 13,
	Not: 14,
	Cond: 15,
	Inc: 16,
	Dec: 17,
	Assign: 18,
	AAdd: 19,
	ASub: 20,
	AMul: 21,
	ADiv: 22,
	AExp: 23,
	AMod: 24,
	Connect: 25
};
eco.ASTType = {
	None: 0,
	Import: 1,
	Namespace: 2,
	Interface: 3,
	Class: 4,
	Enum: 5,
	Template: 6,
	ServerComponent: 7,
	ClientComponent: 8,
	Initialiser: 9,
	Service: 10,
	Typedef: 11,
	Type: 12,
	ArrayType: 13,
	MapType: 14,
	FunctionType: 15,
	EventType: 16,
	InlineType: 17,
	Member: 18,
	Field: 19,
	Property: 20,
	Method: 21,
	Statement: 22
};
eco.ParserContext = {
	Namespace: 0,
	Interface: 1,
	Class: 2,
	ClassInfo: 3,
	Member: 4,
	Type: 5,
	New: 6,
	Using: 7
};
eco.MemberAccess = {
	Public: 0,
	Protected: 1,
	Private: 2
};
eco.StatementType = {
	None: 0,
	Block: 1,
	VarDecl: 2,
	If: 3,
	For: 4,
	Foreach: 5,
	While: 6,
	Switch: 7,
	Case: 8,
	Default: 9,
	TryCatch: 10,
	Throw: 11,
	Target: 12,
	Await: 13,
	Return: 14,
	Break: 15,
	Continue: 16,
	Assembly: 17,
	Expression: 18
};
eco.ExpressionType = {
	None: 0,
	Lit: 1,
	Load: 2,
	Access: 3,
	ArrayAccess: 4,
	LitArray: 5,
	Map: 6,
	Function: 7,
	Op: 8,
	PreOp: 9,
	PostOp: 10,
	CondOp: 11,
	Par: 12,
	New: 13,
	Call: 14,
	ComplexCall: 15,
	BaseCall: 16,
	MethodCall: 17,
	Typecast: 18,
	Assembly: 19,
	HTML: 20,
	HTMLText: 21,
	HTMLCode: 22,
	FullPckName: 23
};
eco.SymbolType = {
	SymbolTable: 0,
	Symbol: 1,
	Namespace: 2,
	Interface: 3,
	Class: 4,
	Enum: 5,
	Template: 6,
	ServerComponent: 7,
	ClientComponent: 8,
	Initialiser: 9,
	Service: 10,
	Typedef: 11,
	Member: 12
};
eco.MemberType = {
	Field: 0,
	Method: 1,
	Constructor: 2,
	Property: 3,
	ServerRender: 4,
	TemplateRender: 5
};
// Node exports
module.exports = {
};


