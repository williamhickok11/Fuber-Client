"use strict";


app.controller('userMapCtrl', function($scope, $http, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $ionicPopover, ionicMaterialInk, firebaseURL, authFactory) {
     
  $ionicPlatform.ready(function() {  

    // Ionic Material Ink
    ionicMaterialInk.displayEffect();

    var ref = new Firebase(firebaseURL);

    var currentUser = {};  

    // If user isAuthorized, get users and set current user based on uid.
    authFactory.getUser().then(function (UserObj) {
      var authData = ref.getAuth();
      for (var i = 0; i < UserObj.length; i++) {
        if(UserObj[i].firebaseUID == authData.uid) {
          currentUser = UserObj[i];
          $scope.$apply();
        }
      }
      console.log("Current User:", currentUser);
    });

    // Checks if current user is a food truck user or not
    $scope.isTruck = function () {
      if (currentUser.is_truck) {
        return true;
        $scope.$apply();
      } else {
        return false;
        $scope.$apply();
      }
    };

    var lat;
    var long;

    // Preloader
    $ionicLoading.show({
      template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div><br/>Acquiring location!'
    });
     
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    // Get user's current position lat, long
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      lat  = position.coords.latitude;
      long = position.coords.longitude;
      
      console.log("Current Coords:", lat, long);

      // Set user's coords
      var myLatLng = new google.maps.LatLng(lat, long);
       
      var mapOptions = {
        center: myLatLng,
        zoom: 16,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };  
      
      // Open New Google Map
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      // Set empty array for all truck coords.
      var allTrucks = [];
      var infowindow;
      var truckMarker;
      var markerContent = [];

      // Get all truck locs, then refresh on setInterval
      $scope.getAllTrucks = function () {
        return new Promise(function (resolve, reject) {
          $http.get(`http://localhost:3000/api/truck_user`)
          .success(
            function (allTrucksObj) {resolve(allTrucksObj)},
            function (error) {reject(error)}
          )
        })
      };
      // Invoke GET
      $scope.getAllTrucks().then(
        function (allTrucksObj) {
          allTrucks = allTrucksObj;
          console.log("All Truck Users:", allTrucks);
        }
      )
      .then(
        function () {
          for (var i = 0; i < allTrucks.length; i++) { 
            // var currPosition = new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long);
            truckMarker = new google.maps.Marker({
              position: new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long),
              map: map,
              icon: `img/truck_icon.png`
            });
            markerContent.push(`<div>${allTrucks[i]}</div>`);
            console.log("??", markerContent);
            
            infowindow = new google.maps.InfoWindow({
              position: new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long),
              // content: markerContent[i].contact_info
            });
            
            google.maps.event.addListener(truckMarker, 'click', function() {
              infowindow.setContent(markerContent.contact_info);
              infowindow.open(map, this);
            });    
          }
        }
      );

      google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
      });
      

      // Begin marker refresh of truck locs on setInterval
      window.setInterval(
        function () {
          // GET all truck locations
          $scope.getAllTrucks = function () {
            return new Promise(function (resolve, reject) {
              $http.get(`http://localhost:3000/api/truck_user`)
              .success(
                function (allTrucksObj) {resolve(allTrucksObj)},
                function (error) {reject(error)}
              )
            })
          };
          // Invoke GET
          $scope.getAllTrucks().then(
            function (allTrucksObj) {
              allTrucks = allTrucksObj;
              console.log("All Truck User Coords:", allTrucks);
            }
          )
          .then(
            function () {
              for (var i = 0; i < allTrucks.length; i++) {
                var currTruckCoord = new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long);
                truckMarker.setPosition(currTruckCoord);
              }
            }
          );
        }, 20000 
      );

      $scope.map = map;   
      $ionicLoading.hide();     
      }, 
      function(err) {
        $ionicLoading.hide();
        console.log(err);
      }
    );

  // End ionicPlatform.ready
  });
// End dependency function
});





























