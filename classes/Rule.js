
const _ = require( 'lodash' );

function Rule(name, salience, domain, conditions, effect) {
	this.name = name;
	this.salience = salience;
	this.domain = domain;
	this.conditions = conditions.length === 0 ? () => true : conditions;
	this.effect = effect;
}

var _builderId = 0;
Rule.Builder = function() {

	// Interface
	this.build = build;
	this.name = name;
	this.salience = salience;
	this.domain = domain;
	this.condition = condition;
	this.conditions = conditions;
	this.effect = effect;

	// Implementation
	var _builder = this;
	var _name = 'Rule#' + (++_builderId);
	var _salience = 0;
	var _domain = {};
	var _conditions = [];
	var _effect = _.noop;

	function build() {
		return new Rule( _name, _salience, _domain, _conditions, _effect );
	}

	function name(x) {
		// TODO: Check if X is a string.
		_name = x;
		return _builder;
	}

	function salience(x) {
		// TODO: Check if X is a number.
		_salience = x;
		return _builder;
	}

	function domain(x) {
		// TODO: Check if X is an object.
		_domain = x;
		return _builder;
	}

	function condition(x) {
		// TODO: Check if X is a function.
		_conditions.push(x);
		return _builder;
	}

	function conditions(x) {
		// TODO: Check if X is an array.
		_conditions = x;
		return _builder;
	}

	function effect(x) {
		// TODO: Check if X is a function..
		_effect = x;
		return _builder;
	}

	return this;

}

Rule.Builder.create = () => new Rule.Builder();

module.exports = Rule;
