
/*--------------------------------------------------------------------------

Calling ExperienceDistributionScreen by Event Command

update
20/08/03　create

Version
　SRPG Studio Version:1.210

URL
https://github.com/RYBA549/RYBA_SrpgStudio

MIT License Copyright (c) 2020 RYBA(熱帯魚)

--------------------------------------------------------------------------*/
var Nettaigyo = Nettaigyo || {};


Nettaigyo.ExperienceDistributionCallEventCommand = defineObject(BaseEventCommand,
{
	_baseScreen: null,
	
	enterEventCommandCycle: function() {
		this._prepareEventCommandMemberData();
		
		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}
		
		return this._completeEventCommandMemberData();
	},
	
	moveEventCommandCycle: function() {

		if (this._baseScreen.moveScreenCycle() === MoveResult.END) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawEventCommandCycle: function() {
		this._baseScreen.drawScreenCycle();
	},
	
	_prepareEventCommandMemberData: function() {
		this._baseScreen = createObject(ExperienceDistributionScreen);
	},
	
	_checkEventCommand: function() {
		return true;
	},

	isEventCommandSkipAllowed: function() {
		return false;
	},
	
	_completeEventCommandMemberData: function() {
		var screenParam;
		
		screenParam = this._createScreenParam();
		this._baseScreen.setScreenData(screenParam);
		this._doCurrentAction();
		
		return EnterResult.OK;
	},
	
	_doCurrentAction: function() {
		var unit;
		
		if (root.getBaseScene() === SceneType.REST) {
			return;
		}
		
		if (!root.getCurrentSession().isMapState(MapStateType.PLAYERFREEACTION)) {
			unit = root.getCurrentSession().getActiveEventUnit();
			if (unit !== null) {
				// If the unit is executed via a unit command, it is treated as a standby.
				unit.setWait(true);
			}
		}
	},
	
	_createScreenParam: function() {
		return {};
	},
	getEventCommandName: function() {
		return 'Nettaigyo.ExperienceDistributionCallEventCommand';
	}
}
);

(function() {

	var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
		alias1.call(this, groupArray);
	
		groupArray.appendObject(Nettaigyo.ExperienceDistributionCallEventCommand);
	};
})();
