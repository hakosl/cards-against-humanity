////////////////////////////////////////////////////////
// Functions for creating and managing games, also used for updating gamestate
////////////////////////////////////////////////////////

//Player is different from user because players play and users use
//Creating a game object to insert into the database
var createPlayer = function(userId) {
  if (!userId) {
    userId = this.userId;
  }

  return {
    userId: userId,
    name: Meteor.user().username,
    score: 0,
    cards: generateCards(10, "A")
  };
};

var generateCards = function(numberOfCards, cardType) { //Generate numberOfCards cards
  var allCards = [];
  return _.map(_.range(numberOfCards), function() {
    allCards.push(generateCard(cardType, allCards));
    return allCards[allCards.length - 1];
  });
};

var generateCard = function(cardType, allCards) {
  var card = "";
  while (!card && allCards.indexOf(card) === -1) {
    card = Cards.findOne({
      cardType: cardType
    }, {
      skip: (Math.random() * Cards.find({
        cardType: cardType
      }).count()),
      limit: 1
    });
  }
  return card._id;
};

//Keeps game state in the database
var createBoard = function() {
  return {
    answerCards: [],
    questionCard: null
  };
};

////////////////////////////////////////
// Functions for game mechanics
////////////////////////////////////////

//Checks if userId is in gameId's players[x].userId
var playerAlreadyInGame = function(gameId, userId) {
  if (!userId) {
    userId = this.userId;
  }

  return _.find(Games.findOne(gameId).players,
    function(player, index, players) {
      return player.userId === userId;
    }
  );
};

//Removes a cardId from playerId's, in gameId
var popCardFromPlayer = function(gameId, playerId, cardId) {
  return Games.update({
    _id: gameId,
    "players.userId": playerId
  }, {
    $pull: {
      "players.$.cards": cardId
    }
  });
};

//Check if player is allowed to play a new card
var playerAllreadyPlayedCard = function(gameId, cardId) {
  return _.find(Games.findOne({
    _id: gameId
  }).board.answerCards, function(card) {
    return (card.userId === this.userId);
  });
};

var randomPlayerId = function(currentGame) {
  return currentGame.players[Math.floor(
    Math.random() * currentGame.players.length)].userId;
};

Meteor.methods({
  ///////////////////////////////
  // Game managment
  ///////////////////////////////

  "newGame": function() {
    console.log("gameCount: " + Games.find().count());
    console.log(!this.userId);
    if (!this.userId) {
      console.log("error is being thrown");
      throw new Meteor.Error("UserNotLoggedIn", "You are not logged in");
    }

    console.log("kden");
    try {
      console.log("game: " + {
        players: [
          createPlayer(null, "master")
        ],
        owner: this.userId,
        ownerName: Meteor.user().username,
        board: createBoard(),
        master: this.userId,
        createdAt: new Date()
      });

      gameId = Games.insert({
        players: [
          createPlayer(null, "master")
        ],
        owner: this.userId,
        ownerName: Meteor.user().username,
        board: createBoard(),
        master: this.userId,
        createdAt: new Date()
      });
    } catch (e) {
      console.log(e.name + ": " + e.message);
    }
    console.log("gameID: " + gameId);
    return gameId;
  },

  "joinGame": function(gameId) {
    if (!playerAlreadyInGame(gameId) && this.user()) {

      Games.update({
        "_id": gameId
      }, {
        $addToSet: {
          players: createPlayer()
        }
      });

      return gameId;
    } else {
      throw new Meteor.Error(403, "You are already in that game");
    }
  },

  "leaveGame": function(gameId, userId) {
    if (!userId) {
      userId = this.userId;
    }

    if (playerAlreadyInGame(gameId, userId)) {

      return Games.update({
        _id: gameId
      }, {
        $pull: {
          players: {
            userId: userId
          }
        }
      });
    } else {
      throw new Meteor.Error(403, "player not in game");
    }
  },

  "destroyGame": function(gameId) {
    if (Games.findOne({
      _id: gameId
    }).owner === this.userId) {
      return Games.remove({
        _id: gameId
      });
    } else {
      throw new Meteor.Error(403, "You are not the owner of this game: " + Games.findOne({
        _id: gameId
      }).owner + " " + this.userId);
    }
  },

  /////////////////////////
  // Game mechanics
  /////////////////////////

  "playCard": function(gameId, cardId) {
    if (this.userId === Games.findOne({
      _id: gameId
    }).master) {

      throw new Meteor.Error(403, "playerIsMaster");
    } else if (playerAllreadyPlayedCard(gameId, cardId)) {

      throw new Meteor.Error(403, "playerAllreadyPlayedCard");
    } else if (popCardFromPlayer(gameId, this.userId, cardId)) {

      Games.update({ //Give player a new card
        _id: gameId,
        "players.userId": this.userId
      }, {
        $push: {
          "players.$.cards": generateCard("A", [])
        }
      });

      Games.update({ //Add a new answerCard to the board
        _id: gameId
      }, {
        $push: {
          "board.answerCards": {
            cardId: cardId,
            userId: this.userId
          }
        }
      });
      console.log("success");
      return gameId;
    }

  },

  "judgeGame": function(gameId, winnerId) {
    currentGame = Games.findOne({
      _id: gameId
    });
    if (this.userId !== currentGame.master) {
      console.log("no dice");
      throw new Meteor.Error(403, "You are not allowed to judge right now");
    } else {
      return Games.update({
          _id: gameId,
          "players.userId": winnerId
        }, {
          $inc: {
            "players.$.score": 1
          }, //Give the winner a point
          $set: {
            board: {
              answerCards: [] /*Reset questionCard*/ ,
              questionCard: null /*Reset answerCards*/
            },
            master: randomPlayerId(currentGame) //Randomly select a new Master
          }
        }, {
          multi: true
        }

      );
    }
  },

  "chooseQuestionCard": function(gameId, choiceId) {
    var curGame = Games.findOne({
      _id: gameId
    });
    var cardChoice = Cards.findOne({
      _id: choiceId
    });
    if (this.userId !== curGame.master) {
      throw new Meteor.Error('noPermission',
        "You are not currently allowed to do that, because you are not the master");
    } else if (curGame.board.questionCard) {
      console.log(curGame.board.questionCard);
      throw new Meteor.Error('noPermission', "there is already a card Played");
    } else if (cardChoice.cardType !== "Q") {
      throw new Meteor.Error('noPermission', "you can't play that card");
    }

    Games.update({
      _id: gameId
    }, {
      $set: {
        "board.questionCard": choiceId
      }
    });
  }
});