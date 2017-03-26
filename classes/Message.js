
const _ = require( 'lodash' )
	, Command = require( './Command.js' )
	, Reply = require( './Reply.js' )
	;

// function getter( destObj, sourceObj, sourceProp, destProp ) {
// 	destProp = destProp || sourceProp;
// 	Object.defineProperty( destObj, destProp, {
// 		get: () => source[sourceProp]
// 	});
// }

function Message( telegramMessage, update ) {

	this.data = telegramMessage;
	this.update = update;
	this.type = null;

}

Message.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Get message chat' )
		.salience( 10 )
		.domain( { m: Message } )
		.condition( (m) => m.data.chat && !m.chat )
		.effect( (m) => {
			m.chat = engine.getChat( m.data.chat );
			m.chat.receivedMessages++;
			if ( !m.chat.lastUpdated || m.chat.lastUpdated < m.data.date ) {
				m.chat.lastUpdated = m.data.date;
				m.chat.lastMessage = m.data;
			}
		} );

	engine.createRule()
		.name( 'Get message user' )
		.salience( 10 )
		.domain( { m: Message } )
		.condition( (m) => m.data.from && !m.user )
		.effect( (m) => {
			m.user = engine.getUser( m.data.from );
			m.user.receivedMessages++;
			if ( !m.user.lastUpdated || m.user.lastUpdated < m.data.date ) {
				m.user.lastUpdated = m.data.date;
				m.user.lastMessage = m.data;
			}
		} );

	engine.createRule()
		.name( 'I have a command message' )
		.domain( { m: Message } )
		.condition( (m) => !m.type )
		.condition( (m) => m.data.text && m.data.text.length && m.data.text[ 0 ] === '/' )
		.effect( (m) => {
			m.type = 'COMMAND';
			engine.assert( new Command( m ) );
		} );

	engine.createRule()
		.name( 'Unknown message' )
		.domain( { m: Message } )
		.salience( -1000 )
		.condition( (m) => !m.type )
		.effect( (m) => {
			m.type = 'UNKNOWN';
			m.completed = true;
			engine.assert( new Reply( m, 'unknown-message', {} ) );
		} );

}

module.exports = Message;
