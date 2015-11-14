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



Template.answeredCards.helpers({
  'answeredCards': function() {

    if (gamesHandle.ready() && cardsHandle.ready()) {
      var board = Games.findOne({
        _id: FlowRouter.getParam("gameId")
      }).board.answerCards;
      var playerCardObjects = board;

      var playedCards = _.map(board, function(playerCardObject) {
        var card = Cards.findOne({
          _id: playerCardObject.cardId
        });
        card.userId = playerCardObject.userId;
        return card;
      });

      return playedCards;
    }
  },

  "clickableCard": function() {
    return clickableCardMaster();
  }
});

Template.answeredCards.events({
  "click .choose-winner": function() {
    var curGame = FlowRouter.getParam("gameId");
    var winnerId = this.userId;
    Meteor.call("judgeGame", curGame, winnerId, function(error, result) {});
  }
});