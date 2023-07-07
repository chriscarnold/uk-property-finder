function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function runMainScript() {
    const { spawn } = require('child_process');
    const mainScript = spawn('node', ['main.js']);
  
    mainScript.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  
    mainScript.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  
    mainScript.on('close', (code) => {
      console.log(`Main script process exited with code ${code}`);
    });
}

function scheduleMainScript() {
    const minInterval = 45 * 60 * 1000; 
    const maxInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
    const interval = getRandomInterval(minInterval, maxInterval);
  
    console.log(`Next run in ${interval / 1000} seconds`);
  
    
    runMainScript();
  
    // Schedule the next run after the random interval
    setTimeout(scheduleMainScript, interval);
}

scheduleMainScript();
// ctrl c to exit