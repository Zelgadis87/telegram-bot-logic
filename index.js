
const _ = require( 'lodash' ),
	Bluebird = require( 'bluebird' ),
	RuleReactor = require( 'rule-reactor' );

let Update = require( './classes/Update.js' )
	, Base = require( './classes/Base.js' )
	, Message = require( './classes/Message.js' )
	, Rule = require( './classes/Rule.js' )
	, Command = require( './classes/Command.js' )
	, Reply = require( './classes/Reply.js' )
	;

function TelegramBotLogic() {

	// var isNewMessage = ( m ) => m.state === 'NEW';
	// var isBeingProcessedMessage = ( m ) => m.state === 'PROCESSING';
	// var isProcessedMessage = ( m ) => m.state === 'PROCESSED';

	// var isTextMessage = ( m ) => m.data.text && m.data.text.length;
	// var isCommandMessage = ( m ) => isTextMessage( m ) && m.data.text[ 0 ] === '/';

	// reactor.createRule( 'I have a message update', 0, { u: Update }, [
	// 	( u ) => u.data.message
	// ], ( u ) => {
	// 	let m = _.extend( new Message(), { data: u.data.message, update: u, state: 'NEW' } );
	// 	reactor.assert( m );
	//
	// 	reactor.retract( u );
	// } );

	// reactor.createRule( 'Get message chat', 10, { m: Message },
	// 	[
	// 		isNewMessage,
	// 		( m ) => !m.chat && m.data.chat
	// 	],
	// 	function( m ) {
	// 		m.chat = Traktgram.getChat( m.data.chat );
	// 		m.chat.receivedMessages++;
	// 		if ( !m.chat.lastUpdated || m.chat.lastUpdated < m.data.date ) {
	// 			m.chat.lastUpdated = m.data.date;
	// 			m.chat.lastMessage = m.data;
	// 		}
	// 	}
	// );
	//
	// reactor.createRule( 'Get message user', 9, { m: Message },
	// 	[
	// 		isNewMessage,
	// 		( m ) => !m.user && m.data.from
	// 	],
	// 	function( m ) {
	// 		m.user = Traktgram.getUser( m.data.from );
	// 		m.user.receivedMessages++;
	// 		if ( !m.user.lastUpdated || m.user.lastUpdated < m.data.date ) {
	// 			m.user.lastUpdated = m.data.date;
	// 			m.user.lastMessage = m.data;
	// 		}
	// 	}
	// );
	//
	// reactor.createRule( 'I have a command message', 0, { m: Message },
	// 	[
	// 		isNewMessage,
	// 		( m ) => !m.command,
	// 		isCommandMessage
	// 	],
	// 	function( m ) {
	// 		m.command = m.data.text.split( ' ' )[ 0 ].substring( 1 );
	// 	}
	// );
	//
	// reactor.createRule( 'ASD Command found', 0, { m: Message },
	// 	[
	// 		isNewMessage,
	// 		(m) => m.command === 'asd'
	// 	],
	// 	function( m ) {
	// 		m.state = 'PROCESSING';
	// 		Bluebird.resolve( true ).then( () => {
	// 			m.state = 'PROCESSED';
	// 			reactor.assert( new Reply( m, 'ok', {} ) );
	// 		} );
	// 	}
	// );
	//
	// reactor.createRule( 'Unknown command', -999, { m: Message },
	// 	[
	// 		isNewMessage,
	// 		( m ) => m.command
	// 	],
	// 	( m ) => {
	// 		console.warn( "I don't know how to reply to command:", m.command );
	// 		m.state = 'PROCESSED';
	// 		reactor.assert( new Reply( m, 'unknown-command', {} ) );
	// 	}
	// );
	//
	// reactor.createRule( 'Unknown message', -1000, { m: Message },
	// 	[
	// 		isNewMessage
	// 	],
	// 	( m ) => {
	// 		console.warn( "I don't know how to reply to message:", m.data );
	// 		m.state = 'PROCESSED';
	// 		reactor.assert( new Reply( m, 'unknown-message', {} ) );
	// 	}
	// );
	//
	// reactor.createRule( 'I have a reply', 0, { r: Reply },
	// 	_.constant( true ),
	// 	(r) => {
	// 		Traktgram.sendReply( r );
	// 		reactor.retract( r );
	// 	}
	// )
	//
	// reactor.createRule( 'Processed message', -1000, { m: Message },
	// 	isProcessedMessage,
	// 	( m ) => {
	// 		// TODO: Retract chat and user.
	// 		Traktgram.saveData();
	// 		reactor.retract( m );
	// 	}
	// );
	//
	// reactor.createRule( 'Unknown update', -1000, { u: Update },
	// 	( u ) => true,
	// 	( u ) => {
	// 		console.warn( "I don't know what to do with an update:", u );
	// 		reactor.retract( u );
	// 	}
	// );

	// Interface
	this.activate = activate;
	this.stop = stop;
	this.insertUpdate = insertUpdate;
	this.registerComponent = registerComponent;
	this.addRules = addRules;
	this.getEngine = getEngine;

	// Implementation

	var _reactor,
		_engine,
		_initFunctions = [],
		_domain = {};

	function activate(bot, knownChats, knownUsers) {
		_reactor = new RuleReactor( _domain );
		_engine = new Engine( _reactor, bot, knownChats, knownUsers );
		_.each( _initFunctions, (fn) => fn( _engine ) );
		_.each( _engine.buildRules(), (r) => _reactor.createRule( r.name, r.salience, r.domain, r.conditions, r.effect ) );

		_reactor.trace( 0 ) ;
		_reactor.run( Infinity, true );
		return

	}

	function getEngine() {
		// DEBUG ONLY
		return _engine;
	}

	function insertUpdate( telegramUpdate ) {
		_reactor.assert( new Update( telegramUpdate ) );
		return Promise.resolve( telegramUpdate );
	}

	// Engine is a wrapper object around the reactor function.
	// All basic functions of reactor are aliased from engine.
	// The rest of the reactor internals are kept private.
	// In addition, some common logic functions are present on engine.
	function Engine( _reactor, bot, knownChats, knownUsers ) {

		var engine = this;

		// Interface
		engine.createRule = createRule;
		engine.buildRules = buildRules;
		engine.getChat = getChat;
		engine.getUser = getUser;
		engine.bot = bot;

		_.each( [ 'assert', 'retract', 'not', 'exists' ], (k) => engine[k] = _.bind( _reactor[k], _reactor ) );

		Object.defineProperty( engine, 'domain', {
			get: () => _reactor.domain
		} );
		Object.defineProperty( engine, 'data', {
			get: () => _reactor.data
		} );

		// Implementation
		var _ruleBuilders = [];

		function createRule() {
			var r = Rule.Builder.create();
			_ruleBuilders.push(r);
			return r;
		}

		function buildRules() {
			return _.map( _ruleBuilders, (rb) => rb.build() );
		}

		function getChat( chat ) {
			let knownChat = knownChats[ chat.id ];
			if ( !knownChat ) {
				knownChat = knownChats[ chat.id ] = _.clone( chat );
				knownChat.receivedMessages = 0;
				knownChat.lastUpdated = new Date( 0 );
				knownChat.lastMessage = null;
			}
			return knownChat;
		}

		function getUser( user ) {
			let knownUser = knownUsers[ user.id ];
			if ( !knownUser ) {
				knownUser = knownUsers[ user.id ] = _.clone( user );
				knownUser.receivedMessages = 0;
				knownUser.lastUpdated = new Date( 0 );
				knownUser.lastMessage = null;
			}
			return knownUser;
		}

	}

	function registerComponent(componentName, componentClass, componentInitializationFn) {
		_domain[ componentName ] = componentClass;
		addRules( componentInitializationFn );
	}

	function addRules( initializationFunction ) {
		_initFunctions.push( initializationFunction );
	}

	function stop() {
		if ( _reactor )
			return _reactor.stop();
	}

	registerComponent( 'Base', Base, Base.createRules );
	registerComponent( 'Update', Update, Update.createRules );
	registerComponent( 'Message', Message, Message.createRules );
	registerComponent( 'Command', Command, Command.createRules );
	registerComponent( 'Reply', Reply, Reply.createRules );

	return this;

}

module.exports = TelegramBotLogic;
