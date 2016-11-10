/**
 * AppdataController
 *
 * @description :: Server-side logic for managing appdatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    getdata: function ( req, res ) {

        if (!req.param("appid")){
            return res.notFound("No app id");
        }
        
        Appdata.findOne( { appid: req.param( "appid" )} )
            .then( function(model){
            
                if (!model){
                    return res.ok({})
                }
            
                return res.ok(model.data);
            
            } )

    },

    postdata: function ( req, res ) {

        if ( !req.param( "appid" ) ) {
            return res.notFound( "No app id" );
        }

        var pdata = req.allParams();
        delete pdata.appid;

        Appdata.findOrCreate( { appid: req.param( "appid" ) }, { appid: req.param("appid"), data: pdata } )
            .then( function ( model ) {

                if ( !model ) {
                    return res.notFound( 'something bad happened' )
                }

                model.data = pdata;
                model.save();
                return res.ok(pdata);

            } )

    }

};

