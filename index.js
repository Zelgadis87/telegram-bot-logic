
const _ = require( 'lodash' )
	, RuleReactor = require( 'rule-reactor' )
	;

let Update = require( './classes/Update.js' )
	, Base = require( './classes/Base.js' )
	, Message = require( './classes/Message.js' )
	, Rule = require( './classes/Rule.js' )
	, Command = require( './classes/Command.js' )
	, CommandRule = require( './classes/CommandRule.js' )
	, Reply = require( './classes/Reply.js' )
	, ShutdownRequest = require( './classes/ShutdownRequest.js' )
	;

function TelegramBotLogic() {

	let me = this;

	// Interface
	me.init = init;
	me.run = run;
	me.stop = stop;
	me.stopImmediately = stopImmediately;
	me.insertUpdate = insertUpdate;

	me.registerComponent = registerComponent;
	me.registerInitializationFunctions = registerInitializationFunctions;

	me.createRule = createRule;
	me.getChat = getChat;
	me.getUser = getUser;

	me.assert = assert;
	me.retract = retract;
	me.not = not;
	me.exists = exists;

	Object.defineProperty( me, 'data', {
		get: () => Array.from( _reactor.data.entries() )
	} );

	Object.defineProperty( me, 'domain', {
		get: () => _domain
	} );

	// Implementation

	var _reactor
		, _initFunctions = []
		, _ruleBuilders = []
		, _assertions = []
		, _domain = {}
		, _running = false
		, _shuttingDown = false
		;

	function assert( x ) {
		if ( !_reactor ) {
			_assertions.push( x );
		} else {
			_reactor.assert( x );
		}
	}

	function retract( x ) {
		if ( !_reactor )
			throw new Error( 'Reactor not started.' );
		_reactor.retract( x );
	}

	function not( x ) {
		if ( !_reactor )
			throw new Error( 'Reactor not started.' );
		_reactor.not( x );
	}

	function exists( x ) {
		if ( !_reactor )
			throw new Error( 'Reactor not started.' );
		_reactor.exists( x );
	}

	function init( bot, knownChats, knownUsers ) {
		me.bot = bot;
		_knownChats = knownChats;
		_knownUsers = knownUsers;

		_reactor = new RuleReactor( _domain );
		_reactor.trace( 1 );
	}

	function run() {
		if ( !_running ) {
			_.each( _initFunctions, fn => fn( me ) );
			_.each( buildRules(), r => _reactor.createRule( r.name, r.salience, r.domain, r.conditions, r.effect ) );
			_.each( _assertions, x => _reactor.assert( x ) );
			_reactor.run( Infinity, true );
		}
		return
	}

	function insertUpdate( telegramUpdate ) {
		if ( _shuttingDown )
			throw new Error( 'Cannot process update since we are shutting down.' );
		_reactor.assert( new Update( telegramUpdate ) );
		return Promise.resolve( telegramUpdate );
	}

	function createRule() {
		var r = Rule.Builder.create();
		_ruleBuilders.push( r );
		return r;
	}

	function buildRules() {
		return _.map( _ruleBuilders, rb => rb.build() );
	}

	function getChat( chat ) {
		let knownChat = _knownChats[ chat.id ];
		if ( !knownChat ) {
			knownChat = _knownChats[ chat.id ] = _.clone( chat );
			knownChat.receivedMessages = 0;
			knownChat.lastUpdated = new Date( 0 );
			knownChat.lastMessage = null;
		}
		return knownChat;
	}

	function getUser( user ) {
		let knownUser = _knownUsers[ user.id ];
		if ( !knownUser ) {
			knownUser = _knownUsers[ user.id ] = _.clone( user );
			knownUser.receivedMessages = 0;
			knownUser.lastUpdated = new Date( 0 );
			knownUser.lastMessage = null;
		}
		return knownUser;
	}

	function registerComponent( componentName, componentClass, componentInitializationFn ) {
		_domain[ componentName ] = componentClass;
		registerInitializationFunctions( componentInitializationFn );
	}

	function registerInitializationFunctions( initializationFunction ) {
		_initFunctions.push( initializationFunction );
	}

	function stop() {

		if ( _shuttingDown )
			return _shuttingDown;

		if ( !_reactor ) {
			_shuttingDown = stopImmediately();
			return _shuttingDown;
		}

		_shuttingDown = new Promise( resolve => _reactor.assert( new ShutdownRequest( resolve ) ) ).then( stopImmediately );
		return _shuttingDown;

	}

	function stopImmediately() {
		if ( _reactor ) {
			return _reactor.stop();
		} else {
			return Promise.resolve();
		}
	}

	registerComponent( 'Base', Base, Base.createRules );
	registerComponent( 'Update', Update, Update.createRules );
	registerComponent( 'Message', Message, Message.createRules );
	registerComponent( 'Command', Command, Command.createRules );
	registerComponent( 'CommandRule', CommandRule, CommandRule.createRules );
	registerComponent( 'Reply', Reply, Reply.createRules );
	registerComponent( 'ShutdownRequest', ShutdownRequest, ShutdownRequest.createRules );

	return this;

}

module.exports = TelegramBotLogic;
