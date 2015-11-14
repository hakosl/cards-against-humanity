var clickableCardMaster = function(){
    if (gamesHandle.ready()) {
      var gameId = FlowRouter.getParam("gameId");
      var game = Games.findOne({
        _id: gameId
      });
      if (game.master === Meteor.userId()) {
        return "clickable-card";
      } else {
        return null;
      }
    }
    return null;
};


Template.playerCards.events({
    "click .play-card": function() {
        Meteor.call("playCard", FlowRouter.getParam("gameId"), this._id);
    }
});

Template.playerCards.helpers({
    "cards": function() {
        if (cardsHandle.ready()) {
            var gameId = FlowRouter.getParam("gameId");

            var players = Games.findOne({
                _id: gameId
            }).players;
            var cardIds = _.find(players, function(player) {
                return player.userId === Meteor.userId();
            }).cards;

            var cards = _.map(cardIds, function(cardId) {
                return Cards.findOne({
                    _id: cardId
                });
            });

            return cards;
        }
    },

    "notMaster": function(){
      if(!clickableCardMaster()){
        return "clickable-card";
      }
      return null;
    }
});