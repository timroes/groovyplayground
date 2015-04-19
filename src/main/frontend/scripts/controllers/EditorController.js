angular.module('gp')
.controller("EditorController", function($scope, $http, $q, $location, gists, ngDialog, localStorageService) {

	var STORAGE_KEY = 'source';
	var runningRequest;
	var Range = ace.require('ace/range').Range;
	var highlights = [];
	var cancelSourceWatch;

	var errorDialog = function(error, data) {
		ngDialog.open({
			template: 'views/errorDialog.html',
			data: {
				error: error,
				data: data
			},
			className: 'ngdialog-theme-default error-dialog'
		});
	};

	var gistLoaded = function(gist) {
		if(Object.keys(gist.files).length === 0) {
			errorDialog('no_files');
		} else {
			$scope.source = '';
			angular.forEach(gist.files, function(file) {
				if(gist.files.length > 1) {
					$scope.source += '// ' + file.filename + '\n';
				}
				$scope.source += file.content;
				$scope.source += '\n\n';
			});
			$location.search('load', gist.id);
		}
	};

	var handleGistError = function(reason) {
		if(reason.status === 404) {
			errorDialog('not_found');
		} else if(reason.status === 403) {
			errorDialog('limit_exceeded', { reset: reason.headers('X-RateLimit-Reset') * 1000 });
		} else {
			errorDialog('generic');
		}
	};

	var loadGist = function(id) {
		gists.byId(id).then(gistLoaded, handleGistError);
	};

	$scope.source = localStorageService.get(STORAGE_KEY) || '';

	// Try to load a gist from the URL parameter
	var params = $location.search();
	if(angular.isString(params.load) && params.load.length > 0) {
		loadGist(params.load);
	}

	var editorDefer = $q.defer();

	var withEditor = function() {
		return editorDefer.promise;
	};

	$scope.evaluate = function() {
		$location.search('load', null);
		localStorageService.set(STORAGE_KEY, $scope.source);
		$scope.result = {};
		$scope.output = [];
		$scope.error = null;
		$scope.isLoading = true;
		
		if(runningRequest) {
			runningRequest.resolve();
		}
		var canceler = $q.defer();
		runningRequest = canceler;
		
		$http.post('/api/script', {
			"source": $scope.source
		}, { timeout: runningRequest.promise })
		.then(function(response) {
			$scope.result = response.data;

			var lines = [[]];
			var line = 0;
			angular.forEach($scope.result.output, function(el) {
				lines[line].push(el);
				if(el.lineBreak) {
					lines.push([]);
					line++;
				}
			});

			// Remove last entry if it is empty
			if (lines[lines.length - 1].length === 0) {
				lines.splice(-1);
			}

			$scope.error = null;
			$scope.output = lines;
			$scope.interactiveOutput = true;
		})
		.catch(function(reason) {
			if(reason.status === 418) {
				$scope.interactiveOutput = false;
				$scope.error = 'DEADLINE_EXCEEDED';
			} else {
				$scope.error = 'UNKNOWN';
			}
		}).finally(function() {
			if(canceler === runningRequest) {
				runningRequest = null;
				$scope.isLoading = false;
			}
		});
	};

	$scope.aceLoaded = function(editor) {
		editorDefer.resolve(editor);
		editor.focus();
	};

	$scope.gistLoadDialog = function() {
		ngDialog.open({
			template: 'views/gistLoad.html',
			className: 'ngdialog-theme-default wide-dialog'
		}).closePromise.then(function(close) {
			if(close.value && close.value[0] != '$') {
				loadGist(close.value);
			}
		});
	};

	$scope.highlightLine = function(line) {
		if($scope.interactiveOutput) {
			withEditor().then(function(editor) {
				highlights.forEach(function(markerId) {
					editor.getSession().removeMarker(markerId);
				});
				if(line >= 0) {
					highlights.push(editor.getSession().addMarker(new Range(line, 0, line, 1), "output-cause-line", "fullLine"));
				}
			});
		}
	};

	$scope.createGist = function() {
		$scope.gistCreating = true;
		$http.post('https://api.github.com/gists', {
			'description': "",
			'public': false,
			'files': {
				'script.groovy': {
					'content': $scope.source
				}
			}
		})
		.then(function(result) {
			ngDialog.open({
				template: 'views/gistcreated.html',
				data: {
					url: result.data.html_url
				},
				className: 'ngdialog-theme-default gist-dialog'
			});
		})
		.catch(handleGistError)
		.finally(function() {
			$scope.gistCreating = false;
		});
	};

	$scope.showInfo = function() {
		ngDialog.open({
			template: 'views/info.html',
			className: 'ngdialog-theme-default wide-dialog info-dialog'
		});
	};

	$scope.$watch('interactiveOutput', function(isInteractive, wasInteractive) {
		if(isInteractive && !wasInteractive) {
			cancelSourceWatch = $scope.$watch('source', function(newSource, oldSource) {
				// When source changed stop interactive mode and clear annotations
				if(newSource !== oldSource) {
					withEditor().then(function(editor) {
						editor.getSession().clearAnnotations();
					});
					$scope.interactiveOutput = false;
					// Stop watching for source changes until the next execute
					cancelSourceWatch();
				}
			});
		}
	});

	$scope.$watch('result', function(result) {

		if(!result || !result.output) {
			return;
		}

		var errors = result.output.filter(function(out) {
			return out.type === 'EXCEPTION' || out.type === 'COMPILATION_ERROR';
		});

		withEditor().then(function(editor) {
			editor.getSession().setAnnotations(errors.map(function(out) {
				return {
					row: out.line - 1,
					text: out.message,
					type: 'error'
				};
			}));
		});
	});

});