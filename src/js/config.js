jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  var $form = $('.js-submit-settings');
  var $cancelButton = $('.js-cancel-button');
  // var $viewId = $('.js-view-id');
  if (!($form.length > 0 && $cancelButton.length > 0)) {
    throw new Error('Required elements do not exist.');
  }
  
  //configが空のときオブジェクトを作成
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  if(config.view === undefined) {
    config = {view: '', field: ''};
  }
  console.log(config);

  //現在選択されているビューを取得する
  var $viewNameCheckBox = $('.view-name-checkbox');
  var selectedViews = config.view.split(',');
  //すべてのビューをチェックする
  if(selectedViews.indexOf('（すべて）') !== -1) {
    document.getElementById('all').checked = 'checked';
  }

  //現在選択されているフィールドを取得する
  var $fieldCheckBox = $('.field-checkbox');
  var selectedFields = config.field.split(',');

  //プラグインを適用する一覧を選択するチェックボックスを設置
  kintone.api(kintone.api.url('/k/v1/app/views.json', true), 'GET', {app: kintone.app.getId()})
    .then((resp) => {
      // console.log(views);
      Object.keys(resp.views).forEach((view, index) => {
        // console.log(index, view);

        //一覧のチェックボックスを動的に作成
        var checkBox = document.createElement('div');
        checkBox.className = 'kintoneplugin-input-checkbox';
        var checkItem = document.createElement('span');
        checkItem.className = 'kintoneplugin-input-checkbox-item';
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = 'view-check-' + index;
        input.value = view;
        input.name = 'view-checkbox';
        
        //初期値設定
        selectedViews.forEach((configView, i) => {
          if (configView === view) {
            input.checked = 'checked';
          }
        });
        var label = document.createElement('label');
        label.textContent = view;
        label.htmlFor = 'view-check-' + index;
        checkItem.append(input);
        checkItem.append(label);
        checkBox.append(checkItem);
        $viewNameCheckBox.append(checkBox);
      });
    });

  //フィールド選択のチェックボックスを設置
  kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {app: kintone.app.getId()})
    .then((resp) => {
      // console.log(resp.properties);
      Object.keys(resp.properties).forEach((field, index) => {
        var fieldType = resp.properties[field].type; //フィールドタイプ
        var fieldLabel = resp.properties[field].label; //フィールド名
        // var fieldCode = resp.properties[key].code; //フィールドID
        if (fieldType === 'SINGLE_LINE_TEXT' || fieldType === 'MULTI_LINE_TEXT' || fieldType === 'SINGLE_LINE_TEXT') {
          // console.log(index, fieldLabel);
          //一覧のチェックボックスを動的に作成
          var checkBox = document.createElement('div');
          checkBox.className = 'kintoneplugin-input-checkbox';
          var checkItem = document.createElement('span');
          checkItem.className = 'kintoneplugin-input-checkbox-item';
          var input = document.createElement('input');
          input.type = 'checkbox';
          input.id = 'field-check-' + index;
          input.value = field;
          input.name = 'field-checkbox';

          //初期値設定
          selectedFields.forEach((configField, i) => {
            if (configField === field) {
              input.checked = 'checked';
            }
          });
          var label = document.createElement('label');
          label.textContent = fieldLabel;
          label.htmlFor = 'field-check-' + index;
          checkItem.append(input);
          checkItem.append(label);
          checkBox.append(checkItem);
          $fieldCheckBox.append(checkBox);
        }
      });
    });

  //保存が押されたとき
  $form.on('submit', function(e) {
    e.preventDefault();

    //ビューが複数個チェックされたとき配列化する
    var selectedViews = [];
    $('input[name="view-checkbox"]:checked').each(function() {
      selectedViews.push( $(this).val() );
    });
    if(selectedViews.length >= 2){
      var selectedView = selectedViews.join(','); //配列→文字列
    }else if(selectedViews.length === 1){
      selectedView = selectedViews[0];
    }else{
      selectedView = '';
    }
    console.log(selectedView);
    
    //フィールドが複数個チェックされたとき配列化する
    var selectedFields = [];
    $('input[name="field-checkbox"]:checked').each(function() {
      selectedFields.push( $(this).val() );
    });
    if(selectedFields.length >= 2){
      var selectedField = selectedFields.join(','); //配列→文字列
    }else if(selectedFields.length === 1){
      console.log(selectedFields);
      var selectedField = selectedFields[0];
    }else{
      var selectedField = '';
    }
    console.log(selectedField);

    //configのオブジェクトを設定する
    kintone.plugin.app.setConfig({
      view: selectedView,
      field: selectedField
    }, function() {
      // alert('The plug-in settings have been saved. Please update the app!');
      window.location.href = '../../flow?app=' + kintone.app.getId();
    });
  });
  $cancelButton.on('click', function() {
    window.location.href = '../../' + kintone.app.getId() + '/plugin/';
  });
})(jQuery, kintone.$PLUGIN_ID);
