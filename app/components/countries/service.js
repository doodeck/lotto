// countries/service.js

'use strict';

/* Services */

angular.module('myApp.countries', ['ngResource'])
.factory('Country', ['$resource',
  function($resource){
    return $resource('components/countries/:countryId.json', {}, {
      query: {method:'GET', params:{countryId:'countries'}, isArray:true}
    });
  }]);
