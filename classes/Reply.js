
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	;

class Reply extends Base {

	constructor( parent, message, responseCode, responseParams ) {
		super();
		this.parent = parent;
		this.message = message;
		this.responseCode = responseCode;
		this.responseParams = responseParams;
	}

}

Reply.createRules = ( engine ) => {

	engine
		.createRule()
		.name( 'Reply.Send' )
		.domain( { r: Reply } )
		.condition( (r) => !r.accepted )
		.effect( (r) => {
			r.accepted = true;
			engine.bot.sendMessage( r.message.chat.id, r.responseCode, _.extend( {}, r.options, { reply_to_message_id: r.message.data.message_id } ) ).then( () => {
				console.info( 'Reply sent' );
				r.processed = true;
			}, (err) => {
				// TODO: This should cause a request failed object with N retries and X cooldown.
				console.error( 'Failed to send message to ' + r.message.chat.id, err );
				r.processed = true;
			} );
		} );

	engine
		.createRule()
		.name( 'Reply.UpdateMessageWithReply' )
		.domain( { r: Reply } )
		.condition( (r) => r.processed )
		.condition( (r) => !r.message.reply )
		.effect( (r) => {
			r.message.reply = r;
		} );

};

module.exports = Reply;
