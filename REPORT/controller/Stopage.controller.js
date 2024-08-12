sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "REPORT/model/formatter",
    "common/transactionCaller",
    "sap/ui/core/Core",
    "sap/m/MessagePopover",
    "REPORT/scripts/Utility",
    "sap/ui/Device",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    Fragment,
    formatter,
    TransactionCaller,
    Core,
    MessagePopover,
    Utility,
    Device,
    ChartFormatter,
    Format
) {
	"use strict";

	return Controller.extend("REPORT.controller.Stopage", {
       
      onInit: function() {
            var model = new JSONModel();
            var data = [
              {
                ID: "1",
                NAME: "TÜM VARDİYALAR",
              },
              {
                ID: "2",
                NAME: "1. VARDİYA(08-16)",
              },
              {
                ID: "3",
                NAME: "2. VARDİYA(16-00)",
              },
              {
                ID: "4",
                NAME: "3. VARDİYA(00-08)",
              },
            ];
            model.setData(data);
            //this.getView().setModel(model)
    
            this.getView().byId("idShiftStopageComboBox").setModel(model);
            this.getView().byId("idShiftStopageComboBox").setSelectedKey("1");
            

            var oVizFrame = this.getView().byId("idVizFrameStopage");
            var oPopOver = this.getView().byId("idPopOverStopage");
            oPopOver.connect(oVizFrame.getVizUid());
            this.getComboBox();
        
        },
      onShowPress: function (params) {
        var gv_Start_Time = this.getView().byId("StartDateStopage").getValue();
        var gv_End_Time = this.getView().byId("EndDateStopage").getValue();
        var gv_Shift = this.getView().byId("idShiftStopageComboBox").getSelectedKey();
        var gv_Operation = this.getView().byId("idOperationComboBox").getSelectedKey();

        if (gv_Start_Time == "" || gv_End_Time == "") {
          MessageBox.show("Lütfen tarih aralığı girin!");
          return;
        }
        if (gv_Shift < 0 || gv_Shift == "") gv_Shift = 1;

        if (gv_Operation < 0 || gv_Operation == "") 
        {
          gv_Operation = "";
        }
        else 
        {
          gv_Operation = "and EST.dbo.[HIST_NETWORK].[OPERATION] = " + gv_Operation ;
        } 

        let sPath = "MII/REPORT/T_HIST_NETWORK_LIST";
        TransactionCaller.async(
          sPath,
          {
            I_START_TIME: gv_Start_Time,
            I_END_TIME: gv_End_Time,
            I_SHIFT: gv_Shift,
            I_OPERATION: gv_Operation,
          },
          "O_JSON",
          this.onShowPressCB,
          this,
          "GET"
        );
      },
      onShowPressCB: function (iv_data, iv_scope) {
        if (iv_data[1] == "E") {
          MessageToast.error(iv_data[0]);
        }

        if (!Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
          var oArray = [];
          oArray.push(iv_data[0].Rowsets.Rowset.Row);
          var oModel = new JSONModel(oArray);
          iv_scope.getView().byId("StopageListTable").setModel(oModel);
        } else {
          var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
          iv_scope.getView().byId("StopageListTable").setModel(oModel);
        }

        Format.numericFormatter(ChartFormatter.getInstance());
        var formatPattern = ChartFormatter.DefaultPattern;
        var oVizFrame = iv_scope.oVizFrame = iv_scope.getView().byId("idVizFrameStacked");
        // oVizFrame.setVizProperties({
        //     plotArea: {
        //         dataLabel: {
        //             formatString:formatPattern.SHORTFLOAT_MFD2,
        //             visible: true,
        //             showTotal: false
        //         }
        //     },
        //     valueAxis: {
        //         label: {
        //             formatString: formatPattern.SHORTFLOAT
        //         },
        //         title: {
        //             visible: false
        //         }
        //     },
        //     valueAxis2: {
        //         label: {
        //             formatString: formatPattern.SHORTFLOAT
        //         },
        //         title: {
        //             visible: false
        //         }
        //     },
        //     categoryAxis: {
        //         title: {
        //             visible: false
        //         }
        //     },
        //     title: {
        //         visible: false,
        //         text: 'Revenue by City and Store Name'
        //     }
        // });
        var dataModel = oModel;
        oVizFrame.setModel(dataModel);

        var oPopOver = iv_scope.getView().byId("idPopOverStacked");
        oPopOver.connect(oVizFrame.getVizUid());
        oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

        //var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
        //iv_scope.getView().byId("StopageListTable").setModel(oModel);
      },
      onSelectionChange: function (oEvent) {
       
        var aIndices = this.byId("StopageListTable").getSelectedIndices();
        var aTotalActiviteTime=0;
        var oGUID =[];
        var oModelOpr = this.getView().byId("StopageListTable").getModel().oData;
        for (let i = 0; i < aIndices.length; i++) {
          aTotalActiviteTime+=oModelOpr[aIndices[i]].UPTIME;
          var ofilter= oGUID.filter(x=>x.GUID==oModelOpr[aIndices[i]].GUID)
          if (ofilter.length==0) {
            oGUID.push( oModelOpr[aIndices[i]].GUID);
          }
          
        }
      
        var oGUIDFormatter=""
        oGUID.forEach((item)=>{
        oGUIDFormatter+="'"+item+"',"

        })
       
        this.getDownTimeList(oGUIDFormatter.substring(0,oGUIDFormatter.length -1));
        this.byId("infoLabelActiviteTime").setText(aTotalActiviteTime+" dk");

      },
      getDownTimeList: function (oGUID) {
        let sPath = "MII/REPORT/T_HIST_DOWNTIME_LIST";

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
        if (iv_data[1] == "E") {
          MessageToast.error(iv_data[0]);
        }

      
        var oModelVizor = [];
		    var totalSum=0;
        if (!Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
          var oArray = [];
          oArray.push(iv_data[0].Rowsets.Rowset.Row);
     
          totalSum=oArray[0].DIFF;
          sum=oArray[0].DIFF;
    
          oModelVizor.push({
            DownTime: oArray[0].REASON,
            Percent: (sum / totalSum).toFixed(2)*100,
          }); 

        }

        else {
		for (let index = 0;index < iv_data[0].Rowsets.Rowset.Row?.length;index++ ) {

			totalSum+=iv_data[0].Rowsets.Rowset.Row[index].DIFF;
		}

        for (let index = 0;index < iv_data[0].Rowsets.Rowset.Row?.length;index++ ) {

          var check = oModelVizor.filter((x) => x.REASON_ID == iv_data[0].Rowsets.Rowset.Row[index].REASON_ID);
          if (check.length == 0) {
            var sum = 0;
            var isReasonList = iv_data[0].Rowsets.Rowset.Row.filter((x) =>x.REASON_ID == iv_data[0].Rowsets.Rowset.Row[index].REASON_ID);
            for (let i = 0; i < isReasonList.length; i++) {
              sum += isReasonList[i].DIFF;
            }
            
              oModelVizor.push({
                DownTime: isReasonList[0].REASON,
                Percent: (sum / totalSum).toFixed(2)*100,
              });
            
          }
        }
      }
		iv_scope.getView().byId("idVizFrameStopage").setModel(new JSONModel(oModelVizor));
      },
	    onDatasetSelected : function(oEvent){
		  var datasetRadio = oEvent.getSource();
		  if (this.oVizFrame ){
			var bindValue = datasetRadio.getBindingContext().getObject();
			var dataModel = new JSONModel(this.dataPath + bindValue.value);
			this.oVizFrame.setModel(dataModel);
			var that = this;
			this.oVizFrame.getModel().attachRequestCompleted(function() {
				that.dataSort(this.getData());
			});
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
      // getSelectedIndices: function(evt) {
      //   var aIndices = this.byId("StopageListTable").getSelectedIndices();
      //   var aNetwork=this.getView().byId("StopageListTable").getModel().oData[aIndices[0]].NETWORK;
      //   var oArray=[];
      //   var oModel=this.tableFilter("StopageListTable");

      //   for (let i = 0; i < aIndices.length; i++) {
      //     if (oModel[aIndices[i]].STATU=="AÇIK"){
      //     oArray.push({
      //       NETWORK:oModel[aIndices[i]].NETWORK,
      //       OPERATION:oModel[aIndices[i]].OPERATION,
      //       WORK_CENTER:oModel[aIndices[i]].WORK_CENTER,
      //       START_TIME:oModel[aIndices[i]].START_TIME,
      //       END_TIME:oModel[aIndices[i]].END_TIME,
      //       UPTIME:oModel[aIndices[i]].UPTIME,
      //       ID:oModel[aIndices[i]].ID
            
      //     });
      //   }
      //   }
      //   var oArraySort=[];
      //   for (let index = 0; index < oArray.length; index++) {
         
      //     var ofilter=oArray.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK  );
      //     var ofilter2=oArraySort.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK);
      //     if (ofilter2.length==0){
            
      //     var osumUptime=ofilter.reduce((a,b)=>({UPTIME:a.UPTIME+b.UPTIME}));
      //     ofilter.sort((a,b)=>a.START_TIME<b.START_TIME);
      //     var oIdList="";
      //     var odate="";
      //     for (let index = 0; index < ofilter.length; index++) {
      //       if (odate=="") odate=ofilter[index].START_TIME.substring(5,7)
      //       if(odate!=ofilter[index].START_TIME.substring(5,7)) {
      //           MessageBox.show("Farklı aylara ait aktiviteler şeçildi.Seçimlerinizi tekrar kontrol ediniz");
      //           return;
      //       }
      //       oIdList+=ofilter[index].ID+",";
      //     }

      //     oArraySort.push(
      //                {
      //                 NETWORK:oArray[index].NETWORK,
      //                 OPERATION:oArray[index].OPERATION,
      //                 WORK_CENTER:oArray[index].WORK_CENTER,
      //                 START_TIME:ofilter[0].START_TIME,
      //                 END_TIME:ofilter[ofilter.length-1].START_TIME,
      //                 UPTIME:osumUptime.UPTIME,
      //                 ID:oIdList.substring(0,oIdList.length-1)
      //                }
      //     )
      //   }
      // }

      //   //Core.byId("lblConfirmation").setText("SAP ye aktivite teyidi kaydedilecek. Onaylıyor musunuz?");
      //   Utility.showOrHide("onActiviteSend");
      //   this.oCBFunction=this.activiteSend;
      //   this.params={oArraySort};
      //   Utility.onOpenDialog("KAYDET", "AKTİVİTE KAYDETME", this );
        
     
      // },
      tableFilter: function(tableName){

        var oModel=this.getView().byId(tableName).getModel().oData;
        var tableFilter=this.getView().byId(tableName).getAggregation("columns").filter(x=>{return x.getFilterValue()!=""});
          for (let i = 0; i < tableFilter.length; i++) {
            oModel=oModel.filter(x=> {return x[tableFilter[i].getFilterProperty()]==tableFilter[i].getFilterValue()})
          }

         return  oModel;


      },      
      getComboBox: function() {
        let sPath = "MII/DOWNTIME/T_CNFG_GROUP_LIST";
        var response = TransactionCaller.sync(sPath, {}, "O_JSON");
        var oModel = new JSONModel(response[0].Rowsets.Rowset?.Row);
        this.getView().byId("idOperationComboBox").setModel(oModel);
      },
      onExport: function(oEvent) {

        var oTable = this.getView().byId(oEvent.getSource().oParent.oParent.getId());
        jQuery.sap.require("sap.ui.core.util.Export");
            jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
            oTable.exportData({
              exportType: new sap.ui.core.util.ExportTypeCSV( 
                {separatorChar : ';'} 
              )
            })
            .saveFile()
            .always(function() {
              this.destroy();
            });
    
        /*
          var tableId = oEvent.getSource().getAriaDescribedBy().toString();
            var oTable = this.getView().byId("ActiveNetworkListTable");
            var oExport = oTable.exportData();
            var sModel = oTable.getModel();
            if (sModel){
            var aExpCol = oExport.getColumns();
              var aCol = oTable.getColumns();
              aCol.forEach(function(oColumn,i){
              var oCell = new sap.ui.core.util.ExportCell();
              aExpCol[i].setTemplate(oCell);
              
              });
            } 
            oExport.saveFile("Table_data" + new Date());
    
            */
          },  
	});
});