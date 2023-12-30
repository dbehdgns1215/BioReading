// bionicReadingScript.js (Background Script)
chrome
    .runtime
    .onMessage
    .addListener(function (request, sender, sendResponse) {
        console.log("Message received:", request.message);
        if (request.message === "activateBionicReading") {
            console.log("active2");
            chrome
                .tabs
                .query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    if (tabs.length > 0) {
                        chrome
                            .tabs
                            .sendMessage(tabs[0].id, {
                                message: "toggleBionicReading"
                            }, function (response) {
                                console.log(response);
                            });
                    } else {
                        console.error("No active tab found.");
                    }
                });
        } else if (request.message === "deactivateBionicReading") {
            console.log("active3");
            chrome
                .tabs
                .query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    if (tabs.length > 0) {
                        chrome
                            .tabs
                            .sendMessage(tabs[0].id, {
                                message: "untoggleBionicReading"
                            }, function (response) {
                                console.log(response);
                            });
                    } else {
                        console.error("No active tab found.");
                    }
                });
        }
        // Important: Return true to indicate that the sendResponse function will be
        // called asynchronously
        return true;
    });