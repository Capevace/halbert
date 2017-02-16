const NodeAudioPlayer = require('./NodeAudioPlayer');
const player = new NodeAudioPlayer();
const { playMusic, cacheSong, getSong, songIsCached } = require('./play-music');

module.exports = function(state) {
  state.set('song', {
    title: 'Select a song'
  });
  state.set('playing', false);

  function playSong(query) {
    playMusic.search(query, 5, function(err, data) {
      // max 5 results
      if (err) throw err;

      if (!data.entries) {
        console.logger.warn('Didnt find entries for query', query, data);
        return;
      }

      const song = data.entries
        .sort((a, b) => a.score < b.score) // sort by score
        .filter(entry => entry.type === '1') // filter by only songs
        .shift(); // take first song

      if (songIsCached(song.track.nid)) {
        playSongById(song.track.nid);
      } else {
        const cachedSong = cacheSong(song);
        playSongById(cachedSong.id);
      }
    });
  }

  function playSongById(id) {
    playMusic.getStreamUrl(id, function(err, streamUrl) {
      if (err) throw err;

      if (DEBUG_MODE) console.logger.info('Fetched streamUrl:', streamUrl);

      const song = getSong(id);

      state.set('song', {
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt
      });

      if (DEBUG_MODE) {
        state.set('playing', true);
        return;
      }

      player.addSource(streamUrl.replace('https://', 'http://'));
      player.stop();

      const index = player.sourceList.length > 0
        ? player.sourceList.length - 1
        : 0;
      player.play(index);
    });
  }

  player.on('playstate', playing => state.set('playing', playing));

  function resume() {
    if (DEBUG_MODE) {
      state.set('playing', true);
    }

    player.resume();
  }

  function pause() {
    if (DEBUG_MODE) {
      state.set('playing', false);
    }

    player.pause();
  }

  return {
    play: data => data.id ? playSongById(data.id) : playSong(data.query),
    resume,
    pause
  };
};
