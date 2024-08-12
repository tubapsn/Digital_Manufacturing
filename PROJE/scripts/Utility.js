sap.ui.define([
"sap/ui/core/Core",
"common/transactionCaller",
"sap/m/MessageBox"

], function (Core,TransactionCaller,MessageBox) {
  "use strict";

  return {
    createContent: function (othis) {
      var that=othis;
      var oContent = [
        new sap.m.VBox({
          width: "100%",

          items: [
            new sap.m.Label("lblRecord", {
              text: "Sicil No",
              labelFor: "recordNo",
              visible: false,
            }),
            new sap.m.Input("recordNo", {
              width: "210px",
              placeholder: "Sicil No",
              value: "",
              visible: false,
            }),
            new sap.m.Label("lblPassword", {
              text: "Sifre",
              labelFor: "Password",
              visible: false,
            }),
            new sap.m.Input("Password", {
              width: "210px",
              placeholder: "Sifre",
              value: "",
              visible: false,
            }),
            new sap.m.Input("iGUID", {
              value: "",
              visible: false,
            }),
            new sap.m.HBox({
              width: "100%",
              items: [
                new sap.m.Label("lblStartDate", {
                  width: "200px",
                  text: "Başlangıç Tarihi",
                  labelFor: "StartDate",
                  visible: false,
                }),
                new sap.m.Label("lblEndDate", {
                  width: "200px",
                  text: "Bitiş Tarihi",
                  labelFor: "EndDate",
                  visible: false,
                }),
              ],
            }),
            new sap.m.HBox({
              width: "100%",

              items: [
                new sap.m.DateTimePicker("StartDate", {
                  width: "230px",
                  placeholder: "Başlangıç Tarihi",
                  visible: false,
                  valueFormat: "yyyy-MM-dd HH:mm",
                  displayFormat: "yyyy-MM-dd HH:mm",
                }),
                new sap.m.DateTimePicker("EndDate", {
                  width: "230px",
                  placeholder: "Bitiş Tarihi",
                  visible: false,
                  valueFormat: "yyyy-MM-dd HH:mm",
                  displayFormat: "yyyy-MM-dd HH:mm",
                }),
              ],
            }),

            new sap.m.Label("lblReason", {
              text: "Neden Kodu",
              labelFor: "NedenKodu",
              visible: false,
            }),

            new sap.m.HBox({
              width: "100%",
              items: [
                new sap.m.ComboBox({
                  width: "200px",
                  visible: true,
                  id: "idComboDownReason",
                  //valueState: "Success",
                  selectionChange:[that.handleChange,othis] ,
                  items: {
                    path: "/",
                    //selectionChange:[that.handleChange,othis] ,
                    template: new sap.ui.core.Item({
                      key: "{ID}",
                      text: "{DESCRIPTION}",
                    }),
                  },
                }),
                new sap.m.Input("Description", {
                  width: "210px",
                  placeholder: "Açıklama",
                  value: "",
                  visible: false,
                }),

                new sap.m.Button("save", {
                  width: "200px",
                  text: "Kaydet",
                  press: [that.onDownTimeSave,othis],
                  icon: "sap-icon://action",
                  visible: false,
                }),
              ],
            }),
            new sap.ui.table.Table("downTable", {
              rows: "{/}",
              selectionMode: "Single",
              visible: false,
              visibleRowCount: 15,
              
            }),
          ],
        }),
      ];

      return oContent;
    },
    showOrHide: function (oParam) {
      if (oParam == "onStop") {
        Core.byId("recordNo").setEnabled(false);
        Core.byId("lblRecord").setVisible(true);
        Core.byId("recordNo").setVisible(true);
        Core.byId("lblPassword").setVisible(false);
        Core.byId("lblStartDate").setVisible(false);
        Core.byId("lblEndDate").setVisible(false);
        Core.byId("Password").setVisible(false);
        Core.byId("idComboDownReason").setVisible(false);
        Core.byId("Description").setVisible(false);
        Core.byId("StartDate").setVisible(false);
        Core.byId("EndDate").setVisible(false);
        Core.byId("save").setVisible(false);
        Core.byId("downTable").setVisible(false);
        Core.byId("lblReason").setVisible(false);
      } else if (oParam == "onStart") {
        Core.byId("lblRecord").setVisible(true);
        Core.byId("recordNo").setVisible(true);
        Core.byId("recordNo").setEnabled(true);
        Core.byId("lblPassword").setVisible(true);
        Core.byId("Password").setVisible(true);
        Core.byId("idComboDownReason").setVisible(false);
        Core.byId("Description").setVisible(false);
        Core.byId("StartDate").setVisible(false);
        Core.byId("EndDate").setVisible(false);
        Core.byId("save").setVisible(false);
        Core.byId("downTable").setVisible(false);
        Core.byId("lblReason").setVisible(false);
        Core.byId("lblStartDate").setVisible(false);
        Core.byId("lblEndDate").setVisible(false);
        Core.byId("recordNo").setValue("");
        Core.byId("Password").setValue("");
      } else if (oParam == "onPause") {
        Core.byId("lblRecord").setVisible(true);
        Core.byId("recordNo").setVisible(true);
        Core.byId("recordNo").setEnabled(false);
        Core.byId("idComboDownReason").setVisible(true);
        Core.byId("StartDate").setVisible(true);
        Core.byId("EndDate").setVisible(true);
        Core.byId("save").setVisible(true);
        Core.byId("downTable").setVisible(true);
        Core.byId("lblReason").setVisible(true);
        Core.byId("lblStartDate").setVisible(true);
        Core.byId("lblEndDate").setVisible(true);
        Core.byId("lblPassword").setVisible(false);
        Core.byId("Password").setVisible(false);
      }
    },
    createGUID: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    },
    onOpenDialog: function (
        buttonText,
        dialogMess,
        oScope,
    ) {
        
        //oScope.oCBFunction=oCBFunction;
       // oScope.params = oParams;
        if (!oScope.oRejectDialog) {
            oScope.oRejectDialog = new sap.m.Dialog("idDialog", {
                title: dialogMess,
                type: sap.m.DialogType.Message,
                content: oScope.oContent,
                beginButton: new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: buttonText,
                    press: function () {
                        oScope.oCBFunction(oScope.params, oScope);
                        oScope.oRejectDialog.close();
                    }.bind(oScope),
                }),
                endButton: new sap.m.Button({
                    text: "İptal",
                    press: function () {
                        oScope.oRejectDialog.close();
                    }.bind(oScope),
                }),
            });
        }
        else{
            oScope.oRejectDialog.getBeginButton().setText(buttonText);
            oScope.oRejectDialog.setTitle(dialogMess);

        }

        oScope.oRejectDialog.open();
    },
    createDownTimeTable: function(){
              
        var columnData = [
            {
                columnName: "START_TIME",
                description:"BAŞLANGIÇ TARİHİ"
            },
            {
                columnName: "END_TIME",
                description:"BİTİŞ TARİHİ"
            },
            {
                columnName: "REASON",
                description:"NEDEN"
            },
            
            {
                columnName: "PLANNEDTEXT",
                description:"TÜR"
            },
            {
                columnName: "DIFF",
                description:"SÜRE"
            },
            {
              columnName: "DELETE",
              description:"SİL"
          },
            {
                columnName: "GUID",
                description:"GUID"
            },
        ];
        return columnData;


    },
  

  };
});
