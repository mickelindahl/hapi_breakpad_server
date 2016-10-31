/**
 * Created by Mikael Lindahl (mikael) on 10/9/16.
 */

'use strict';

const Joi = require( 'joi' );
const Boom = require( 'boom' );
const debug = require( 'debug' )( 'breakpad:route:symbols' );
const Fs = require( 'fs' );
const Handlebars = require( 'handlebars' );
const Path = require( 'path' );

module.exports = [
    {
        method: 'POST',
        path: '/symbols',
        handler: ( request, reply )=> {

            debug( request.headers, request.payload );

            let record = {
                user_agent: request.headers['user-agent'],
                os: request.payload.os,
                version: request.payload.version,
                cpu: request.payload.cpu,
                ip: request.info.remoteAddress,
                file: request.payload.symbol_file,
                code_file: request.payload.code_file,
                debug_file: request.payload.debug_file,
                debug_identifier: request.payload.debug_identifier,
            };

            if ( process.env.BAD_IMPLEMENTATION == 'true' ) {
                record.file = 1
            }

            var Model = request.server.getModel( 'symbol' );

            Model.create( record ).then( ( models )=> {

                reply( models ).code( 201 );

            } ).catch( function ( err ) {

                request.server.app.log.error( err );
                reply( Boom.badImplementation( err.message ) );

            } );

        },
        config: {
            payload: { "maxBytes": 1048576*20 },
            description: 'Create symbol file entry',
            notes: 'Creates an symbol file entry',
            tags: ['api', 'symbol'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                options: {
                    allowUnknown: true
                },
                payload: {

                    os: Joi.string().required().description( 'Os symbol file is for' ),
                    version: Joi.string().description( 'Product version symbol file is for' ),
                    cpu: Joi.string().required().description( 'Symbol cpu type' ),
                    symbol_file: Joi.binary().required().description( 'Symbol file' ),
                    code_file: Joi.string().required().description( 'Code file name' ),
                    debug_file: Joi.string().required().description( 'Symbol file name' ),
                    debug_identifier: Joi.string().required().description( 'Symbol file identifier' ),

                }
            }
        }
    },

    {
        method: 'GET',
        path: '/symbols',
        handler: ( request, reply )=> {

            let Model = request.server.getModel( 'symbol' );

            debug('BEFORE QUERYYY!!!')

            Model.query({
                text:"SELECT " +
                'symbol.cpu, symbol.ip, symbol.os, ' +
                'symbol.version, symbol.code_file, ' +
                'symbol.debug_file, symbol.debug_identifier, ' +
                'symbol.user_agent, ' +
                'symbol.created_at, ' +
                'symbol.updated_at, ' +
                'symbol.id ' +
                "FROM symbol"}, ( err, result )=> {


                debug('AFTER QUERYYY!!!')


                if ( err ) {
                    console.log(err)
                    return reply( Boom.badImplementation( err.message ) );

                }

                reply( JSON.parse(JSON.stringify(result.rows)) )

            } );

        },

        config: {
            auth: 'jwt',
            description: 'Get all symbol files',
            notes: 'Gets all symbols files',
            tags: ['api', 'symbol'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: [
                        { code: 404, message: 'Not found' }
                    ]
                }
            },
            validate: {
                options: {
                    allowUnknown: true
                },
            }
        }
    },

    {
        method: 'GET',
        path: '/symbols/{id}',
        handler: ( request, reply )=> {

            let Model = request.server.getModel( 'symbol' );


            Model.find({id:request.params.id}).then(models=>{

                models= models[0].file.toString()

                models=models.replace(/(?:\r\n|\r|\n)/g, '<br />')

                debug(models)

                reply( models)


            })

            //Model.query({
            //    text:"SELECT " +
            //    "symbol.file " +
            //    "FROM symbol " +
            //    "WHERE symbol.id="+request.params.id}, ( err, result )=> {
            //
            //        if ( err ) {
            //
            //            return reply( Boom.badImplementation( err.message ) );
            //        }
            //
            //
            //        //result.rows.forEach(e=>{
            //        //    debug( e )
            //        //    debug( JSON.stringify(e) )
            //        //    debug( JSON.parse(JSON.stringify(e)) )
            //        //    debug(typeof e )
            //        //
            //        //})
            //        debug(JSON.parse(JSON.stringify(result.rows)))
            //    debug(JSON.parse(JSON.stringify(result.rows))[0].file.data.toString())
            //    result=JSON.parse(JSON.stringify( result.rows[0])).file.toString()
            //    result=result.replace(/(?:\r\n|\r|\n)/g, '<br />')
            //
            //    debug(result)
            //
            //    reply( result)
            //
            //        //reply(result )
            //
            //    } );

        },

        config: {
            auth: 'jwt',
            description: 'Get all symbol files',
            notes: 'Gets all symbols files',
            tags: ['api', 'symbol'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: [
                        { code: 404, message: 'Not found' }
                    ]
                }
            },
            validate: {
                options: {
                    allowUnknown: true
                },
            }
        }
    },

    {
        method: 'GET',
        path: '/symbols/view',
        config: { auth: 'jwt' },
        handler: function ( request, reply ) {

            let head = Fs.readFileSync( Path.join( Path.resolve(), 'views/head.html' ) ).toString();
            let nav = Fs.readFileSync( Path.join( Path.resolve(), 'views/nav.html' ) ).toString();

            head = Handlebars.compile( head )( { title: 'Symbol' } );
            nav = Handlebars.compile( nav );

            reply.view( 'symbol', {
                head: head,
                nav: nav
            } );

        }
    },
];
