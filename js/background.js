chrome.browserAction.setBadgeText({text: "Wait"});
var $currentNumberTickets 
var $currentNumberWorkflows
var $currentNumberTotal
var $ticketNumberGlobal
var $idleState
var $rootURL

if ($rootURL == undefined) {$rootURL = "https://aomev.service-now.com"}
if ($idleState == undefined) {$idleState = "active"}
if ($currentNumberTickets == undefined) {$currentNumberTickets = 0}
if ($currentNumberWorkflows == undefined) {$currentNumberWorkflows = 0}
if ($currentNumberTotal == undefined) {$currentNumberTotal = 0}

function showNotification(ticketNumber,ticketDescription,severity) {
	var imageName
	switch(severity) {
		case "1":
			imageName = "Sev1.png"
			break;
		case "2":
			imageName = "Sev2.png"
			break;
		case "3":
			imageName = "Sev3.png"
			break;
		case "4":
			imageName = "Sev4.png"
			break;
		default:
			imageName = "ITSM128.png"
	}
    chrome.notifications.create('reminder', {
        type: 'basic',
        iconUrl: 'images/' + imageName,
        title: ticketNumber,
        message: ticketDescription
     }, function(notificationId) {});
}

chrome.notifications.onClicked.addListener(notificationClicked);
function notificationClicked () {
	var urlTicketSearch = $rootURL + "/incident.do?sys_id=" + $ticketNumberGlobal
	chrome.tabs.create({'url':urlTicketSearch})
}

chrome.alarms.create("CheckTicketsAlarm", {delayInMinutes: 1, periodInMinutes: 1});

chrome.alarms.onAlarm.addListener(function(info, tab) {
	getGroupsSaved()
});

function getAssignmentGroupById (AGroupId) {
	var $group = ""
	$(function() {
    $.ajax({
        type: "get",
        url: $rootURL + "/sys_user_group.do?XML&sys_id=" + AGroupId,
        dataType: "xml",
		async: false,
        success: function(data) {
			var $allxml = $(data)
			$group = $allxml.find("sys_user_group").find("name").text()
        },
        error: function(xhr, status) {
            $group = "error"
        }
		});
	});
	return $group
}

function getGroupsSaved() {
	chrome.storage.sync.get(['groups','specificURL','rootURL','searchunacceptedurl','followWorkflow'], loadPendingTasks );
}

function removeOtherGroups(xml,groups) {
	$.each( $(xml).find("incident"), function (index, value) {
		var $ticketAGroupId = $(value).find("assignment_group")
		var ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
		tag = ticketAGroup.toLowerCase()
		g = groups.toLowerCase()
		if (tag.indexOf(g) == -1) {
			$(this).remove();
		}
	})
	
	return xml
}

function hasValue (item) {
	if ((item != undefined) && (item != NaN) && (item != null)) {return true}
	return false
}

function loadTickesFromSearchURL (items) { 
	var searchURL = changeURLforGetXML(items.searchunacceptedurl)
	$.ajax({
        type: "get",
        url: searchURL,
		async: false,
        dataType: "xml",
        success: function(data) {
			var $allxml = $(data)
			var group = items.groups
			if ( hasValue(group) && group != "" ) {
				group = group.replace("#","")
				$allxml = removeOtherGroups($allxml, group)
			}
			var $quantTickets = $allxml.find("incident").length
			chrome.browserAction.setBadgeText({text: $quantTickets.toString()});
			var $ticketNumber = $allxml.find("incident").last().find("number")
			var $severity = $allxml.find("incident").last().find("severity")
			var $ticketDescription = $allxml.find("incident").last().find("short_description")
			var $numberUpdated = $quantTickets
			var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
			var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
			
			if (hasValue($currentNumberTickets) && ($quantTickets > $currentNumberTickets) && ($quantTickets > 0)) {	
				$ticketNumberGlobal = $ticketNumber.text()
				showNotification($ticketNumber.text(),$ticketDescription.text(), $severity.text())
			} 
			$currentNumberTickets = $quantTickets
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({text: "X"});
        }
	})
}

