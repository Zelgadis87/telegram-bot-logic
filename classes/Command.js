
const _ = require( 'lodash' )
	, Reply = require( './Reply.js' )
	;

function Command( message ) {
	this.command = message.data.text.split( ' ' )[ 0 ].substring( 1 );
	this.message = message;
	this.processed = false;

	this.markBeingProcessed = () => {
		this.processed = true;
		message.completed = true;
	};
}

Command.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Unknown command' )
		.domain( { c: Command } )
		.salience( -1000 )
		.effect( (c) => {
			console.warn( "I don't know how to reply to command:", c.command );
			c.message.completed = true;
			engine.assert( new Reply( c.message, 'unknown-command', {} ) );
			engine.retract( c );
		} );

}

module.exports = Command;
