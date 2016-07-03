var $rootURL
var $searchunacceptedurl

if ($rootURL == undefined) {$rootURL = "https://aomev.service-now.com"}

function loadOptions () {
	chrome.storage.sync.get(['groups','rootURL','searchunacceptedurl'], function (items) {
		if (items.rootURL != undefined) {
			$rootURL = items.rootURL
		}
		$searchunacceptedurl = items.searchunacceptedurl
		$("#groupname").val(items.groups);
	});
}

$(document).ready(function() {
	loadOptions()
	$("#status").hide();
	$("#allgroups").change(function() {
		if($(this).is(":checked")) {
			$("#groupname").val("")
			$("#groupname").prop('disabled', true);
		} else {
			$("#groupname").prop('disabled', false);
		}
	}); 
	
	$("#groupname").keyup(function(event){
		if(event.keyCode == 13){
			$("#save").click();
		}
	})
	
	$("#searchinput").keyup(function(event){
		if(event.keyCode == 13){
			$("#idsearch").click();
		}
	})
	
	$("#idunacceptedbutton").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/incident_list.do?sysparm_userpref_module=3357969fa14c71001d242169f15e70ac&sysparm_query=incident_state=3^assignment_group=javascript:gs.getUser().getMyGroups();^EQ"});
	})
	
	$("#idunacceptedworkflowbutton").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/u_inc_wftask_list.do?sysparm_query=iwt_u_assigned_group%3Djavascript%3AgetMyGroupsAdvanced2(4)%5Eiwt_u_assigned_group%3Dd2c17b14e9082d007e9753d310d3051b%5Eiwt_u_task_status%3D1%5EORDERBYinc_u_updated_by_customer&sysparm_view="});
	})
	
	$("#idacceptedbutton").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/incident_list.do?sysparm_userpref_module=e0d40a1fa14c71001d242169f15e70d2&sysparm_query=active=true^incident_stateNOT%20IN6,7^u_accepted_by=javascript:gs.getUserID();^EQ"});
	})
	
	$("#save").click(function (){
		save_options()
	})
	
	$("#newticket").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/incident.do?sysparm_stack=incident_list.do&sys_id=-1"});
	})
	$("#newproblem").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/problem.do?sysparm_stack=problem_list.do&sys_id=-1"});
	})
	$("#newcr").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/change_request.do?sysparm_stack=change_request_list.do&sys_id=-1&sysparm_query=active=true"});
	})
	$("#newios").click(function (){
		chrome.tabs.create({active: true, url: $rootURL + "/u_interruption_of_service.do?sysparm_stack=u_interruption_of_service_list.do&sys_id=-1"});
	})
	$("#idsearch").click(function (){
		var $input = $("#searchinput").val()
		var $urlTicketSearch = $rootURL
		if ($input.indexOf("CR") != -1) {
			$urlTicketSearch = $urlTicketSearch + "/change_request.do?sys_id=" +  $input	
		} else if ($input.indexOf("INC") != -1) {
			$urlTicketSearch = $urlTicketSearch + "/incident.do?sys_id=" +  $input
		} else if ($input.indexOf("PRB") != -1) {
			$urlTicketSearch = $urlTicketSearch + "/problem.do?sys_id=" +  $input
		} else if ($input.indexOf("IOS") != -1) {
			$urlTicketSearch = $urlTicketSearch + "/u_interruption_of_service.do?sys_id=" +  $input
		} else {
			$urlTicketSearch = $urlTicketSearch + "/textsearch.do?sysparm_no_redirect=true&sysparm_search=" + $input
		}
		  
		chrome.tabs.create({'url':$urlTicketSearch})
	})
});

function isEnableNotifications () {
	return $(".check").is(":checked")
}

function getGroups() {
	groups = $("#groupname").val()
	return groups
}

function save_options() {
	var notification = isEnableNotifications()
	var groups = getGroups()
	
	chrome.storage.sync.set({
		'groups' : groups
	}, function () {
		var status = document.getElementById('status');
		status.textContent = 'Options saved';
		$("#status").show();
		setTimeout(function () {
			$("#status").hide();
			status.textContent = '';
		}, 3000);
	});
}