sap.ui.define(["sap/ui/core/Core",
               "common/transactionCaller",
               "sap/ui/model/json/JSONModel"], function (Core,TransactionCaller,JSONModel) {
  "use strict";
  var subCatResponse = [];
  return {
    createContent: function () {
      var oContent = [
        new sap.m.VBox({
          width: "100%",

          items: [
      
           
            new sap.m.Label("lblConfirmation", {
              text: "Silmek istediğinize emin misiniz?",
              width: "450px",
              labelFor: "lblConfirmation",
              visible: false,
            }),
            new sap.m.Input("iGUID", {
              value: "",
              visible: false,
            }),
            new sap.m.Input("iID", {
              value: "",
              visible: false,
            }),
            new sap.m.Input("iOperator", {
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
                new sap.m.Label("lblNetwork", {
                  width: "200px",
                  text: "Ağ Planı",
                  labelFor: "Network",
                  visible: false,
                }),
                new sap.m.Label("lblOperation", {
                  width: "200px",
                  text: "Operasyon",
                  labelFor: "Operation",
                  visible: false,
                }),
                new sap.m.Label("lblSubCategory", {
                  width: "200px",
                  text: "Alt Kategori",
                  labelFor: "SubCategory",
                  visible: false,
                }),
                
              ],
            }),
            new sap.m.HBox({
              width: "100%",

              items: [
                new sap.m.DateTimePicker("StartDate", {
                  width: "200px",
                  placeholder: "Başlangıç Tarihi",
                  visible: false,
                  valueFormat: "yyyy-MM-dd HH:mm",
                  displayFormat: "yyyy-MM-dd HH:mm",
                }),
                new sap.m.DateTimePicker("EndDate", {
                  width: "200px",
                  placeholder: "Bitiş Tarihi",
                  visible: false,
                  valueFormat: "yyyy-MM-dd HH:mm",
                  displayFormat: "yyyy-MM-dd HH:mm",
                }),
                new sap.m.Input("iNetwork", {
                  value: "",
                  visible: false,
                  liveChange:this.productInputChange
                }),
                new sap.m.ComboBox("iOperation", {
                  value: "",
                  visible: false,
                  selectionChange:this.OperationChange,
                  items: {
                    path: "/",
                    template: new sap.ui.core.Item({
                      key: "{ACTIVITY}",
                      text: "{ACTIVITY}-{WORK_CNTR}",
                      
                    }),
                  },
                }),
                new sap.m.ComboBox("iSubCategory", {
                  value: "",
                  visible: false,
                  items: {
                    path: "/",
                    template: new sap.ui.core.Item({
                      key: "{SUB_CATEGORY}",
                      text: "{SUB_CATEGORY}-{DESCRIPTION}",
                    }),
                  },
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
                  items: {
                    path: "/",
                    template: new sap.ui.core.Item({
                      key: "{ID}",
                      text: "{DESCRIPTION}",
                    }),
                  },
                }),

              
              ],
            }),
           
          ],
        }),
      ];

      return oContent;
    },
    showOrHide: function (oParam) {
     if (oParam == "onEditDownTime") {
        Core.byId("iOperation").setVisible(false);
        Core.byId("iSubCategory").setVisible(false);
        Core.byId("iNetwork").setVisible(false);
        Core.byId("lblOperation").setVisible(false);
        Core.byId("lblSubCategory").setVisible(false);
        Core.byId("lblNetwork").setVisible(false);
        Core.byId("idComboDownReason").setVisible(true);
        Core.byId("StartDate").setVisible(true);
        Core.byId("EndDate").setVisible(true);
        Core.byId("lblReason").setVisible(true);
        Core.byId("lblStartDate").setVisible(true);
        Core.byId("lblEndDate").setVisible(true);
        Core.byId("lblConfirmation").setVisible(false);
     
      }else  if (oParam == "onDeleteDownTime") {
          Core.byId("iOperation").setVisible(false);
          Core.byId("iSubCategory").setVisible(false);
          Core.byId("iNetwork").setVisible(false);
          Core.byId("idComboDownReason").setVisible(false);
          Core.byId("StartDate").setVisible(false);
          Core.byId("EndDate").setVisible(false);
          Core.byId("lblReason").setVisible(false);
          Core.byId("lblStartDate").setVisible(false);
          Core.byId("lblEndDate").setVisible(false);
          Core.byId("lblOperation").setVisible(false);
          Core.byId("lblSubCategory").setVisible(false);
          Core.byId("lblNetwork").setVisible(false);
          Core.byId("lblConfirmation").setVisible(true);
          Core.byId("lblConfirmation").setText("Silmek istediğinize emin misiniz?");
       
        }else  if (oParam == "onDeleteNetwork") {
          Core.byId("iOperation").setVisible(false);
          Core.byId("iSubCategory").setVisible(false);
          Core.byId("iNetwork").setVisible(false);
          Core.byId("idComboDownReason").setVisible(false);
          Core.byId("StartDate").setVisible(false);
          Core.byId("EndDate").setVisible(false);
          Core.byId("lblReason").setVisible(false);
          Core.byId("lblStartDate").setVisible(false);
          Core.byId("lblEndDate").setVisible(false);
          Core.byId("lblOperation").setVisible(false);
          Core.byId("lblSubCategory").setVisible(false);
          Core.byId("lblNetwork").setVisible(false);
          Core.byId("lblConfirmation").setVisible(true);
          Core.byId("lblConfirmation").setText("Silmek istediğinize emin misiniz?");
          
        }
        
        else if (oParam == "onEditNetwork") {

          Core.byId("lblConfirmation").setVisible(false);
          Core.byId("idComboDownReason").setVisible(false);
          Core.byId("lblReason").setVisible(false);
          Core.byId("StartDate").setVisible(true);
          Core.byId("EndDate").setVisible(true);
          Core.byId("lblOperation").setVisible(true);
          Core.byId("lblSubCategory").setVisible(true);
          Core.byId("lblNetwork").setVisible(true);
          Core.byId("lblStartDate").setVisible(true);
          Core.byId("lblEndDate").setVisible(true);
          Core.byId("iOperation").setVisible(true);
          Core.byId("iSubCategory").setVisible(true);
          Core.byId("iNetwork").setVisible(true);
          
       
        }
        else if (oParam == "onAllEditNetwork") {

          Core.byId("lblConfirmation").setVisible(false);
          Core.byId("idComboDownReason").setVisible(false);
          Core.byId("lblReason").setVisible(false);
          Core.byId("StartDate").setVisible(false);
          Core.byId("EndDate").setVisible(false);
          Core.byId("lblOperation").setVisible(true);
          Core.byId("lblSubCategory").setVisible(true);
          Core.byId("lblNetwork").setVisible(true);
          Core.byId("lblStartDate").setVisible(false);
          Core.byId("lblEndDate").setVisible(false);
          Core.byId("iOperation").setVisible(true);
          Core.byId("iSubCategory").setVisible(true);
          Core.byId("iNetwork").setVisible(true);
          
       
        }
        else  if (oParam == "onActiviteSend") {
          Core.byId("iOperation").setVisible(false);
          Core.byId("iSubCategory").setVisible(false);
          Core.byId("iNetwork").setVisible(false);
          Core.byId("idComboDownReason").setVisible(false);
          Core.byId("StartDate").setVisible(false);
          Core.byId("EndDate").setVisible(false);
          Core.byId("lblReason").setVisible(false);
          Core.byId("lblStartDate").setVisible(false);
          Core.byId("lblEndDate").setVisible(false);
          Core.byId("lblOperation").setVisible(false);
          Core.byId("lblSubCategory").setVisible(false);
          Core.byId("lblNetwork").setVisible(false);
          Core.byId("lblConfirmation").setVisible(true);
          
       
        }


      
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
        this.getSubCategoryList();
        oScope.oRejectDialog.open();
    },
    productInputChange: function () {
      let sPath = "MII/REPORT/INS_NETWORK/T_GET_PRODUCT_OPERATION_LIST";
      var array = [];
      var sProduct = Core.byId("iNetwork").getValue();

      if (sProduct=="")
      this.getView().byId("operationInput").setValue("");
    
      var response = TransactionCaller.sync(
        sPath,
        { I_PRODUCT: sProduct },
        "O_JSON"
      );
      if (!Array.isArray(response[0].root?.item)) {
        array.push(response[0].root?.item);
      } else {
        array = response[0].root?.item
      }
      Core.byId("iOperation").setModel(new JSONModel(response[0]?.root.item)); 
      
    },
    getSubCategoryList: function () {

			let sPath = "MII/REPORT/INS_NETWORK/T_SUB_CATEGORY_LIST";
			var response = TransactionCaller.sync(
				sPath,
				{},
				"O_JSON"
			);
			if (!Array.isArray(response[0].Rowsets?.Rowset?.Row)) {
				subCatResponse.push(response[0].Rowsets?.Rowset?.Row);
			} else {
				subCatResponse = response[0].Rowsets?.Rowset?.Row
			}

		},
    OperationChange: function (oEvent) {
			var value = oEvent.getSource().getValue().toUpperCase()
			value = value.substring((value.indexOf("-") + 1), value.length);
			oEvent.getSource().setValue(value)
			var filtered = subCatResponse.filter(item => { return item.WORK_CENTER == value })
			var model = new JSONModel(filtered);
      Core.byId("iSubCategory").setModel(model); 
			
		},
  };
});
