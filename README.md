# Serial port MIDI Bridge v0.0.4

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
下記のコマンドで使い方と使用可能なシリアルポートとMIDI OUTポートの一覧が表示されます。
~~~
> node rs-midi
~~~
実行結果（例）
~~~
Serial port MIDI Bridge v0.0.4 by nobu24

usage:
  node rs-midi [options] <Serial port Name> <MIDI OUT No.>

options:
  -D<delay time> Delay time (ms)
  -LCD           LCD enable
  -GS            GS Reset

Serial port list:
  [COM3] USB Serial Port (COM3)
  [COM5] com0com - serial port emulator (COM5)
  [COM6] com0com - serial port emulator (COM6)

MIDI OUT list:
  [0] Microsoft GS Wavetable Synth
  [1] SoundCanvasVA
~~~

受信するシリアルポート名とMIDI OUT listに表示されたポートの番号を指定して実行します。  
（例）シリアルポート[COM3]から受信して、MIDI OUT listの[1]に出力する場合
~~~
> node rs-midi COM3 1
~~~
シリアルポート名とMIDI OUT名が表示され、Ready!と表示されれば準備完了です。  
~~~
Serial port: COM3
MIDI OUT   : SoundCanvasVA
Delay time : 0 ms
Ready!
~~~
シリアルポートから受信したMIDI信号をMIDI OUTへ出力します。  

## オプション
下記のオプションを指定することができます。  

-D\<Delay time\>  
指定時間(ミリ秒)遅延して演奏します。  
（例）150ミリ秒遅延させる場合
~~~
> node rs-midi -D150 COM3 1
~~~

-LCD  
Roland SC-55などのLCD表示エクスクルーシブ・メッセージの表示をコンソール(CLI)で再現します。  

-GS  
起動時にGSリセットを送信します。  

## 仕様
・シリアルポートの通信は、下記固定です。  
　31250bps/ビット長8ビット/パリティなし/ストップビット1ビット/フロー制御無し  
・シリアルポート->MIDI OUTの一方向の通信しか今のところ実装していません。  
・下記のパッケージを利用しています。npmインストールを行うと下記パッケージおよび依存関係のモジュールがインストールされます。  
　[Node SerialPort](https://serialport.io/)  
　[WEBMIDI.js](https://webmidijs.org/)  
・下記のシリアルアダプタで動作確認しています。  
　DSD TECH SH-U09C2（FT232RLチップ）  
　DSD TECH SH-U09B（CP2102Nチップ）  

## リリースノート

### 0.0.4

シリアルポートの一覧表示を追加  
LCD表示オプション(-LCD)を追加  
GSリセットオプション(-GS)を追加  
MIDI出力をJZZ APIに変更  

### 0.0.3

遅延演奏オプション(-D)を追加

### 0.0.2

ランニングステータスなどを正しく処理できずMIDI OUTへ出力できなくなる問題を修正

### 0.0.1

初版
