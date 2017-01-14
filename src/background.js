chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);

	function promisify(fn) {
		return function(){
			let args = Array.prototype.slice.call(arguments);
			return new Promise(function(resolve){
				fn.apply(this, args.concat(resolve));
			});
		}
	}

	let queryTabs = promisify(chrome.tabs.query);
	let getAllWindows = promisify(chrome.windows.getAll);
	let updateWindows = promisify(chrome.windows.update);
	let updateTabs = promisify(chrome.tabs.update);
	let moveTabs = promisify(chrome.tabs.move);

	function moveTabsToWindow(tabs, windowId) {
		if (tabs.length == 0) {
			return;
		}
		moveTabs(tabs.map((e) => e.id), {
			windowId: windowId,
			index: -1
		}).then(function(){
			console.log('tabs.move');
			return updateWindows(windowId, {
				focused: true
			});
		}).then(function(){
			console.log('window.update');
			return updateTabs(tabs.slice(-1)[0].id, {
				active: true
			});
		}).then(function(){
			console.log('tabs.update id=' + tabs.slice(-1)[0].id);
			return queryTabs({
				currentWindow: true
			});
		})
	}
	
	switch (command) {
	case "move_tab":
		queryTabs({
			active: true,
			currentWindow: true
		}).then(function(tabs){
			console.log('tabs.query', tabs);
			return getAllWindows().then(function(windows){
				console.log('window.getAll', windows);
				return [windows, tabs];
			});
		}).then(function (wintabs) {
			let windows = wintabs[0], tabs = wintabs[1];
			let destWindow = null;
			for (let i=0; i < windows.length; i++) {
				if (!windows[i].focused) {
					destWindow = windows[i];
					break;
				}
			}
			if (destWindow) {
				moveTabsToWindow(tabs, destWindow.id);
			}
		})
		break;
	default:
		break;
	}
});
