// bionicReading.js (Content Script)
document.addEventListener('DOMContentLoaded', function () {
    const myCheckbox = document.getElementById('switch');

    // Load the state of the checkbox when the popup is opened
    chrome
        .storage
        .sync
        .get('checkboxState', function (data) {
            myCheckbox.checked = data.checkboxState;
        });

    myCheckbox.addEventListener('change', function () {
        if (this.checked) {
            console.log(
                "Checkbox checked - Sending message:",
                {message: "activateBionicReading"}
            );
            chrome
                .runtime
                .sendMessage({
                    message: "activateBionicReading"
                }, function (response) {
                    console.log(response);
                });
            // Save the state of the checkbox when it is unchecked
            chrome
                .storage
                .sync
                .set({checkboxState: true});
        } else {
            console.log(
                "Checkbox unchecked - Sending message:",
                {message: "deactivateBionicReading"}
            );
            chrome
                .runtime
                .sendMessage({
                    message: "deactivateBionicReading"
                }, function (response) {
                    console.log(response);
                });
            // Save the state of the checkbox when it is unchecked
            chrome
                .storage
                .sync
                .set({checkboxState: false});
        }
    });
});

chrome
    .runtime
    .onMessage
    .addListener(function (request, sender, sendResponse) {
        if (request.message === "toggleBionicReading") {
            toggleBionicReadingOnWebpage(function (response) {
                sendResponse(response);
            });
        } else if (request.message === "untoggleBionicReading") {
            untoggleBionicReadingOnWebpage(function (response) {
                sendResponse(response);
            });
        }
        // Important: Return true to indicate that the sendResponse function will be
        // called asynchronously
        return true;
    });

function toggleBionicReadingOnWebpage(callback) {
    var textElements = document.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th'
    );

    textElements.forEach(function (element) {
        if (!element.dataset.originalHtml) {
            element.dataset.originalHtml = element.innerHTML;
        };
        applyBionicReadingToElement(element);
    });

    console.log("Bionic Reading enabled");

    if (typeof callback === 'function') {
        callback({message: "toggleBionicReading executed"});
    }
}

function untoggleBionicReadingOnWebpage(callback) {
    var textElements = document.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th'
    );

    textElements.forEach(function (element) {
        // Check if the element has original HTML stored
        if (element.dataset.originalHtml) {
            // Restore original HTML
            element.innerHTML = element.dataset.originalHtml;
            delete element.dataset.originalHtml;
            element
                .classList
                .remove('bionicReadingApplied');
        }
    });

    console.log("Bionic Reading disabled");

    if (typeof callback === 'function') {
        callback({message: "untoggleBionicReading executed"});
    }
}

function processTextNodes(node, callback) {
    for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 3) {
            callback(child);
        } else if (child.nodeType === 1) {
            processTextNodes(child, callback);
        }
    }
}

function applyBionicReadingToElement(element) {
    if (element.classList.contains('bionicReadingApplied')) {
        return;
    }

    // Save original HTML
    element.dataset.originalHtml = element.innerHTML;

    var clone = element.cloneNode(true);
    element
        .classList
        .add('bionicReadingApplied');

    processTextNodes(clone, function (textNode) {
        var words = textNode
            .nodeValue
            .split(/\s+/);
        var newHtml = words
            .map(word => {
                var splitIndex = Math.ceil(word.length / 2);
                var firstHalf = word.slice(0, splitIndex);
                var secondHalf = word.slice(splitIndex);
                return `<span style="font-weight: bold;">${firstHalf}</span>${secondHalf}`;
            })
            .join(' ');

        var div = document.createElement('div');
        div.innerHTML = newHtml;
        while (div.firstChild) {
            textNode
                .parentNode
                .insertBefore(div.firstChild, textNode);
        }
        textNode
            .parentNode
            .removeChild(textNode);
    });

    element
        .parentNode
        .replaceChild(clone, element);
}

function processTextNodes(node, callback) {
    // 이 노드가 텍스트 노드인 경우
    if (node.nodeType === Node.TEXT_NODE) {
        callback(node)
        // 이 노드가 텍스트 노드가 아닌 경우);
    } else {
        var children = node.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
            processTextNodes(children[i], callback);
        }
    }
}

function getRandomFontWeight() {
    var weights = ['bold'];
    var randomIndex = Math.floor(Math.random() * weights.length);
    return weights[randomIndex];
}