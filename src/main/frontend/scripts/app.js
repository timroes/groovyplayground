angular.module('gp', ['templates', 'ui.ace', 'ngDialog', 'LocalStorageModule'])
.config(function(localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('groovyplayground');
});