function loadTicketsFromRootURL(items) {
	if (items.rootURL != undefined) {
		$rootURL = items.rootURL
	}
	$.ajax({
        type: "get",
        url: $rootURL + "/incident_list.do?XML&sysparm_query=incident_state=3^assignment_group=javascript:gs.getUser().getMyGroups()^%3B%5EORDERBYsys_updated_on&sysparm_view=",
		async: false,
        dataType: "xml",
        success: function(data) {
			var $allxml = $(data)
			var group = items.groups
			if ( hasValue(group) && group != "" ) {
				group = group.replace("#","")
				$allxml = removeOtherGroups($allxml, group)
			}
			var $quantTickets = $allxml.find("incident").length
			chrome.browserAction.setBadgeText({text: $quantTickets.toString()});
			var $ticketNumber = $allxml.find("incident").last().find("number")
			var $ticketDescription = $allxml.find("incident").last().find("short_description")
			var $numberUpdated = $quantTickets
			var $severity = $allxml.find("incident").last().find("severity")
			var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
			var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
			
			if (hasValue($currentNumberTickets) && ($numberUpdated > $currentNumberTickets) && ($numberUpdated > 0)) {	
				$ticketNumberGlobal = $ticketNumber.text()
				showNotification($ticketNumber.text(),$ticketDescription.text(), $severity.text() )
			} 
			$currentNumberTickets = $numberUpdated
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({text: "X"});
        }
	})
}

function loadWorkflowsFromRootURL(items) {
	if (items.rootURL != undefined) {
		$rootURL = items.rootURL
	}
	$.ajax({
        type: "get",
        url: $rootURL + "/u_inc_wftask_list.do?XML&sysparm_query=iwt_u_assigned_group%3Djavascript%3AgetMyGroupsAdvanced2(4)%5Eiwt_u_assigned_group%3Dd2c17b14e9082d007e9753d310d3051b%5Eiwt_u_task_status%3D1%5EORDERBYinc_u_updated_by_customer&sysparm_view=",
		async: false,
        dataType: "xml",
        success: function(data) {
			var $allxml = $(data)
			var $quantWorkflows = $allxml.find("u_inc_wftask").length
			console.log("quantWorkflows " + $quantWorkflows)
			$totalPending = $quantWorkflows + $currentNumberTickets
			console.log("$totalPending " + $totalPending)
			chrome.browserAction.setBadgeText({text: $quantWorkflows.toString() + "-" + $currentNumberTickets });
			var $WFNumber = $allxml.find("u_inc_wftask").last().find("inc_number")
			var $WFDescription = $allxml.find("u_inc_wftask").last().find("inc_short_description")
			var $numberUpdated = $quantWorkflows
			
			if (hasValue($currentNumberTickets) && ($quantWorkflows > $currentNumberWorkflows) && ($quantWorkflows > 0)) {	
				$ticketNumberGlobal = $WFNumber.text()
				showNotification($WFNumber.text(),$WFDescription.text())
			} 
			$currentNumberWorkflows = $quantWorkflows
			$currentNumberTotal = $currentNumberWorkflows + $currentNumberTickets
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({text: "X"});
        }
	})
}

function changeURLforGetXML(url) {
	index = url.indexOf("?")
	return url.slice(0,index+1) + "XML&" + url.slice(index+1,url.length)
}

function loadFromLink (items) {
	urlXML = changeURLforGetXML(items.specificURL)
	$.ajax({
        type: "get",
        url: urlXML,
        dataType: "xml",
		async: false,
        success: function(data) {
			var $allxml = $(data)
			var $quantTask = $allxml.find("incident").length
			
			if ($allxml.find("incident").length > 0) {
				$quantTask = $allxml.find("incident").length
			} else if ($allxml.find("u_interruption_of_service").length > 0) {
				$quantTask = $allxml.find("u_interruption_of_service").length
			} else if ($allxml.find("problem").length > 0){
				$quantTask = $allxml.find("problem").length
			} else if ($allxml.find("change_request").length > 0) {
				$quantTask = $allxml.find("change_request").length
			}
			
			var badgeText = $quantTask.toString() + "  " + $currentNumberTickets.toString()
			chrome.browserAction.setBadgeText({text: badgeText});
			var $ticketNumber = $allxml.find("incident").last().find("number")
			var $ticketDescription = $allxml.find("incident").last().find("short_description")
			var $numberUpdated = $quantTask
			
			if (hasValue($currentNumberTasks) && ($numberUpdated > $currentNumberTasks) && ($numberUpdated > 0)) {	
				$ticketNumberGlobal = $ticketNumber.text()
				showNotification($ticketNumber.text(),$ticketDescription.text())
			} 
			$$currentNumberTasks = $numberUpdated
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({text: "X X"});
        }
	})
}

function loadPendingTasks(items) {	
	if ($idleState != "locked") {
		if (items.searchunacceptedurl != undefined && items.searchunacceptedurl != "") {
			loadTickesFromSearchURL(items)
		} else {
			loadTicketsFromRootURL(items)
		}
		console.log("Checking follow workflow.....", items.followWorkflow)
		if (items.followWorkflow) {
			console.log("Follow Workflow")
			loadWorkflowsFromRootURL(items)
		} else	if (hasValue(items.specificURL) && items.specificURL != "") {
			loadFromLink(items)
		}
	}
}
  
chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
	}
	getGroupsSaved()
});

chrome.idle.onStateChanged.addListener(function (state) {
	$idleState = state
})