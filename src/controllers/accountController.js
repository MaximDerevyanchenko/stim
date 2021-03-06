module.exports = function (mongoose, io) {
    const fs = require('fs')
    const bcrypt = require('bcrypt')
    const Account = mongoose.model('AccountSchema')
    const GameSchema = mongoose.model('GameSchema')

    module.exports.login = function (req, res) {
        Account.findOne({username: req.body.username})
            .then(acc => {
                if (acc)
                    bcrypt.compare(req.body.password, acc.password, (err, result) => {
                        if (result)
                            res.json(acc)
                        else
                            res.send(result)
                    })
                else
                    res.send(acc)
            })
            .catch(err => {console.log(err);res.send(err)})
    }

    module.exports.changeState = function (req, res) {
        Account.findOneAndUpdate({username: req.cookies.username}, { state: req.body.state, lastOnline: new Date().toLocaleString()})
            .then(acc => {
                io.emit('friendStateChanged', acc, req.body)
                res.json(acc)
            })
            .catch(err => res.send(err))
    }

    module.exports.getAccount = function (req, res) {
        Account.findOne({ username: req.params.username })
            .then(acc => res.json(acc))
            .catch(err => res.send(err))
    }

    module.exports.signup = function (req, res) {
        bcrypt.hash(req.body.password, 0, (err, hash ) => {
            req.body.password = hash
            Account.findOne({username: req.body.username})
                .then(acc => {
                    if (acc != null)
                        res.json({username: acc.username})
                    else {
                        const userPath = './public/img/' + req.body.username
                        const avatar = req.files.avatarImg
                        const background = req.files.backgroundImg
                        if (avatar || background) {
                            fs.mkdir(userPath, err => {
                                if (err != null)
                                    res.send(err)
                                else {
                                    if (avatar)
                                        fs.rename(avatar.path, userPath + '/' + avatar.name, err => {
                                            if (err != null)
                                                res.send(err)
                                        })
                                    if (background && background !== avatar)
                                        fs.rename(background.path, userPath + '/' + background.name, err => {
                                            if (err != null)
                                                res.send(err)
                                        })
                                }
                            })
                        }
                        req.body['avatarImg'] = avatar ? avatar.name : ""
                        req.body['backgroundImg'] = background ? background.name : ""

                        Account.create(req.body)
                            .then(account => res.status(201).json(account))
                            .catch(err => res.send(err))
                    }
                })
                .catch(err => res.send(err))
        })
    }

    module.exports.getFriends = function (req, res) {
        Account.findOne({username: req.params.username})
            .then(acc => {
                let promises = []
                acc.friends.forEach(friend =>
                    promises.push(
                        Account.findOne({username: friend})
                            .then(fr => {
                                if (fr.state === 'in game')
                                    return GameSchema.findOne({ gameId: fr.inGame })
                                        .then(f => {
                                            fr.inGame = f.name
                                            return fr
                                        })
                                        .catch(err => res.send(err))
                                else
                                    return fr
                            })
                            .catch(err => res.send(err))))
                Promise.all(promises)
                    .then(friends => res.json(friends))
                    .catch(err => res.send(err))
            })
            .catch(err => res.send(err))
    }

    const getRequests = function (req, res, isFriend){
        Account.findOne({username: req.cookies.username})
            .then(acc => {
                let promises = []
                acc[isFriend ? 'friendRequests' : 'pendingRequests'].forEach(friend =>
                    promises.push(
                        Account.findOne({username: friend})
                            .then(fr => fr)
                            .catch(err => res.send(err))))
                Promise.all(promises)
                    .then(friends => res.json(friends))
                    .catch(err => res.send(err))
            })
            .catch(err => res.send(err))
    }

    module.exports.getFriendRequests = function (req, res) {
        getRequests(req, res, true)
    }

    module.exports.getPendingRequests = function (req, res) {
        getRequests(req, res, false)
    }

    module.exports.addFriend = function (req, res) {
        Account.findOneAndUpdate({username: req.body.username}, {$addToSet: {friendRequests: [req.cookies.username]}})
            .then(friend => {
                if (friend !== null)
                    Account.updateOne({username: req.cookies.username}, {$addToSet: {pendingRequests: [req.body.username]}})
                        .then(() => {
                            io.emit('friendAdded', req.cookies.username, friend)
                            res.json(friend)
                        })
                        .catch(err => res.send(err))
                else
                    res.sendStatus(204)
            })
            .catch(err => res.send(err))
    }

    module.exports.removeFriend = function (req, res) {
        Account.updateOne({username: req.cookies.username}, {$pull: {friends: req.params.friend}})
            .then(() => {
                Account.updateOne({username: req.params.friend }, {$pull: {friends: req.cookies.username }})
                    .then(acc => {
                        io.emit('friendRemoved')
                        res.json(acc)
                    })
                    .catch(err => res.send(err))
            })
            .catch(err => res.send(err))
    }

    module.exports.acceptFriend = function (req, res) {
        Account.updateOne({username: req.cookies.username}, {
            $addToSet: {friends: [req.body.username]},
            $pull: {friendRequests: req.body.username}
        })
            .then(() =>
                Account.findOneAndUpdate({username: req.body.username}, {
                    $addToSet: {friends: [req.cookies.username]},
                    $pull: {pendingRequests: req.cookies.username}
                })
                    .then(friend => {
                        io.emit('friendAccept', req.cookies.username, friend)
                        res.json(friend)
                    })
                    .catch(err => res.send(err)))
            .catch(err => res.send(err))
    }

    module.exports.denyFriend = function (req, res) {
        Account.findOneAndUpdate({username: req.cookies.username}, {
            $pull: {friendRequests: req.params.username}
        })
            .then(f =>
                Account.updateOne({username: req.params.username}, {
                    $pull: {pendingRequests: req.cookies.username}
                })
                    .then(() => {
                        io.emit('friendDenied', f)
                        res.json(f)
                    })
                    .catch(err => res.send(err)))
            .catch(err => res.send(err))
    }

    module.exports.updateMyAccount = function (req, res) {
        const avatar = req.files.avatarImg
        const background = req.files.backgroundImg
        if (avatar)
            req.body['avatarImg'] = avatar.name
        if (background)
            req.body['backgroundImg'] = background.name
        Account.findOneAndUpdate({username: req.cookies.username}, req.body)
            .then(acc => {
                const userPath = './public/img/' + req.body.username
                if (req.files) {
                    if (avatar || background ) {
                        fs.mkdir(userPath, () => {
                            if (avatar && avatar !== acc.avatarImg) {
                                if (acc.backgroundImg !== acc.avatarImg)
                                    fs.rm(userPath + '/' + acc.avatarImg, () => {
                                        fs.rename(avatar.path, userPath + '/' + avatar.name, err => {
                                            if (err != null)
                                                res.send(err)
                                        })
                                    })
                                else
                                    fs.rename(avatar.path, userPath + '/' + avatar.name, err => {
                                        if (err != null)
                                            res.send(err)
                                    })
                            }
                            if (background && background !== avatar && background !== acc.backgroundImg){
                                if (acc.backgroundImg !== acc.avatarImg || avatar)
                                    fs.rm(userPath + '/' + acc.backgroundImg, () => {
                                        fs.rename(background.path, userPath + '/' + background.name, err => {
                                            if (err != null)
                                                res.send(err)
                                        })
                                    })
                                else
                                    fs.rename(background.path, userPath + '/' + background.name, err => {
                                        if (err != null)
                                            res.send(err)
                                    })
                            }
                        })
                    }
                }
                io.emit('friendStateChanged', acc, req.body)
                res.json(acc)
            })
            .catch(err => res.send(err))
    }

    module.exports.becomeDeveloper = function (req, res){
        Account.updateOne({username: req.cookies.username}, req.body)
            .then(acc => res.json(acc))
            .catch(err => res.send(err))
    }
}
