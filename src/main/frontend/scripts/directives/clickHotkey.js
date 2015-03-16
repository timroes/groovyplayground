angular.module('gp')
.directive('clickHotkey', function($document) {

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