var app = angular.module('gp', ['ui.ace', 'ngDialog', 'LocalStorageModule']);

app.config(function(localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('groovyplayground');
});

app.controller("EditorController", function($scope, $http, $q, ngDialog, localStorageService) {

	var STORAGE_KEY = 'source';
	var runningRequest;
	var Range = ace.require('ace/range').Range;
	var highlights = [];
	var cancelSourceWatch;

	$scope.source = localStorageService.get(STORAGE_KEY);

	var editorDefer = $q.defer();

	var withEditor = function() {
		return editorDefer.promise;
	};

	$scope.evaluate = function() {
		localStorageService.set(STORAGE_KEY, $scope.source);
		$scope.result = {};
		$scope.output = [];
		$scope.isLoading = true;
		
		if(runningRequest) {
			runningRequest.resolve();
		}
		var canceler = $q.defer();
		runningRequest = canceler;
		
		$http.post('/api/script', {
			"source": $scope.source
		}, { timeout: runningRequest.promise }).then(function(response) {
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

			$scope.output = lines;
			$scope.interactiveOutput = true;
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

app.directive('clickHotkey', function($document) {

	var MODIFIERS = ['shift', 'ctrl', 'meta', 'alt'];

	return {
		restrict: 'A',
		scope: {
			'clickHotkey': '@'
		},
		link: function(scope, elem) {
			var hotkey = scope.clickHotkey.split('+');
			var key = hotkey[hotkey.length - 1];
			
			
			function isHotkey(ev) {
				for(var i = 0; i < hotkey.length - 1; i++) {
					if(MODIFIERS.indexOf(hotkey[i]) === -1) {
						throw new Error('Modifier ' + hotkey[i] + ' does not exist.');
					}
					
					if(!ev[hotkey[i] + 'Key']) {
						return false;
					}
					
				}
				return key.toLowerCase() === ev.keyIdentifier.toLowerCase();
			}
			
			$document.bind('keypress', function(ev) {
				if(isHotkey(ev)) {
					angular.element(elem).triggerHandler('click');
				}
			});
		}
	};
});