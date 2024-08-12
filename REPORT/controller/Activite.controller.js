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
    Device
) {
	"use strict";

	return Controller.extend("REPORT.controller.Activite", {
       
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
    
            this.getView().byId("idShiftComboBox").setModel(model);
            this.getView().byId("idShiftComboBox").setSelectedKey("1");
            

            var oVizFrame = this.getView().byId("idVizFrame");
            var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(oVizFrame.getVizUid());
            this.oContent=Utility.createContent();
        
            this.getComboBox();
          },

      getComboBox: function() {
          let sPath = "MII/DOWNTIME/T_CNFG_GROUP_LIST";
          var response = TransactionCaller.sync(sPath, {}, "O_JSON");
          var oModel = new JSONModel(response[0].Rowsets.Rowset?.Row);
          this.getView().byId("idOperationComboBox").setModel(oModel);
      },
      onShowPress: function (params) {
        var gv_Start_Time = this.getView().byId("StartDate").getValue();
        var gv_End_Time = this.getView().byId("EndDate").getValue();
        var gv_Shift = this.getView().byId("idShiftComboBox").getSelectedKey();
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
          iv_scope.getView().byId("NetworkListTable").setModel(oModel);
        } else {
          var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
          iv_scope.getView().byId("NetworkListTable").setModel(oModel);
        }
        //var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
        //iv_scope.getView().byId("NetworkListTable").setModel(oModel);
      },
      onSelectionChange: function (oEvent) {
       
        var aIndices = this.byId("NetworkListTable").getSelectedIndices();
        var aTotalActiviteTime=0;
        var oGUID =[];
        var oModelOpr = this.getView().byId("NetworkListTable").getModel().oData;
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
          var oModel = new JSONModel(oArray);
          iv_scope.getView().byId("DetailListTable").setModel(oModel);
          totalSum=oArray[0]?.DIFF;
          sum=oArray[0]?.DIFF;
    
          oModelVizor.push({
            DownTime: oArray[0]?.REASON,
            Percent: (sum / totalSum).toFixed(2)*100,
          }); 

        } else {
          var oModel = new JSONModel(iv_data[0].Rowsets.Rowset.Row);
          iv_scope.getView().byId("DetailListTable").setModel(oModel);
       

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


		iv_scope.getView().byId("idVizFrame").setModel(new JSONModel(oModelVizor));
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
      onEditDownTime : function (oSource){

        var oModel=this.getView().byId("DetailListTable").getModel().oData;
        var oStartTime =oSource.getSource().oParent.getCells()[2].getText();
        var oEndTime=oSource.getSource().oParent.getCells()[3].getText();
        var ofilter=oModel.filter(x=>x.START_TIME==oStartTime && x.END_TIME==oEndTime);

        if (ofilter.length>0){

          var oGUID= ofilter[0].GUID;
          var oID= ofilter[0].ID;
          var REASON_ID= ofilter[0].REASON_ID;

        }

        Core.byId("StartDate").setValue(oStartTime);
        Core.byId("EndDate").setValue(oEndTime);
        Core.byId("iGUID").setValue(oGUID);
        Core.byId("iID").setValue(oID);

        this.getDowntimeReason();
        Core.byId("idComboDownReason").setSelectedKey(REASON_ID);
        Utility.showOrHide("onEditDownTime");
                
        this.oCBFunction=this.editDownTime;
        this.params={
        };
        Utility.onOpenDialog("Düzenle", "Duruş Düzenleme", this );
      },
      onDeleteDownTime : function (oSource){
       
        var oModel=this.getView().byId("DetailListTable").getModel().oData;
        var oStartTime =oSource.getSource().oParent.getCells()[2].getText();
        var oEndTime=oSource.getSource().oParent.getCells()[3].getText();
        var ofilter=oModel.filter(x=>x.START_TIME==oStartTime && x.END_TIME==oEndTime);

        if (ofilter.length>0){

          var oGUID= ofilter[0].GUID;
          var oID= ofilter[0].ID;
          var REASON_ID= ofilter[0].REASON_ID;
        }
        Core.byId("StartDate").setValue(oStartTime);
        Core.byId("EndDate").setValue(oEndTime);
        this.getDowntimeReason();
        Core.byId("idComboDownReason").setSelectedKey(REASON_ID);

        Core.byId("iID").setValue(oID);
        Core.byId("iGUID").setValue(oGUID);
        Utility.showOrHide("onDeleteDownTime");
                
        this.oCBFunction=this.deleteDownTime;
        this.params={};
        Utility.onOpenDialog("Sil", "Duruş Silme", this );
        
      },
      editDownTime : function (oEvent) {
      var gv_Start_Time = Core.byId("StartDate").getValue();
      var gv_End_Time = Core.byId("EndDate").getValue();
      var gv_Reason_Code = Core.byId("idComboDownReason").getSelectedKey();
      var gv_GUID = Core.byId("iGUID").getValue();
      var gv_ID = Core.byId("iID").getValue();


      if (gv_Start_Time>gv_End_Time){
        MessageBox.show("Bitiş tarihi başlangıç tarihinden küçük olamaz");
        return;
        }

        
        if (gv_Reason_Code==""){
          MessageBox.show("Neden kodu boş olamaz");
          return;
          }

      var response = TransactionCaller.sync(
        "MII/REPORT/T_UPDATE_DOWNTIME",
        {
          I_END_TIME: gv_End_Time,
          I_REASON_CODE: gv_Reason_Code,
          I_START_TIME: gv_Start_Time,
          I_GUID: gv_GUID,
          I_ID: gv_ID
        },
        "O_JSON"
      );
      MessageBox.show(response[0]);
      this.getDownTimeList("'"+gv_GUID+"'");
      },
      deleteDownTime : function (oEvent) {
        
      var gv_Start_Time = Core.byId("StartDate").getValue();
      var gv_End_Time = Core.byId("EndDate").getValue();
      var gv_Reason_Code = Core.byId("idComboDownReason").getSelectedKey();
      var gv_ID = Core.byId("iID").getValue();
      var gv_GUID = Core.byId("iGUID").getValue();

      var response = TransactionCaller.sync(
        "MII/REPORT/T_DELETE_DOWNTIME",
        {
          I_END_TIME: gv_End_Time,
          I_REASON_CODE: gv_Reason_Code,
          I_START_TIME: gv_Start_Time,
          I_GUID:gv_GUID,
          I_ID: gv_ID
        },
        "O_JSON"
      );
      MessageBox.show(response[0]);
      this.getDownTimeList("'"+gv_GUID+"'");
      },
      onDeleteNetwork : function (oSource){
       
        var oModel=this.getView().byId("NetworkListTable").getModel().oData;
        var oStartTime =oSource.getSource().oParent.getCells()[0].getText();
        var oEndTime=oSource.getSource().oParent.getCells()[1].getText();
        var ofilter=oModel.filter(x=>x.START_TIME==oStartTime && x.END_TIME==oEndTime);

        if (ofilter.length>0){

          var oGUID= ofilter[0].GUID;
          var oID= ofilter[0].ID;
          
        }
      
        Core.byId("iID").setValue(oID);
        Core.byId("iGUID").setValue(oGUID);
        Utility.showOrHide("onDeleteNetwork");
        this.oCBFunction=this.deleteNetwork;
        this.params={};
        Utility.onOpenDialog("Sil", "Ağ Planı Kaydı Silme", this );
        
        
      },
      deleteNetwork : function (oEvent) {

        var gv_ID = Core.byId("iID").getValue();
        var gv_GUID = Core.byId("iGUID").getValue();
  
        var response = TransactionCaller.sync(
          "MII/REPORT/T_DELETE_NETWORK",
          {
            I_GUID: gv_GUID
          },
          "O_JSON"
        );
        MessageBox.show(response[0]);
        this.onShowPress();


      },
      onEditNetwork : function (oSource){
     
        var oModel=this.getView().byId("NetworkListTable").getModel().oData;
        var oStartTime =oSource.getSource().oParent.getCells()[0].getText();
        var oEndTime=oSource.getSource().oParent.getCells()[1].getText();
        var oOperation = oSource.getSource().oParent.getCells()[3].getText(); 
        var oWorkCenter = oSource.getSource().oParent.getCells()[4].getText(); 
        var oSubCategory = oSource.getSource().oParent.getCells()[8].getText(); 
        var oNetwork = oSource.getSource().oParent.getCells()[2].getText(); 
        var oOperator = oSource.getSource().oParent.getCells()[10].getText(); 
        var ofilter=oModel.filter(x=>x.START_TIME==oStartTime && x.END_TIME==oEndTime);
        if (ofilter.length>0){
          var oGUID= ofilter[0].GUID;
          var oID= ofilter[0].ID;
        }


      var oResponse= TransactionCaller.sync(
          "MII/REPORT/T_GET_PRODUCT_OPERATION_LIST",
          {
            I_NETWORK: oNetwork,
          },
          "O_JSON",
          "GET"
        );

        Core.byId("iOperation").setModel(new JSONModel(oResponse[0]?.root.item)); 
        Core.byId("iOperation").setSelectedKey(oOperation);
   
        var oResponseSub= TransactionCaller.sync(
            "MII/REPORT/T_SUB_CATEGORY_LIST",
            {
              I_WORK_CENTER:oWorkCenter

            },
            "O_JSON",
            
            "GET"
        );

        Core.byId("iSubCategory").setModel(new JSONModel(oResponseSub[0]?.Rowsets.Rowset?.Row)); 
        Core.byId("iSubCategory").setSelectedKey(oSubCategory);
        Core.byId("StartDate").setValue(oStartTime);
        Core.byId("EndDate").setValue(oEndTime);
        Core.byId("iGUID").setValue(oGUID);
        Core.byId("iID").setValue(oID);
        Core.byId("iSubCategory").setValue(oSubCategory);
        Core.byId("iNetwork").setValue(oNetwork);
        Core.byId("iOperator").setValue(oOperator);

        Utility.showOrHide("onEditNetwork");
        this.oCBFunction=this.editNetwork;
        this.params={};
        Utility.onOpenDialog("Düzenle", "Ağ Planı Düzenleme", this );

      },
      editNetwork : function (oEvent) {

        var gv_ID = Core.byId("iID").getValue();
        var gv_GUID = Core.byId("iGUID").getValue();
        var gv_StartDate = Core.byId("StartDate").getValue();
        var gv_EndDate = Core.byId("EndDate").getValue();
        var gv_Operation = Core.byId("iOperation").getSelectedKey();
        var gv_SubCategory = Core.byId("iSubCategory").getSelectedKey();
        var gv_Network = Core.byId("iNetwork").getValue();
        var gv_Operator = Core.byId("iOperator").getValue();



        if (gv_StartDate>gv_EndDate){
          MessageBox.show("Bitiş tarihi başlangıç tarihinden küçük olamaz");
          return;
          }
  
          
          

        var response = TransactionCaller.sync(
          "MII/REPORT/T_UPDATE_NETWORK",
          {
            I_ID: gv_ID,
            I_GUID: gv_GUID,
            I_START_TIME: gv_StartDate,
            I_END_TIME: gv_EndDate,
            I_OPERATION: gv_Operation,
            I_SUB_CATEGORY: gv_SubCategory,
            I_NETWORK: gv_Network,
            I_OPERATOR:gv_Operator
          },
          "O_JSON"
        );
        MessageBox.show(response[0]);
        this.onShowPress();
   
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
      getSelectedIndices: function(evt) {
        var aIndices = this.byId("NetworkListTable").getSelectedIndices();
        var aNetwork=this.getView().byId("NetworkListTable").getModel().oData[aIndices[0]].NETWORK;
        var oArray=[];
        var oModel=this.tableFilter("NetworkListTable");

        for (let i = 0; i < aIndices.length; i++) {
          if (oModel[aIndices[i]].STATU=="AÇIK"){
          oArray.push({
            NETWORK:oModel[aIndices[i]].NETWORK,
            OPERATION:oModel[aIndices[i]].OPERATION,
            WORK_CENTER:oModel[aIndices[i]].WORK_CENTER,
            START_TIME:oModel[aIndices[i]].START_TIME,
            END_TIME:oModel[aIndices[i]].END_TIME,
            UPTIME:oModel[aIndices[i]].UPTIME,
            ID:oModel[aIndices[i]].ID
            
          });
        }
        }
        var oArraySort=[];
        for (let index = 0; index < oArray.length; index++) {
         
          var ofilter=oArray.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK  );
          var ofilter2=oArraySort.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK);
          if (ofilter2.length==0){
            
          var osumUptime=ofilter.reduce((a,b)=>({UPTIME:a.UPTIME+b.UPTIME}));
          ofilter.sort((a,b)=>a.START_TIME<b.START_TIME);
          var oIdList="";
          var odate="";
          for (let index = 0; index < ofilter.length; index++) {
            if (odate=="") odate=ofilter[index].START_TIME.substring(5,7)
            if(odate!=ofilter[index].START_TIME.substring(5,7)) {
                MessageBox.show("Farklı aylara ait aktiviteler şeçildi.Seçimlerinizi tekrar kontrol ediniz");
                return;
            }
            oIdList+=ofilter[index].ID+",";
          }

          oArraySort.push(
                     {
                      NETWORK:oArray[index].NETWORK,
                      OPERATION:oArray[index].OPERATION,
                      WORK_CENTER:oArray[index].WORK_CENTER,
                      START_TIME:ofilter[0].START_TIME,
                      END_TIME:ofilter[ofilter.length-1].START_TIME,
                      UPTIME:osumUptime.UPTIME,
                      ID:oIdList.substring(0,oIdList.length-1)
                     }
          )
        }
      }

        Core.byId("lblConfirmation").setText("SAP ye aktivite teyidi kaydedilecek. Onaylıyor musunuz?");
        Utility.showOrHide("onActiviteSend");
        this.oCBFunction=this.activiteSend;
        this.params={oArraySort};
        Utility.onOpenDialog("KAYDET", "AKTİVİTE KAYDETME", this );
        
     
      },
      activiteSend: function (params) {
        var oResponseSub= TransactionCaller.sync(
          "MII/CONF/CONF",
          {
            I_JSON_DATA:JSON.stringify(params.oArraySort)

          },
          "O_JSON",
          
          "GET"
      );
      
        MessageBox.show(oResponseSub[0]);
        
        this.onCancelButton();
        this.onShowPress();
      },
      getSelectedData: function () {
        if( !this.oshowDetailFragment){
          this.oshowDetailFragment=sap.ui.xmlfragment("detailFragment","REPORT.view.fragments.Menu",this);
          this.getView().addDependent(this.oshowDetailFragment)

        }

        this.oshowDetailFragment.open()


        var aIndices = this.byId("NetworkListTable").getSelectedIndices();
        var oArray=[];
        var oModel=this.tableFilter("NetworkListTable");
        
        for (let i = 0; i < aIndices.length; i++) {
          if (oModel[aIndices[i]].STATU=="AÇIK"){
          oArray.push({
            NETWORK:oModel[aIndices[i]].NETWORK,
            OPERATION:oModel[aIndices[i]].OPERATION,
            WORK_CENTER:oModel[aIndices[i]].WORK_CENTER,
            START_TIME:oModel[aIndices[i]].START_TIME,
            END_TIME:oModel[aIndices[i]].END_TIME,
            UPTIME:oModel[aIndices[i]].UPTIME,
            ID:oModel[aIndices[i]].ID,
            STATU:oModel[aIndices[i]].STATU
            
          });
        }
        }
        var oArraySort=[];
        for (let index = 0; index < oArray.length; index++) {
          var ofilter=oArray.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK  );
          var ofilter2=oArraySort.filter(x=>x.OPERATION==oArray[index].OPERATION && x.NETWORK==oArray[index].NETWORK  );
          if (ofilter2.length==0){
          var osumUptime=ofilter.reduce((a,b)=>({UPTIME:a.UPTIME+b.UPTIME}));
          ofilter.sort((a,b)=>a.START_TIME<b.START_TIME);
          oArraySort.push(
                     {
                      NETWORK:oArray[index].NETWORK,
                      OPERATION:oArray[index].OPERATION,
                      WORK_CENTER:oArray[index].WORK_CENTER,
                      START_TIME:ofilter[0].START_TIME,
                      END_TIME:ofilter[ofilter.length-1].START_TIME,
                      UPTIME:osumUptime.UPTIME
                     
                     }
          )
        }
      }
      sap.ui.core.Fragment.byId("detailFragment","SelectedListTable").setModel(new JSONModel(oArraySort))

      },
      onCancelButton: function(){

        if( this.oshowDetailFragment)
          this.oshowDetailFragment.close();

        

      },
      tableFilter: function(tableName){

        var oModel=this.getView().byId(tableName).getModel().oData;
        var tableFilter=this.getView().byId(tableName).getAggregation("columns").filter(x=>{return x.getFilterValue()!=""});
          for (let i = 0; i < tableFilter.length; i++) {
            oModel=oModel.filter(x=> {return x[tableFilter[i].getFilterProperty()]==tableFilter[i].getFilterValue()})
          }

         return  oModel;


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
      onAllEditNetwork: function(oEvent) {   


          Core.byId("iSubCategory").setModel(""); 
          Core.byId("iSubCategory").setSelectedKey("");
          Core.byId("StartDate").setValue("");
          Core.byId("EndDate").setValue("");
          Core.byId("iGUID").setValue("");
          Core.byId("iID").setValue("");
          Core.byId("iSubCategory").setValue("");
          Core.byId("iNetwork").setValue("");
          Core.byId("iOperator").setValue("");
          Core.byId("iOperation").setSelectedKey("");

          Utility.showOrHide("onAllEditNetwork");
          this.oCBFunction=this.AllEditNetwork;
          this.params={};
          Utility.onOpenDialog("Düzenle", "Toplu Ağ Planı Düzenleme", this );

      },
      AllEditNetwork: function(oEvent) {


        var gv_ID = Core.byId("iID").getValue();
        var gv_GUID = Core.byId("iGUID").getValue();
        var gv_StartDate = Core.byId("StartDate").getValue();
        var gv_EndDate = Core.byId("EndDate").getValue();
        var gv_Operation = Core.byId("iOperation").getSelectedKey();
        var gv_SubCategory = Core.byId("iSubCategory").getSelectedKey();
        var gv_Network = Core.byId("iNetwork").getValue();
        var gv_Operator = Core.byId("iOperator").getValue();

        if (gv_StartDate>gv_EndDate){
          MessageBox.show("Bitiş tarihi başlangıç tarihinden küçük olamaz");
          return;
          }

        var aIndices = this.byId("NetworkListTable").getSelectedIndices();
        var oArray=[];
        var oModel=this.tableFilter("NetworkListTable");

        for (let i = 0; i < aIndices.length; i++) {
          if (oModel[aIndices[i]].STATU=="AÇIK"){
          oArray.push( oModel[aIndices[i]].ID);
        }
        }

        var oArrayFormatter=""
        oArray.forEach((item)=>{
          oArrayFormatter+=item+","

        })
        



        var response = TransactionCaller.sync(
          "MII/REPORT/T_UPDATE_ALL_NETWORK",
          {
            
            I_ID: oArrayFormatter.substring(0,oArrayFormatter.length -1),
            I_GUID: gv_GUID,
            I_START_TIME: gv_StartDate,
            I_END_TIME: gv_EndDate,
            I_OPERATION: gv_Operation,
            I_SUB_CATEGORY: gv_SubCategory,
            I_NETWORK: gv_Network,
            I_OPERATOR:gv_Operator
          },
          "O_JSON"
        );
        MessageBox.show(response[0]);
        this.onShowPress();

      },

	});
});