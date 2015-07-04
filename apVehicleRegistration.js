(function (window, undefined) {
	var apVehicleRegstrationSearchLink = "https://aptransport.in/APCFSTONLINE/Reports/VehicleRegistrationSearch.aspx";
	var postSaverLink = "https://localhost:8443/PostSaver/postsaver";
	var outputDirectoryName = "D:/vehicleInformation";
	var fileSeparator = "/";
	var MIN_NUMBER = 1;
	var MAX_NUMBER = 9999;
	var MIN_CHAR_INDEX = 0;
	var MAX_CHAR_INDEX = 26;
	var stateParam = [
	    "__EVENTTARGET",
	    "__EVENTARGUMENT",
	    "__VIEWSTATE"
	];
	var vehicleParam = [
		"ctl00$OnlineContent$ddlInput",
		"ctl00$OnlineContent$txtInput",
		"ctl00$OnlineContent$btnGetData"
	];
	var resParam = [
		"ctl00_OnlineContent_tdRegnNo",
		"ctl00_OnlineContent_tdOwner",
		"ctl00_OnlineContent_tdAuthority",
		"ctl00_OnlineContent_tdMkrName"
	];

	var states = ["ap"];

	var rtos = {
		"ap" : [2, 3, 4, 5, 7, 16, 21, 26, 27, 30, 31, 35, 37]
	}

	var zeros = ["", "0", "00", "000", "0000"];
	var aToZ = ["", "a","b", "c", "d", "e", "f", "g", "h", 
	"i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", 
	"t", "u", "v", "w", "x", "y", "z"];
	var responseType = "document";
	var paramString = "";
	
	function generateStateParameters(dataLink, saverLink, responseCallback, 
									 state, rto, 
									 firstLetterStart, firstLetterEnd, 
									 secondLetterStart, secondLetterEnd, 
									 numberStart, numberEnd) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", dataLink, true);
	try {   
		    xhr.responseType = responseType;
		} catch(e) {
		}
		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 && xhr.status == 200) {
				var response = xhr.responseXML;
				paramString = vehicleParam[0] + "=" + "R" + "&" + vehicleParam[2] + "=" + "Get Data" + "&";
				for (var i=stateParam.length-1; i>=0; --i) {
					paramString += stateParam[i] + "=" + response.getElementById(stateParam[i]).value + "&";	
				}

				responseCallback(dataLink, saverLink,
							     state, rto, 
							     firstLetterStart, firstLetterEnd, 
							     secondLetterStart, secondLetterEnd, 
							     numberStart, numberEnd);
			}
		}
		xhr.send();
	}

	function displayVehicleDetails(dataLink, saverLink, 
								   state, rto, twoLetters,
								   data) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", dataLink, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		try {
		    xhr.responseType = responseType;
		} catch(e) {
		}
		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 && xhr.status == 200) {
				var response = xhr.responseXML;
				if(response.getElementById(resParam[0]) != null 
				   && response.getElementById(resParam[0]) != undefined) {
					var fileName = response.getElementById(resParam[0]).textContent;
					var vehicleDetails = fileName + ", " + 
						response.getElementById(resParam[1]).textContent + ", " +
						response.getElementById(resParam[2]).textContent + ", " + 
						response.getElementById(resParam[3]).textContent;

					/*console.log(vehicleDetails);*/

					//saving the vehicle details to my local server
					var saverXHR = new XMLHttpRequest();
					saverXHR.open("POST", saverLink, true);
					saverXHR.setRequestHeader("Content-type", 
						                      "application/x-www-form-urlencoded");
					var outputDir = outputDirectoryName + fileSeparator + state + fileSeparator + rto;
					if(twoLetters && twoLetters.length > 0) {
						outputDir += fileSeparator + twoLetters;
					}
					saverXHR.send("directoryName=" + outputDir +
								  "&fileName=" + fileName + 
								  "&data=" + vehicleDetails);
				}
		  	}
	  	}
		xhr.send(data);
	}

	function generate(dataLink, saverLink, 
					  state, rto, 
					  firstLetterStart, firstLetterEnd, 
					  secondLetterStart, secondLetterEnd, 
					  numberStart, numberEnd) {
		var i=0;
		var j=0;
		var k=0;
		for(i=firstLetterStart; i<=firstLetterEnd; ++i) {
			for(j=secondLetterStart; j<=secondLetterEnd; ++j) {
				for(k=numberStart; k<=numberEnd; ++k) {
					if(	i>=MIN_CHAR_INDEX && i<=MAX_CHAR_INDEX &&
						j>=MIN_CHAR_INDEX && j<=MAX_CHAR_INDEX &&
						k>=MIN_NUMBER && k<=MAX_NUMBER) {
						/*displayVehicleDetails(dataLink, saverLink,
										  state, rto, aToZ[i] + aToZ[j],
										  paramString + vehicleParam[1] + "=" + 
										  state + rto + aToZ[i] + aToZ[j] + zeros[4-(k+"").length] + k);*/
						setTimeout(displayVehicleDetails, 10, dataLink, saverLink,
										  state, rto, aToZ[i] + aToZ[j],
										  paramString + vehicleParam[1] + "=" + 
										  state + rto + aToZ[i] + aToZ[j] + zeros[4-(k+"").length] + k);
					}
				}
			}
		}
	}

	function generateAll(dataLink, saverLink,
						 state, rto) {
		generateStateParameters(dataLink, saverLink, generate,
								state, rto,
								0, 26,
								0, 26,
								1, 100);
	}


	function runner(dataLink, saverLink) {
		var i = 0;
		var j = 0;
		var currentState = undefined;
		for(i=states.length-1; i>=0; --i){
			currentState = states[i];
			var currentStateRtos = rtos[currentState];
			//for each rto in currentStateRtos
			for(j=currentStateRtos.length-1; j>=0; --j){
			/*for(j=0; j>=0; --j){*/
				var temp = currentStateRtos[j];
				var currentRto = zeros[2-(temp+"").length] + temp;
				//var areaCode = currentState + currentRto;
				generateAll(dataLink, saverLink, 
							currentState, currentRto);
			}
		}

	}

	runner(apVehicleRegstrationSearchLink, postSaverLink);
	
	/*var areaCode = "ap05";
	generateAll(apVehicleRegstrationSearchLink, areaCode);*/

})(window);