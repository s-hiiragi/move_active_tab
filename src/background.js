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
	let createWindows = promisify(chrome.windows.create);

	function createWindowWithTabs(tabIds) {
		return createWindows({
			tabId: tabIds[0]
		}).then(function(win){
			console.log('createWindowWithTabs', win);
			moveTabsToWindow(tabIds.slice(1), win.id);
		});
	}

	function moveTabsToWindow(tabIds, windowId) {
		if (tabIds.length == 0) {
			return;
		}
		moveTabs(tabIds, {
			windowId: windowId,
			index: -1
		}).then(function(){
			console.log('tabs.move');
			return updateWindows(windowId, {
				focused: true
			});
		}).then(function(){
			console.log('window.update');
			return updateTabs(tabIds.slice(-1)[0], {
				active: true
			});
		}).then(function(){
			console.log('tabs.update id=' + tabIds.slice(-1)[0]);
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
				// If there are another window, move tabs to the window
				moveTabsToWindow(tabs.map(t => t.id), destWindow.id);
			} else {
				// If there are no other windows, create a window with the first tabs
				// and move rest tabs to the window
				createWindowWithTabs(tabs.map(t => t.id));
			}
		})
		break;
	default:
		break;
	}
});
