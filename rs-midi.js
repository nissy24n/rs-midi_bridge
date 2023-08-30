'use strict';

const { WebMidi } = require("webmidi");
const { JZZ } = require('jzz');
const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

let argv;
let delay = 0;
let isGS = false;
let isLCD = false;
let timLCD1 = null;
let timLCD2 = null;
const ttl = "Serial port MIDI Bridge v0.0.4";
const LCD = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

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
  process.stdout.write(ttl + " by nobu24\n\n");
  process.stdout.write("usage:\n");
  process.stdout.write("  node rs-midi [options] <Serial port Name> <MIDI OUT No.>\n\n");
  process.stdout.write("options:\n");
  process.stdout.write("  -D<delay time> Delay time (ms)\n");
  process.stdout.write("  -LCD           LCD enable\n");
  process.stdout.write("  -GS            GS Reset\n");
  process.stdout.write("\n");

  // Serial port list
  process.stdout.write("Serial port list:\n");
  SerialPort.list().then((list)=>{
    list.forEach((port)=>{
      process.stdout.write("  [" + port.path + "] " + port.friendlyName + "\n");
    });
    process.stdout.write("\n");

    // MIDI OUT list
    process.stdout.write("MIDI OUT list:\n");
    let i = 0;
    WebMidi.outputs.forEach((output)=>{
      process.stdout.write("  [" + i + "] " + output.name + "\n");
      i++;
    });

    process.exit();
  })
  .catch(err => console.log(err));
}

function onEnabled() {
  let st = 2;

  // Options
  while (true) {
    // -D
    if (argv[st].match(/^-D[0-9]+/g)) {
      delay = parseInt(argv[st].slice(2));
      st++;
    } else
    // -LCD
    if (argv[st].match(/^-LCD/g)) {
      isLCD = true;
      st++;
    } else
    // -GS
    if (argv[st].match(/^-GS/g)) {
      isGS = true;
      st++;
    } else {
      break;
    }
  }

  const portName = argv[st];
  const midiOut  = argv[st + 1];

  // Serial
  process.stdout.write("Serial port: " + portName + "\n");

  if (!(midiOut < WebMidi.outputs.length)) {
    process.exit(-1);
  }

  // Output
  process.stdout.write("MIDI OUT   : " + WebMidi.outputs[midiOut].name + "\n");

  // Delay
  process.stdout.write("Delay time : " + delay + " ms\n");

  // �J�[�\����\��
  process.stdout.write("\x1b[?25l");
  process.on("exit", () => {
    process.stdout.write("\x1b[0m");
    process.stdout.write("\x1b[?25h");
  });
  process.on("SIGINT", () => process.exit());

  // Bridge
  process.stdout.write("Ready!\n");
  serialMIDIbridge(portName, WebMidi.outputs[midiOut].name);

  // LCD
  if (isLCD) {
    initLCD();
  }
}

function initLCD() {
  // LCD������
  process.stdout.write("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");//17�s���m��
  process.stdout.write("\x1b[1m");//����
  process.stdout.write("\x1b[38;2;0;0;0m");//�����F

  setLCDstr(ttl);
  setLCDdot(LCD);
}

function setLCDstr(data) {
  // LCD������\��
  process.stdout.write("\x1b[17F");
  process.stdout.write("\x1b[48;2;240;131;0m");//�w�i�F
  const spcLen = 64-data.length;
  process.stdout.write(" ".repeat(spcLen/2)+data+" ".repeat(spcLen/2+spcLen%2));
  process.stdout.write("\x1b[17E");
}

function setLCDdot(data) {
  // LCD�h�b�g�\��
  process.stdout.write("\x1b[16F");
  process.stdout.write("\x1b[48;2;216;118;0m");//�w�i�F
  let cl = 0;
  for (let i = 0;i < 16;i++) {
    for (let j = 0;j < 16;j++) {
      if (data[i][j] == 0) {
        if (cl == 1) {
          process.stdout.write("\x1b[48;2;216;118;0m");
        }
        process.stdout.write("    ");
        cl = 0;
      } else {
        if (cl == 0) {
          process.stdout.write("\x1b[48;2;0;0;0m");
        }
        process.stdout.write("    ");
        cl = 1;
      }
    }
    process.stdout.write("\x1b[1E");
  }
}

function excLCD(data) {
  if (data[0] == 0xf0 && data[1] == 0x41 && data[2] == 0x10 && data[3] == 0x45 && data[4] == 0x12 && data[5] == 0x10 && (data[6] == 0x00 || data[6] == 0x01) && data[7] == 0x00 && data[data.length-1] == 0xf7) {
    // �f�[�^�E�Z�b�g1DT1
    let sum = 0;
    for (let i = 5;i < data.length-2;i++) {
      sum = sum + data[i];
    }
    if (128-(sum%128) == data[data.length-2]) {
      // ex check sum ok.
      if (data[6] == 0x00) {
        // letter
        clearTimeout(timLCD1);
        let str = "";
        for (let j = 8;j < data.length-2;j++) {
          if (data[j] < 0x20 || data[j] > 0x7f) {
            break;
          }
          str = str + String.fromCharCode(data[j]);
        }
        setLCDstr(str);
        timLCD1 = setTimeout(setLCDstr, 3000, ttl);
      } else {
        // dot
        clearTimeout(timLCD2);
        let dot = new Array(16);
        for (let j = 0;j < 4;j++) {
          for (let k = 0;k < 16;k++) {
            if (j == 0) {
              dot[k] = new Array(16);
            }
            let mask = 0b00010000;
            for (let l = 0;l < 5;l++) {
              if ((data[8+k+j*16] & mask) == mask) {
                dot[k][l+j*5] = 1;
              } else {
                dot[k][l+j*5] = 0;
              }
              mask = mask >>> 1;
              if (j == 3) {
                break;
              }
            }
          }
        }
        setLCDdot(dot);
        timLCD2 = setTimeout(setLCDdot, 3000, LCD);
      }
    }
  }
}

function sendMIDI(port, message) {
  try {
    port.send(message);
  } catch (err) {
    return false;
  }

  // LCD
  if (isLCD) {
    excLCD(message);
  }

  return true;
}

function GSreset(mo) {
  // GS���Z�b�g
  sendMIDI(mo, [0xF0,0x41,0x10,0x42,0x12,0x40,0x00,0x7F,0x00,0x41,0xF7]);
}

function serialMIDIbridge(portName, midiOutName) {
  let st = 0;
  let len = 0;
  let mes = [];

  const mo = JZZ().openMidiOut(midiOutName);

  // ���Z�b�g
  if (isGS) {
    GSreset(mo);
  }

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
          sendMIDI(mo, [data[0]]);
        } else {
          setTimeout(sendMIDI, delay, mo, [data[0]]);
        }
        return;
      }
      if (st == 0xf0 && mes.length > 0) {
        mes.push(0xf7);
        if (delay == 0) {
          sendMIDI(mo, mes);
        } else {
          setTimeout(sendMIDI, delay, mo, mes);
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
        sendMIDI(mo, mes);
      } else {
        setTimeout(sendMIDI, delay, mo, mes);
      }
      mes = [];
    }
  });
}

