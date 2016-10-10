/**
 * Created by Mikael Lindahl (mikael) on 10/10/16.
 */

'use strict';

let $_ = require( 'jquery' );
let dt = require( 'datatables.net' )( window, $_ );
let dt_bs = require( 'datatables.net-bs' )( window, $_ );

let data_table;

// Create and dend invite
function get_crash_dumps() {

    var done = function ( dumps ) {

        data_table.clear();


        dumps.forEach( function ( v ) {

            data_table.row.add( [v.product, v.version, v.ip, v.user_agent,  v.file] )

        } );

        data_table.draw();

    };

    $_.ajax( {
        type: 'GET',
        url: "/crash_dumps",
        success: function ( response ) {

            done( response )

        },
        error: function ( xhr, status, error ) {
            var err = eval( "(" + xhr.responseText + ")" );
            console.log( err );
            alert( "Failed!\n\n" + error );
            done( err )
        }
    } );
}

$( document ).ready( function () {

    $_( '#crash_dump_table' )
        .addClass( 'table table-striped table-bordered table-hover' );

    data_table = $_( '#crash_dump_table' ).DataTable( {
        pageLength: 50,
        columnDefs: [
            {
                targets: [4],
                visible: false
            }],
        rowCallback(td, data, index){
            td.setAttribute('data-toggle',"modal")
            td.setAttribute('data-target',"#modal_crash_dumps");

        }
    } );
    $( '#crash_dump_table tbody' ).on( 'click', 'tr', function () {
        var data = data_table.row( this ).data();

        $_('#modal_crash_dumps_label').html('Crash dump for product '+data[0]+ '  version '+data[1]);
        $_('#modal_crash_dumps .modal-body p').html(data[4])

    } );

    $_( '#crash_dump_table' ).css( { display: 'table' } )
    get_crash_dumps()


} );