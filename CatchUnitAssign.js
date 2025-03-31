/*-----------------------------------------------------------------------------------------------

「プレイヤーを敵として作成」で作った敵を捕獲した状態のままクリアするとその敵を自軍に加える事ができる。
次の章から自軍として扱える。

※当然捕獲した後にその味方が倒された場合、自軍に加わらない
※「プレイヤーを敵として作成」で作った敵以外に対しては無効
※同じユニットは1人まで
(章をまたぐなどして同一ユニットを2回以上捕獲できる機会があってもしか1人しか仲間に出来ない)

■対応バージョン
　SRPG Studio Version:1.310

■作成者：熱帯魚(/RYBA)

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

-----------------------------------------------------------------------------------------------*/

//
//
var RYBA = RYBA || {};

/*--
「フュージョン設定」の「捕獲」のIDを指定する。ツールデフォルトなら1のはず
フュージョンの種類が「フュージョン攻撃」でないデータを設定した場合、正常な動作にならないので注意

複数設定例
ID1と3と5を指定する場合
RYBA.FusionAttackIdList = [
    1,
    3,
    5
];
*/
RYBA.FusionAttackIdList = [
    1
];


RYBA.CatchUnitAssign = defineObject(BaseFlowEntry,
{
    _dynamicEvent: null,
    _IdListlen: 0,
	
	enterFlowEntry: function(battleResultScene) {
		this._prepareMemberData(battleResultScene);
		return this._completeMemberData(battleResultScene);
	},
	
	moveFlowEntry: function() {
        var result = this._dynamicEvent.moveDynamicEvent();
        if(result === MoveResult.END){
            return MoveResult.END;
        }
        return MoveResult.CONTINUE;
	},
	
	_prepareMemberData: function(battleResultScene) {
		this._dynamicEvent = createObject(DynamicEvent);
	},
    
    _completeMemberData: function(battleResultScene) {
        var active, passive, unitType, fusionData;
        var generator = this._dynamicEvent.acquireEventGenerator();
        playerList = PlayerList.getAliveList();
        var count = playerList.getCount();
        var eventOn = false;
        this._IdListlen = RYBA.FusionAttackIdList.length;

        for(var i = 0; i < count; i++){
            active = playerList.getData(i);
            fusionData = active.getUnitStyle().getFusionData();
            if(fusionData === null){
                continue;
            }
            if(!this._fusionDataMatch(fusionData)){
                continue;
            }
            passive = FusionControl.getFusionChild(active);
            unitType = active.getUnitType();
            generator.unitAssign(passive, unitType);
            eventOn = true;
        }
        
        if(!eventOn){
            return EnterResult.NOTENTER;
        }

        return this._dynamicEvent.executeDynamicEvent();
    },

    _fusionDataMatch:function(fusionData){
        for(var i = 0; i < this._IdListlen; i++){
            if(fusionData.getId() === this._IdListlen[i]){
                return true;
            }
        }
        return false;
    }
}
);

(function() {
    var alias1 = BattleResultScene._pushFlowEntriesBefore;
    BattleResultScene._pushFlowEntriesBefore = function(straightFlow) {
		alias1.call(this,straightFlow);
        straightFlow.pushFlowEntry(RYBA.CatchUnitAssign);
	}
})();