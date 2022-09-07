// for serial port
let port, readlock;
let receivedCount = 0; 

// for Serial setting sampleing
const freq=200; //[Hz]
let nowValue = 0;

// for get using element
const outputArea = document.getElementById('outputArea');

// for outputArea
const outputAreaBuffArr = []
const outputAreaBuffLineNumber = 100;

// for check sampling rate
let startTime = Date.now();
let endTime = Date.now();

async function onConnectButtonClick() {
    try {
        readlock = true;
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: document.getElementById('baudrate').value });

        while (port.readable) {
            const reader = port.readable.getReader();

            try {
                let readbuff = "";
                while (true && readlock) {
                    const { value, done } = await reader.read();
                    if (done) {
                        addOutputArea("Canceled\n");
                        break;
                    }
                    const inputValue = new TextDecoder().decode(value);

                    // readbuffにとりあえずいれて、改行があった場合、値を取り出す処理を回す
                    readbuff+=inputValue;
                    while (readbuff.includes("\n")) {
                        const n = readbuff.indexOf('\n')
                        const v = readbuff.substring(0, n)//vが値
                        readbuff = readbuff.substring(n+1, readbuff.length)//残りの全てをreadbuffに詰めなおす
                        addOutputArea(v);
                        nowValue = v
                        // receivedCount = (receivedCount + 1) % freq;
                        // if (receivedCount === 0) {
                        //     endTime = Date.now();
                        //     addOutputArea("duration:"+String(endTime-startTime)+"[msec],")
                        //     startTime = endTime;
                        // }
                    }
                }
            } catch (error) {
                addOutputArea("[ERROR: Read] " + error + "\n");
            } finally {
                await reader.releaseLock();
                await port.close();
                addOutputArea("Closed port.\n")
                break;
            }
        }
    } catch (error) {
        addOutputArea("[ERROR: Open] " + error + "\n");
    }
}

function addOutputArea(msg) {
  outputAreaBuffArr.push(msg)
  while (outputAreaBuffArr.length > outputAreaBuffLineNumber) {
    outputAreaBuffArr.shift()
  }
  outputArea.value = outputAreaBuffArr.join('');
  outputArea.scrollTop = outputArea.scrollHeight;
}

async function sendSerial() {
    var text = document.getElementById('sendInput').value;
    document.getElementById('sendInput').value = "";

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode(text + "\n"));
    writer.releaseLock();
}

async function closePort(){
    readlock = false;
}

const config = {
  type: 'line',
  // type: 'scatter',
  data: {
    datasets: [
      {
        label: 'data1',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        // borderDash: [8, 4],
        fill: false,
        data: []
      },
      // {
      //   label: 'data2',
      //   backgroundColor: 'rgba(54, 162, 235, 0.5)',
      //   borderColor: 'rgb(54, 162, 235)',
      //   cubicInterpolationMode: 'monotone',
      //   fill: true,
      //   data: []
      // }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 10,
          refresh: 5,
          frameRate: 30,
          onRefresh: chart => {
            chart.data.datasets.forEach(dataset => {
              dataset.data.push({
                x: Date.now(),
                y: nowValue
              });
            });
          }
        }
      }
    },
    elements: {
      point:{
        radius: 0
      }
    }
  }
};

const myChart = new Chart(
  document.getElementById('plotarea'),
  config
);
