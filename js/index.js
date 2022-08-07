let port;

async function onConnectButtonClick() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        while (port.readable) {
            const reader = port.readable.getReader();

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        addSerial("Canceled\n");
                        break;
                    }
                    const inputValue = new TextDecoder().decode(value);
                    addSerial(inputValue);
                }
            } catch (error) {
                addSerial("[ERROR: Read] " + error + "\n");
            } finally {
                reader.releaseLock();
            }
        }
    } catch (error) {
        addSerial("[ERROR: Open] " + error + "\n");
    }
}

function addSerial(msg) {
    var textarea = document.getElementById('outputArea');
    textarea.value += msg;
    textarea.scrollTop = textarea.scrollHeight;
}

async function sendSerial() {
    var text = document.getElementById('sendInput').value;
    document.getElementById('sendInput').value = "";

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode(text + "\n"));
    writer.releaseLock();
}