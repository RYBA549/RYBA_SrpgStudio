/*--------------------------------------------------------------------------------------------------
If a skill has already been learned with a skill learning item
If a skill is already learned with a skill acquisition item, you can disable it with this plugin.

update
21/04/24@create
Version
@SRPG Studio Version:1.216
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------------------------------*/
(function () {
	//スキル習得
	//現在セットしているスキルと外しているスキルをID配列でまとめて取得
	Miscellaneous.getSetSkillAndRemoveSkillIdArray= function(unit){
		var arr = Miscellaneous.getRemoveSkillIdArray(unit);
		// 現在所持しているスキルを配列にして取得
		var i, skill;
		var list = unit.getSkillReferenceList();
		var count = list.getTypeCount();

		for (i = 0; i < count; i++) {
			skill = list.getTypeData(i);
			
			arr.push(skill.getId());
		}

		return arr;
	}

	Miscellaneous.isCondSkillManageToId= function(unit, skillId){
		var arr = Miscellaneous.getSetSkillAndRemoveSkillIdArray(unit);
		var i;
		var len = arr.length;
		for (i = 0; i < len; i++) {
			if( arr[i] === skillId ){
				return true;
			}
		}
		return false;
	}

	//スキル習得での条件を変更する
	SkillChangeItemAvailability._isCondition = function(unit, targetUnit, item) {
		if(!item.getTargetAggregation().isCondition(targetUnit)){
			return false;
		}
		var skill = Nettaigyo.Item.CustomControl.getSkillGetSkillData(item);
		if(skill == null){
			return false;
		}
		return !Miscellaneous.isCondSkillManageToId(targetUnit,skill.getId());
	};

	var aliasIsItemAllowed = ItemMessenger.isItemAllowed;
	ItemMessenger.isItemAllowed = function(unit, item) {
		var result = aliasIsItemAllowed.call(this,unit,item);
		if(!result){
			return result;
		}

		var obj = ItemPackageControl.getItemAvailabilityObject(item);
		if (obj === null) {
			return false;
		}
		return obj.isItemAvailableCondition(unit, item);
	};
})();
