
const _ = require( 'lodash' )
	, RuleReactor = require( 'rule-reactor' )
	;

let Update = require( './classes/Update.js' )
	, Base = require( './classes/Base.js' )
	, Message = require( './classes/Message.js' )
	, Rule = require( './classes/Rule.js' )
	, Command = require( './classes/Command.js' )
	, Reply = require( './classes/Reply.js' )
	;

function TelegramBotLogic() {

	// Interface
	this.activate = activate;
	this.stop = stop;
	this.insertUpdate = insertUpdate;
	this.registerComponent = registerComponent;
	this.registerInitializationFunctions = registerInitializationFunctions;

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
		registerInitializationFunctions( componentInitializationFn );
	}

	function registerInitializationFunctions( initializationFunction ) {
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
