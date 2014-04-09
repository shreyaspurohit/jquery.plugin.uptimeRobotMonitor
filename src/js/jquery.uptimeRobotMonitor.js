(function ( $ ) {
	var UROB_API_URL = "http://api.uptimerobot.com/";
	var defaultMonitorConf = {
        	color: "#5cb85c",
        	unavailableColor: "#E68A00",
        	backgroundColor: "#f5f5f5",
        	percLabelColor: "#000000",		            	
        	customUptimeRatio: "1-7"
    };
	
	var methods = {
		init: function($this, $setting){
			if($("#" + $setting.containerId).length > 0){
				clearCanvas($setting.containerId);
			}else{
				addCanvas($this, $setting, $setting.containerId);				
			}
			return validateCanvas($setting.containerId);
		},					
		invoke: function($setting, callback){
			drawCanvasRect($setting, $setting.containerId);
			//Draw the header
			drawUptimeRobotHeader($setting, $setting.containerId);
			
			//Invoke API for all monitors
			$.each($setting.monitorConfs, function(index, object){
				var monitorConf = $.extend($.extend(true, {}, defaultMonitorConf), object);							
				var url = formGetMonitorUrl(monitorConf);
				$.getJSON(url, function( data ) {
					console.log( "Success, url: " + url + ", data: " + JSON.stringify(data));
					callback($setting, index, monitorConf, data);
				});
			});
		},
		handleApiResponseForCanvas: function($setting, index, monitorConf, data){
			if(data.stat == "ok"){//Only if OK response
				var monitor = data.monitors.monitor[0];
				var numberOfMonitors = $setting.monitorConfs.length;
				
				//Add the friendly name as default names
				monitorConf['friendlyName'] = monitor.friendlyname;
				drawMonitor($setting, monitor, monitorConf, numberOfMonitors, index, $setting.containerId);				
			}
		}
	};

	var mainApiKeyMethods = {
		invoke: function($this, $setting){
			var numberOfMonitorsPerRow = $setting.numOfMonitorsPerRow;
			var numOfRows = $setting.numOfRows;
			if(numberOfMonitorsPerRow <= 0){
				//Init the rows as they are configured to be atleast 1 and number of monitors per row is not configured.
				mainApiKeyMethods.init($this, $setting, $setting.numOfRows);
			}
			
			var url = formGetMonitorUrl({'apiKey' : $setting.mainApiKey, 'customUptimeRatio' : $setting.allMonitorCustomUptimeRatio});
			$.getJSON(url, function( data ) {
				console.log( "Success, url: " + url + ", data: " + JSON.stringify(data));
				if(data.stat == "ok" && data.monitors.monitor && data.monitors.monitor.length > 0){//Only if OK response
					var monitors = data.monitors.monitor;
					
					if($setting.numOfMonitorsPerRow <= 0){
						numberOfMonitorsPerRow = Math.ceil(monitors.length / $setting.numOfRows.toFixed(2));						
					}else{
					//Calculate number of rows and init them. This has to be delayed till here since the total number of monitors is obtained from server
					//and using configured number of monitor's per row we can calculate the number of rows.
						numOfRows = Math.ceil(monitors.length / $setting.numOfMonitorsPerRow.toFixed(2));
						mainApiKeyMethods.init($this, $setting, numOfRows);
					}
					
					var i = 0;										
					while(monitors.length){
						var containerId = getContainerIdForRowNum($setting, i);
						var containerSelector = '#' + containerId;
						var currentRow = monitors.splice(0, numberOfMonitorsPerRow);						
						drawCanvasRect($setting, containerId);
						$.each(currentRow, function(index, monitor){														
							drawMonitor($setting, monitor, getMonitorConfForMainAPI(monitor, $setting), currentRow.length, index, containerId);
						});
						i++;
					}
					drawUptimeRobotHeader($setting, getContainerIdForRowNum($setting, i-1));
				}
			});
		},
		init: function($this, $setting, numOfRows){			
			var allCanvasReady = true;			
			for(var i=0; i < numOfRows; i++){
				var containerId = getContainerIdForRowNum($setting, i);
				var containerSelector = '#' + containerId;
				if($(containerSelector).length > 0){
					clearCanvas(containerId);
				}else{
					addCanvas($this, $setting, containerId);
				}
				if(!validateCanvas(containerId)){
					allCanvasReady = false;
				}
			}						
			return allCanvasReady;
		}
	};
	
	function getMonitorConfForMainAPI(monitor, $setting){
		var monitorConfResult = $.extend(true, {'friendlyName' : monitor.friendlyname}, defaultMonitorConf); //Duplicate so as to not overwrite the real default conf
		
		monitorConfResult['color'] = $setting.allMonitorDefaultColor;		
		$.each($setting.monitorConfs, function(index, monitorConf){
			if(monitor.friendlyname == monitorConf.friendlyName){
				monitorConfResult = $.extend(monitorConfResult, monitorConf);
			}
		});
		monitorConfResult['customUptimeRatio'] = $setting.allMonitorCustomUptimeRatio;
		
		return monitorConfResult;
	}
	
	function getContainerIdForRowNum($setting, rowNum){
		return $setting.containerId + '_' + rowNum;
	}
	
	function addCanvas($this, $setting, containerId){
		$this.append($("<canvas> Browser does not support required HTML5 Canvas element. </canvas>").
						attr("width", $setting.width).
						attr("height", $setting.height).
						attr("id", containerId).
						addClass($setting.containerClass)
				);				
	}
	
	function validateCanvas(containerId){
		//Instead of accessing actual DOM from array in Jquery way, this is clearer.
		var canvas = document.getElementById(containerId);
		
		if(!canvas || !canvas.getContext){
			return false;
		}
		
		var c = canvas.getContext("2d");
		
		if(!c || !c.drawImage){
			return false;
		}		
		return true;	
	}
	
	function drawMonitor($setting, monitor, monitorConf, numberOfMonitors, index, containerId){
		//Canvas width per monitor
		var canvasPartSize = $setting.width / numberOfMonitors;
		var rRatio = 1.5;
		//Draw the circle representing total
		draw($setting, index, canvasPartSize, rRatio, monitor.alltimeuptimeratio, containerId, {
			color: monitorConf.color,
			unavailableColor: monitorConf.unavailableColor,
			backgroundColor: monitorConf.backgroundColor,
			percLabelColor: monitorConf.percLabelColor,
			labelPrefix: "Total"
		});
		
		//Draw the circles representing varius uptimes
		var uptimes = monitorConf.customUptimeRatio.split("-").reverse();
		
		if(uptimes.length <= 3){//Maximum custom uptime ratio's supported: 3
			var uptimesVal = monitor.customuptimeratio.split("-").reverse();
			var color = monitorConf.color;
			$.each(uptimes, function(iUpTime, timeVal){
				rRatio += 0.7;
				color = nextColor(color);					
				draw($setting, index, canvasPartSize, rRatio, uptimesVal[iUpTime], containerId, {
					color: color,
					unavailableColor: monitorConf.unavailableColor,
					backgroundColor: monitorConf.backgroundColor,
					percLabelColor: monitorConf.percLabelColor,
					labelPrefix: timeVal + " day"
				});
			});					
		}
						
		//Draw the circle for current status
		draw($setting, index, canvasPartSize, rRatio + 0.7, monitor.status == "2" ? 100 : 0.01, containerId, {//Must be 0.01 else circle is not drawn when server is down
			color: "#5CE62E",
			unavailableColor: "#E60000",
			backgroundColor: monitorConf.backgroundColor,
			percLabelColor: monitorConf.percLabelColor,
			isStatus: true
		});
		
		//Draw the Server name
		drawServerName($setting, index, canvasPartSize, monitorConf, containerId);	
	}
		
	function drawCanvasRect($setting, containerId){
		var c = getContext(containerId);
		c.fillStyle = $setting.backgroundColor;
		c.fillRect(0, 0, $setting.width, $setting.height);
	}

	function getContext(containerId){
		var canvas = document.getElementById(containerId);		
		return canvas.getContext("2d");
	}
	
	function nextColor(hex){
		var perc = 0.8;//Darken by 20%
		var rgbs = hexToRgb(hex);														
		rgbs[0] = Math.ceil(perc*rgbs[0]);
		rgbs[1] = Math.ceil(perc*rgbs[1]);
		rgbs[2] = Math.ceil(perc*rgbs[2]);
		return rgbToHex(rgbs);
	}
	
	function componentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(rgbs) {
	    return "#" + componentToHex(rgbs[0]) + componentToHex(rgbs[1]) + componentToHex(rgbs[2]);
	}

	function hexToRgb(hex) {
	    var bigint = parseInt(hex.substring(1,hex.length), 16);
	    var r = (bigint >> 16) & 255;
	    var g = (bigint >> 8) & 255;
	    var b = bigint & 255;

	    return [r,g,b];
	}
	
	function formGetMonitorUrl(monitorConf){
		return UROB_API_URL + "getMonitors?format=json&noJsonCallback=1&apiKey=" + 
				monitorConf.apiKey + "&customUptimeRatio=" + monitorConf.customUptimeRatio;
	}
	
	function getPadding($setting){
		return 0.1*$setting.height;
	}
	
	function drawUptimeRobotHeader($setting, containerId){
		var c = getContext(containerId);
		var padding = getPadding($setting);
		var xMid = $setting.width/2;					
		var yPaddingTop = $setting.height - 0.3*padding;
		var fWriteUptimeRobot = function(){
			writeUptimeRobot($setting, xMid, yPaddingTop, containerId);
		};
		
		//Try loading image
		var uptimeRobotLogo = new Image();
		uptimeRobotLogo.src = 'http://uptimerobot.com/assets/img/logo3.png';
		uptimeRobotLogo.onload = function(){
			if(uptimeRobotLogo.width == 180 && uptimeRobotLogo.height == 52){//Must make sure logo is not changed to something too big. Better to ignore than over draw.
		    	c.drawImage(uptimeRobotLogo, 10, yPaddingTop*0.90, uptimeRobotLogo.width*0.50, uptimeRobotLogo.height*0.50);
			}else{
				fWriteUptimeRobot();
			}
		};
		
		//Image load fails
		uptimeRobotLogo.onerror = fWriteUptimeRobot;
		
		//Image load aborted
		uptimeRobotLogo.onabort = fWriteUptimeRobot;
	}
	
	function writeUptimeRobot($setting, xVal, yVal, containerId){
		//Fill 
		var c = getContext(containerId);
		c.fillStyle=$setting.color;
		c.font = "bold " + $setting.font;	
		c.textAlign = 'center';
		c.lineWidth = 4;
		c.fillText("Uptime Robot (http://uptimerobot.com/)", xVal, yVal);	
	}
	
	function drawServerName($setting, index, canvasPartSize, monitorConf, containerId){
		//Canvas start,end,mid point for monitor based on index in array
		var xStart = index * canvasPartSize;
		var xEnd = xStart + canvasPartSize;
		var xMid = (xStart + xEnd)/2;
		//Padding for all.
		var padding = getPadding($setting);
		var yMid = ($setting.height/2);
		var yPaddingTop = $setting.height - padding*1.5;
		
		//Fill
		var c = getContext(containerId);
		c.fillStyle=$setting.color;
		c.font = "bold " + $setting.font;	
		c.textAlign = 'center';
		c.lineWidth = 4;
		c.fillText(getMonitorName(monitorConf), xMid, yPaddingTop);
		
		function getMonitorName(monitorConf){
			if(monitorConf.name == "" || monitorConf.name == undefined){
				return monitorConf.friendlyName;
			}
			return monitorConf.name;
		}
	}
	
	function draw($setting, index, canvasPartSize, radiusRatio, perc, containerId, monitorConf){
		//Canvas start,end,mid point for monitor based on index in array
		var xStart = index * canvasPartSize;
		var xEnd = xStart + canvasPartSize;
		var xMid = (xStart + xEnd)/2;
		//Canvas y Mid (shifted to top from exact mid by padding), minus padding of 10%
		var padding = getPadding($setting);
		var yMid = ($setting.height/2)-padding;
		//Status radius, h/2 - extra radiusRatio% of padding
		var radius = ($setting.height/2)-(radiusRatio*padding);
		//Draw overall uptime
		var arc = (perc/100.0)*(2*Math.PI);
		//Consider the arc not present, divided by 2
		var arcDisplacement = ((2*Math.PI) - arc)/2;
		//Starting from top bottom, decrease start angle
		var start = 1.5*Math.PI + arcDisplacement;
		//Starting from top bottom, increase end angle
		var end = arc + 1.5*Math.PI + arcDisplacement;
		var c = getContext(containerId);
		
		//Draw available arc
		c.beginPath();
		c.arc(xMid, yMid, radius, start, end);
		c.fillStyle=monitorConf.color;
		c.fill();
		
		//Draw un-available arc
		c.beginPath();
		c.arc(xMid, yMid, radius, end, start);
		// Create gradient
		var grd = c.createRadialGradient(xMid, yMid, radius*0.75, xMid, yMid, radius);
		grd.addColorStop(0, monitorConf.unavailableColor);
		grd.addColorStop(1, monitorConf.backgroundColor);
		c.fillStyle=grd;						
		//c.fillStyle=monitorConf.unavailableColor;
		c.fill();
		
		//Fill percentage with label
		c.fillStyle=monitorConf.percLabelColor;
		c.font = "bold " + $setting.font;	
		c.textAlign = 'center';
		c.lineWidth = 4;
		if(monitorConf.labelPrefix){
			var text = monitorConf.labelPrefix + ": " + perc + "%";
			//c.fillText(text, xMid - text.length*3.0, radiusRatio/1.3 * padding);
			drawTextAlongArc(c, text, xMid, yMid, radius, 0.7*Math.PI);
		}else if(monitorConf.isStatus){
			var statusText = perc == 0.01 ? "DOWN" : "UP";
			c.fillText(statusText, xMid, yMid);
		}
	}
	
	function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
        var len = str.length, s;
        context.save();
        context.translate(centerX, centerY);
        context.rotate(-1 * angle / 2);
        context.rotate(-1 * (angle / len) / 2);
        for(var n = 0; n < len; n++) {
          context.rotate((Math.PI/1.5) / (len));
          context.save();
          context.translate(0, -0.85 * radius);
          s = str[n];
          context.fillText(s, 0, 0);
          context.restore();
        }
        context.restore();
    }
	
	function clearCanvas(containerId){
		var canvas = document.getElementById(containerId);		
		var c = canvas.getContext("2d");
		
		// Store the current transformation matrix
		c.save();

		// Use the identity matrix while clearing the canvas
		c.setTransform(1, 0, 0, 1, 0, 0);
		c.clearRect(0, 0, canvas.width, canvas.height);

		// Restore the transform
		c.restore();
	}
	
	function getSantizedMonitorConf(defaultMonitorConf, conf){
		return $.extend($.extend(true, {}, defaultMonitorConf), conf);
	}
	
	$.fn.uptimeRobotMonitor = function(options){
		var $this = this;
		var $setting = $.extend({
            monitorConfs: [{
				friendlyName: "",
            	color: "",
            	apiKey: "",
            	backgroundColor: "",
            	name: "",
            	customUptimeRatio: ""
            }],
			mainApiKey: "",
			allMonitorCustomUptimeRatio:"1-7",
			numOfRows: 1,
			numOfMonitorsPerRow: 0,
			allMonitorDefaultColor: "#5CB85C",
            color: "#000000",
            backgroundColor: "#f5f5f5",
            width: "640",
            height: "240",
            containerClass: "uptimeContainer",
            containerId: "uptimeContainer",
            font: "12px Arial",
            refresh: true,
            refreshInterval: 60
        }, options );
		
		//Sanitize the customUptimeRatio to allow only 3 max values
		$.each($setting.monitorConfs, function(index, conf){
			var monitorConf = getSantizedMonitorConf(defaultMonitorConf, conf);					
			conf.customUptimeRatio = monitorConf.customUptimeRatio.split("-").slice(0, 3).join("-");			
		});
		$setting.allMonitorCustomUptimeRatio = $setting.allMonitorCustomUptimeRatio.split("-").slice(0, 3).join("-");
		
		function doAll(){
			//No main api key provided, use monitor keys
			if($setting.mainApiKey.length <= 0 && 
				methods.init($this, $setting)){				
				methods.invoke($setting, methods.handleApiResponseForCanvas);
			}else{
			//Use main api key
				mainApiKeyMethods.invoke($this, $setting);				
			}
		}
				
		doAll();
		
		if(true == $setting.refresh){
			var timerId = setInterval(doAll, $setting.refreshInterval * 1000);
			return timerId;
		}
		
	};
	
}( jQuery ));