
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	, Reply = require( './Reply.js' )
	;

class CommandRule {

	constructor( command, fnApplyEffect ) {
		this.__className = this.constructor.name;
		this.name = command;
		this.command = command.toLowerCase();
		this.applyEffect = fnApplyEffect;
	}

}

CommandRule.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Command.Rule' )
		.domain( { c: engine.domain.Command, cr: engine.domain.CommandRule } )
		.salience( -1000 )
		.condition( function( c, cr ) { return !c.accepted; } )
		.condition( function( c, cr ) { return c.command === cr.command; } )
		.effect( function( c, cr ) {
			c.accepted = true;
			c.type = engine.domain.Command.Types.KNOWN;
			cr.applyEffect( c );
		} );

}

module.exports = CommandRule;
