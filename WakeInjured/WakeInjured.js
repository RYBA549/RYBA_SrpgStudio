/*-----------------------------------------------------------------------------------------------
    
　某ゲームの「蘇生のラ〇ナエイド」みたいな事ができるようになります。
　（負傷した味方まで近づいてその場で蘇生させるスキル）

■使い方
　スキルのカスタムキーワードにRybaSurvivedCommandを入力します

■スキルのカスパラ
{
    easyAnimeId:104,
    getExpPoint:10,
    unitHp:1
}

  ・easyAnimeIdでアニメーションのIDを指定して再生します。
  　設定しなかった場合104となります
　・getExpPointの分だけコマンドを使用した際に経験値が得られます
　　設定しなかった場合0となります
　・unitHpを1にすることで蘇生したユニットのHPを1にできます。
  　設定しなかった場合HP満タンで蘇生されます

■注意点
　unitHpは1を設定するか、そもそも書かないかの２つ以外を想定していません

■設定項目

　以下の二つを設定できます
　（両方falseにするとマップ上で蘇生対象を確認できなります）

　・trueにすると蘇生スキルを持つユニットにマップカーソルを合わせると蘇生対象が半透明表示される
　　Ryba.PlayerTurnModeMAP_ShowSurvivedUnit = true;

　・trueにすると蘇生スキルを持つユニットを選択すると蘇生対象が半透明表示される
　　Ryba.PlayerTurnModeAREA_ShowSurvivedUnit = true;

■対応バージョン
　SRPG Studio Version:1.265

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
Ryba.UnitCommand = Ryba.UnitCommand || {};

//スキルのカスタムキーワード
Ryba.UnitCommand.RybaSurvivedCommandKeyword = 'RybaSurvivedCommand';

//trueにすると蘇生スキルを持つユニットにマップカーソルを合わせると蘇生対象が半透明表示される
Ryba.PlayerTurnModeMAP_ShowSurvivedUnit = true;

//trueにすると蘇生スキルを持つユニットを選択すると蘇生対象が半透明表示される
Ryba.PlayerTurnModeAREA_ShowSurvivedUnit = true;

//------------------------------------------------------------------------------
//蘇生対象のキャラチップ描画する関数

UnitRenderer.resurrectionCharChip = function(unit, x, y) {
    UnitRenderer.alphaCharChip(unit, x, y, 96);
};

UnitRenderer.alphaCharChip = function(unit, x, y, alpha) {
    var handle;
    var keyword = unit.getCustomCharChipKeyword();
    var unitRenderParam = StructureBuilder.buildUnitRenderParam();
    
    this._setDefaultParam(unit, unitRenderParam);

    unitRenderParam.alpha = alpha;
    
    if (keyword !== '') {
        CustomCharChipGroup.drawMenuUnit(unit, x, y, unitRenderParam);
    }
    else {
        handle = unit.getCustomCharChipHandle();
        if (handle !== null) {
            unitRenderParam.handle = handle;
        }
        
        this.drawCharChip(x, y, unitRenderParam);
    }
};

//------------------------------------------------------------------------------
//蘇生対象を描画する処理オブジェクト

Ryba.ResurrectioningPanel = defineObject(BaseObject,{
    _updateing:false,
    _lockList:false,
    _resList: null,
    _resListCount: 0,
    setResList: function(unit) {
        //ロックしている間は更新しない
        if(this._lockList){
            return;
        }
        this._updateing = true;
        this._resList = null;
        this._resListCount = 0;
        if(unit === null){
            this._updateing = false;
            return;
        }
        //TODO: 蘇生コマンドが扱えるユニットのみにする
        if (unit.getUnitType() === UnitType.PLAYER) {
            var skill = SkillControl.getPossessionCustomSkill(unit,Ryba.UnitCommand.RybaSurvivedCommandKeyword);
            if(skill){
                //root.log('createResList')
                this._createResList(unit);
            }
            this._updateing = false;
        }
    },

    setLock:function(flag){
        this._lockList = flag;
    },
    
    _createResList: function(unit){
        
        this._resList = [];
        this._resListCount = 0;
        var i, unit;
        var list = PlayerList.getDeathAndInjuryListSamePosHash(unit);
        var count = list.getCount();
        for (i = 0 ; i < count; i++) {
            unit = list.getData(i);
            this._resList.push(unit);
            this._resListCount++;
        }
        
    },
    //蘇生コマンド用
    drawMarkingPanel: function(){
        if(this._updateing || this._resListCount < 1){
            return;
        }
        var i, unit, xPixel, yPixel, aliveState;
        for (i = 0 ; i < this._resListCount; i++) {
            
            unit = this._resList[i];

            //死んでるかどうかはチェックしないと速攻を持つ蘇生コマンド時に困る
            aliveState = unit.getAliveState();
        
            if( aliveState === AliveType.DEATH || aliveState === AliveType.INJURY ){
                //TODO:組成マークを描画する
                xPixel = LayoutControl.getPixelX(unit.getMapX());
                yPixel = LayoutControl.getPixelY(unit.getMapY());
                //UnitRenderer.alphaCharChip(unit,xPixel,yPixel,192);
                UnitRenderer.resurrectionCharChip(unit,xPixel,yPixel);
            }
            
        }
    }
});

//------------------------------------------------------------------------------
//スキルコマンドベース
Ryba.UnitCommand.BaseUseAction = defineObject(UnitListCommand,
{
    _dynamicEvent: null,
    _dynamicAnime: null,
    _posSelector: null,
    _exp: 0,
    _skill:null,
    _commandName:'',
    _anime: null,
    _bottomText:null,
    _lastSelectPos:null,

    _getSkillData:function(){
        return this._skill;
    },

    openCommand: function() {
        this._prepareCommandMemberData();
        this._completeCommandMemberData();
    },
    
    moveCommand: function() {
        var mode = this.getCycleMode();
        var result = MoveResult.CONTINUE;
        
        if (mode === QuickCommandMode.SELECT) {
            result = this._moveSelect();
        }
        else if (mode === QuickCommandMode.QUICK) {
            result = this._moveQuick();
        }
        else if (mode === QuickCommandMode.DIRECT) {
            result = this._moveDirect();
        }
        else if (mode === QuickCommandMode.EXP) {
            result = this._moveExp();
        }
        
        return result;
    },
    
    drawCommand: function() {
        var mode = this.getCycleMode();
        
        if (mode === QuickCommandMode.SELECT) {
            this._drawSelect();
        }
        else if (mode === QuickCommandMode.QUICK) {
            this._drawQuick();
        }
        else if (mode === QuickCommandMode.DIRECT) {
            this._drawDirect();
        }
        else if (mode === QuickCommandMode.EXP) {
            this._drawExp();
        }
    },
    
    isCommandDisplayable: function() {
        if(!this._isActiveCond()){
            return false;
        }
        var unit = this.getCommandTarget();
        var indexArray = this._getTradeArray(unit);
        if ( indexArray.length !== 0 ){
            return true;
        }
        return false;
    },

    _isActiveCond:function() {
        return true;
    },
    
    getCommandName: function() {
        return this._commandName;
    },
    
    isRepeatMoveAllowed: function() {
        //TODO : ここはfalseにすると再移動不可になる
        return true;
    },
    
    _prepareCommandMemberData: function() {
        this._posSelector = createObject(PosSelector);
        this._dynamicEvent = createObject(DynamicEvent);
        this._dynamicAnime = createObject(DynamicAnime);
    },
    
    _completeCommandMemberData: function() {

        if (this._skill === null) {
            return;
        }

        this._posSelectorSetPos();

        this.changeCycleMode(QuickCommandMode.SELECT);
        
        //とりあえず操作ミスの一巻になりそうなのでDIRECTは無しで
        //this._exp = 10;//this._skill.getSkillSubValue();
        //if (this._skill.getSkillValue() === 0) {
        // if(true){
        // }
        // else {
        //     this._indexArray = indexArray;
        //     this._showAnime(this.getCommandTarget());
        //     this.changeCycleMode(QuickCommandMode.DIRECT);
        // }
    },
    
    _moveSelect: function() {
        var screenParam;
        var result = this._posSelector.movePosSelector();
        
        if (result === PosSelectorResult.SELECT) {
            this._lastSelectPos = this._getPosSelectable();
            if (this._lastSelectPos !== null) {
                this._posSelector.endPosSelector();
                this._showAnime(this._getAnimePos());
                this.changeCycleMode(QuickCommandMode.QUICK);
            }
        }
        else if (result === PosSelectorResult.CANCEL) {
            this._posSelector.endPosSelector();
            return MoveResult.END;
        }
        
        return MoveResult.CONTINUE;
    },
    
    _moveQuick: function() {
        if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
            this._mainAction();
            if (this._exp > 0) {
                this._changeExp();
            }
            else {
                this.endCommandAction();
                return MoveResult.END;
            }
        }
        
        return MoveResult.CONTINUE;
    },
    
    _moveDirect: function() {
        var i, count, x, y, targetUnit;
        
        if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
            count = this._indexArray.length;
            for (i = 0; i < count; i++) {
                x = CurrentMap.getX(this._indexArray[i]);
                y = CurrentMap.getY(this._indexArray[i]);
                targetUnit = PosChecker.getUnitFromPos(x, y);
                if (targetUnit !== null) {
                    targetUnit.setWait(false);
                }
            }
            
            if (this._exp > 0) {
                this._changeExp();
            }
            else {
                this.endCommandAction();
                return MoveResult.END;
            }
        }
        
        return MoveResult.CONTINUE;
    },
    
    _moveExp: function() {
        var result = this._dynamicEvent.moveDynamicEvent();
        
        if (result === MoveResult.END) {
            this.endCommandAction();
        }
        
        return result;
    },
    
    _drawSelect: function() {
        this._posSelector.drawPosSelector();
    },
    
    _drawQuick: function() {
        this._dynamicAnime.drawDynamicAnime();
    },
    
    _drawDirect: function() {
        this._dynamicAnime.drawDynamicAnime();
    },
    
    _drawExp: function() {
    },
    
    _changeExp: function() {
        var generator = this._dynamicEvent.acquireEventGenerator();
        var unit = this.getCommandTarget();
        
        generator.experiencePlus(unit, ExperienceCalculator.getBestExperience(unit, this._exp), false);
        this._dynamicEvent.executeDynamicEvent();
        this.changeCycleMode(QuickCommandMode.EXP);
    },
    
    _getPosSelectable: function() {
        var unit = this._posSelector.getSelectorTarget(true);

        if(unit !== null){
            return createPos(unit.getMapX(), unit.getMapY());
        }
        
        return null;
    },
    
    //フィルターを扱っている箇所が存在しないので無意味な処理だけど一応とっておく？
    _getUnitFilter: function() {
        return FilterControl.getNormalFilter(this.getCommandTarget().getUnitType());
    },
    
    _showAnime: function(selectPos) {
        var x = LayoutControl.getPixelX(selectPos.x);
        var y = LayoutControl.getPixelY(selectPos.y);
        var pos = LayoutControl.getMapAnimationPos(x, y, this._anime);
        
        this._dynamicAnime.startDynamicAnime(this._anime, pos.x, pos.y);
    },


    setSkill:function(skill, unit){
        this._skill = skill;
        this._exp = this._getDefExp();
        if(skill == null){
            return ;
        }

        //root.log('setSkill')

        this._setAnime(skill);

        if( typeof this._skill.custom.getExpPoint === 'number' ){
            this._exp = this._skill.custom.getExpPoint;
        }

        this._commandName = skill.getName();
        this._bottomText = null;

        this._setSkillData(unit, skill);
    },

    //-------------------------------------------------------
    //ここから下はコマンドごとに変えよう

    _getDefExp:function(){
        return 0;
    },

    //デフォルトでは踊り（味方選択系？）となっている
    _posSelectorSetPos:function(){
        var unit = this.getCommandTarget();
        var filter = this._getUnitFilter();
        var indexArray = this._getTradeArray(this.getCommandTarget());

        this._posSelector.setUnitOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Default, filter);
        this._posSelector.setFirstPos();
    },

    _getAnimePos:function(){
        return this._lastSelectPos;
    },

    //-------------------------------------------------------
    //(というかここから下は設定しないとエラー出ます)
    _mainAction: function() {
        var targetUnit = this._posSelector.getSelectorTarget(true);
        targetUnit.setWait(false);
    },
    
    _getTradeArray: function(unit) {
        var i, x, y, targetUnit;
        var indexArray = [];
        
        if (this._skill === null) {
            return indexArray;
        }
        
        for (i = 0; i < DirectionType.COUNT; i++) {
            x = unit.getMapX() + XPoint[i];
            y = unit.getMapY() + YPoint[i];
            targetUnit = PosChecker.getUnitFromPos(x, y);
            if (targetUnit !== null && unit.getUnitType() === targetUnit.getUnitType()) {
                if (targetUnit.isWait()) {
                    indexArray.push(CurrentMap.getIndex(x, y));
                }
            }
        }
        
        return indexArray;
    },

    _setAnime:function(skill){
        this._anime = null;
    },

    _setSkillData:function(unit, skill){
        
    }
}
);

//------------------------------------------------------------------------------
//蘇生コマンド（死者のマスに直接立たないと実行できない蘇生コマンド）
Ryba.UnitCommand.SurvivedCommand = defineObject(Ryba.UnitCommand.BaseUseAction,
{
    _summonUnit:function(){
        var selfUnit = this.getCommandTarget();
        var i, unit;
        var list = PlayerList.getDeathAndInjuryListSamePosHash(selfUnit);
        var count = list.getCount();
        for (i = 0 ; i < count; i++) {
            unit = list.getData(i);
            if( selfUnit.getMapX() !== unit.getMapX() || selfUnit.getMapY() !== unit.getMapY() ){
                continue;
            }
            return unit;
        }
        return null;
    },
    _getPosSelectable: function() {
        return this._posSelector.getSelectorPos(true);
    },

    _posSelectorSetPos:function(){
        var unit = this.getCommandTarget();
        var indexArray = this._getTradeArray(unit);

        this._posSelector.setPosOnly(unit, null, indexArray, PosMenuType.Default);
        this._posSelector.setFirstPos();
    },

    //-------------------------------------------------------
    //(というかここから下は設定しないとエラー出ます)
    _mainAction: function() {
        var summonUnit = this._summonUnit();
        var pos = this._lastSelectPos;
        //HPを全回復
        UnitProvider.recoveryUnit(summonUnit);
        var unitHp = this._skill.custom.unitHp;
        if(typeof unitHp === 'number'){
            summonUnit.setHp(unitHp);
        }
        summonUnit.setMapX(pos.x);
        summonUnit.setMapY(pos.y);
        summonUnit.setAliveState(AliveType.ALIVE);
        summonUnit.setSortieState(SortieType.SORTIE);
        summonUnit.setInvisible(false);
        summonUnit.setWait(true);
    },
    
    _getTradeArray: function(unit) {
        var i, x, y, summonUnit, movePoint;
        var indexArray = [];

        var summonUnit = this._summonUnit();
        
        if (this._skill === null || unit.isGuest() || summonUnit === null) {
            return indexArray;
        }

        for (i = 0; i < DirectionType.COUNT; i++) {
            x = unit.getMapX() + XPoint[i];
            y = unit.getMapY() + YPoint[i];

            targetUnit = PosChecker.getUnitFromPos(x, y);
            if(targetUnit !== null){
                continue;
            }

            movePoint = PosChecker.getMovePointFromUnit(x, y, summonUnit);
            if (movePoint < 1) {
                // 移動できない場所には召喚できない
                continue;
            }

            indexArray.push(CurrentMap.getIndex(x, y));
        }
        
        return indexArray;
    },

    //下記はコマンドごとに変えよう

    _setAnime:function(skill){
        var id = skill.custom.easyAnimeId;
        if(typeof id !== 'number'){
            id = 104;
        }
        this._anime = this._getAnimeToId(id);
    },

    _getAnimeToId: function(id){
		//trueだとランタイム、falseだとオリジナル参照のためこうする
		var runtime = true;
		if(id < 0){
			runtime = false;
			id = id * -1;
		}
		var list = root.getBaseData().getEffectAnimationList(runtime);
		var anime = list.getDataFromId(id);
		return anime;
	},

    getBottomText:function(){
        var skill = this._getSkillData();
        if(skill == null){
            return null;
        }

        if( this._bottomText === null ){
            this._bottomText = skill.getDescription();
            var summonUnit = this._summonUnit();
            this._bottomText += '\n[現在の蘇生対象：' + summonUnit.getName() + ']'
        }
        
        return this._bottomText;
    }
});
(function() {
    //------------------------------------------------------------------------------
    //MapLayer
    MapLayer._resurrectioningPanel = null;
    var alias1 = MapLayer.prepareMapLayer;
    MapLayer.prepareMapLayer = function() {
        alias1.call(this);
        this._resurrectioningPanel = createObject(Ryba.ResurrectioningPanel);
    }

    MapLayer.setResList = function(unit){
        this._resurrectioningPanel.setResList(unit);
    }
    MapLayer.setResListLock = function(unit){
        this._resurrectioningPanel.setLock(unit);
    }

    MapLayer.drawUnitLayer = function() {
		var index = this._counter.getAnimationIndex();
		var index2 = this._counter.getAnimationIndex2();
		var session = root.getCurrentSession();
		
		this._markingPanel.drawMarkingPanel();
		
		this._unitRangePanel.drawRangePanel();
		this._mapChipLight.drawLight();
		
		if (session !== null) {
			// index2は2列のキャラチップ用
			session.drawUnitSet(true, true, true, index, index2);

            if (root.getCurrentScene() === SceneType.FREE) {
                this._resurrectioningPanel.drawMarkingPanel();
            }
		}
		
		this._drawColor(EffectRangeType.MAPANDCHAR);
		
		if (this._effectRangeType === EffectRangeType.MAPANDCHAR) {
			this._drawScreenColor();
		}
	}
    //------------------------------------------------------------------------------
    //PlayerTurn
    PlayerTurn.changeCycleMode = function(mode) {
		this._masterMode = mode;
		if(mode === PlayerTurnMode.MAP){
			MapLayer.setResListLock(false);
		}
	};
    PlayerTurn._moveMap = function() {
		var result = this._mapEdit.moveMapEdit();
		
		if (result === MapEditResult.UNITSELECT) {
			this._targetUnit = this._mapEdit.getEditTarget();
			if (this._targetUnit !== null) {
				if (this._targetUnit.isWait()) {
					this._mapEdit.clearRange();
					
					// 待機しているユニット上での決定キー押下は、マップコマンドとして扱う
					this._mapCommandManager.openListCommandManager();
					this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
				}
				else {
					// ユニットの移動範囲を表示するモードに進む
					this._mapSequenceArea.openSequence(this);
                    MapLayer.setResList(Ryba.PlayerTurnModeAREA_ShowSurvivedUnit ? this._targetUnit : null);
                    MapLayer.setResListLock(true);
					this.changeCycleMode(PlayerTurnMode.AREA);
				}
			}
		}
		else if (result === MapEditResult.MAPCHIPSELECT) {
			this._mapCommandManager.openListCommandManager();
			this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
		}
		
		return MoveResult.CONTINUE;
	}

    var alias_MapPartsCollectionSetUnit = MapPartsCollection.setUnit;
	MapPartsCollection.setUnit = function(unit) {
		alias_MapPartsCollectionSetUnit.call(this,unit);
        MapLayer.setResList( Ryba.PlayerTurnModeMAP_ShowSurvivedUnit ? unit : null);
		
	};
    //------------------------------------------------------------------------------
    //AllUnitList
	AllUnitList.getDeathAndInjuryList = function(list,notGuest) {
		var funcCondition = function(unit) {
			var aliveState = unit.getAliveState();
			//ゲストは含まない
			if(notGuest){
				if(unit.isGuest()){
					return false;
				}
			}
			
			return aliveState === AliveType.DEATH || aliveState === AliveType.INJURY;
		};
		
		return this.getList(list, funcCondition);
	};

    AllUnitList._posHashArrayCheck = function(array,x,y){
		var i, data;
		var count = array.length;
		for (i = 0 ; i < count; i++) {
			data = array[i];
			//一致すると重複して死亡者がいることになる
			if(data.mapX !== x || data.mapY !== y){
				continue;
			}
			return false;
		}
		return true;
	};

	//同じポジションのユニットは配列上に１つしかない
	AllUnitList.getDeathAndInjuryListSamePosHash = function(list,selfUnit) {
		var i, unit, targetUnit, mapX, mapY;
		var arr = [];
		var posArr = [];
		var list = AllUnitList.getDeathAndInjuryList(list,true);
		var count = list.getCount();
		for (i = 0 ; i < count; i++) {
			unit = list.getData(i);
			//なにかがいる位置は半透明キャラ表示しない
			mapX = unit.getMapX();
			mapY = unit.getMapY();
			//最初は生存者がいたら非表示だったが、それだと死亡位置を確認するすべがないためコメントアウト
			// targetUnit = PosChecker.getUnitFromPos(mapX,mapY);
			// if (targetUnit !== null) {
			// 	if(selfUnit !== targetUnit){
			// 		continue;
			// 	}
			// }
			if(!this._posHashArrayCheck(posArr,mapX,mapY)){
				continue;
			}
			//TODO:組成マークを描画する
			arr.push(unit);
			posArr.push({
				mapX:mapX,
				mapY:mapY
			})
		}

		var obj = StructureBuilder.buildDataList();
		obj.setDataArray(arr);

		return obj;
	};

    PlayerList.getDeathAndInjuryListSamePosHash = function(selfUnit) {
		return AllUnitList.getDeathAndInjuryListSamePosHash(this.getMainList(),selfUnit);
	};

    UnitCommand._baseKeywordSkillAppendCommand = function(groupArray, keyword, classObj){
        var unit = this.getListCommandUnit();
        var skill = SkillControl.getPossessionCustomSkill(unit,keyword);
        if(!skill){
            return;
        }
        //root.log('_baseKeywordSkillAppendCommand')
        //実装したコマンド入れる
        var insertIndex = groupArray.length-1;
        groupArray.insertObject(classObj, insertIndex);
        groupArray[insertIndex].setSkill(skill,unit);
    };

    var alias_UnitCommandConfigureCommands = UnitCommand.configureCommands;
    UnitCommand.configureCommands = function(groupArray) {
        alias_UnitCommandConfigureCommands.call(this,groupArray);
        //root.log('configureCommands');
        this._baseKeywordSkillAppendCommand( groupArray, 
            Ryba.UnitCommand.RybaSurvivedCommandKeyword, Ryba.UnitCommand.SurvivedCommand );
    };
})();