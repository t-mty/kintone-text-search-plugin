jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  kintone.events.on('app.record.index.show', (e) => {
    //設定値を取得
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);

    //ビューが設定されていない場合検索フォームを非表示にする
    if(config.view === undefined) return;

    //チェックされたビューを配列化する
    var viewArray = config.view.split(',');
    if (viewArray.indexOf(e.viewName) == -1) return e;

    //すでに検索ボックスが設置されているときreturnする
    if ($('.text-search-span').length !== 0) return e;

    //ヘッダースペースを取得
    // var spaceElement = document.getElementsByClassName('kintone-app-headermenu-space');
    var spaceElement = kintone.app.getHeaderMenuSpaceElement();
    spaceElement.selectMenu;
    if (spaceElement === null) {
      throw new Error('The header element is unavailable on this page');
    }
    
    settingForm(spaceElement); //フォームを設置（設置する場所）
    setValue($, config); //値をセット

    //現在のクエリ確認
    var queryCondition = kintone.app.getQueryCondition();
    var query = kintone.app.getQuery();
    console.log("query: " + query);
    console.log(queryCondition);
    
    //検索ボタンが押されたとき
    $('.search-button').click(function() {
      searchText($, e, config);
      // if (query.indexOf(queryCondition) !== -1) {
      //   console.log("if");
      // }else{
      //   searchDate($, e, config) //検索
      //   console.log("else");
      // }
    });

  });
})(jQuery, kintone.$PLUGIN_ID);

//フォーム設置
function settingForm(spaceElement) {
  //フォーム親要素を指定
  var textSearchForm = document.createElement('span');
  textSearchForm.className = 'text-search-span';
  textSearchForm.style = 'margin: 0 5px 0 0; padding: 11.5px 5px; border: 1px solid; border-color: #E4E8DF; background-color: #F7F9FA; color: #848692'
  
  //テキストの入力フォームを設置
  var textBox = document.createElement('input');
  textBox.type = 'search';
  textBox.placeholder = 'テキストを入力';
  textBox.className = 'text-box';
  textBox.style = 'margin: 0; padding-left: 5px; height:30px; border: 1px solid; border-color: #E4E8DF;';

  //検索ボタン
  var searchButton = document.createElement('input');
  searchButton.type = 'submit';
  searchButton.value = '検索';
  searchButton.className = 'search-button';
  searchButton.style = 'height: 30px; margin-left: 5px; background: #3498DB; color: white; border: none; border-radius: 10%';

  //フォームを設置
  textSearchForm.append(textBox);
  textSearchForm.append(searchButton);
  spaceElement.append(textSearchForm);
}

//値をセット
function setValue($, config) {
  var field = config.field;
  var textBoxValue = $('.text-box').val();
  if (textBoxValue == '') return;
  //現在のクエリの日付を取得
  var query = kintone.app.getQueryCondition(); //現在のクエリ文字列を取得
  var regexField = new RegExp(`${field} + ' like '+ ".+"`); //フィールドの正規表現
  if(regexField.test(query)){
    fieldValue = query.match(regexField);
  }
  $('.text-box').val(fieldValue);
}

//検索
function searchText($, e, config) {
  const textBoxValue = $('.text-box').val();
  if (textBoxValue == '') return; //テキストボックスが空欄のときreturnする
  // var field = config.field; //対象のフィールドを宣言
  var fieldArray = config.field.split(',');

  // クエリ文字列生成
  const createQueryString = (fieldArray) => {  
    var queryCondition = kintone.app.getQueryCondition(); //現在のクエリ文字列を取得
    // var regexField = new RegExp(`${field} like ".+"`);
    var textSearchQuery;
    var regexpTextSearchQuery;

    //queryをつくる
    fieldArray.forEach(function (field, index) {
      //テキスト検索のqueryを作成する
      if(index === 0) {
        textSearchQuery = field +' like "' + textBoxValue + '"';
        regexpTextSearchQuery = field + ' like ' + ".+"; //正規表現用のクエリ
      }else{
        textSearchQuery = textSearchQuery + ' or ' + field + ' like "' + textBoxValue + '"';
        regexpTextSearchQuery = regexpTextSearchQuery + ' or ' + field + ' like ' + ".+"; //正規表現用のクエリ
      }
    });

    //正規表現にコンパイルする
    regexpTextSearchQuery = new RegExp(regexpTextSearchQuery);
    
    //テキスト検索のクエリを結合する
    if(queryCondition === ''){
      queryCondition = textSearchQuery;
    }else{
      if (regexpTextSearchQuery.test(queryCondition)) {
        queryCondition = queryCondition.replace(regexpTextSearchQuery, textSearchQuery); // 既存のテキスト検索クエリを置換する
      }else{
        queryCondition = queryCondition + ' and ' + textSearchQuery; //置換するクエリがないとき結合する
      }
    }
    return '&query=' + queryCondition;
  };

  //URLを作成
  const viewpath = '?view=' + e.viewId;
  const query = createQueryString(fieldArray); //引数としてフィールドコードを渡す
  document.location = location.origin + location.pathname + viewpath + encodeURI(query);
}
