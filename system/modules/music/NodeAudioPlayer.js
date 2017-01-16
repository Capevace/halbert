const EventEmitter = require('events');
const Speaker = require('speaker');
const lame = require('lame');
const http = require('http');

class NodeAudioPlayer {
  constructor () {
    this.sourceList = [];
    this.decoder = null;
    this.format = null;
    this.speaker = null;
    this.httpResponse = null;
    this.currentIndex = 0;
    this.playing = false;
    this.eventEmitter = new EventEmitter();
  }

  addSource(sources) {
    if (Array.isArray(sources)) {
      this.urlList = [
        ...this.urlList,
        ...sources
      ];
    } else {
      this.sourceList = [
        ...this.sourceList,
        sources
      ];
    }
  }

  removeSource(index) {
    this.sourceList = this.sourceList.splice(index, 1);
  }

  clearSourceList() {
    this.sourceList = [];
  }

  play(index) {
    if (this.playing) {
      this.stop();
    }

    if (index >= this.sourceList.length) {
      console.error(`Source at index ${index} doesn't exist.`);
      return false;
    }

    index = this.currentIndex = index || (this.currentIndex >= this.sourceList.length ? 0 : this.currentIndex);

    const source = this.sourceList[index]
      .replace('https://', 'http://');

    this.decoder = new lame.Decoder()
      .on('format', format => this._pipeToSpeaker(format))

    http.get(source, (res) => {
      this.httpResponse = res;
      this.httpResponse.on('data', (data) =>  {
        if (this.decoder) {
          this.decoder.write(data);
        } else {
          console.log('no decoder');
        }
      });
    });

    console.log('Playing');
    this.playing = true;
    this.eventEmitter.emit('play', this.playing);
    this.eventEmitter.emit('playstate', this.playing);

    return true;
  }

  next() {
    this.stop();
    this.play(this.currentIndex + 1);
  }

  togglePlay() {
    if (this.playing) {
      this.pause();
    } else {
      this.resume();
    }
  }

  resume() {
    if (!this.playing && this.decoder) {
      console.log('Resuming');
      this._pipeToSpeaker(this.format);
      this.playing = true;
      this.eventEmitter.emit('resume', this.playing);
      this.eventEmitter.emit('playstate', this.playing);
    }
  }

  pause() {
    if (this.playing) {
      console.log('Pausing');
      this.speaker.end();
      this.playing = false;
      this.eventEmitter.emit('pause', this.playing);
      this.eventEmitter.emit('playstate', this.playing);
    }
  }

  stop() {
    console.log('Stopping');
    if (this.speaker && this.decoder && this.playing) {
      this.speaker.end();
      this.decoder.unpipe();
      this.decoder = null;
      this.playing = false;

      if (this.httpResponse)
        this.httpResponse.destroy();

      this.eventEmitter.emit('stop', this.playing);
      this.eventEmitter.emit('playstate', this.playing);
    }
  }

  _pipeToSpeaker(format) {
    console.log(format);
    this.format = format || this.format;

    try {
      this.speaker = new Speaker(this.format);
      this.decoder.pipe(this.speaker);
    } catch (e) {
      console.error('Speaker failed... retrying...', e);
      setTimeout(() => this._pipeToSpeaker(format), 1000);
    }
  }

  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }
}

module.exports = NodeAudioPlayer;
