Jquery Uptime Robot Plugin
==========================

The plugin uses UptimeRobot (http://uptimerobot.com/) API's to display the server statuses. It displays the current server status as UP or DOWN and has the capacity to display uptimes for a max 3 custom days range. The plugin supports both account API keys and Monitor specific API keys. 

Modes
-----

Plugin can be used in two modes of operation. Monitor mode, where monitor specific API keys are used and Account mode, where account API key is used. When in account mode, all the monitors in account are displayed row by row with number of rows configured during plugin invocation.

Usage
-----

Make sure to include jquery script before proceeding. Include the plugin script in the head of the HTML page.

	<script type="text/javascript" 
		src="http://shreyaspurohit.github.io/jquery.plugin.uptimeRobotMonitor/src/js/jquery.uptimeRobotMonitor.js"></script>
	
On document ready, call the plugin by providing the minimum configurations.
	
	$( document ).ready(function() {
		var timerId = $("body").uptimeRobotMonitor(options);
	});

Monitor specific API key Example:
	
	$( document ).ready(function() {
	var timerId = $("body").uptimeRobotMonitor({monitorConfs: [
		{
			apiKey: "XXX",
			name: "Server 1 - OPTIONAL",
			color: "#5CB85C - OPTIONAL",
		},
		{
			apiKey: "XXX",
			name: "Server 2 - OPTIONAL",
			color: "#957EE6 - OPTIONAL"
		},
		{
			apiKey: "XXX",
			name: "Server 3 - OPTIONAL",
			color: "#E67EA8 - OPTIONAL",
		}]});
	});

Account API Key Example:

	$( document ).ready(function() {
		var timerId = $("body").uptimeRobotMonitor({
			mainApiKey: 'XXX',			
			numOfRows: 1,
			monitorConfs: [{
				friendlyName: 'REAL NAME IN UPTIMEROBOT',
				name: 'DISPLAY NAME - OPTIONAL',
				color: '#E67EA8 - OPTIONAL'
			}]
		});
	});
	
Options
-------
Defaults in Monitor mode:

	{
	    monitorConfs: [{
	    	apiKey: "",
	    	name: "",
	    	color: "#5CB85C",
        	unavailableColor: "#E68A00",
        	backgroundColor: "#f5f5f5",
        	percLabelColor: "#000000",		            	
        	customUptimeRatio: "1-7"
	    }],			            
	    color: "green",
	    backgroundColor: "#F5F5F5",
	    width: "640",
	    height: "240",
	    containerClass: "uptimeContainer",
	    containerId: "uptimeContainer",
	    font: "12px Arial",
	    refresh: true,
        refreshInterval: 60	    
    }

Defaults in Account mode:
    
	{
	    monitorConfs: [{
	    	friendlyName: "",
	    	name: "",
	    	color: "#5CB85C",
        	unavailableColor: "#E68A00",
        	backgroundColor: "#f5f5f5",
        	percLabelColor: "#000000",		            	
	    }],
		mainApiKey: "",
		allMonitorCustomUptimeRatio:"1-7",
		numOfRows: 1,
	    color: "#000000",
	    backgroundColor: "#F5F5F5",
	    width: "640",
	    height: "240",
	    containerClass: "uptimeContainer",
	    containerId: "uptimeContainer",
	    font: "12px Arial",
	    refresh: true,
        refreshInterval: 60	    
    }
	
* monitorConfs: Configuration for every monitor.
	* apiKey: The monitor specific API Key (generated from your uptime robot control panel). Refer http://uptimerobot.com/api for more details.
	* color: The base color for this monitor.
	* unavailableColor: The color to use to designate server was not available.
	* backgroundColor: The background color to use for this monitor.
	* percLabelColor: The color of the text font for this monitor.
	* customUptimeRatio: In the increasing order, the custom uptime server stats in days separated by "-". "1-7" means, server monitor stats for 1 and 7 days. Used only in Monitor mode.
	* friendlyName: The name of the monitor as configured in uptime robot control panel. Used only in Account mode.
* color: The font color in the container containing all the monitors.
* backgroundColor: The background color of the container containing the monitors.
* width: Width of the container.
* height: Height of the container.
* containerClass: The CSS class associated with container that you can target.
* containerId: The 'id' of the container. When using multiple rows of monitor's in the same page this option must be set to unique values.
* font: The font size followed by the font type.
* refresh: If true refresh's the the sever status repeatedly.
* refreshInterval: The interval at which the server status will refresh continuously in seconds.	
* mainApiKey: The main account specific API key (generated from your uptime robot control panel). Refer http://uptimerobot.com/api for more details.
* allMonitorCustomUptimeRatio: In the increasing order, the custom uptime server stats in days separated by "-". "1-7" means, server monitor stats for 1 and 7 days. Used only in Account mode. Applies to all the monitors in the account.
* numOfRows: Number of rows to split all the monitors in the account into. Used only in Account mode invocation.

Return value
------------

The plugin returns the timerId that can be used to cancel the interval set for refreshing server status. Use window.clearInterval(timerId) to stop data refresh dynamically.

Constraints
-----------

* Number of custom uptime ratio's is limited to first 3. If you provide for eg, 1-7-30-360, only 1,7 and 30 are considered.
* Width and Height provided by the options must be sufficient enough to hold all monitors. This is not automated. If not, monitors over write. Just increase the width in which case.
* Only one row of monitors is supported in Monitor mode. To add more monitors create a new row by calling the API again with a new 'containerId' option. This is important to be unique or else the graphics will overwrite. (In Account mode all monitors are displayed split in number of rows as configured)
* The states refresh configuration is in seconds. The max rate at which all monitors in a row will refresh is 1 sec.

Live in Action
--------------

The plugin can be seen live in action http://shreyaspurohit.github.io/jquery.plugin.uptimeRobotMonitor/static/servers.html and http://unlockalert.bitourea.com/server-status which uses the uptime monitors for my servers. The demo uses the Monitor mode. 

Note
----

In Account mode the account API key is used. This key allows one to add/delete and do more changes to the monitor. I would not suggest embedding this in any webpage where anyone can view source and find your key. The plugin supports this for ease of use with account with 30-50 monitors. It will be nice if we can have  another key like account API key but with no destructive/modification powers that allows to query all the monitors in account. 

Project Site
------------

The project site is generated using the github pages and modified. It is hosted at http://shreyaspurohit.github.io/jquery.plugin.uptimeRobotMonitor/.

Licensing
---------
Released under MIT license, go ahead and use, modify, distribute as you wish, but do not forget to include the associated license too with it. The license is provided in LICENSE.txt. The license of other libraries used must be used as defined by them.   			