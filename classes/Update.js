
const _ = require( 'lodash' )
	, Message = require( './Message.js' )
	;

function Update( telegramUpdate ) {
	this.data = telegramUpdate;
}

Update.createRules = ( engine ) => {

	engine.createRule()
		.name( 'I have a message update' )
		.domain( { u: Update } )
		.condition( (u) => u.data.message )
		.effect( (u) => {
			engine.assert( new Message( u.data.message, u ) );
			engine.retract( u );
		} );

	engine.createRule()
		.name( 'Unknown update' )
		.salience( -1000 )
		.domain( { u: Update } )
		.effect( (u) => {
			console.warn( "I don't know what to do with an update:", u );
			engine.retract( u );
		} );

};

module.exports = Update;
