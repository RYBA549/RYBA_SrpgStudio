/*--------------------------------------------------------------------------
  
This plugin provides an event command that allows you to duplicate enemies.

As a reminder, you can only duplicate enemy units once they have appeared.

Prepare a dummy enemy unit that you want to duplicate beforehand.
Erase it at the opening.
That unit can be called up with this event command.

How to use

Code Execution
[RYBA.CreateUnitControl.createEnemyContent();]
and write

original content
Unit
Number 1 (X coordinate)
Number 2 (Y coordinate)
Set three parameters

update
20/08/03?@create
Version
?@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.CreateUnitControl = {

    createUnitContent:function(){
        var content = root.getEventCommandObject().getOriginalContent();
        if(!content){
            return;
        }
        var unit = content.getUnit();
        if(!unit){
            return;
        }
        //root.log(unit.getId());
        var x = content.getValue(0);
        var y = content.getValue(1);
        this.createEnemyToUnit(unit, x, y);
    },

    createEnemyToUnit:function(baseUnit, x, y){

        var list = EnemyList.getAliveList();
		
		if (list.getCount() >= DataConfig.getMaxAppearUnitCount()) {
			return null;
		}

        var pos = PosChecker.getNearbyPosFromSpecificPos(x, y, baseUnit, null);
        if (!pos) {
            return null;
        }

        var unit = root.getObjectGenerator().generateUnitFromBookmarkUnit(baseUnit,UnitType.ENEMY);
        if (unit !== null) {
            unit.setMapX(pos.x);
            unit.setMapY(pos.y);
            unit.setAliveState(AliveType.ALIVE);
            UnitProvider.recoveryPrepareUnit(unit);
        }

        return unit;

    }
};