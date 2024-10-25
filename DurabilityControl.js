
/**
 * マップクリア後にストックと自軍の持ち物の耐久を全回復するプラグイン
 */
var RYBA = RYBA || {};

RYBA.DurabilityControl = {

    resetDurability:function(item){
        var max = item.getLimitMax();
        item.setLimit(max);
    },

    unitResetDurability:function(unit){
        var i, item;
        var count = UnitItemControl.getPossessionItemCount(unit);
        
        for (i = 0; i < count; i++) {
            item = UnitItemControl.getItem(unit, i);
            if( item == null ){
                continue;
            }
            this.resetDurability(item);
        }
    },

    unitListResetDurability:function(list){
        var count = list.getCount();
        
        for( i = 0; i < count; ++i ){
            var unit = list.getData(i);
            this.unitResetDurability(unit);
        }
    },

    stockAllItemResetDurability:function(){
        var count = StockItemControl.getStockItemCount();
        var i;
        for( i = 0; i < count; ++i ){
          var item = StockItemControl.getStockItem(i);
          this.resetDurability(item);
        }
    },

    playerUnitAllResetDurability:function(){
        var list = PlayerList.getAliveDefaultList();
        this.unitListResetDurability(list);
    }
};

/**
 * スクリプトの実行のコード実行で以下のコードを実行する事でも回復できます。
 * RYBA.DurabilityControl.stockAllItemResetDurability();
 * RYBA.DurabilityControl.playerUnitAllResetDurability();
 */
/**
 * 耐久回復タイミングを制御したい場合、
 * 以下のコードをコメントアウトしてください。
 */
(function() {
    var alias = BattleResultScene._doEndAction;
    BattleResultScene._doEndAction = function() {
        alias.call(this);
        RYBA.DurabilityControl.stockAllItemResetDurability();
        RYBA.DurabilityControl.playerUnitAllResetDurability();
	}
})();
