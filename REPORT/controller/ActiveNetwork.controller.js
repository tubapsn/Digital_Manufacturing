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

	return Controller.extend("REPORT.controller.ActiveNetwork", {
       
      onInit: function() {
          
          },

      onShowPress:function() {
          let sPath = "MII/REPORT/ACTIVE_NETWORK/T_LIVE_NETWORK";
			TransactionCaller.async(
				sPath,
				{
					
				},
				"O_JSON",
				this.onShowPressCB,
				this,
				"GET"
			);
          },

      onShowPressCB: function (iv_data, iv_scope) {
            if (iv_data[1] == "E") {
              MessageBox.show(iv_data[0]);
              return;
            }
            var oArray = [];
      
      
            if (!Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
              oArray.push(iv_data[0].Rowsets?.Rowset?.Row);
            } else {
              oArray = iv_data[0].Rowsets?.Rowset?.Row
            }
      
      
            var omodel = new JSONModel(oArray);
            iv_scope.getView().byId("ActiveNetworkListTable").setModel(omodel);
      
      
      
      
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