/*-----------------------------------------------------------------------------------------------------------------
  
This plugin provides an event command that generates alter egos with the same status as the specified unit.

The alter ego is generated based on the units in the bookmarks tab.

Information to be overwritten
Class, Equipment, Parameters
Information to be added
Skill
The unit is still in the bookmarks tab.
Face Graphics, Unit Direction

How to use

Code Execution
[RYBA.CreatePhantomControl.createPhantomContent();]
and write

original content
Number 1 (X coordinate)
Number 2 (Y coordinate)
Number 3 (bookmarkId)
Number 4 (UnitType: PLAYER:0,ENEMY:1,ALLY:2)
Number 5 (Set the maximum HP)
(If the value is less than or equal to 0, the maximum HP is the same as the base unit.)
Set parameters.)

update
20/08/16@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
-----------------------------------------------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.CreatePhantomControl = {
// bookmarkunitid    :ID+524288 (65536*8)
    _bookmark_unitid:524288,
    createPhantomContent:function(){
        var content = root.getEventCommandObject().getOriginalContent();
        if(!content){
            return;
        }
        var unit = content.getUnit();
        if(!unit){
            return;
        }
        var bookmarkId = content.getValue(2) + this._bookmark_unitid;
        var x = content.getValue(0);
        var y = content.getValue(1);
        var unitType = content.getValue(3);
        if( unitType < 0 || unitType > 2){
            unitType = 0;
        }
        var maxhp = content.getValue(4);
        var list = root.getBaseData().getBookmarkUnitList();
        var bookmarkUnit = list.getDataFromId(bookmarkId);
        if(!bookmarkUnit){
            return;
        }
        
        var newUnit = this.createUnit(bookmarkUnit, x, y, unitType);
        if(!newUnit){
            return;
        }

        this.unitDataOverride(newUnit,unit,maxhp);

    },

    createUnit:function(baseUnit, x, y, unitType){
        var i;
        var listArray = FilterControl.getListArray(FilterControl.getNormalFilter(unitType));
        var listCount = listArray.length;
		
		for (i = 0; i < listCount; i++) {
            if (listArray[i].getCount() >= DataConfig.getMaxAppearUnitCount()) {
                return null;
            }
        }

        var pos = PosChecker.getNearbyPosFromSpecificPos(x, y, baseUnit, null);
        if (!pos) {
            return null;
        }

        var unit = root.getObjectGenerator().generateUnitFromBookmarkUnit(baseUnit,unitType);
        if (unit !== null) {
            unit.setMapX(pos.x);
            unit.setMapY(pos.y);
            UnitProvider.recoveryPrepareUnit(unit);
        }

        return unit;

    },

    unitDataOverride:function(unit, baseUnit, maxhp){
        this.itemOverride(unit,baseUnit);
        this.classOverride(unit,baseUnit);
        //this.setCharaChip(unit,baseUnit);
        this.setLevel(unit,baseUnit);
        this.skillOverride(unit,baseUnit);
        unit.setName(baseUnit.getName());

        var index = ParamGroup.getParameterIndexFromType(ParamType.MHP);
        var n;
        if(maxhp > 0){
            //root.log('maxhp > 0')
            n = maxhp;
            ParamGroup.setUnitValue(unit, index, maxhp);
        }else{
            n = ParamBonus.getMhp(unit);//ParamGroup.getUnitValue(baseUnit,index);
        }

        unit.setHp(n);
    },

    itemOverride:function(unit, baseUnit){
        var count = DataConfig.getMaxUnitItemCount();
        var item,baseItem;
        for (var i = 0; i < count; i++) {
            UnitItemControl.cutItem(unit,i);
            baseItem = UnitItemControl.getItem(baseUnit, i);
            if(baseItem){
                item = root.duplicateItem(baseItem);
                unit.setItem(i, item);
            }
        }
        UnitItemControl.arrangeItem(unit);
    },

    setLevel: function(unit, baseUnit) {
        var defaultParamValue;
        var paramTypeIndex = 0;
        var count = ParamGroup.getParameterCount();
        var weapon = null;
        var n = 0;
        
        for (var i = 0; i < count; i++) {
            defaultParamValue = ParamGroup.getUnitValue(baseUnit,i);
            ParamGroup.setUnitValue(unit,i,defaultParamValue);
        }
        unit.setLv(baseUnit.getLv());
        //this.classCheck(unit);
    },

    classOverride:function(unit, baseUnit){
        Miscellaneous.changeClass(unit, baseUnit.getClass());
    },

    skillOverride:function(unit, baseUnit){
        var i, skill;
        var skillList = baseUnit.getSkillReferenceList();
        var skillCount = skillList.getTypeCount();
        //SkillChecker.arrangeSkill(unit, null, IncreaseType.ALLRELEASE);
        for (i = 0; i < skillCount; i++) {
            skill = skillList.getTypeData(i);
            SkillChecker.arrangeSkill(unit, skill, IncreaseType.INCREASE)
        }
    }
};