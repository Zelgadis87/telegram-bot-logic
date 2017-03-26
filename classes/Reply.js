
const _ = require( 'lodash' )
	;

function Reply( message, responseCode, responseParams ) {

	this.message = message;
	this.responseCode = responseCode;
	this.responseParams = responseParams;

	Object.defineProperty( this, 'text', {
		get: function() {
			return this.responseCode;
		}
	} );

}

Reply.createRules = ( engine ) => {

	engine
		.createRule()
		.name( 'I have a reply' )
		.domain( { r: Reply } )
		.effect( (r) => {
			engine.bot.sendMessage( r.message.chat.id, r.text, _.extend( {}, r.options, { reply_to_message_id: r.message.data.message_id } ) );
			engine.retract(r);
		} );

};

module.exports = Reply;
