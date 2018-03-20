
const _ = require( 'lodash' )
	, Base = require( './Base.js' )
	, Command = require( './Command.js' )
	, Reply = require( './Reply.js' )
	;

class Message extends Base {

	constructor( telegramMessage, update ) {
		super();
		this.data = telegramMessage;
		this.update = update;
		this.parent = update;
	}

}

Message.Types = {
	COMMAND: 'command',
	UNKNOWN: 'unknown'
}

Message.createRules = ( engine ) => {

	engine.createRule()
		.name( 'Message.RetrieveChat' )
		.salience( 10 )
		.domain( { m: Message } )
		.condition( function( m ) { return m.data.chat && !m.chat; } )
		.effect( function( m ) {
			m.chat = engine.getChat( m.data.chat );
			m.chat.receivedMessages++;
			if ( !m.chat.lastUpdated || m.chat.lastUpdated < m.data.date ) {
				m.chat.lastUpdated = m.data.date;
				m.chat.lastMessage = m.data;
			}
		} );

	engine.createRule()
		.name( 'Message.RetrieveUser' )
		.salience( 10 )
		.domain( { m: Message } )
		.condition( function( m ) { return m.data.from && !m.user; } )
		.effect( function( m ) {
			m.user = engine.getUser( m.data.from );
			m.user.receivedMessages++;
			if ( !m.user.lastUpdated || m.user.lastUpdated < m.data.date ) {
				m.user.lastUpdated = m.data.date;
				m.user.lastMessage = m.data;
			}
		} );

	engine.createRule()
		.name( 'Message.Command' )
		.domain( { m: Message } )
		.condition( function( m ) { return !m.accepted; } )
		.condition( function( m ) { return m.data.text && m.data.text.length && m.data.text[ 0 ] === '/'; } )
		.effect( function( m ) {
			m.accepted = true;
			m.type = Message.Types.COMMAND;
			m.command = new Command( m )
			engine.assert( m.command );
		} );

	engine.createRule()
		.name( 'Message.Unknown' )
		.domain( { m: Message } )
		.salience( -1000 )
		.condition( function( m ) { return !m.accepted; } )
		.effect( function( m ) {
			m.accepted = true;
			m.type = Message.Types.UNKNOWN;
			engine.assert( new Reply( m, m, 'unknown-message', {} ) );
		} );

}

module.exports = Message;
