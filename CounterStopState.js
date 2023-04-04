/*-----------------------------------------------------------------------------------------------
    
　特定のステートが付与されるとそのユニットは反撃不能になります
　（攻撃を仕掛ける事はできます）

■使い方
　

■ステートのカスパラ
//
{
    counter_invalid:1
}

■設定項目

　

■対応バージョン
　SRPG Studio Version:1.279

■作成者：熱帯魚

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

-----------------------------------------------------------------------------------------------*/

var Ryba = Ryba || {};
Ryba.CounterStopStateControl = {
    getInvalidState: function(unit) {
        var i, state;
        var list = unit.getTurnStateList();
        var count = list.getCount();
        
        // ユニットに設定されているステートを配列に設定
        for (i = 0; i < count; i++) {
            state = list.getData(i).getState();
            if( typeof list.getData(i).getState().custom.counter_invalid === 'number'){
                return state;
            }
        }
        return null;
    }
};



(function() {

    var alias1 = VirtualAttackControl._isAttackStopState;
    VirtualAttackControl._isAttackStopState = function(virtualAttackUnit, state) {
        
        if(!virtualAttackUnit.isSrc){
			if(typeof state.custom.counter_invalid === 'number'){
                return true;
            }
        }
        
        return alias1.call(this, virtualAttackUnit, state);
    };

    var alias2 = AttackChecker.isCounterattack;
    AttackChecker.isCounterattack = function(unit, targetUnit) {
		if( Ryba.CounterStopStateControl.getInvalidState(targetUnit) ){
			return false;
		}
		return alias2.call(this, unit, targetUnit);
	};

})();