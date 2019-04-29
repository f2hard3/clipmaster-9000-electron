const { clipboard, ipcRenderer, shell } = require('electron');

const clippingsList = document.getElementById('clippings-list');
const copyFromClipboardButton = document.getElementById('copy-from-clipboard');

const createClippingElement = clippingText => {
    const clippingElement = document.createElement('article');

    clippingElement.classList.add('cippings-list-item');

    clippingElement.innerHTML = `
        <div class="clipping-text" disabled="true"></div>
        <div class="clipping-controls">
            <button class="copy-clipping">&rarr; Clipboard</button>
            <button class="publish-clipping">Publish</button>
            <button class="remove-clipping">Remove</button>
        </div>
    `;

    clippingElement.querySelector('.clipping-text').innerText = clippingText;

    return clippingElement;
};

const addClippingTolist = () => {
    const clippingElement = createClippingElement(clipboard.readText());
    clippingsList.prepend(clippingElement);
};

copyFromClipboardButton.addEventListener('click', addClippingTolist);

clippingsList.addEventListener('click', event => {
    const hasClass = className => event.target.classList.contains(className);

    const clippingListItem = getButtonParent(event);

    if (hasClass('remove-clipping')) removeClipping(clippingListItem);
    if (hasClass('copy-clipping'))
        writeToClipboard(getClippingText(clippingListItem));
    if (hasClass('publish-clipping'))
        publishClipping(getClippingText(clippingListItem));
});

const removeClipping = target => target.remove();

const getButtonParent = ({ target }) => target.parentNode.parentNode;

const getClippingText = clippingListItem =>
    clippingListItem.querySelector('.clipping-text').innerText;

const writeToClipboard = clippingText => clipboard.writeText(clippingText);

const request = require('request').defaults({
    url: 'https://cliphub.glitch.me/clippings',
    headers: { 'User-Agent': 'Clipmaster 9000' },
    json: true
});

const publishClipping = clipping =>
    request.post({ json: { clipping } }, responeHandler);

const responeHandler = (error, response, body) => {
    if (error)
        return new Notification('Error Publishing Your Clipping', {
            body: JSON.parse(error).message
        });

    const url = body.url;
    const notification = new Notification('Your Clipping Has Been Published', {
        body: `Click to open ${url} in your browser.`
    });

    notification.onclick = () => {
        shell.openExternal(url);
    };

    clipboard.writeText(url);
};

ipcRenderer.on('create-new-clipping', () => {
    addClippingTolist();
    new Notification('Clipping Added', {
        body: `${clipboard.readText()}`
    })
});

ipcRenderer.on('write-to-clipboard', () => {
    const clipping = clippingsList.firstChild;
    writeToClipboard(getClippingText(clipping));
});

ipcRenderer.on('publish-clipping', () => {
    const clipping = clippingsList.firstChild;
    publishClipping(getClippingText(clipping));
});
