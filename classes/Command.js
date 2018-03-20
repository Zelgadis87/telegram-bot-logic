
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	, Reply = require( './Reply.js' )
	;

class Command extends Base {

	constructor( message ) {
		super();
		this.message = message;
		this.parent = message;

		let words = message.data.text.split( ' ' );
		this.command = words[ 0 ].substring( 1 ).toLowerCase();
		this.arguments = words.slice( 1 );
	}

}

Command.Types = {
	KNOWN: 'known',
	UNKNOWN: 'unknown'
}

Command.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Command.Unknown' )
		.domain( { c: Command } )
		.salience( -1000 )
		.condition( function( c ) { return !c.accepted; } )
		.effect( function( c ) {
			c.accepted = true;
			c.type = Command.Types.UNKNOWN;
			c.reply = new Reply( c, c.message, 'unknown-command', {} );
			engine.assert( c.reply );

			console.warn( "I don't know how to reply to command:", c.command );
		} );

}

module.exports = Command;
