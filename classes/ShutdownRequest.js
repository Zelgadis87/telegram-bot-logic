
class ShutdownRequest {

	constructor( resolve ) {
		this.__className = this.constructor.name;
		this.accepted = false;
		this.resolve = resolve;
		this.timestamp = new Date();
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
