/*-----------------------------------------------------------------------------------------------
    
　味方ユニットが行動する度(or自軍ターン開始ごと)
  にセーブを行うタイプのオートセーブ機能を実装します。

  マップコマンド、タイトルコマンドに追加される
  「最近の記録」からオートセーブ一覧を開くことができます。

  Ryba.UndoLoadCountRecord を true にすると
　指定した変数に「戦闘マップ中にロードしたセーブデータの数」を記録できます。
　（記録しているだけです。EDのマップ共通コマンド等でリセットしないと章をまたいでロードした回数が増え続けます）
　※ロードした回数じゃなくてロードしたセーブデータの数なので注意

　追記(2023/04/06)：
　ロードできる回数を指定し、それ以上はオートセーブデータをロードできなくできる設定を追加しました。
　より巻き戻しに近くできるような設定です。
　Ryba.RewindSystem を trueにすると
  タイトルから選べなくなる代わりにそのマップ中に巻き戻した回数がゲーム中に記録されるようになります。
  巻き戻せる回数も指定できます
　Ryba.RewindMaxCount = 10;
 
　ただし、「ツールのデフォルトのセーブコマンドはマップ中は非表示にする必要があります」
  非表示にしなくても機能しますが、オートセーブで再現している都合上、
  プレイヤーが簡単に回数をズル出来てしまいます）
  
  セーブを非表示にする方法：
  ツール上部の
  「ゲームレイアウト」→「コマンドレイアウト」でウィンドウを開き
  「マップコマンド」から「セーブ」を「非表示」にします。

■注意点

　このプラグインは巻き戻しではなく、あくまで「オートセーブ機能」です。

■設定項目

Ryba.UndoLoadControlのうちの以下の関数を設定する必要があります

    //実際に使っている通常のセーブデータの数を入力します
    startUndoSaveCount:function(){
        return 50;
    },

    //オートセーブデータを何個まで記録するかの数
    //※startUndoSaveCountと合わせて99を超えるとバグります
    maxUndoCount:function(){
        return 40;
    },

■対応バージョン
　2023/04/01版：SRPG Studio Version:1.279
　2023/04/06版：SRPG Studio Version:1.282（セーブの_getCustomObjectを変更している場合、不具合が出る可能性があります）
　2023/12/27版：SRPG Studio Version:1.288（たぶん1.282以上なら大丈夫だと思います）
  2025/01/13版：SRPG Studio Version:1.307
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
//-----------------------------------------------------------------------------------------------
//ロードしたセーブデータの数を記録する変数のテーブル番号を記載します。
//※タブの番号は「0」、「1」、「2」....となっている点に注意
Ryba.SaveCountTableId = 0;
//ロードしたセーブデータの数を記録する変数のIDを記載します。
Ryba.SaveCountVariableId = 1;
//ロードしたセーブデータの数を記録するかどうか
Ryba.UndoLoadCountRecord = false;
//-----------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------
//巻き戻し機能化するかどうか
//trueにするとロードできる回数などが指定できます
//(ツール側にデフォルトであるマップセーブがオフにしないとプレイヤーが簡単に不正出来てしまう欠点があります)
//trueにするとタイトルからは選べなくなります（マップ攻略中のみ選択可能に）
Ryba.RewindSystem = true;
//巻き戻せる回数
Ryba.RewindMaxCount = 10;
//巻き戻し回数を保存する変数を設定
//これは「ロードしたセーブデータの数を記録する」変数とは別の物にする必要があります
//※タブの番号は「0」、「1」、「2」....となっている点に注意
Ryba.RewindCountTableId = 0;
//変数のIDを記載します。
Ryba.RewindCountVariableId = 2;
//-----------------------------------------------------------------------------------------------
AutoSaveTitleType = {
	None:0,
	Turn:1,
	Section:2
};
//番号的にはRyba.OmakeSaveCount+1番から始まるが
//root.getLoadSaveManager().saveFileでindexを指定してセーブする時
Ryba.UndoLoadControl = {
    _isActivatedFromSaveFile:false,
    UnSeenMapAnyMapDataObject:null,
    isActivatedFromSaveFile:function(){
        return this._isActivatedFromSaveFile;
    },
    offActivatedFromSaveFile:function(){
        this._isActivatedFromSaveFile = false;
    },
    //実際に使っている通常のセーブデータの数を入力します
    startUndoSaveCount:function(){
        return 50;
    },

    //オートセーブデータを何個まで記録するかの数
    //※startUndoSaveCountと合わせて99を超えるとバグります
    maxUndoCount:function(){
        return 40;
    },

    getCommandName:function(){
        return '最近の記録';
    },

    reset:function(){
        delete root.getExternalData().env.undoSaveIndex;
        var max = this.maxUndoCount();
		var i,saveFileIndex;
        for (i = 0; i < max; i++) {
            saveFileIndex = this.startUndoSaveCount() + i;
            root.getLoadSaveManager().deleteFile(saveFileIndex);
        }
    },

    executeSave:function(param){
        var index = this.getNextSaveIndex(this.getNowSaveIndex());
        this.setNowSaveIndex(index);
        Ryba.SaveExControl.executeNowSave(Ryba.UndoLoadControl.startUndoSaveCount() + index,param);
    },

    executeLoad:function(data){
        this._isActivatedFromSaveFile = true;
        if(ConfigItem.AutoSaveIndexUpdate.getFlagValue() === AutoSaveIndexType.Update){
            Ryba.UndoLoadControl.setNowSaveIndex(data.autoIndex);
        }
        var beforeValue;
        if(Ryba.RewindSystem){
            beforeValue = Ryba.CommonControl.getToolVariable( Ryba.RewindCountTableId,Ryba.RewindCountVariableId);
        }
        root.getLoadSaveManager().loadFile(data.saveFileIndex);
        if(Ryba.RewindSystem){
            Ryba.CommonControl.setToolVariable( Ryba.RewindCountTableId,Ryba.RewindCountVariableId, beforeValue + 1);
        }

        var unSeenMapAnyMapDataObject = data.data.custom.UnSeenMapAnyMapDataObject;
		// ロードファイルに独自データがあれば読み込む
		if( typeof unSeenMapAnyMapDataObject !== 'undefined' ) {
			this.UnSeenMapAnyMapDataObject = unSeenMapAnyMapDataObject;
		}
    },

    getNowSaveIndex:function(){
        if(typeof root.getExternalData().env.undoSaveIndex === 'number'){
            return root.getExternalData().env.undoSaveIndex;
        }
        return this.maxUndoCount()-1;
    },

    setNowSaveIndex:function(index){
        root.getExternalData().env.undoSaveIndex = index;
    },

    getNextSaveIndex:function(index){
        var result = index + 1;
        if(result >= this.maxUndoCount()){
            result = 0;
        }
        return result;
    },

    getSaveFileIndexArray: function(manager) {
        var result = [];
        var firstIndex = this.getNextSaveIndex(this.getNowSaveIndex());
        var maxUndoCount = Ryba.UndoLoadControl.maxUndoCount();

        this._saveFileData(result,manager,firstIndex,maxUndoCount);
        this._saveFileData(result,manager,0,firstIndex);

        return result;
    },

    getUndoDataCount:function(){
        return this.getSaveFileIndexArray(root.getLoadSaveManager()).length;
    },

    isExistSaveData:function(){
        return this.getUndoDataCount() > 0;
    },

    //ロード回数上限かどうか
    isLoadCountLimit:function(){
        return this.getUndoDataCount() > 0;
    },

    _saveFileData:function(array,manager,start,end){
        var i,data,saveFileIndex;
        for (i = start; i < end; i++) {
            saveFileIndex = this.startUndoSaveCount() + i;
            data = manager.getSaveFileInfo(saveFileIndex);
            if(data.getMapInfo() === null ){
                continue;
            }
            array.push({
                data:data,
                autoIndex:i,
                saveFileIndex:saveFileIndex
            });
        }
    }

};

//汎用処理
Ryba.CommonControl = {
    //ツールの変数に数値を設定する関数
    //Ryba.UndoLoadControl.addToolVariable(tableId,valueId,value){
    setToolVariable:function(tableId,valueId,value){
        var table = root.getMetaSession().getVariableTable(tableId);
        var variableIndex = table.getVariableIndexFromId(valueId);
        table.setVariable(variableIndex, value);
    },
    getToolVariable:function(tableId,valueId){
        var table = root.getMetaSession().getVariableTable(tableId);
        var variableIndex = table.getVariableIndexFromId(valueId);
        return table.getVariable(variableIndex);
    },
    addToolVariable:function(tableId,valueId,add){
        var value = this.getToolVariable(tableId, valueId);
        value += add;
        this.setToolVariable(tableId, valueId, value);
    }
};

//拡張セーブ画面に必要なデータをセーブする機能を持つ
Ryba.SaveExControl = {

    executeNowSave:function(index,param){
        //戦闘時のオートセーブのため
        this.executeSave(index, root.getBaseScene(), root.getCurrentSession().getCurrentMapInfo().getId(),param);
    },

    addLoadCount:function(sceneType, value){
        if(!Ryba.UndoLoadCountRecord){
            return;
        }
        if (sceneType === SceneType.FREE || sceneType === SceneType.EVENT) {
            Ryba.CommonControl.addToolVariable(Ryba.SaveCountTableId,Ryba.SaveCountVariableId,value);
        }
    },

    executeSave:function(index,scene,mapId,param){
        this.addLoadCount(scene, 1)
        root.getLoadSaveManager().saveFile(index, scene, mapId, 
            Ryba.SaveExControl.getCustomObject({
                scene:scene,
                mapId:mapId
            },param));
        this.addLoadCount(scene, -1);
    },

    getCustomObject: function(param,autoSaveData) {

        //TODO:a
        //ver1.280から構造が変わったため修正
        //セーブのカスタムオブジェクトを変更している場合、
        //このobj変数もからではなく同じように変更しなければならない
	//var obj = LoadSaveScreen._getCustomObject.call(this);
        var obj = {};

        obj.saveCount = Ryba.CommonControl.getToolVariable(Ryba.SaveCountTableId,Ryba.SaveCountVariableId);
		
		this._setLeaderSettings(obj, autoSaveData.unit);
		this._setPositionSettings(obj, param);

        obj.titleType = autoSaveData.titleType;
		obj.UnSeenMapAnyMapDataObject = CurrentMap.createAnyMapDataObject();
		return obj;
	},

    getCustomObjectToLeader: function(param) {
		var obj = {};
		
        //var autoSaveData = AutoSavedControl.buildAutoSaveParam();
		this._setLeaderSettings(obj, this._getLeaderUnit());
		this._setPositionSettings(obj, param);
		
		return obj;
	},

    _setLeaderSettings: function(obj, unit) {
		var handle;
		
		if (unit == null) {
			obj.leaderName = 'undefined';
			return;
		}
		
		obj.leaderName = unit.getName();
		obj.leaderLv = unit.getLv();
		
		handle = unit.getCustomCharChipHandle();
		if (handle === null) {
			handle = unit.getCharChipResourceHandle();
		}
		obj.binary = serializeResourceHandle(handle);
	},

    _setPositionSettings: function(obj, param) {
		var area, mapInfo;
		
		obj.playerArrayX = [];
		obj.playerArrayY = [];
		obj.enemyArrayX = [];
		obj.enemyArrayY = [];
		obj.allyArrayX = [];
		obj.allyArrayY = [];
		
		if (param.scene === SceneType.REST) {
			area = root.getRestPreference().getActiveRestAreaFromMapId(param.mapId);
			obj.areaId = area.getId();
			return obj;
		}
		else {
			mapInfo = root.getCurrentSession().getCurrentMapInfo();
			if (param.mapId !== mapInfo.getId()) {
				return obj;
			}
		}
		
		this._setPositionSettingsInternal(PlayerList.getSortieList(), obj.playerArrayX, obj.playerArrayY);
		this._setPositionSettingsInternal(EnemyList.getAliveList(), obj.enemyArrayX, obj.enemyArrayY);
		this._setPositionSettingsInternal(AllyList.getAliveList(), obj.allyArrayX, obj.allyArrayY);
	},
	
	_setPositionSettingsInternal: function(list, arrayX, arrayY) {
		var i, unit;
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (this._isUnitExcluded(unit)) {
				continue;
			}
			
			arrayX.push(unit.getMapX());
			arrayY.push(unit.getMapY());
		}
	},
	
	_isUnitExcluded: function(unit) {
		return unit.isInvisible();
	},
	
	_getLeaderUnit: function() {
		var i, count;
		var list = PlayerList.getMainList();
		var unit = null;
		var firstUnit = null;
		
		count = list.getCount();
		if (count === 0) {
			return null;
		}
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getAliveState() === AliveType.ERASE) {
				continue;
			}
			
			if (firstUnit === null) {
				firstUnit = unit;
			}
			
			if (unit.getImportance() === ImportanceType.LEADER) {
				break;
			}
		}
		
		if (i === count) {
			unit = firstUnit;
		}
		
		return unit;
	}
};


AutoSavedControl = {
	_endUnit:null,

	trunStartRegister:function(){
		this.autoSaveTurnStart();
	},

	buildAutoSaveParam:function(){
		return {
			unit:null,
			titleType:0
		};
	},

	//TODD:巻き戻し時のセーブ処理をここに記述すればよい
	//現状使う想定はないのでコメントアウトしている
	autoSaveUnitEnd: function() {
		if(ConfigItem.AutoSaveType.getFlagValue() !== AutoSaveType.Unit){
			return;
		}
		this._baseAutoSave(this.buildAutoSaveParam());
	},

	autoSaveTurnStart: function() {
		if(ConfigItem.AutoSaveType.getFlagValue() !== AutoSaveType.Turn){
			return;
		}
		//ターンスタート時のセーブにはユニットを保存する必要がない
		this._endUnit = null;
		var param = this.buildAutoSaveParam();
		param.titleType = AutoSaveTitleType.Turn;
		this._baseAutoSave(param);
	},

	_baseAutoSave:function(param){
		if (GameOverChecker.isGameOver()) {
			return;
		}
		param.unit = this._endUnit;
		Ryba.UndoLoadControl.executeSave(param);
		this._endUnit = null;
	},

	setUnitEndData:function(unit){
		this._endUnit = unit;
	}
};


Ryba.UndoLoadScreen = defineObject(BaseScreen,
{
    _screenParam: null,
    _isLoadMode: true,
    _scrollbar: null,
    _questionWindow: null,
    _saveFileDetailWindow: null,
    _saveIndexArray:[],
    
    setScreenData: function(screenParam) {
        this._prepareScreenMemberData(screenParam);
        this._completeScreenMemberData(screenParam);
    },
    
    moveScreenCycle: function() {
        return this._moveLoad();
    },

    drawScreenCycle: function() {
        var mode = this.getCycleMode();
		var width = this._scrollbar.getObjectWidth() + this._saveFileDetailWindow.getWindowWidth();
		var x = LayoutControl.getCenterX(-1, width);
		var y = LayoutControl.getCenterY(-1, this._scrollbar.getScrollbarHeight());
		
		this._scrollbar.drawScrollbar(x, y);
		this._saveFileDetailWindow.drawWindow(x + this._scrollbar.getObjectWidth(), y);
		
		if (mode === LoadSaveMode.SAVECHECK) {
			x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
			y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
			this._questionWindow.drawWindow(x, y);
		}
	},

    getScreenTitleName: function() {
		return '最近の記録（一覧）';
	},
    
    getScreenInteropData: function() {        
        return root.queryScreen('Load');
    },
    
    _prepareScreenMemberData: function(screenParam) {
        this._screenParam = screenParam;
        this._isLoadMode = true;//screenParam.isLoad;
        this._scrollbar = createScrollbarObject(this._getScrollbarObject(), this);
        this._questionWindow = createWindowObject(QuestionWindow, this);
    },
    
    _completeScreenMemberData: function(screenParam) {
        var count = LayoutControl.getObjectVisibleCount(76, 5);
        
        this._scrollbar.setScrollFormation(this._getFileCol(), count);
        this._scrollbar.setActive(true);
        this._setScrollData(DefineControl.getMaxSaveFileCount(), this._isLoadMode);
        this._setDefaultSaveFileIndex();
        
        this._questionWindow.setQuestionMessage(StringTable.LoadSave_SaveQuestion);
        
        this._scrollbar.enablePageChange();
		
		this._saveFileDetailWindow	= createWindowObject(Ryba.UndoDetailWindow, this);
		this._saveFileDetailWindow.setSize(Math.floor(this._scrollbar.getScrollbarHeight() * 1.2), this._scrollbar.getScrollbarHeight());
		
		this._checkSaveFile();

        this.changeCycleMode(LoadSaveMode.TOP);
    },
    
    _setScrollData: function(count, isLoadMode) {
        var i;
        var manager = root.getLoadSaveManager();
        this._saveIndexArray = Ryba.UndoLoadControl.getSaveFileIndexArray(manager);
        var maxCount = this._saveIndexArray.length;

        for (i = 0; i < maxCount; i++) {
            this._scrollbar.objectSet(this._saveIndexArray[i].data);
        }
        
        this._scrollbar.objectSetEnd();
        
        this._scrollbar.setLoadMode(isLoadMode);
    },
    
    _setDefaultSaveFileIndex: function() {
        this._scrollbar.setIndex(this._saveIndexArray.length-1);
        // var index = root.getExternalData().getActiveSaveFileIndex();
        // // 以前使用したファイルのインデックスにカーソルを合わせる
        // if (this._scrollbar.getObjectCount() > index) {
        //     this._scrollbar.setIndex(index);
        // }
    },
    
    _moveLoad: function() {
        var input;
        var mode = this.getCycleMode();
        var result = MoveResult.CONTINUE;
        
        if (mode === LoadSaveMode.TOP) {
            input = this._scrollbar.moveInput();
            if (input === ScrollbarInput.SELECT) {
                this._executeLoad();
            }
            else if (input === ScrollbarInput.CANCEL) {
                result = MoveResult.END;
            }
            else {
                this._checkSaveFile();
            }
        }
        
        return result;
    },
    
    _checkSaveFile: function() {
        if (this._scrollbar.checkAndUpdateIndex()) {
			this._saveFileDetailWindow.setSaveFileInfo(this._scrollbar.getObject());
		}
    },
    
    _getScrollbarObject: function() {
        return LoadSaveScrollbarEx;
    },
    
    _getFileCol: function() {
        return 1;
    },
    
    _executeLoad: function() {
        var object = this._scrollbar.getObject();
        
        if (object.isCompleteFile() || object.getMapInfo() !== null) {
            SceneManager.setEffectAllRange(true);
            
            // 内部でroot.changeSceneが呼ばれ、セーブファイルに記録されているシーンに変更される。
            Ryba.UndoLoadControl.executeLoad(this._getAutoSaveData());
        }
    },

    _getAutoSaveData:function(){
        return this._saveIndexArray[this._scrollbar.getIndex()];
    }
    
}
);

Ryba.UndoDetailWindow = defineObject(SaveFileDetailWindow,
{
    _configureSentence: function(groupArray) {
		if (typeof this._saveFileInfo.custom.leaderName !== 'undefined') {
			groupArray.appendObject(LoadSaveSentence.ActionUnit);
		}
        if(Ryba.UndoLoadCountRecord){
            groupArray.appendObject(LoadSaveSentence.SaveCount);
        }
        if(Ryba.RewindSystem){
            groupArray.appendObject(LoadSaveSentence.RewindCount);
        }
	}
});

LoadSaveSentence.ActionUnit = defineObject(LoadSaveSentence.Leader,{
    drawLoadSaveSentence: function(x, y) {
		var unitRenderParam;
		var textui = this._getSentenceTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var obj = this._saveFileInfo.custom;
		var length = 130;
        var titleX = 70;

        var titleType = 0;
		if(typeof obj.titleType !== 'undefied'){
            titleType = obj.titleType;
        }

		this._drawTitle(x, y);
		
		if (typeof obj.binary !== 'undefined') {
			unitRenderParam = StructureBuilder.buildUnitRenderParam();
			unitRenderParam.handle = deserializeResourceHandle(obj.binary);
			unitRenderParam.colorIndex = 0;
			UnitRenderer.drawCharChip(x + 24, y + 8, unitRenderParam);
		}
		
		if (typeof obj.leaderName !== 'undefined') {
			length += this._detailWindow.isSentenceLong() ? 20 : 0;
            
            if(obj.leaderName === 'undefined'){
                var text = 'ターン開始データ';
                TextRenderer.drawKeywordText(x + titleX, y + 18, text, length, color, font);
            }else{
                TextRenderer.drawKeywordText(x + titleX, y + 18, obj.leaderName, length, color, font);
            }
			
		}
		
		if (typeof obj.leaderLv !== 'undefined') {
			x += this._detailWindow.isSentenceLong() ? 20 : 0;
			TextRenderer.drawKeywordText(x + 180, y + 18, '行動後', -1, color, font);
		}
	}
});


LoadSaveSentence.SaveCount = defineObject(BaseLoadSaveSentence,
{
    _saveFileInfo: 0,
    
    setSaveFileInfo: function(saveFileInfo) {
        this._saveFileInfo = saveFileInfo;
    },
    
    drawLoadSaveSentence: function(x, y) {
        var n = -1;
        var textui = this._getSentenceTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var obj = this._saveFileInfo.custom;
        //var difficulty = this._saveFileInfo.getDifficulty();
        
        this._drawTitle(x, y);
        
        if(typeof obj.saveCount === 'number'){
            n = obj.saveCount - 1;
        }

        if( n > -1){
            TextRenderer.drawKeywordText(x + 70, y + 18, 'ロードデータ数：', -1, color, font);
            this.drawNumber(x + 180,y,n);
        }else{
            TextRenderer.drawKeywordText(x + 70, y + 18, 'ロードデータ数： -- ', -1, color, font);
        }
    },

    drawNumber:function(x,y,n){
        var dx = 0;
        if (n >= 100) {
            dx = 0;
        }
        else if (n >= 10) {
            dx = 20;
        }
        else {
            dx = 40;
        }
        NumberRenderer.drawAttackNumberColor(x + dx, y + 18, n, 1, 255);
    }
}
);

LoadSaveSentence.RewindCount = defineObject(LoadSaveSentence.SaveCount,
{
    _saveFileInfo: 0,
    
    drawLoadSaveSentence: function(x, y) {
        var n = -1;
        var textui = this._getSentenceTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var obj = this._saveFileInfo.custom;
        //var difficulty = this._saveFileInfo.getDifficulty();
        
        this._drawTitle(x, y);
        
        n = Ryba.RewindMaxCount - Ryba.CommonControl.getToolVariable(Ryba.RewindCountTableId,Ryba.RewindCountVariableId);

        if( n > -1){
            TextRenderer.drawKeywordText(x + 70, y + 18, '残り使用回数：', -1, color, font);
            this.drawNumber(x + 180,y,n);
        }else{
            TextRenderer.drawKeywordText(x + 70, y + 18, '残り使用回数： -- ', -1, color, font);
        }
    }
}
);


TitleCommand.UndoLoad = defineObject(BaseTitleCommand,
{
    _screen: null,

    openCommand: function() {
        var screenParam = this._createLoadSaveParam();
        
        this._screen = createObject(Ryba.UndoLoadScreen);
        SceneManager.addScreen(this._screen, screenParam);
    },
    
    moveCommand: function() {
        if (SceneManager.isScreenClosed(this._screen)) {
            return MoveResult.END;
        }
        
        return MoveResult.CONTINUE;
    },
    
    isSelectable: function() {
        return Ryba.UndoLoadControl.isExistSaveData();
    },

    getCommandName: function() {
		return Ryba.UndoLoadControl.getCommandName();
	},
    
    _createLoadSaveParam: function() {
        var screenParam = ScreenBuilder.buildLoadSave();
        
        return screenParam;
    }
}
);
SetupCommand.UndoLoad = defineObject(BaseListCommand, 
{
    _screen: null,
    
    openCommand: function() {
        var screenParam = this._createScreenParam();
    
        this._screen = createObject(Ryba.UndoLoadScreen);
        SceneManager.addScreen(this._screen, screenParam);
    },
    
    moveCommand: function() {
        if (SceneManager.isScreenClosed(this._screen)) {
            return MoveResult.END;
        }
        
        return MoveResult.CONTINUE;
    },
    
    _createScreenParam: function() {
        var screenParam = ScreenBuilder.buildUnitSortie();
        
        return screenParam;
    },

    getCommandName: function() {
        return Ryba.UndoLoadControl.getCommandName();
    },

    isCommandDisplayable: function() {
	if(Ryba.RewindSystem){
	    if(Ryba.CommonControl.getToolVariable( Ryba.RewindCountTableId,Ryba.RewindCountVariableId) >= Ryba.RewindMaxCount){
                return false;
            }
	}

        return Ryba.UndoLoadControl.isExistSaveData();
    }
}
);

AutoSaveType = {
    None:0,
    Turn:1,
    Unit:2
};

AutoSaveIndexType = {
    Update:0,
    None:1
};

Ryba.LongConfigTextScrollbar = defineObject(ConfigTextScrollbar,
{	
    getObjectWidth: function() {
        return 80 + HorizontalLayout.OBJECT_SPACE;
    }
}
);

ConfigItem.AutoSaveType = defineObject(BaseConfigtItem,
{

    setupConfigItem: function() {
		this._scrollbar = createScrollbarObject(Ryba.LongConfigTextScrollbar, this);
		this._scrollbar.setScrollFormation(this.getFlagCount(), 1);
		this._scrollbar.setObjectArray(this.getObjectArray());
	},

    selectFlag: function(index) {
        root.getExternalData().env.autoSaveType = index;
    },
    
    getFlagValue: function() {
        if (typeof root.getExternalData().env.autoSaveType !== 'number') {
            return AutoSaveType.Unit;
        }
    
        return root.getExternalData().env.autoSaveType;
    },
    
    getFlagCount: function() {
        return 3;
    },
    
    getConfigItemTitle: function() {
        return 'オートセーブ設定'
    },
    
    getConfigItemDescription: function() {
        //root.log(root.getExternalData().env.autoSaveType);
        return 'オートセーブのタイミングを設定します';
    },

    getObjectArray: function() {
        return [ 'なし', 'ターン',  'ユニット' ];
    }
});

ConfigItem.AutoSaveIndexUpdate = defineObject(BaseConfigtItem,
{
    selectFlag: function(index) {
        root.getExternalData().env.autoSaveIndexUpdate = index;
    },
    
    getFlagValue: function() {
        if (typeof root.getExternalData().env.autoSaveIndexUpdate !== 'number') {
            return AutoSaveIndexType.Update;
        }
    
        return root.getExternalData().env.autoSaveIndexUpdate;
    },
    
    getFlagCount: function() {
        return 2;
    },
    
    getConfigItemTitle: function() {
        return 'オートセーブ最新読込';
    },
    
    getConfigItemDescription: function() {
        //root.log(root.getExternalData().env.autoSaveIndexUpdate);
        return 'オンにするとオートセーブをロードしたファイルが最新に';
    }
});
    

(function() {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function(groupArray) {
        //ツール側
        alias1.call(this,groupArray);
        groupArray.appendObject(ConfigItem.AutoSaveType);
        groupArray.appendObject(ConfigItem.AutoSaveIndexUpdate);
    };
    var alias2 = TitleScene._configureTitleItem;
    TitleScene._configureTitleItem = function(groupArray) {
        alias2.call(this, groupArray);
        //巻き戻し化している場合はタイトルから選べるのはマズイ
        if(!Ryba.RewindSystem){
            groupArray.insertObject(TitleCommand.UndoLoad, 2);
        }
    };
    var alias3 = PlayerTurn.openTurnCycle;
	PlayerTurn.openTurnCycle = function() {
		alias3.call(this);
		//両方呼ばないとならない
		//実際には自動セーブは１回しか処理されない
		AutoSavedControl.trunStartRegister();
		AutoSavedControl.autoSaveUnitEnd();
	};

    var alias4 = MapCommand.configureCommands;
    MapCommand.configureCommands = function(groupArray) {
        alias4.call(this, groupArray);
        groupArray.insertObject(SetupCommand.UndoLoad, 1);
    };


    //------------------------------------------------------------------------------------------------
    //マップ共通イベントED前よりも前に呼ばれる処理を作成する
    //（当然マップのエンディングイベントよりも前に呼ばれる）
    //この処理が呼ばれるタイミングを変更したい場合、
    //EventCheckerの関数はコメントアウトして
    //ツール上で、マップ共通コマンドで巻き戻し回数を記録している変数を０にしてください
    EventChecker._eventType = 0;
    EventChecker._eventEndingBefore = function() {
        if(Ryba.RewindSystem){
            Ryba.CommonControl.setToolVariable( Ryba.RewindCountTableId,Ryba.RewindCountVariableId, 0);
        }
    };
    var alias_enterEventChecker = EventChecker.enterEventChecker;
    EventChecker.enterEventChecker = function(eventList, eventType) {
        this._eventType = eventType;
        if(this._eventType === EventType.ENDING){
            this._eventEndingBefore();
        }
        return alias_enterEventChecker.call(this,eventList,eventType);
    };
    //------------------------------------------------------------------------------------------------
    PlayerTurn._unitEndAutoCheck = false;
    PlayerTurn._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
            if(this._unitEndAutoCheck){
                this._unitEndAutoCheck = false;
                AutoSavedControl.setUnitEndData(this._targetUnit);
                AutoSavedControl.autoSaveUnitEnd();
                //root.log('_moveAutoEventCheck' + this._targetUnit.getName());
            }
			this.changeCycleMode(PlayerTurnMode.MAP);
		}
		
		return MoveResult.CONTINUE;
	};

    PlayerTurn._moveUnitCommand = function() {
		var result = this._mapSequenceCommand.moveSequence();
		
		if (result === MapSequenceCommandResult.COMPLETE) {
			this._mapSequenceCommand.resetCommandManager();
			MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
			this._changeEventModeNeo(true);
		}
		else if (result === MapSequenceCommandResult.CANCEL) {
			this._mapSequenceCommand.resetCommandManager();
			this.changeCycleMode(PlayerTurnMode.MAP);
		}
		
		return MoveResult.CONTINUE;
	};
    
    PlayerTurn._changeEventMode = function() {
		this._changeEventModeNeo(false);
	};

    PlayerTurn._changeEventModeNeo= function(unitEnd) {
        var result;
		this._unitEndAutoCheck = false;
		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);
		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
            if(unitEnd){
                AutoSavedControl.setUnitEndData(this._targetUnit);
                AutoSavedControl.autoSaveUnitEnd();
                //root.log('_changeEventModeNeo' + this._targetUnit.getName());
            }
			this.changeCycleMode(PlayerTurnMode.MAP);
		}
		else {
            if(unitEnd){
                this._unitEndAutoCheck = true;
            }
			this.changeCycleMode(PlayerTurnMode.AUTOEVENTCHECK);
		}
    };

    //最近の記録をロードした際にセーブファイルのロードと同等の挙動に変更する
    //isActivatedFromSaveFileは他の箇所でも使用されているが
    //オートセーブは性質上Freeでしか使用しないためこの関数のみ修正
    FreeAreaScene._completeSceneMemberData= function() {
        var isLoad = root.getSceneController().isActivatedFromSaveFile();
        if( Ryba.UndoLoadControl.isActivatedFromSaveFile() ) {
            Ryba.UndoLoadControl.offActivatedFromSaveFile();
            if(!isLoad){
                isLoad = true;
            }
        }
		// セーブファイルのロードによってこの画面が表示される場合、ターン開始の処理を省く。
		if (isLoad) {
			this._initializeNewMap();
			this._playTurnMusic();
			this._processMode(FreeAreaMode.MAIN);
		}
		else {
			this._processMode(FreeAreaMode.TURNSTART);
		}
	};
})();
