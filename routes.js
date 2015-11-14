FlowRouter.route('/', {
    name: "home",
    action(params, queryParams) {
        BlazeLayout.render("index", {
            mainArea: "gameList"
        })
    }
})

FlowRouter.route('/games/:gameId', {
    name: "gameScreen",
    action(params) {
        BlazeLayout.render('gameScreen')
    }
})