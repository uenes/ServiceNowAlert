$("#urlfield").hide();
$("#clear").hide();

function getRootURL(searchunacceptedurl) {
	index = searchunacceptedurl.indexOf("/",10)
	return searchunacceptedurl.slice(0,index) 
}

// Saves options to chrome.storage
function save_options() {
	var url = $("#idurl").val()
	var rooturl = $("#idrooturl").val()
	var searchunacceptedurl = $("#idunacceptedcalls").val()
	
	if (isEmpty(rooturl) && isEmpty(searchunacceptedurl) ) {
		rooturl = "https://aomev.service-now.com"
	} else if (!(isEmpty(searchunacceptedurl)) )  {
		rooturl = getRootURL(searchunacceptedurl)
	}
	
	chrome.storage.sync.set({
		'specificURL' : url,
		'rootURL' : rooturl,
		'searchunacceptedurl' : searchunacceptedurl
	}, function () {
		showSuccessMessage("Options saved!")
	});
}

function isEmpty (value) {
	if ( value == undefined || value == "" || value == null || value == NaN) {
		return true
	}
	return false
}

function showSuccessMessage(message) {
	var status = document.getElementById('status');
	status.textContent = message;
	showMessageForWhile(3000)
}

function showMessageForWhile (millisec) {
	$("#status").show();
	setTimeout(function () {
		$("#status").hide();
		status.textContent = '';
	}, millisec);
}

function showMessageForMillisec(millisec) {
	$("#status").show();
	setTimeout(function () {
		$("#status").hide();
		status.textContent = '';
	}, millisec);
}

function clear_options() {
	chrome.storage.sync.clear();
	
	var status = document.getElementById('status');
	status.textContent = 'Options erased';
	$("#status").show();
	setTimeout(function () {
		$("#status").hide();
		status.textContent = '';
	}, 3000);
}

function restore_options() {
	chrome.storage.sync.get(['specificURL','rootURL','searchunacceptedurl'], function (items) {
		$("#idunacceptedcalls").val(items.searchunacceptedurl);
		$("#idurl").val(items.specificURL);
		if (items.rootURL != undefined) {
			$("#idrooturl").val(items.rootURL);
		} else {
			$("#idrooturl").val("https://aomev.service-now.com");
		}
		if ( isEmpty($("#idunacceptedcalls").val()) ) {
			$("#idunacceptedcalls").prop('readonly', true);
			$("#idrooturl").prop('readonly', false);
		} else {
			$("#idunacceptedcalls").prop('readonly', false);
			$("#idrooturl").prop('readonly', true);
		}
	});
}

$(document).ready(function() {
	$("#status").hide()
	restore_options()
	
	$("#searchpage").change(function() {
		var notifications
		if($(this).is(":checked")) {
			$("#idurl").val("")
			$("#idurl").prop('disabled', true);
		} else {
			$("#idurl").prop('disabled', false);
		}
	}); 
	
	$("#idrooturl").click(function (){
		$("#idunacceptedcalls").prop('readonly', true);
		$("#idunacceptedcalls").val("")
		$("#idrooturl").prop('readonly', false);
	})
	
	$("#idunacceptedcalls").click(function (){
		$("#idrooturl").prop('readonly', true);
		$("#idunacceptedcalls").prop('readonly', false);
	})
	
	$("#idunacceptedcalls").keyup(function(event){
		if(event.keyCode == 13){
			$("#save").click();
		}
	})
	$("#idrooturl").keyup(function(event){
		if(event.keyCode == 13){
			$("#save").click();
		}
	})
	$("#idurl").keyup(function(event){
		if(event.keyCode == 13){
			$("#save").click();
		}
	})
});

document.getElementById('save').addEventListener('click',save_options);
//document.getElementById('clear').addEventListener('click',clear_options);