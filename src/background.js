chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);
	
	switch (command) {
	case "move_tab":
		let queryInfo = {
			active: true,
			currentWindow: true
		};
		chrome.tabs.query(queryInfo, function(tabs){
			console.log('tabs.query', tabs);
			chrome.windows.getAll(function(windows){
				console.log('window.getAll', windows);
				
				let destWindow = null;
				for (let i=0; i < windows.length; i++) {
					if (!windows[i].focused) {
						destWindow = windows[i];
						break;
					}
				}
				if (destWindow) {
					let moveProperties = {
						windowId: destWindow.id,
						index: -1
					};
					chrome.tabs.move(tabs.map((e) => e.id), moveProperties, function(){
						console.log('tabs.move');
						let updateInfo = {
							focused: true
						};
						chrome.windows.update(destWindow.id, updateInfo, function(){
							console.log('window.update');
							let updateProperties = {
								active: true
							};
							chrome.tabs.update(tabs.slice(-1)[0].id, updateProperties, function(){
								console.log('tabs.update id=' + tabs.slice(-1)[0].id);
								
								let queryInfo = {
									currentWindow: true
								};
								chrome.tabs.query(queryInfo, function(tabs){
									console.log('tabs.query', tabs);
									
									
								});
							});
						});
					});
				}
			});
		});
		break;
	default:
		break;
	}
});
