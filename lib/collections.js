Cards = new Mongo.Collection("cards");
Games = new Mongo.Collection("games");

if (Meteor.isServer) {
    Meteor.publish("games", function() {
        return Games.find();
    });

    Meteor.publish("cards", function() {
        return Cards.find();
    });
}

if (Meteor.isClient) {
    gamesHandle = Meteor.subscribe("games");
    cardsHandle = Meteor.subscribe("cards");
}