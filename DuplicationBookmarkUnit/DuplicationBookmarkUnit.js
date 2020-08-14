/*--------------------------------------------------------------------------
  
The plugin provides an event command that allows you to generate units in the bookmarks tab.

How to use

Code Execution
[RYBA.CreateBookmarkControl.createBookmarkContent();]
and write

original content
Number 1 (X coordinate)
Number 2 (Y coordinate)
Number 3 (bookmarkId)
Number 4 (UnitType: PLAYER:0,ENEMY:1,ALLY:2)
Set parameters

update
20/08/15@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.CreateBookmarkControl = {
// bookmarkunitid    :ID+524288 (65536*8)
    _bookmark_unitid:524288,
    createBookmarkContent:function(){
        var content = root.getEventCommandObject().getOriginalContent();
        if(!content){
            return;
        }
        var bookmarkId = content.getValue(2) + this._bookmark_unitid;
        var x = content.getValue(0);
        var y = content.getValue(1);
        var unitType = content.getValue(3);
        if( unitType < 0 || unitType > 2){
            unitType = 0;
        }
        var list = root.getBaseData().getBookmarkUnitList();
        var bookmarkUnit = list.getDataFromId(bookmarkId);
        if(!bookmarkUnit){
            return null;
        }
        
        this.createUnit(bookmarkUnit, x, y, unitType);
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

    }
};