Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.gameList.helpers({
  "games": function() {
    games = Games.find({}).fetch();
    games = games.map(function(game) {
      game.playerCount = game.players.length;
      return game;
    });
    return games;
  },

  "pathForGame": function() {
    var game = this;

    path = FlowRouter.path("gameScreen", {
      gameId: game._id
    });
    return path;
  }
});

Template.gameList.events({
    'click .join-game': function() {
      try {
        Meteor.call("joinGame", this._id);
      } catch (error) {}
    },

    'click .leave-game': function() {
      Meteor.call("leaveGame", this._id);
    },

    'click .new-game': function() {
      console.log("You clicked new game");
      Meteor.call("newGame", function(error, result) {
          if (error) {
            console.log(error.message);
          } else {
            FlowRouter.go("/games/" + result);
          }
        }
      );
  },

  'click .delete-game': function() {
    Meteor.call("destroyGame", this._id);
  }
});