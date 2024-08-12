sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "andonScreen/model/formatter",
        "common/transactionCaller"

    ],
    function (
        Controller,
        JSONModel,
        MessageToast,
        MessageBox,
        Fragment,
        formatter,
        TransactionCaller,

    ) {
        "use strict";
        let tempData = [];
        let index = 0;


        return Controller.extend("andonScreen.controller.Main", {

            onInit: function () {
                var andonNeedsReload=localStorage.getItem("andonNeedsReload") || 1
                    
                    if ( andonNeedsReload>0) {
                    
                    localStorage.setItem("andonNeedsReload", 0 )
                    window.location.reload();
                }
               
                
                setTimeout(() => {
                    localStorage.setItem("andonNeedsReload", 1 )
                }, 1000);
                    
               
                
                this.getData();
                const that = this;
                setInterval(function () {
                    that.getData()
                }, 10000 * 20);
                setInterval(function () {
                    that.fillData(that)
                  }, 10000*2);//10 sn 
                setInterval(function () {
                    localStorage.setItem("andonNeedsReload", 0 )
                    window.location.reload();
                    // window.open("/XMII/CM/MII/andonScreen3/index.html?PC_ID="+Glb_GROUP_ID+"&IllumLoginName=User&IllumLoginPassword=Akslv2023*&session=true", "_top");
                }, 1000 * 60*60*3);//10 sn 60*60*3



                

            },
            handleSelectionChange: function (oEvent) {

                // var cBox = this.getView().byId("idAndonComboBox");
                // Glb_GROUP_ID=cBox.getSelectedKey()

                var path = oEvent.getSource().getBindingContext().sPath.split('/')[1];
                Glb_GROUP_ID = oEvent.getSource().getBindingContext().oModel.oData[path].ID;

                this.getData();
                //alert('selectedValue::'+cBox.getValue());
            },
            getData: function () {
                let sPath = "MII/ANDON/ANDON_SCREEN_SHIPMENT/SLC_ANDON_LIVE";
                try {
                    TransactionCaller.async(
                        sPath,
                        {
                            "PC_ID": Glb_GROUP_ID
                        },
                        "O_JSON",
                        this.getTableCB,
                        this,
                        "GET"
                    );

                } catch (error) {
                    alert("ee");
                }



            },
            getTableCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageToast.error(iv_data[0]);
                }

                index = 0;
                if (!Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    var oArray = [];
                    oArray.push(iv_data[0].Rowsets.Rowset.Row);
                    var oModel = new JSONModel(oArray);
                    iv_scope.getView().byId("idAndonTable").setModel(oModel);
                    iv_scope.funcClassRemoveAdd(oArray[0], iv_scope, 0);
                

                }
                else {
                    
                    var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
                    iv_scope.getView().byId("idAndonTable").setModel(oModel);
                    iv_scope.getView().setModel(oModel);
                    tempData = iv_data[0].Rowsets.Rowset.Row;
                    iv_scope.fillData(iv_scope);

                    for (let i = 0; i < iv_data[0]?.Rowsets.Rowset.Row.length; i++) {
                    iv_scope.funcClassRemoveAdd(iv_data[0]?.Rowsets.Rowset.Row[i], iv_scope, i);
                    }

                   

                   

                }
            },
            fillData: function (iv_scope) {
                let fillDataTemp = [];
                var lineCount=10;
                if (tempData.length< lineCount) lineCount=tempData.length;
                if (tempData.length > 0) {
                  for (let i = 0; i < lineCount; i++) {
                    if (index == tempData.length) index = 0;
                    fillDataTemp.push(tempData[index]);
                    index++;
                  }
                  let oModel = new JSONModel(fillDataTemp);
                  iv_scope.getView().byId("idAndonTable").setModel(oModel);
                  

                  for (let i = 0; i < fillDataTemp.length; i++) {
                    iv_scope.funcClassRemoveAdd(fillDataTemp[i], iv_scope,i);
                    }
                }
              },
            funcClassRemoveAdd: function (iv_data, iv_scope, i) {

                /*var statusindex = 2;
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundRed");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundYellow");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundGreen");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundGrey");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundBlue");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundOrange"); 
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].removeStyleClass("backgroundDefault");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex].addStyleClass(iv_data.TRUCK_COLOR);*/

                var statusindex1 = 8;
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundRed");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundPink");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundYellow");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundGreen");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundGrey");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundBlue");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundOrange");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].removeStyleClass("backgroundDefault");
                iv_scope.getView().byId("idAndonTable").getItems()[i].getCells()[statusindex1].addStyleClass(iv_data.SHIPMENT_COLOR);



            },
           
        });


    }


);
