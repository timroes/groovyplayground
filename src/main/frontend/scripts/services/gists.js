angular.module('gp')
.service('gists', function($http) {

	var GISTS_API = 'https://api.github.com/gists';

	function byId(id) {
		return $http.get(GISTS_API + '/' + id)
			.then(function(response) {
				return response.data;
			});
	}

	return {
		byId: byId
	};

});