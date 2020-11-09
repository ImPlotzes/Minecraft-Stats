async function loadEvents(){
	document.getElementById("toggle").addEventListener("click", toggleCollapse);
	document.getElementById("search").addEventListener("click", showStats);
	document.getElementById("player").addEventListener("keyup", enterName);
	

	let params = new URLSearchParams(window.location.search);
	let player = params.get('player');

	if(player == null) {
		document.getElementById("skin").style.opacity = "1";
		return;
	}

	document.getElementById("skin").style.transition = "opacity 0.5s ease 0.5s"
	document.getElementById("player").value = player;
	let main = document.getElementById("main");
	main.innerHTML = "";
	let title = document.getElementById("title");
	title.innerHTML = "Loading . . .";
	let loading = setInterval(() => {
		if(title.innerHTML.endsWith(". . .")){
			title.innerHTML = "Loading . .";
		} else {
			title.innerHTML = "Loading . . .";
		}
	}, 500);
	
	let data = await fetch("https://api.plotzes.ml?user=" + player);
	let json = await data.text();
	json = JSON.parse(json);
	showData(json, document.getElementById("main"));
	main.appendChild(document.createElement("hr"));
	for(let i = 0; i < 6; i++){
		let breakNode = document.createElement("br");
		main.appendChild(breakNode);
	}
	main.appendChild(document.createElement("hr"));
	addCollapsible("Raw Data", "<pre>" + JSON.stringify(json, null, 4) + "</pre>", document.getElementById("main"));
	document.getElementById("toggle").style.display = "block";
	document.getElementById("sidebar").style.width = "200px";
	document.getElementById("sidebar").style.backgroundColor = "#09171c";
	document.getElementById("sidebarContent").style.transform = "scale(1)";
	document.getElementById("sidebarContent").style.marginTop = "0";
	document.getElementById("player").style.width = "150px";
	document.getElementById("skin").style.opacity = "1";
	clearInterval(loading);
	document.getElementById("title").innerHTML = "Player name or UUID"
}

function enterName(event) {
	if(event.keyCode === 13) {
		event.preventDefault();
		document.getElementById("search").click();
	}
}

function showStats(){
	document.getElementById("skin").style.transition = "opacity 0.5s ease 0.5s"
	document.getElementById("toggle").style.display = "none";
	document.getElementById("sidebar").style.width = "100%";
	document.getElementById("sidebar").style.backgroundColor = "#0d2129";
	document.getElementById("sidebarContent").style.transform = "scale(1.75)";
	document.getElementById("sidebarContent").style.marginTop = "150px";
	document.getElementById("player").style.width = "290px";
	document.getElementById("skin").style.opacity = "0";
	document.body.style.overflow = "hidden";
	let player = document.getElementById("player").value;
	setTimeout(() => {
		if(player == "") {
			window.location.search = "";
		} else {
			window.location.search = "?player=" + encodeURIComponent(player);
		}
	}, 1100);
}

function showData(json, parent){
	let objectKeys = [];
	let stats = [];
	
	Object.keys(json).forEach(key => {
		let value = json[key];
		if(key == "uuid") {
			document.getElementById("skin").setAttribute("src", "https://crafatar.com/renders/body/" + value + "?scale=3");
		}
		if(typeof value === "object" && value !== null){
			objectKeys.push(key);
		} else {
			key = formatString(key);
			if(key.includes("Uuid") || key.includes("Username") || key.includes("Data") || key.includes("Value") || key.includes("Signature")){
				stats.push(key + ": <b>" + value + "</b><br>");
			} else {
				stats.push(key + ": <b>" + formatString(value) + "</b><br>");
			}
		}
	});

	stats.sort();
	stats.forEach(stat => {
		if(parent == document.getElementById("main")){
			let collapsible = document.getElementById("loneInfo");
			if(collapsible != undefined){
				collapsible.innerHTML += stat;
			} else {
				collapsible = document.createElement("p");
				collapsible.innerHTML = stat;
				collapsible.id = "loneInfo";
				document.getElementById("main").appendChild(collapsible)
			}
		} else {
			parent.innerHTML += stat;
		}
	});

	objectKeys.sort();
	objectKeys.forEach(key => {
		let value = json[key];
		if(Array.isArray(value) && value !== null){
			addCollapsible(formatString(key), formatArray(value), parent);
		} else {
			showData(value, addCollapsible(formatString(key), "", parent));
		}
	});
}

