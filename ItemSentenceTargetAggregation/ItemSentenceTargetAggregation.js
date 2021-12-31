/*-----------------------------------------------------------------------------------------------
    
　有効相手がアイテム情報欄で確認可能になります
  さらに別プラグインが存在する場合追加の処理が可能になります。
  CustomAggregationViewer.js
  https://www.mediafire.com/file/6vy5cbpcz3r7g6m/Plugin_CustomAggregationViewer.zip/file

  有効相手はtargetAggregation

  それぞれcustomTextかcustomTextListを設定できます
  (両方設定するとcustomTextListが優先されます)

  例：
  アイテムのカスパラ表記を
  「  特効   歩兵系
    　　　 　悪魔系
    　専用 　歩兵(魔道士は除く)
    全対象外 選ばれし者」
  としたい場合
  {
	effectiveAggregation:{customTextList:['歩兵系','悪魔系']},
	onlyAggregation:{customText:'歩兵(魔道士は除く)'},
	targetAggregation:{customText:'選ばれし者'}
  }
  とします

■対応バージョン
　SRPG Studio Version:1.249

■作成者：熱帯魚

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

-----------------------------------------------------------------------------------------------*/
var Nettaigyo = Nettaigyo || {};

	//ベースクラス
	//対象外の他にも項目増やしたい時に継承して作ると便利かもです
	Nettaigyo.BaseItemSentenceCustomAggregation = defineObject(BaseItemSentence,
	{
		_customAggregation: null,
		_aggregationViewer: null,
		
		setParentWindow: function(itemInfoWindow) {
			var item = itemInfoWindow.getInfoItem();
			var aggregation = this._getAggregation(item);
			this._customAggregation = null;
			this._setCustomParamter(item,aggregation,itemInfoWindow);
		},
		//元々の処理
		_baseSetParentWindow: function(aggregation,itemInfoWindow) {
			BaseItemSentence.setParentWindow.call(this, itemInfoWindow);
			
			this._aggregationViewer = createObject(AggregationViewer);
			this._aggregationViewer.setAggregationViewer(aggregation);
		},
		
		moveAggregationViewer: function() {
			return MoveResult.CONTINUE;
		},
		
		drawItemSentence: function(x, y, item) {
			if( this._customAggregation === null ){
				this._aggregationViewer.drawAggregationViewer(x, y, this._getName());
				return;
			}
			this._customAggregation.drawAggregationViewer(x,y,this._getName());
		},
		
		getItemSentenceCount: function(item) {
			if( this._customAggregation === null ){
				return this._aggregationViewer.getAggregationViewerCount();
			}
			return this._customAggregation.getAggregationViewerCount();
		},
		
		//----------------
		//ここから下が独自に設定する処理
		_getName: function() {
			return root.queryCommand('only_capacity');
		},
		//ここはアイテムごとに変更しないとエラーが出る
		_getAggregation: function(item) {
			return null;
			//return item.getAvailableAggregation();
		},
		//カスタムした内容物を使うかどうか
		_setCustomParamter:function (item,aggregation,itemInfoWindow) {
			if( Nettaigyo.CustomAggregationViewer == undefined || item == null || item.custom.effectiveAggregation === undefined){
				this._baseSetParentWindow(aggregation,itemInfoWindow);
			}else{
				this._customAggregation = createObject(Nettaigyo.CustomAggregationViewer);
				this._customAggregation.setAggregationViewer(item.custom.effectiveAggregation);
			}
		}
	}
	);
	//有効相手
	//Nettaigyo.ItemSentenceTargetAggregationという名称で作る
	//ItemSentence.TargetAggregation
	//だと公式の名称になりそうなので
	Nettaigyo.ItemSentenceTargetAggregation= defineObject(Nettaigyo.BaseItemSentenceCustomAggregation,
	{
		_name:'対象外',
		//----------------
		//ここから下が独自に設定する処理
		_getName: function() {
			return this._name;
		},
		//ここはアイテムごとに変更しないとエラーが出る
		_getAggregation: function(item) {
			if(item==null){
				return null;
			}
			//return item.getAvailableAggregation();
			return item.getTargetAggregation();
			//return item.getAvailableAggregation();
		},
		//カスタムした内容物を使うかどうか
		_setCustomParamter:function (item,aggregation,itemInfoWindow) {
			if( Nettaigyo.CustomAggregationViewer == undefined || item == null || item.custom.targetAggregation === undefined){
				this._baseSetParentWindow(aggregation,itemInfoWindow);
			}else{
				this._customAggregation = createObject(Nettaigyo.CustomAggregationViewer);
				this._customAggregation.setAggregationViewer(item.custom.targetAggregation);
			}

			var matchtype = aggregation.getMatchType();
			if (matchtype === MatchType.MATCH) {
				this._name = StringTable.Aggregation_Match;
			}
			else if (matchtype === MatchType.MISMATCH) {
				this._name = StringTable.Aggregation_Mismatch;
			}
			else if (matchtype === MatchType.MATCHALL) {
				this._name = StringTable.Aggregation_MatchAll;
			}
			else {
				this._name = StringTable.Aggregation_MismatchAll;
			}
		}
	}
	);
(function () {

	var alias = ItemInfoWindow._configureItem;
	ItemInfoWindow._configureItem = function(groupArray) {
		alias.call(this,groupArray);
		groupArray.appendObject(Nettaigyo.ItemSentenceTargetAggregation);
	}
})();