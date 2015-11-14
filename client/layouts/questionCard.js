Template.questionCard.helpers({
    "questionCard": function() {
        if (gamesHandle.ready() && cardsHandle.ready()) {
            var curGameId = FlowRouter.getParam("gameId");
            var curGame = Games.findOne({
                _id: curGameId
            });
            if (curGame.board.questionCard) {
                var curQuestionCard = Cards.findOne({
                    _id: curGame.board.questionCard
                });
                return curQuestionCard;
            } else {
                return false;
            }
        }
    },

    "master": function() {
        if (gamesHandle.ready()) {
            var curGameId = FlowRouter.getParam("gameId");
            var curGame = Games.findOne({
                _id: curGameId
            });
            return curGame.master === Meteor.userId();
        }
    }
});

Template.chooseQuestionCard.helpers({
    "cards": function() {
        var cards = Cards.find({
            cardType: "Q"
        }, {
            skip: (Math.random() * Cards.find( {cardType: "Q" } ).count()),
            limit: 3
        }).fetch();
        return cards;
    }
});

Template.chooseQuestionCard.events({
    "click .choose-question-card": function() {
        var gameId = FlowRouter.getParam("gameId");
        var cardId = this._id;
        console.log("gameid: " + gameId, "cardId: " + cardId);
        Meteor.call("chooseQuestionCard", gameId, cardId);
    }
});