function formatString(string){
	string = JSON.stringify(string, null, 4);
	string = string.replace(/"/g, "");
	string = string.toLowerCase();
	string = string.replace(/_/g, " ");
	string = string.replace(/new/g, "");
	string = string.replace(/wizard/g, " Wizard")
	string = string.replace(/capture/g, "Wizards")
	string = string.replace(/^\s/, "");
	string = string.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
	if(isNaN(string) && !isNaN(Date.parse(string)) && string.includes("-")){
		string = new Date(string).toLocaleString() + " (Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone + ")"
	}
	return string;
}

function formatArray(array){
	let finalString = "<hr>";
	for(let i = 0; i < array.length; i++){
		if(typeof array[i] === "object"){
			Object.keys(array[i]).forEach(key => {
				if(key.includes("uuid") || key.includes("username") || key.includes("data") || key.includes("value") || key.includes("signature")){
					finalString += formatString(key) + ": <b>" + array[i][key] + "</b><br>";
				} else {
					finalString += formatString(key) + ": <b>" + formatString(array[i][key]) + "</b><br>";
				}
			});
		} else {
			finalString += "<b>" + formatString(array[i]) + "</b>";
		}
		finalString += "<hr>"
	}
	return finalString;
}

function addCollapsible(title, content, parent){
	let button = document.createElement("button");
	button.classList.add("collapsible");
	button.innerHTML = title;

	let contentDiv = document.createElement("div");
	contentDiv.classList.add("content");
	if(content != ""){
		contentDiv.innerHTML = content;
	}

	parent.appendChild(button);
	parent.appendChild(contentDiv);
	button.addEventListener("click", collapsibleEvent);
	return contentDiv;
}

function collapsibleEvent(){
	this.classList.toggle("active");
	let content = this.nextElementSibling;
	if(content.style.maxHeight){
		content.style.maxHeight = null;
		content.style.animation = null;
	} else {
		content.style.maxHeight = content.scrollHeight + "px";
		content.style.animation = "blink 0.7s ease-out 0.2s";
	}
	if(content.parentElement.classList != undefined && content.parentElement.classList.contains("content")){
		updateParentHeight(content);
	}
}

function toggleCollapse(){
	let toggle = document.getElementById("toggle");
	let close = toggle.innerHTML == "Close All" ? true : false;
	let collapsibles = document.getElementsByClassName("collapsible");
	if(close){
		for(let i = 0; i < collapsibles.length; i++){
			let collapsible = collapsibles[i];
			if(collapsible.classList.contains("active")){
				collapsible.classList.remove("active");
				let content = collapsible.nextElementSibling;
				content.style.maxHeight = null;
				content.style.animation = null;
			}
		}
	} else {
		for(let i = 0; i < collapsibles.length; i++){
			let collapsible = collapsibles[i];
			if(!collapsible.classList.contains("active")){
				collapsible.classList.add("active");
				let content = collapsible.nextElementSibling;
				content.style.maxHeight = content.scrollHeight + "px";
				content.style.animation = "blink 0.7s ease-out 0.2s";
				if(content.parentElement.classList != undefined && content.parentElement.classList.contains("content")){
					updateParentHeight(content);
				}
			}
		}
	}
	if(close){
		toggle.innerHTML = "Open All";
	} else {
		toggle.innerHTML = "Close All";
	}
}

function updateParentHeight(content) {
	let parent = content.parentElement;
	let contents = parent.getElementsByClassName("content");
	let contentHeight = 0;
	for(let i = 0; i < contents.length; i++){
		let height = parseInt(contents[i].style.maxHeight.replace("px", ""));
		if(!isNaN(height)){
			contentHeight += height;
		}
	}
	parent.style.maxHeight = (parent.scrollHeight + contentHeight) + "px";
	if(parent.parentElement.classList != undefined && parent.parentElement.classList.contains("content")){
		updateParentHeight(parent);
	}
}

window.onload = loadEvents;