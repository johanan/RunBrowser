(function(RunBrowser, $){
RunBrowser.appController = function(){
	this.mapView = null;
	this.runPath = null;
	this.watchid = null;
	
	//cached elements
	this.mapPage = document.getElementById('mapPage');
	this.startPage = document.getElementById('startPage');
	this.showMapButton = document.getElementById('showMap');
	this.stop = document.getElementById('stop');
	this.saveButton = document.getElementById('saveRun');
	this.clearButton = document.getElementById('clearRun');
	this.backButton = document.getElementById('back');
	this.table = document.getElementById('savedRuns');
	
	//modals
	this.errorModal = document.getElementById('errorModal');
	this.clearError = document.getElementById('clearError');
	this.saveModal = document.getElementById('saveModal');
	this.backdrop = document.getElementById('backdrop');
	
	this.addEvents = function(){
		var This = this;
		this.showMapButton.addEventListener("click", function(){This.showMap()});
		this.stop.addEventListener("click", function(){This.stopMap()});
		this.saveButton.addEventListener("click", function(){This.saveRun()});
		this.clearButton.addEventListener("click", function(){This.clearRun()});
		this.backButton.addEventListener("click", function(){This.clearRun()});
		this.clearError.addEventListener("click", function(){This.clearRun()});
	}
	
	this.saveRun = function(){
		localStorage.setItem(this.runPath.startTime, JSON.stringify(this.runPath));
		
		if(this.mapView != null){
			this.mapView.destroy();
		}
		
		if(this.watchid != null){
			navigator.geolocation.clearWatch(this.watchid);
			this.watchid = null;
		}
		
		if(this.runPath != null){
			this.runPath = null;
		}
		
		$(this.backdrop).addClass('none');
		$(this.saveModal).addClass('none');
		
		$(this.mapPage).addClass('none');
		$(this.startPage).removeClass('none');
		
		this.showHome();
	}
	
	this.clearRun = function(){
		if(this.mapView != null){
			this.mapView.destroy();
		}
		
		if(this.watchid != null){
			navigator.geolocation.clearWatch(this.watchid);
			this.watchid = null;
		}
		
		if(this.runPath != null){
			this.runPath = null;
		}
		
		$(this.backdrop).addClass('none');
		$(this.saveModal).addClass('none');
		$(this.errorModal).addClass('none');
		
		$(this.mapPage).addClass('none');
		$(this.startPage).removeClass('none');
	}
	
	this.showHome = function(){
		//clear the old table out
		var This = this;

		$(this.table).removeClass('none');
		
		for(var i=this.table.rows.length;i>1;i--) {
			this.table.deleteRow(i-1);
		}
		
		for (var key in localStorage){
			var old = JSON.parse(localStorage.getItem(key));
		   
		   var rowCount = this.table.rows.length;
			var row = this.table.insertRow(rowCount);
			
			var cellRemove = row.insertCell(0);
			var rm = document.createElement("button");
		    rm.className = "btn btn-danger";
		    rm.innerHTML = '<i class="icon-remove icon-white"></i>';
		    rm.setAttribute('data-key', key);
		    rm.addEventListener('click', function(evt){This.removeSavedRun(evt.target)});
		    cellRemove.appendChild(rm);
			
			var celldate = row.insertCell(1);
			var startDate = new Date(old.startTime);
		    var datetext = document.createTextNode(startDate.toDateString());
		    celldate.appendChild(datetext);
		 
		    var celldist = row.insertCell(2);
		    var disttext = document.createTextNode(Math.round(old.distance*100)/100);
		    celldist.appendChild(disttext);
		 
		    var cellbutton = row.insertCell(3);
		    var butt = document.createElement("button");
		    butt.className = "btn btn-inverse";
		    butt.innerHTML = '<i class="icon-chevron-right icon-white"></i>';
		    butt.setAttribute('data-key', key);
		    butt.addEventListener('click', function(evt){This.loadSavedRun(evt.target)});
		    cellbutton.appendChild(butt);
		}
		
		if(this.table.rows.length == 1){
			$(this.table).addClass('none');
		}
	}
	
	this.loadSavedRun = function(target){
		var datakey;
		if(target.getAttribute('data-key')){
			datakey = target.getAttribute('data-key');
		}else{
			datakey = target.parentNode.getAttribute('data-key');
		}
		
		var runp = new RunBrowser.runPath();
		var old = JSON.parse(localStorage.getItem(datakey));
		
		runp.startTime = old.startTime;
		runp.distance = old.distance;
		runp.lastUpdateTime = old.lastUpdateTime;
		runp.pointArray = old.pointArray;
		
		$(this.mapPage).removeClass('none');
		$(this.startPage).addClass('none');
		
		$(this.stop).addClass('none');
		$(this.backButton).removeClass('none');
	
		if(this.mapView != null){
			this.mapView.destroy();
		}
		
		this.mapView = new RunBrowser.mapView();
		
		for(var i=0; i<old.pointArray.length; i++ ){
			this.mapView.addPoint(old.pointArray[i]);
		}
		
		this.mapView.updateTimeDistance(runp.getElapsedFormat(), runp.getDistance());
		this.mapView.updateSpeeds(runp.getCurrentMph(), runp.getMinMile());
	}
	
	this.removeSavedRun = function(target){
		var datakey;
		if(target.getAttribute('data-key')){
			datakey = target.getAttribute('data-key');
		}else{
			datakey = target.parentNode.getAttribute('data-key');
		}
		
		localStorage.removeItem(datakey);
		this.showHome();
	}
	
	this.errorHandler = function(error){
		$(this.backdrop).removeClass('none');
		$(this.errorModal).removeClass('none');
	}

	this.showMap = function(){
		$(this.mapPage).removeClass('none');
		$(this.startPage).addClass('none');
		
		$(this.stop).removeClass('none');
		$(this.backButton).addClass('none');
		
		if(this.mapView != null){
			this.mapView.destroy();
		}
		
		this.mapView = new RunBrowser.mapView();
		this.runPath = new RunBrowser.runPath();
		var This = this;
		this.watchid = navigator.geolocation.watchPosition(function(location){This.GetLocation(location)}, function(error){This.errorHandler(error)}, {enableHighAccuracy:true, maximumAge: 5000, timeout: 12000 });
		
		setTimeout(function(){
	    window.scrollTo(0, 0);
	    }, 0);
	}
	
	this.stopMap = function(){
		$(this.backdrop).removeClass('none');
		$(this.saveModal).removeClass('none');
	}
	
	this.GetLocation = function(location){
		if(ptTest = this.runPath.addPoint(location))
		{
			this.mapView.addPoint(location);
			this.mapView.updateTimeDistance(this.runPath.getElapsedFormat(), this.runPath.getDistance());
			this.mapView.updateSpeeds(this.runPath.getCurrentMph(), this.runPath.getMinMile());
	    }
	}

};

RunBrowser.mapView = function(){
	this.map = new OpenLayers.Map("map");
	this.proj = new OpenLayers.Projection("EPSG:4326");
	this.line = new OpenLayers.Geometry.LineString([]);
	this.lineLayer = new OpenLayers.Layer.Vector("Line Layer");
	
	this.timeSpan = document.getElementById('time');
	this.distance = document.getElementById('distance');
	this.mph = document.getElementById('mph');
	this.minMile = document.getElementById('minMile');
	
	var layer = new OpenLayers.Layer.OSM();
	
	this.map.addControl(new OpenLayers.Control.DrawFeature(this.lineLayer, OpenLayers.Handler.Path));                                     
    var style = { strokeColor: '#0000ff', strokeOpacity: 0.5, strokeWidth: 5 };

    var lineFeature = new OpenLayers.Feature.Vector(this.line, null, style);
    this.lineLayer.addFeatures([lineFeature]);
     
	this.map.addLayers([layer, this.lineLayer]);
	this.map.zoomTo(15);
	
	this.updateTimeDistance = function(time, distance){
		this.timeSpan.innerHTML =  time;
		this.distance.innerHTML =  distance;
	}
	
	this.updateSpeeds = function(mph, minMile){
		this.mph.innerHTML =  mph;
		this.minMile.innerHTML =  minMile;
	}
	
}

RunBrowser.mapView.prototype.addPoint = function(location){
		opLonLat = new OpenLayers.LonLat( location.coords.longitude, location.coords.latitude );
		opLonLat.transform(this.proj, this.map.getProjectionObject());
		point = new OpenLayers.Geometry.Point(opLonLat.lon, opLonLat.lat);
		
		this.line.addComponent(point);
		this.lineLayer.redraw();
		this.map.setCenter(opLonLat);
	}
	
RunBrowser.mapView.prototype.destroy = function(){
		this.map.destroy();
	}
	
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

	RunBrowser.runPath = function() {
		this.distance = 0,
		this.startTime = 0,
		this.lastUpdateTime = 0,
		this.pointArray = [],
		this.addPoint = function(point) {
			if(point.coords.accuracy <= 25 && (point.timestamp - this.lastUpdateTime)>= 6000 || this.lastUpdateTime == 0)
			{
				var now = new Date().getTime();
				this.pointArray.push(point);
				this.lastUpdateTime = now;
				
				if(this.startTime == 0){
					this.startTime = now;
				}
				
				if(this.pointArray.length >= 2){
					var arraylen = this.pointArray.length;
					this.distance += this.computeDistance(this.pointArray[arraylen -2], this.pointArray[arraylen -1]);
				}
				
				return point;
			}
			
			return false;
		},
		
		this.computeDistance = function(point1, point2){
		
			var lon1 = point1.coords.longitude;
			var lon2 = point2.coords.longitude;
			var lat1 = point1.coords.latitude;
			var lat2 = point2.coords.latitude;
			
			var R = 3958.7558657440545; // miles
			var dLat = (lat2-lat1).toRad();
			var dLon = (lon2-lon1).toRad();
			var lat1 = lat1.toRad();
			var lat2 = lat2.toRad();
			
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c;
			
			return d;
		},
		
		this.getDistance = function (){
			return this.distance.toPrecision(4);
		},
		
		this.getElapsed = function(){
			return (this.lastUpdateTime - this.startTime)/60000; //time elapsed in minutes
		},
		
		this.getElapsedFormat = function(){
			var diff = this.lastUpdateTime - this.startTime;
			//get minutes
			var mins = Math.floor(diff/1000/60);
			diff -= mins*60000;
			//get seconds
			var secs = Math.floor(diff/1000);
			secs = (secs < 10 ? '0' : '') + secs
			return mins + ":" + secs;
		},
		
		this.getCurrentMph = function(){
			return (this.pointArray[this.pointArray.length -1].coords.speed * 2.23693629).toPrecision(4);
		},
		
		this.getMph = function(){
			return this.distance / (this.getElapsed()/60); //mph
		},
		
		this.getMinMile = function(){
			var minMile = this.getElapsed() / this.distance;
			if (isNaN(minMile)){
				return 0;
			}
			return  minMile.toPrecision(4);
		}
	}
}( window.RunBrowser = window.RunBrowser || {}, window.Zepto ));           