// Serial port MIDI Bridge

'use strict';

const { WebMidi } = require("webmidi");
const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

let argv;

if (require.main === module) {
  main({ argv: process.argv })
}

function main(options) {
  argv = options.argv

  let onSuccess = function(){};
  if (argv.length > 3) {
    onSuccess = onEnabled;
  } else {
    onSuccess = onUsage;
  }
  WebMidi
    .enable({sysex: true})
    .then(onSuccess)
    .catch(err => console.log(err));
}

function onUsage() {
  // Usage
  console.log("rs-midi <Serial port Name> <MIDI OUT No.>\n");

  // Outputs
  console.log("MIDI OUT list:");
  let i = 0;
  WebMidi.outputs.forEach((output)=>{
    console.log("[" + i + "]", output.name);
    i++;
  });

  process.exit();
}

function onEnabled() {
  const portName = argv[2];
  const midiOut  = argv[3];

  // Serial
  console.log("Serial port:", portName);

  if (!(midiOut < WebMidi.outputs.length)) {
    process.exit(-1);
  }

  // Output
  console.log("MIDI OUT   :", WebMidi.outputs[midiOut].name);

  // Bridge
  console.log('Ready!');
  serialMIDIbridge(portName, midiOut);
}

function sendMIDI(midiOut, message) {
    try {
      WebMidi.outputs[midiOut].send(message);
    } catch (err) {
      return false;
    }
    return true;
}

function serialMIDIbridge(portName, midiOut) {
  let array = [];
  let time = new Date().getTime();

  const sp = new SerialPort({
    path: portName,
    baudRate: 31250,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
  });

  const parser = sp.pipe(new ByteLengthParser({length:1}));

  parser.on('data', (data)=>{
    if (new Date().getTime() - time > 1000) {
      array = [];
    }
    time = new Date().getTime();
    array.push(data[0]);
    if (sendMIDI(midiOut, array)) {
      array = [];
    }
  });
}

