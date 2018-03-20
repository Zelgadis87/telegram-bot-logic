
class ShutdownRequest {

	constructor( resolve ) {
		this.__className = this.constructor.name;
		this.resolve = resolve;
	}

}

ShutdownRequest.createRules = ( engine ) => {

	engine.createRule()
		.name( 'ShutdownRequest' )
		.salience( -10000 )
		.domain( { sr: ShutdownRequest } )
		.effect( sr => {
			engine.retract( sr )
			sr.resolve();
		} );

};

module.exports = ShutdownRequest;
