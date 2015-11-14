Meteor.methods({
    "populateCards": function() {
        getTXTFromUrl = function(url) {
            //console.log("getTXTFromUrl: ");
            return HTTP.get(url, {}).content;
        };

        parseTXTCards = function(TXTCards, callBack) {
            TXTCards.split("\n").forEach(callBack);
        };

        insertAnswers = function(text, index, file) {
            if (text.length >= 3) {
                Cards.insert({
                    text: text,
                    cardType: "A",
                    numAnswers: 0
                });
            }
        };

        insertQuestions = function(text, index, file) {
            if (text.length >= 3) {
                Cards.insert({
                    text: text,
                    cardType: "Q",
                    numAnswers: (text.match(/_/g) || []).length
                });
            }
        };

        console.log("populateCards running");
        var answerCardsUrl = "https://raw.githubusercontent.com/nodanaonlyzuul/against-humanity/master/answers.txt";
        var questionCardsUrl = "https://raw.githubusercontent.com/nodanaonlyzuul/against-humanity/master/questions.txt";
        var JSONCardsUrl = "https://raw.githubusercontent.com/samurailink3/hangouts-against-humanity/master/source/data/cards.js";

        parseTXTCards(getTXTFromUrl(answerCardsUrl), insertAnswers);
        parseTXTCards(getTXTFromUrl(questionCardsUrl), insertQuestions);


        //Cards.remove( {} );
        console.log("cards parsed");
        console.log(Cards.find().count());

    }
});


Meteor.startup(function() {
    if (Cards.find().count === 0) {
        Cards.remove({});
        Meteor.call("populateCards");
    }
});