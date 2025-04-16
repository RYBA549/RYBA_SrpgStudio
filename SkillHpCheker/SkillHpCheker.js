/*--------------------------------------------------------------------------
  
You can fine-tune the target HP for the skills.

1.support skills : RYBA_CondSupportHpRate
2.active skills : RYBA_CondPlayerHpRate or RYBA_CondEnemyHpRate

Custom Parameter Setting Example.

For example 1.
HP less than half a point.
{
	RYBA_CondSupportHpRate:{
		minHp:0,
		maxHp:50
	}
}

For example 2.
HP remaining at least 80%.
{
	RYBA_CondSupportHpRate:{
		minHp:80,
		maxHp:100
	}
}

update
20/08/03@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.UnitHpChecker = {
    isTargetHp:function(targetUnit, conditionParam){
        var maxHp = ParamBonus.getMhp(targetUnit);
        var currentHp = targetUnit.getHp();
        
        return this.isBaseTargetHp(maxHp, currentHp, conditionParam);
    },
    
    isBaseTargetHp:function(maxHp, currentHp, conditionParam){
        var baseHp = 100;
        baseHp = maxHp * (conditionParam.minHp / 100 );
        if (currentHp < baseHp) {
            return false;
        }
        baseHp = maxHp * (conditionParam.maxHp / 100 );
        if (currentHp > baseHp) {
            return false;
        }
        
        return true;

    }
};
(function() {

var alias1 = SkillRandomizer._isSkillInvokedInternal;
SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill) {
    var result = alias1.call(this,active,passive,skill);
    if( !result ){
        return false;
    }

    var playerHpRate = skill.custom.RYBA_CondPlayerHpRate;
	if(playerHpRate != null){
		if(!RYBA.UnitHpChecker.isTargetHp(active, playerHpRate )){
			return false;
		}
    }

	var enemyHpRate = skill.custom.RYBA_CondEnemyHpRate;
	if(enemyHpRate != null){
		if(!RYBA.UnitHpChecker.isTargetHp(passive, enemyHpRate )){
			return false;
		}
    }

    return result;
}


var alias2 = SupportCalculator._isSupportable;
SupportCalculator._isSupportable = function(unit, targetUnit, skill) {
	
    var result = alias2.call(this, unit, targetUnit, skill);
    if( !result ){
        return false;
    }
	if (targetUnit === null) {
        targetUnit = unit;
    }
    var enemyHpRate = skill.custom.RYBA_CondSupportHpRate;
    if(enemyHpRate != null){
        result = RYBA.UnitHpChecker.isTargetHp(targetUnit, enemyHpRate );
    }
	return result;
};

})();
