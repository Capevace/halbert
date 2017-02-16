const { getPlaylists } = require('./play-music');

module.exports = builder => {
  const actions = require('./actions')(builder.state);

  builder.widgets.createWidget('Music Player', 'music', 'widget.html');

  builder.actions
    .createAction('music.play')
    .setMeta('Play Music', 'play music')
    .addArgument('query', 'string')
    .setCallback(actions.play)
    .createAction('music.resume')
    .setMeta('Resume Music', 'resume music')
    .setCallback(actions.resume)
    .createAction('music.pause')
    .setMeta('Pause Music', 'pause music')
    .setCallback(actions.pause);

  builder.routes.get('/music/playlists', (req, res) => {
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
};
