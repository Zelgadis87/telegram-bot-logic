
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	, Message = require( './Message.js' )
	;

class Update extends Base {

	constructor( telegramUpdate ) {
		super();
		this.data = telegramUpdate;
		this.retractWhenProcessed = false;
	}

}

Update.Types = {
	MESSAGE: 'message',
	UNKNOWN: 'unknown'
};

Update.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Update.Message' )
		.domain( { u: Update } )
		.condition( ( u ) => !u.accepted )
		.condition( ( u ) => u.data.message )
		.effect( ( u ) => {
			u.accepted = true;
			u.type = Update.Types.MESSAGE;
			u.message = new Message( u.data.message, u )
			engine.assert( u.message );
		} );

	engine.createRule()
		.name( 'Update.Unknown' )
		.salience( -1000 )
		.domain( { u: Update } )
		.condition( ( u ) => !u.accepted )
		.effect( ( u ) => {
			u.accepted = true;
			u.processed = true;
			u.type = Update.Types.UNKNOWN;

			console.warn( "I don't know what to do with an update:", u );
		} );

};

module.exports = Update;
