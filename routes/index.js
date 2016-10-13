/**
 * Created by Mikael Lindahl on 2016-09-16.
 */


'use strict'

module.exports = function (server){

    var paths=[
        '../routes/assets',
        '../routes/login',
        '../routes/crash_dumps',
        '../routes/stack_walk',
        '../routes/symbols',
    ];

    for (var i in paths){

        server.route(require(paths[i]));

    }
}
