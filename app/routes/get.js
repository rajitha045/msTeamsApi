module.exports = function(app) {
    app.post('/notes', (req, res) => {
        res.send('TeamsHere')
      });
};