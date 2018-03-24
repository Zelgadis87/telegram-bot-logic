
class ShutdownRequest {

	constructor( resolve ) {
		this.accepted = false;
		this.resolve = resolve;
	}

}

ShutdownRequest.createRules = ( engine ) => {

	engine.createRule()
		.name( 'ShutdownRequest' )
		.salience( -10000 )
		.domain( { sr: ShutdownRequest } )
		.condition( function( sr ) { return !sr.accepted; } )
		.effect( function( sr ) {
			sr.accepted = true;
			sr.resolve();
		} );

};

module.exports = ShutdownRequest;
