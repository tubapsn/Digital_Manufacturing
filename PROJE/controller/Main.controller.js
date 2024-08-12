sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "PROJE/model/formatter",
        "common/transactionCaller",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Label",
        "sap/m/library",
        "sap/m/Text",
        "sap/m/Input",
        "sap/ui/core/Core",
        "PROJE/scripts/Utility"
    ],
    function (
        Controller,
        JSONModel,
        MessageToast,
        MessageBox,
        Fragment,
        formatter,
        TransactionCaller,
        Dialog,
        Button,
        Label,
        mobileLibrary,
        Text,
        Input,
        Core,
        Utility
    ) {
        "use strict";
        // shortcut for sap.m.ButtonType
        var ButtonType = mobileLibrary.ButtonType;

        // shortcut for sap.m.DialogType
        var DialogType = mobileLibrary.DialogType;
        return Controller.extend("PROJE.controller.Main", {
            onInit: function () {
                this.getSubCategory();
                this.oContent=Utility.createContent(this);
                const that = this;
                setInterval(function () {
                    that.getData()
                }, 10000 * 60);

            },
            onShowPress: function (evt) {
                var sProduct = this.getView().byId("productInput").getValue();

                if (!sProduct) {
                    MessageBox.show(" Ağ Planı No Boş Olamaz!");
                    return;
                }

                let sPath = "MII/PRODUCTION/T_GET_PRODUCT_OPERATION_LIST";
                TransactionCaller.async(
                    sPath,
                    {
                        I_PRODUCT: sProduct,
                    },
                    "O_JSON",
                    this.getTableCB,
                    this,
                    "GET"
                );
                //MessageToast.show(evt.getSource().getId() + " Pressed");
            },
            getTableCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.show(iv_data[0]);
                    return;
                }

                var oModel = new JSONModel(iv_data[0].root?.item);
                iv_scope.getView().byId("OperationListTable").setModel(oModel);
                var oModelNetwork = new JSONModel(iv_data[0].root?.network);
                iv_scope.getView().setModel(oModelNetwork, "networkInfo");
                if ( !Array.isArray(iv_data[0].root?.operator)     ) {
                    var oArray=[];
                    oArray.push(iv_data[0].root?.operator);
                    var oModelOperationInfo = new JSONModel(oArray);
                    iv_scope.getView().byId("OperationInfoTable").setModel(oModelOperationInfo);
                }
                else{
                    var oModelOperationInfo = new JSONModel(iv_data[0].root?.operator);
                    iv_scope.getView().byId("OperationInfoTable").setModel(oModelOperationInfo);
                  
                }
            },
            getDowntimeReason: function () {
                let sPath = "MII/DOWNTIME/T_DOWNTIME_REASON_LIST";
                var response = TransactionCaller.sync(sPath, {}, "O_JSON");
                var oModel = new JSONModel(response[0].Rowsets.Rowset?.Row);
                Core.byId("idComboDownReason").setModel(oModel);
            },
            getDowntimeReasonCB: function (iv_data, iv_scope) {
                var oModel = new JSONModel(iv_data[0].Rowsets.Rowset?.Row);
                iv_scope.getView().setModel(oModel, "downtimeReasonModel");
            },
            getSubCategory: function () {
                let sPath = "MII/PRODUCTION/T_SUB_COTEGORY_LIST";
                TransactionCaller.async(
                    sPath,
                    {},
                    "O_JSON",
                    this.getSubCategoryCB,
                    this,
                    "GET"
                );
            },
            getSubCategoryCB: function (iv_data, iv_scope) {
                var oModel = new JSONModel(iv_data[0].Rowsets.Rowset?.Row);
                //iv_scope.getView().setModel(oModel,"SubCat");
                iv_scope.SubCategory = iv_data[0].Rowsets.Rowset?.Row;
            },
            onStop: function (oSearch) {
                var gv_NETWORK = this.getView().byId("productInput").getValue();
                if (gv_NETWORK == null) {
                    MessageBox.show("AĞ PLANI NUMARASI BOŞ OLAMAZ!");
                    return;
                }

                var index = this.getView().byId("OperationInfoTable").getSelectedIndex();
                
                if (index < 0) {

                    MessageBox.show("Operatör seçimi yapınız!");
                    return;
                }
               
                var lvoperation = this.getView().byId("OperationInfoTable").getModel().oData[index].OPERATION;
                //this.getView().byId("OperationInfoTable").getRows()[index].mAggregations.cells[0].mProperties.text;
                //this.getView().byId("OperationInfoTable").getRows()[index].getCells()[0].getText();
                //this.getView().byId("OperationInfoTable").oModels.undefined.oData[index].OPERATION;
                var slcoperation = oSearch.getSource().oParent.getCells()[0].getText();
                if (lvoperation != slcoperation) {

                    MessageBox.show("Bu operasyonda aktif oturum bulunmamaktadır.");
                    return;
                }
                Core.byId("recordNo").setValue(this.getView().byId("OperationInfoTable").getModel().oData[index].OPERATOR);
                Utility.showOrHide("onStop");
                
                this.oCBFunction=this.Logoff;
                this.params={
                    OPERATIONS: oSearch.getSource().oParent.getCells()[0].getText(),
                    NETWORK: gv_NETWORK,
                };
                Utility.onOpenDialog("ÇIKIŞ", "Operator Çıkışı", this );
            },
            Logoff: function (oParams, oScope) {

                var oNumber = Core.byId("recordNo").getValue();
                var response = TransactionCaller.sync(
                    "MII/OPERATOR/T_LIVE_OPERATOR_GUID",
                    {
                        I_OPER_ID: oNumber,
                        I_NETWORK: oParams.NETWORK,
                        I_OPERATION: oParams.OPERATIONS,
                    },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.show(response[0]);
                    return;
                }
                var responseDW = TransactionCaller.sync(
                    "MII/DOWNTIME/T_CONTROL_LIVE_DOWNTIME",
                    {
                        I_GUID: response[0],
                    },
                    "O_JSON"
                );
                if (responseDW[0] == 0 || responseDW[0] == "") {
                    MessageBox.warning(
                        "DURUŞ GİRİŞİ YAPMADINIZ. KAPATMAK İSTEDİĞİNİZE EMİN MİSİNİZ?",
                        {
                            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction=="OK")
                                    oScope.networkEnd(response[0]);
                            },
                        }
                    );
                } else {
                    oScope.networkEnd(response[0]);
                }

            },
            networkEnd: function (oParams) {
                var response = TransactionCaller.sync(
                    "MII/PRODUCTION/T_NETWORK_END",
                    {
                        I_GUID: oParams,
                    },
                    "O_JSON"
                );
                MessageBox.show(response[0]);
                this.onShowPress();
            },
            onPause: function (oSearch) {

                var index = this.getView().byId("OperationInfoTable").getSelectedIndex();
                
                if (index < 0) {

                    MessageBox.show("Operatör seçimi yapınız!");
                    return;
                }
                var lvoperation =this.getView().byId("OperationInfoTable").getModel().oData[index].OPERATION;
              
                var slcoperation = oSearch.getSource().oParent.getCells()[0].getText();
                if (lvoperation != slcoperation) {

                    MessageBox.show("Bu operasyonda aktif oturum bulunmamaktadır.");
                    return;
                }
                var oModelOpr = this.getView().byId("OperationInfoTable").getModel().oData;

                var oOperNo=this.getView().byId("OperationInfoTable").getModel().oData[index].OPERATOR;
                var oGUID= oModelOpr.filter(x=>x.OPERATOR==oOperNo);

                Utility.showOrHide("onPause");
                Core.byId("recordNo").setValue(this.getView().byId("OperationInfoTable").getModel().oData[index].OPERATOR);
                Core.byId("iGUID").setValue(oGUID[0].GUID);
                var gv_NETWORK = this.getView().byId("productInput").getValue();
                if (gv_NETWORK == null) {
                    MessageBox.show("AĞ PLANI NUMARASI BOŞ OLAMAZ!");
                    return;
                }
                this.getDowntimeReason();
                this.getDownTimeList(oGUID[0].GUID);


                this.oCBFunction=this.closeDownTime;
                this.params={ };
                Utility.onOpenDialog("KAPAT", "Duruş Girisi", this);

                
            },
            getDownTimeList: function (oGUID) {
                let sPath = "MII/DOWNTIME/T_HIST_DOWNTIME_LIST";

                TransactionCaller.async(
                    sPath,
                    {
                        I_GUID: oGUID,
                    },
                    "O_JSON",
                    this.getDownTimeListCB,
                    this,
                    "GET"
                );
            },
            getDownTimeListCB: function (iv_data, iv_scope) {

                /*var columnData=Utility.createDownTimeTable();
                var oTable = Core.byId("downTable");

                if ( !Array.isArray(iv_data[0].Rowsets.Rowset?.Row)     ) {
                    var oArray=[];
                    oArray.push(iv_data[0].Rowsets.Rowset?.Row);
                    var oModelData = new JSONModel(oArray);
                }else{
                    var oModelData = new JSONModel(iv_data[0].Rowsets.Rowset?.Row);
                }

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    rows: oModelData.oData,
                    columns: columnData,
                });
                oTable.setModel(oModel);

                oTable.bindColumns("/columns", function (sId, oContext) {
                    var columnName = oContext.getObject().columnName;
                    var description = oContext.getObject().description;
                    return new sap.ui.table.Column({
                        label: description,
                        template: columnName,
                    });
                });

                oTable.bindRows("/rows");*/

                var columnData=Utility.createDownTimeTable();
                var oTable = Core.byId("downTable");

                if ( !Array.isArray(iv_data[0].Rowsets.Rowset?.Row)     ) {
                    var oArray=[];
                    oArray.push(iv_data[0].Rowsets.Rowset?.Row);
                    var oModelData = new JSONModel(oArray);
                }else{
                    var oModelData = new JSONModel(iv_data[0].Rowsets.Rowset?.Row);
                }

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    rows: oModelData.oData,
                    columns: columnData,
                });
                oTable.setModel(oModel);

             
                oTable.removeAllColumns();
              

                oTable.addColumn(new sap.ui.table.Column({
                    visible: false,
                    label: new sap.m.Title({text: "ID"}),
                    template: new sap.m.Text({text:"{ID}"})
                  }));

                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "BAŞLANGIÇ TARİHİ"}),
                    template: new sap.m.Text({text:"{START_TIME}"})
                  }));

                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "BİTİŞ TARİHİ"}),
                    template: new sap.m.Text({text:"{END_TIME}"})
                  }));
                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "NEDEN"}),
                    template: new sap.m.Text({text:"{REASON}"})
                  }));
                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "TÜR"}),
                    template: new sap.m.Text({text:"{PLANNEDTEXT}"})
                  }));
                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "SÜRE"}),
                    template: new sap.m.Text({text:"{DIFF}"})
                  }));

                  oTable.addColumn(new sap.ui.table.Column({
                    visible: false,
                    label: new sap.m.Title({text: "GUID"}),
                    template: new sap.m.Text({text:"{GUID}"})
                  }));

                  oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Title({text: "Sil"}),
                    template: new sap.m.Button({
                        width: "200px",
                        text: "Sil",
                        press: [iv_scope.onDeleteDwn,iv_scope],
                        icon: "sap-icon://delete",
                        

                    })
                  }));
               



                
                  oTable.setModel(oModelData);
                  oTable.bindRows("/");
               //  oTable.placeAt("content");  
            },
            closeDownTime: function (oParams, oScope) {
             },
            enterDownTime: function (oParams, oScope) { 
            },
            onStart: function (oSearch) {
                var gv_NETWORK = this.getView().byId("productInput").getValue();

                if (gv_NETWORK == null) {
                    MessageBox.show("AĞ PLANI NUMARASI BOŞ OLAMAZ!");
                    return;
                }

                if (oSearch.getSource().oParent.getCells()[4].getText()!="ACIK") {
                    MessageBox.show("STATUSU AÇIK OLAN OPERASYONLARDA ÇALIŞMA YAPILABİLİR.");
                    return;
                }

                Utility.showOrHide("onStart");
                this.oCBFunction=this.Logon;
                this.params={
                    WORK_CENTER: oSearch.getSource().oParent.getCells()[1].getText(),
                    OPERATION: oSearch.getSource().oParent.getCells()[0].getText(),
                    OPERATION_DESCRIPTION: oSearch.getSource().oParent.getCells()[2].getText(),
                    NETWORK: gv_NETWORK,
                    SUB_CATEGORY: oSearch.getSource().oParent.getCells()[3]._getSelectedItemText().split("-")[0],
                };
                Utility.onOpenDialog("GİRİS", "Operator Girisi", this );
            },
            Logon: function (oParams, oScope) {
                var srecordNo = Core.byId("recordNo").getValue();
                var sPassword = Core.byId("Password").getValue();

                var gv_GUID = Utility.createGUID();
                let sPath = "MII/OPERATOR/TRNS_LOGON_OPERATOR";
                var response = TransactionCaller.sync(
                    sPath,
                    {
                        OPER_ID: srecordNo,
                        PASSWORD: sPassword,
                        NETWORK: oParams.NETWORK,
                        WORK_CENTER: oParams.WORK_CENTER,
                        OPERATION: oParams.OPERATION,
                        GUID: gv_GUID,
                    },
                    "O_JSON"
                );
                if (response[1] == "E") {
                    MessageBox.show(response[0]);
                } else {
                    var response = TransactionCaller.sync(
                        "MII/PRODUCTION/T_INS_LIVE_NETWORK",
                        {
                            I_OPER_ID: srecordNo,
                            I_NETWORK: oParams.NETWORK,
                            I_WORK_CENTER: oParams.WORK_CENTER,
                            I_OPERATION: oParams.OPERATION,
                            I_SUB_CATEGORY: oParams.SUB_CATEGORY,
                            I_SHORT_TEXT: oScope.getView().getModel("networkInfo").oData.SHORT_TEXT,
                            I_WBS_ELEMENT: oScope.getView().getModel("networkInfo").oData .WBS_ELEMENT,
                            I_PROJECT_DEFINITION: oScope.getView().getModel("networkInfo").oData.PROJECT_DEFINITION,
                            I_GUID: gv_GUID,
                            I_OPERATION_DESCRIPTION:oParams.OPERATION_DESCRIPTION,
                        },
                        "O_JSON"
                    );
                    MessageBox.show(response[0]);
                    oScope.onShowPress();
                }
            },
            oUpdate: function (oEvet) {
                let oData = this.getView().byId("OperationListTable").getModel().oData;
                for (let i = 0; i < oData.length; i++) {
                    for (let y = 0; y < this.SubCategory.length; y++) {
                        if (this.SubCategory[y].WORK_CENTER == oData[i].WORK_CNTR) 
                        {   oEvet.getSource().getRows()[i].getCells()[3].mBindingInfos.items.model = `${oData[i].WORK_CNTR}`;
                            oEvet.getSource().getRows()[i].getCells()[3].mBindingInfos.items.template.mBindingInfos.key.parts[0].model = `${oData[i].WORK_CNTR}`;
                            oEvet.getSource().getRows()[i].getCells()[3].mBindingInfos.items.template.mBindingInfos.key.parts[1].model = `${oData[i].WORK_CNTR}`;
                            oEvet.getSource().getRows()[i].getCells()[3].mBindingInfos.items.template.mBindingInfos.text.parts[0].model = `${oData[i].WORK_CNTR}`;
                            oEvet.getSource().getRows()[i].getCells()[3].mBindingInfos.items.template.mBindingInfos.text.parts[1].model = `${oData[i].WORK_CNTR}`;
                            var tempData = this.SubCategory.filter(
                                (x) => x.WORK_CENTER == this.SubCategory[y].WORK_CENTER
                            );
                            this.getView().setModel( new JSONModel(tempData), `${oData[i].WORK_CNTR}` );
                            break;
                            //iv_scope.SubCategory[y].WORK_CENTER=iv_data[0].root?.item[i].WORK_CNTR;
                        }
                    }
                }
            },
            onSelectionChange: function (oEvent) {
                var oPlugin = oEvent.getSource();
                var bLimitReached = oEvent.getParameters().limitReached;
                var iIndices = oPlugin.getSelectedIndices();
                var sMessage = "";

                if (iIndices.length > 0) {
                    sMessage = iIndices.length + " row(s) selected.";
                    if (bLimitReached) {
                        sMessage =
                            sMessage +
                            " The recently selected range was limited to " +
                            oPlugin.getLimit() +
                            " rows!";
                    }
                } else {
                    sMessage = "Selection cleared.";
                }

                //MessageToast.show(sMessage);
            },
            getData  :  function () {
                var indices=this.getView().byId("OperationListTable").getSelectedIndices();   

                if (indices.length>0){
                    var oModel=this.getView().byId("OperationListTable").getModel().oData;
                    
                    var response = TransactionCaller.sync(
                        "MII/PRODUCTION/T_LIVE_NETWORK_AVALIBITY",
                        {
                           
                            I_NETWORK: this.getView().byId("productInput").getValue(),
                            I_OPERATION: oModel[indices[0]].ACTIVITY,
                            
                        },
                        "O_JSON"
                    );

                    this.getView().byId("avalibityRadialChart").setPercentage(response[0]);
                }
                else{
                this.getView().byId("avalibityRadialChart").setPercentage(100);
            }
            },
            onDownTimeSave: function (oEvent,othis) {
                var gv_Start_Time = Core.byId("StartDate").getValue();
                var gv_End_Time = Core.byId("EndDate").getValue();
                
          
                if (gv_Start_Time>gv_End_Time){
                MessageBox.show("Bitiş tarihi başlangıç tarihinden küçük olamaz");
                return;
                }
          
                var gv_Reason_Code =Core.byId("idComboDownReason").getSelectedKey();
                if (gv_Reason_Code==""){
                  MessageBox.show("Neden kodu boş olamaz");
                  return;
                  }

                if (gv_Reason_Code=="15"){
                    MessageBox.show("Diğer nedenili duruş girişlerinde açıklama boş olamaz");
                    return;
                    }
                
                var gv_GUID = Core.byId("iGUID").getValue();
          
                var response = TransactionCaller.sync(
                  "MII/DOWNTIME/T_INSERT_DOWNTIME",
                  {
                    I_END_TIME: gv_End_Time,
                    I_REASON_CODE: gv_Reason_Code,
                    I_START_TIME: gv_Start_Time,
                    I_GUID: gv_GUID,
                  },
                  "O_JSON"
                );
                this.getDownTimeList(gv_GUID)
                MessageBox.show(response[0]);
              },
            onCancelButton: function(){

                if( this.oshowDetailFragment)
                  this.oshowDetailFragment.close();
        
              },
            onDeleteDwn: function(oEvet,othis){

                
                var oModel=Core.byId("downTable").getModel().oData;
                var oStartTime =oEvet.getSource().oParent.getCells()[0].getText();
                var oEndTime=oEvet.getSource().oParent.getCells()[1].getText();
                var ofilter=oModel.filter(x=>x.START_TIME==oStartTime && x.END_TIME==oEndTime);
                if (ofilter.length>0){
                    var oID= ofilter[0].ID;
                    var oGUID= ofilter[0].GUID;
                  }


                  var response = TransactionCaller.sync(
                    "MII/DOWNTIME/T_DELETE_DOWNTIME",
                    {
                      I_ID: oID,
                      I_GUID: oGUID,
                    },
                    "O_JSON"
                  );
                  this.getDownTimeList(oGUID)
                  MessageBox.show(response[0]);
        
              },
              handleChange: function(oEvet,othis){

                var gv_Reason_Code =Core.byId("idComboDownReason").getSelectedKey();
                if (gv_Reason_Code=="15"){
                Core.byId("Description").setVisible(true);
                  
                  }
               
                
              }
        });
    }
);
