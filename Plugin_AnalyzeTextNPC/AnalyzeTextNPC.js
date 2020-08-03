
/*--------------------------------------------------------------------------
  
NPCs will also be able to use control characters

Up to number 3 is available.
Copy and add more classes if you need to.


update
20/04/21　create


Version
　SRPG Studio Version:1.210

URL
https://github.com/RYBA549/RYBA_SrpgStudio

MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.DataVariable = RYBA.DataVariable || {};
RYBA.DataVariable.Np1 = defineObject(BaseDataVariable,
{
    getList: function() {
        return root.getBaseData().getNpcList(0);
    },
    
    getKey: function() {
        var key = /\\np1\[(\d+)\]/;
        
        return key;
    }
});
RYBA.DataVariable.Np2 = defineObject(BaseDataVariable,
{
    getList: function() {
        return root.getBaseData().getNpcList(1);
    },
    
    getKey: function() {
        var key = /\\np2\[(\d+)\]/;
        
        return key;
    }
});
RYBA.DataVariable.Np3 = defineObject(BaseDataVariable,
{
    getList: function() {
        return root.getBaseData().getNpcList(2);
    },
    
    getKey: function() {
        var key = /\\np3\[(\d+)\]/;
        
        return key;
    }
});
(function() {
    var alias = VariableReplacer._configureVariableObject;
	VariableReplacer._configureVariableObject = function(groupArray) {
        alias.call(this,groupArray);
        groupArray.appendObject(RYBA.DataVariable.Np1);
        groupArray.appendObject(RYBA.DataVariable.Np2);
	groupArray.appendObject(RYBA.DataVariable.Np3);
	}
})();
