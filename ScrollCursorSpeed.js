/*--------------------------------------------------------------------------------------------------
update
21/05/05@create
Version
@SRPG Studio Version:1.216
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------------------------------*/
(function() {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function(groupArray) {
        alias1.call(this,groupArray);
        groupArray.appendObject(ConfigItem.ScrollCursorSpeed);
    }

    InputControl.resetCounterInfo = function(){
        var ary = ConfigItem.ScrollCursorSpeed.getSpeedArray();
        var keyWait = ary[ConfigItem.ScrollCursorSpeed.getFlagValue()];
        this._counter.setCounterInfo(keyWait);
    };
    var aliasInitSingleton = InputControl.initSingleton;
    InputControl.initSingleton = function() {
        aliasInitSingleton.call(this);
        this.resetCounterInfo();
    };
	ConfigItem.ScrollCursorSpeed = defineObject(BaseConfigtItem,
	{
		selectFlag: function(index) {
			root.getExternalData().env.scrollCursorSpeed = index;
			InputControl.resetCounterInfo();
		},
		
		getFlagValue: function() {
			if (typeof root.getExternalData().env.scrollCursorSpeed !== 'number') {
				return 1;
			}
		
			return root.getExternalData().env.scrollCursorSpeed;
		},
		
		getFlagCount: function() {
			return 5;
		},
		
		getConfigItemTitle: function() {
			return 'リストカーソル速度';
		},
		
		getConfigItemDescription: function() {
			//root.log(root.getExternalData().env.scrollCursorSpeed);
			return 'リストカーソルの移動速度を設定します';
		},
	
		getObjectArray: function() {
			return ['5', '4', '3', '2', '1'];
		},
		
		getSpeedArray: function() {
			return [2, 3, 4, 5, 6];
		}
	}
	);
})();
