angular.module('gp')
.directive('clickHotkey', function($document) {

	return {
		restrict: 'A',
		link: function(scope, elem) {
			function isHotkey(ev) {
				return ev.ctrlKey && (ev.which === 13 || ev.which === 10);
			}
			
			$document.bind('keypress', function(ev) {
				if(isHotkey(ev)) {
					angular.element(elem).triggerHandler('click');
				}
			});
		}
	};
});