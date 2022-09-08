// for serial port
let port, readlock;
let receivedCount = 0; 

// for Serial setting sampleing
let nowValue = 0;
let nowSamplingRate = 0;

// for get using element
const outputArea = document.getElementById('outputArea');

// for outputArea
const outputAreaBuffArr = []
const outputAreaBuffLineNumber = 100;

// for check sampling rate
let startTime = Date.now();
let endTime = Date.now();

// for record
let recardArr = []

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
                    addOutputArea(inputValue);

                    // readbuffにとりあえずいれて、改行があった場合、値を取り出す処理を回す
                    readbuff+=inputValue;
                    while (readbuff.includes("\n")) {
                        const n = readbuff.indexOf('\n')
                        const v = readbuff.substring(0, n)//vが値
                        readbuff = readbuff.substring(n+1, readbuff.length)//残りの全てをreadbuffに詰めなおす
                        addRecord(v)
                        nowValue = v

                        const countRateFactor = 300;
                        receivedCount = (receivedCount + 1) % countRateFactor;
                        if (receivedCount === 0) {
                            endTime = Date.now();
                            updateSamplingRateSpan("- ReceivedSamplingRate: "+String(Math.round(countRateFactor/(endTime-startTime)*1000))+"[Hz],")
                            startTime = endTime;
                        }
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

function updateSamplingRateSpan(v){
    document.getElementById("samplingRateSpan").innerHTML = v
}

async function sendSerial() {
    const text = document.getElementById('sendInput').value;
    document.getElementById('sendInput').value = "";

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode(text + "\n"));
    writer.releaseLock();
}

async function closePort(){
    readlock = false;
}

// -------- Recording ----------

function onRecording(){
  const rb = document.getElementById('recordingBtn')
  if (rb.innerText === "Recording") {
    clearRecord()
    rb.innerText = "Finish Recording"
    rb.classList.add("btn-danger")
    rb.classList.remove("btn-success")
  } else {
    saveRecord()
    rb.innerText = "Recording"
    rb.classList.add("btn-success")
    rb.classList.remove("btn-danger")
  }
}

function clearRecord(){
  recardArr = []
}

function addRecord(s){
  recardArr.push(s)
}

function saveRecord(){
  // get datetime
  let filename = new Date().toJSON()+".txt"

  // save
  let blob = new Blob(recardArr,{type:"text/plan"});
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click(); 
}

// -------- PlotGraph ----------

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
