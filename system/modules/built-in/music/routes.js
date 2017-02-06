const { getPlaylists } = require('./play-music');

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

}

module.exports = setupRoutes;
