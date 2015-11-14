Template.scoreboard.helpers({
  "players": function() {
    curGameId = FlowRouter.getParam("gameId");

    if (gamesHandle.ready()) {
      var curGame = Games.findOne({
        _id: curGameId
      }, {
        sort: { points: -1 }
      });

      var players = _.map(curGame.players, function(player) {
        if (curGame.master === player.userId) {
          player.master = true;
        } else {
          player.master = false;
        }

        if (Meteor.userId() === player.userId) {
          player.curPlayer = true;
        } else {
          player.curPlayer = false;
        }

        return player;
      });
      return players;
    }

  }
});