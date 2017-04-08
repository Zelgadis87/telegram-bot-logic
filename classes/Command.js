
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	, Reply = require( './Reply.js' )
	;

class Command extends Base {

	constructor( message ) {
		super();
		this.command = message.data.text.split( ' ' )[ 0 ].substring( 1 );
		this.message = message;
		this.parent = message;
	}

}

Command.Types = {
	UNKNOWN: 'unknown'
}

Command.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Command.Unknown' )
		.domain( { c: Command } )
		.salience( -1000 )
		.condition( ( c ) => !c.accepted )
		.effect( (c) => {
			c.accepted = true;
			c.processed = true;
			c.type = Command.Types.UNKNOWN;
			c.reply = new Reply( c.message, 'unknown-command', {} );
			c.reply.parent = c;
			engine.assert( c.reply );

			console.warn( "I don't know how to reply to command:", c.command );
		} );

}

module.exports = Command;
