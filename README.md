# Serial port MIDI Bridge

## 概要
シリアルポートから受信したMIDI信号をMIDIポートへ出力するプログラムです。  
X68000ZなどのRS-MIDI（31250bps）の出力を受信してMIDIポートに出力できます。

## インストール
実行にはNode.jsが必要です。下記からダウンロードしてインストールしてください。  
https://nodejs.org/ja

本プロジェクトをGitクローンまたはzipダウンロードし、展開したフォルダ配下で下記コマンドを実行してください。実行に必要なモジュールがインストールされます。
~~~
> npm i
~~~
※Windowsで動作確認しています。macOSやLinuxでも問題ないと思いますが未確認です。  

## 使い方
下記のコマンドで使い方と使用可能なMIDI OUTポート一覧が表示されます。
~~~
> node rs-midi
~~~
実行結果（例）
~~~
rs-midi <Serial port Name> <MIDI OUT No.>

MIDI OUT list:
[0] Microsoft GS Wavetable Synth
[1] SoundCanvasVA
~~~

受信するシリアルポート名とMIDI OUT listに表示されたポートの番号を指定して実行します。  
（例）シリアルポートCOM3から受信して、MIDI OUT listの[1]に出力する場合
~~~
> node rs-midi COM3 1
~~~
シリアルポート名とMIDI OUT名が表示され、Ready!と表示されれば準備完了です。  
~~~
Serial port: COM3
MIDI OUT   : SoundCanvasVA
Ready!
~~~
シリアルポートから受信したMIDI信号をMIDI OUTへ出力します。  

## 仕様
・シリアルポートの通信は、下記固定です。  
　31250bps/ビット長8ビット/パリティなし/ストップビット1ビット/フロー制御無し  
・シリアルポート->MIDI OUTの一方向の通信しか今のところ実装していません。  
・下記のパッケージを利用しています。npmインストールを行うと下記パッケージおよび依存関係のモジュールがインストールされます。  
　[Node SerialPort](https://serialport.io/)  
　[WEBMIDI.js](https://webmidijs.org/)  

## リリースノート

### 0.0.2

ランニングステータスなどを正しく処理できずMIDI OUTへ出力できなくなる問題を修正

### 0.0.1

初版
