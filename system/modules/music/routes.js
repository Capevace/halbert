const { playMusic, getPlaylists, getPlaylist } = require('./play-music');

function setupRoutes(app) {
  app.get('/music/playlists', (req, res) => {

    function sendPlaylists() {
      const playlists = getPlaylists();

      if (!playlists) {
        setTimeout(sendPlaylists, 2000);
      } else {
        res.json({
          status: 200,
          playlists: getPlaylists()
        });
      }
    }

    sendPlaylists();
  });

  app.get('/music/playlist/:id', (req, res) => {
    playMusic.getPlayLists(function(err, data) {
      if (err) {
        console.error('An error occurred during the fetching of playlist entries.', err);
        res.json({
          status: 500,
          message: 'Error fetching playlist entries'
        });
        return;
      }

      if (!data.data.items) {
        console.error('An error occurred during the fetching of playlist entries with data attr.', data);
        res.json({
          status: 500,
          message: 'Error fetching playlist entries'
        });
        return;
      }

      const playlists = data.data.items
        .map(playlist => ({
          name: playlist.name,
          id: playlist.id
        }));

      console.logger.warn(data);
      res.json({
        status: 200,
        playlists: playlists
      });
    });
  });
}

module.exports = setupRoutes;
