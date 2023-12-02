const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {
    origin: [
      'http://localhost:4200',
      'https://afk-tracker-lcnl4.ondigitalocean.app',
    ],
  },
});

const port = process.env.PORT || 3000;

let trackers = [];
let intervals = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  console.log('trackers:update', trackers);
  io.emit('trackers:update', trackers);

  socket.on('tracker:add', (tracker) => {
    console.log('tracker:add', tracker);
    trackers = [...trackers, tracker];

    console.log('trackers:update', trackers);
    io.emit('trackers:update', trackers);
  });

  socket.on('tracker:start', (trackerName) => {
    console.log('tracker:start', trackerName);
    const tracker = trackers.find((tracker) => tracker.name === trackerName);
    tracker.running = true;

    console.log('trackers:update', trackers);
    io.emit('trackers:update', trackers);

    const trackerInterval = setInterval(() => {
      const tracker = trackers.find((tracker) => tracker.name === trackerName);
      tracker.time += 1000;

      console.log('trackers:update', trackers);
      io.emit('trackers:update', trackers);
    }, 1000);

    intervals[trackerName] = trackerInterval;
  });

  socket.on('tracker:stop', (trackerName) => {
    console.log('tracker:stop', trackerName);
    const tracker = trackers.find((tracker) => tracker.name === trackerName);
    tracker.running = false;
    clearInterval(intervals[trackerName]);
    delete intervals[trackerName];

    console.log('trackers:update', trackers);
    io.emit('trackers:update', trackers);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
});

httpServer.listen(port, () => console.log(`listening on port ${port}`));
