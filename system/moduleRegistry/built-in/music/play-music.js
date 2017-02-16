const PlayMusic = require('playmusic');
const playMusic = new PlayMusic();

let googlePlayReady = false;

const songs = {};
let playlists = {};
let fetchedSongs = false;

playMusic.init(
  { email: 'lukas.mateffy@gmail.com', password: 'exkdqygckgmtfkpp' },
  function(err) {
    if (err) {
      console.logger.error(
        'An error occurred trying to login to the provided Google Play Music account.'
      );
      return;
    }

    googlePlayReady = true;
    console.logger.info('Authorized Google Play Music.');

    cacheSongs();
  }
);

function cacheSongs() {
  playMusic.getPlayLists((err, playListsData) => {
    if (err) {
      console.error('An error occurred during the fetching of playlists.', err);
      return;
    }

    if (!playListsData.data.items) {
      console.error(
        'An error occurred during the fetching of playlists with data attr.',
        playListsData.data
      );
      return;
    }

    playlists = {};
    playListsData.data.items.forEach(playlist => {
      playlists[playlist.id] = {
        id: playlist.id,
        name: playlist.name,
        type: playlist.type,
        description: playlist.description,
        deleted: playlist.deleted,
        songs: []
      };
    });

    playMusic.getPlayListEntries({}, (err, entriesData) => {
      if (err) {
        console.error(
          'An error occurred during the fetching of playlist entries.',
          err
        );
        return;
      }

      if (!entriesData.data.items) {
        console.error(
          'An error occurred during the fetching of playlist entries with data attr.',
          entriesData.data
        );
        return;
      }

      entriesData.data.items.forEach(entry => {
        const song = cacheSong(entry);

        if (song) playlists[entry.playlistId].songs.push(song);
      });

      fetchedSongs = true;
    });
  });
}

function getPlaylists() {
  if (!fetchedSongs) {
    return null;
  }

  return playlists;
}

function getPlaylist(id) {
  return playlists[id];
}

function getSongs() {
  return songs;
}

function getSong(id) {
  return songs[id];
}

function cacheSong(entry) {
  if (!entry.track) return null;

  const song = {
    playlistId: entry.playlistId,
    id: entry.track.storeId,
    title: entry.track.title,
    artist: entry.track.artist,
    composer: entry.track.composer,
    album: entry.track.album,
    albumArtist: entry.track.albumArtist,
    year: entry.track.year,
    genre: entry.track.genre,
    duration: entry.track.durationMillis,
    albumArt: (
      entry.track.albumArtRef && entry.track.albumArtRef.length > 0
        ? entry.track.albumArtRef[0].url
        : null
    ),
    artistArt: (
      entry.track.artistArtRef && entry.track.artistArtRef.length > 0
        ? entry.track.artistArtRef[0].url
        : null
    ),
    size: entry.track.estimatedSize,
    albumId: entry.track.albumId
  };

  songs[song.id] = song;

  return song;
}

function songIsCached(id) {
  return id in songs;
}

module.exports = {
  playMusic,
  googlePlayReady,
  getPlaylists,
  getPlaylist,
  getSongs,
  getSong,
  cacheSong,
  songIsCached
};
