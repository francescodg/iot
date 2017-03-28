app = angular.module("first", [])
app.controller("StudentController", function($scope) { 
    $scope.student = {
	firstName: "",
	lastName: "",
	fullName: function() { return $scope.student.firstName + ", " + $scope.student.lastName; }
    }
})
