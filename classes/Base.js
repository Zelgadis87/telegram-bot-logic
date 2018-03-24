
class Base {

	constructor() {
		this.parent = null;
		this.accepted = false;
		this.processing = false;
		this.processed = false;
		this.type = null;
		this.propageteProcessedToParent = true;
		this.retractWhenProcessed = true;
	}

}

Base.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Base.PropagateProcessedToParent' )
		.salience( -100 )
		.domain( { b: Base } )
		.condition( function( b ) { return b.processed && b.propageteProcessedToParent; } )
		.condition( function( b ) { return b.parent && !b.parent.processed; } )
		.effect( function( b ) { return b.parent.processed = true; } );

	engine.createRule()
		.name( 'Base.RetractWhenProcessed' )
		.salience( -200 )
		.domain( { b: Base } )
		.condition( function( b ) { return b.processed && b.retractWhenProcessed; } )
		.effect( function( b ) { return engine.retract( b ); } );

};

module.exports = Base;
