
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
		.condition( (b) => b.processed && b.propageteProcessedToParent )
		.condition( (b) => b.parent && !b.parent.processed )
		.effect( (b) => b.parent.processed = true );

	engine.createRule()
		.name( 'Base.RetractWhenProcessed' )
		.salience( -200 )
		.domain( { b: Base } )
		.condition( (b) => b.processed && b.retractWhenProcessed )
		.effect( (b) => engine.retract(b) );

};

module.exports = Base;
