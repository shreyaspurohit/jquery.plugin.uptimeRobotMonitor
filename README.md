Jquery Uptime Robot Plugin
==========================

The plugin uses UptimeRobot (http://uptimerobot.com/) API's to display the server statuses. It displays the current server status as UP or DOWN and has the capacity to display uptimes for a max 3 custom days range.

Usage
-----

Make sure to include jquery script before proceeding. Include the plugin script in the head of the HTML page.

	<script type="text/javascript" 
		src="http://shreyaspurohit.github.io/jquery.plugin.uptimeRobotMonitor/src/js/jquery.uptimeRobotMonitor.js"></script>
	
On document ready, call the plugin by providing the minimum configurations - monitor API Key (generated from your uptime robot control panel) and a server name to display.
	
	$( document ).ready(function() {
		$("body").uptimeRobotMonitor(options);
	});

Example:
	
	$( document ).ready(function() {
		$("body").uptimeRobotMonitor({monitorConfs: [
		{
			apiKey: "XXX",
			name: "Server 1",
			color: "#5CB85C",
		},
		{
			apiKey: "XXX",
			name: "Server 2",
			color: "#957EE6"
		},
		{
			apiKey: "XXX",
			name: "Server 3",
			color: "#E67EA8",
		}]});
	});
			
Options
-------
Default:

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
	    font: "12px Arial"
    }
    
* monitorConfs: Configuration for every monitor.
	* apiKey: The monitor API Key (generated from your uptime robot control panel). Refer http://uptimerobot.com/api for more details.
	* color: The base color for this monitor.
	* unavailableColor: The color to use to designate server was not available.
	* backgroundColor: The background color to use for this monitor.
	* percLabelColor: The color of the text font for this monitor.
	*customUptimeRatio: In the increasing order, the custom uptime server stats in days separated by "-". "1-7" means, server monitor stats for 1 and 7 days.
* color: The font color in the container containing all the monitors.
* backgroundColor: The background color of the container containing the monitors.
* width: Width of the container.
* height: Height of the container.
* containerClass: The CSS class associated with container that you can target.
* containerId: The 'id' of the container.
* font: The font size followed by the font type.

Constraints
-----------

* Number of custom uptime ratio's is limited to first 3. If you provide for eg, 1-7-30-360, only 1,7 and 30 are considered.
* Width and Height provided by the options must be sufficient enough to hold all monitors. This is not automated. If not, monitors over write. Just increase the width in which case.

Live in Action
--------------

The plugin can be seen live in action http://shreyaspurohit.github.io/jquery.plugin.uptimeRobotMonitor/static/servers.html which uses the uptime monitors for my servers.

Licensing
---------
Released under MIT license, go ahead and use, modify, distribute as you wish, but do not forget to include the associated license too with it. The license is provided in LICENSE.txt. The license of other libraries used must be used as defined by them.   			