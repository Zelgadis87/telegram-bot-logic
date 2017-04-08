
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	;

class Reply extends Base {

	constructor( message, responseCode, responseParams ) {
		super();
		this.message = message;
		this.parent = message;
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
				console.error( 'Failed to send message to ' + r.message.chat.id, err );
				r.accepted = false;
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
