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
				clearCanvas($setting);
			}else{
				$this.append($("<canvas> Browser does not support required HTML5 Canvas element. </canvas>").
						attr("width", $setting.width).
						attr("height", $setting.height).
						attr("id", $setting.containerId).
						addClass($setting.containerClass)
				);				
			}
			
			//Instead of accessing actual DOM from array in Jquery way, this is clearer.
			var canvas = document.getElementById($setting.containerId);
			
			if(!canvas || !canvas.getContext){
				return false;
			}
			
			var c = canvas.getContext("2d");
			
			if(!c || !c.drawImage){
				return false;
			}
			
			return true;
		},					
		invoke: function($setting, callback){
			//Draw the header
			drawUptimeRobotHeader($setting);
			
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
				//Canvas width per monitor
				var canvasPartSize = $setting.width / numberOfMonitors;
				var rRatio = 1.5;
				//Draw the circle representing total
				draw($setting, index, canvasPartSize, rRatio, monitor.alltimeuptimeratio, {
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
						draw($setting, index, canvasPartSize, rRatio, uptimesVal[iUpTime], {
							color: color,
							unavailableColor: monitorConf.unavailableColor,
							backgroundColor: monitorConf.backgroundColor,
							percLabelColor: monitorConf.percLabelColor,
							labelPrefix: timeVal + " day"
						});
					});					
				}
								
				//Draw the circle for current status
				draw($setting, index, canvasPartSize, rRatio + 0.7, monitor.status == "2" ? 100 : 0.01, {//Must be 0.01 else circle is not drawn when server is down
					color: "#5CE62E",
					unavailableColor: "#E60000",
					backgroundColor: monitorConf.backgroundColor,
					percLabelColor: monitorConf.percLabelColor,
					isStatus: true
				});
				
				//Draw the Server name
				drawServerName($setting, index, canvasPartSize, monitorConf);
				
			}
		}
	};
	
	function getContext($setting){
		var canvas = document.getElementById($setting.containerId);		
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
	
	function drawUptimeRobotHeader($setting){
		var c = getContext($setting);
		var padding = getPadding($setting);
		var xMid = $setting.width/2;					
		var yPaddingTop = $setting.height - 0.3*padding;
		
		//Try loading image
		var uptimeRobotLogo = new Image();
		uptimeRobotLogo.src = 'http://uptimerobot.com/assets/img/logo3.png';
		uptimeRobotLogo.onload = function(){
			if(uptimeRobotLogo.width == 180 && uptimeRobotLogo.height == 52){//Must make sure log is not changed to something too big. Better to ignore than over draw.
		    	c.drawImage(uptimeRobotLogo, 10, yPaddingTop*0.90, uptimeRobotLogo.width*0.50, uptimeRobotLogo.height*0.50);
			}else{
				writeUptimeRobot($setting, xMid, yPaddingTop);
			}
		};
		
		//Image load fails
		uptimeRobotLogo.onerror = function(){
			writeUptimeRobot($setting, xMid, yPaddingTop);
		};
		
		//Image load aborted
		uptimeRobotLogo.onabort = function(){
			writeUptimeRobot($setting, xMid, yPaddingTop);
		};
	}
	
	function writeUptimeRobot($setting, xVal, yVal){
		//Fill 
		var c = getContext($setting);
		c.fillStyle=$setting.color;
		c.font = "bold " + $setting.font;	
		c.textAlign = 'center';
		c.lineWidth = 4;
		c.fillText("Uptime Robot (http://uptimerobot.com/)", xVal, yVal);	
	}
	
	function drawServerName($setting, index, canvasPartSize, monitorConf){
		//Canvas start,end,mid point for monitor based on index in array
		var xStart = index * canvasPartSize;
		var xEnd = xStart + canvasPartSize;
		var xMid = (xStart + xEnd)/2;
		//Padding for all.
		var padding = getPadding($setting);
		var yMid = ($setting.height/2);
		var yPaddingTop = $setting.height - padding*1.5;
		
		//Fill
		var c = getContext($setting);
		c.fillStyle=$setting.color;
		c.font = "bold " + $setting.font;	
		c.textAlign = 'center';
		c.lineWidth = 4;
		c.fillText(monitorConf.name, xMid, yPaddingTop);
	}
	
	function draw($setting, index, canvasPartSize, radiusRatio, perc, monitorConf){
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
		var c = getContext($setting);
		
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
	
	function clearCanvas($setting){
		var canvas = document.getElementById($setting.containerId);		
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
            	color: "",
            	apiKey: "",
            	backgroundColor: "",
            	name: "",
            	customUptimeRatio: ""
            }],			            
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
				
		function doAll(){
			if(methods.init($this, $setting)){
				var c = getContext($setting);
				c.fillStyle = $setting.backgroundColor;
				c.fillRect(0, 0, $setting.width, $setting.height);
				methods.invoke($setting, methods.handleApiResponseForCanvas);
			}
		}
		
		doAll();
		
		if(true == $setting.refresh){
			var timerId = setInterval(doAll, $setting.refreshInterval * 1000);
			return timerId;
		}
		
	};
	
}( jQuery ));