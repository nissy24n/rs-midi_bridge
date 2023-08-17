'use strict';

const { WebMidi } = require("webmidi");
const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

let argv;
let delay = 0;

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
  console.log("Serial port MIDI Bridge v0.0.3 by nobu24\n");
  console.log("usage:");
  console.log("  node rs-midi [options] <Serial port Name> <MIDI OUT No.>\n");
  console.log("options:");
  console.log("  -D<delay time>\tDelay time (ms)\n");

  // Outputs
  console.log("MIDI OUT list:");
  let i = 0;
  WebMidi.outputs.forEach((output)=>{
    console.log("  [" + i + "]", output.name);
    i++;
  });

  process.exit();
}

function onEnabled() {
  let st = 2;

  // Options
  if (argv[st].match(/^-D[0-9]+/g)) {
    delay = parseInt(argv[st].slice(2));
    st++;
  }

  const portName = argv[st];
  const midiOut  = argv[st + 1];

  // Serial
  console.log("Serial port:", portName);

  if (!(midiOut < WebMidi.outputs.length)) {
    process.exit(-1);
  }

  // Output
  console.log("MIDI OUT   :", WebMidi.outputs[midiOut].name);

  // Delay
  console.log("Delay time :", delay, "ms");

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
  let st = 0;
  let len = 0;
  let mes = [];

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
    if (data[0] & 0b10000000) {
      if ((data[0] & 0b11111000) == 0b11111000) {
        if (delay == 0) {
          sendMIDI(midiOut, [data[0]]);
        } else {
          setTimeout(sendMIDI, delay, midiOut, [data[0]]);
        }
        return;
      }
      if (st == 0xf0 && mes.length > 0) {
        mes.push(0xf7);
        if (delay == 0) {
          sendMIDI(midiOut, mes);
        } else {
          setTimeout(sendMIDI, delay, midiOut, mes);
        }
        if (data[0] == 0xf7) {
          mes = [];
          return;
        }
      }
      st = data[0];
      mes = [st];
    } else {
      if (st && mes.length == 0) {
        mes = [st];
      }
      mes.push(data[0]);
    }

    switch (mes[0] & 0b11110000) {
      case 0x80:
      case 0x90:
      case 0xa0:
      case 0xb0:
      case 0xe0:
        len = 2;
        break;
      case 0xc0:
      case 0xd0:
        len = 1;
        break;
      case 0xf0:
        if (mes[0] == 0xf0) {
          len = -1;
        } else
        if ((mes[0] & 0b00001000) == 0) {
          if (mes[0] == 0xf1 || mes[0] == 0xf3) {
            len = 1;
          } else
          if (mes[0] == 0xf2) {
            len = 2;
          } else {
            len = 0;
          }
        } else {
          len = 0;
        }
        break;
      default:
        len = 0;
        break;
    }

    if (mes.length == len + 1) {
      if (delay == 0) {
        sendMIDI(midiOut, mes);
      } else {
        setTimeout(sendMIDI, delay, midiOut, mes);
      }
      mes = [];
    }
  });
}

