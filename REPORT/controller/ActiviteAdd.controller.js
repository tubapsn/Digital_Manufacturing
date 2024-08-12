sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"REPORT/model/formatter",
	"common/transactionCaller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/Input",
	"sap/ui/core/Core",
	"REPORT/scripts/Utility"
], function (
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
	var subCatResponse = [];
	var arrayListNetwork = [];
	return Controller.extend("REPORT.controller.ActiviteAdd", {

		/**
		 * @override
		 */
		onInit: function () {


		},
		onShowPress: function (params) {
			var gv_Start_Time = this.getView().byId("StartDateStopage").getValue();
			var gv_End_Time = this.getView().byId("EndDateStopage").getValue();
			var gv_Shift = 0;//this.getView().byId("idShiftComboBox").getSelectedKey();
			var gv_NETWORK = this.getView().byId("productInput").getValue();
			var gv_Operation = this.getView().byId("operationInput").getValue();
			gv_Operation = gv_Operation.substring(0, (gv_Operation.indexOf("-")));
			var dateFilter = 0;
			var filterNetwork;

			if (gv_NETWORK == "") {
				filterNetwork="";
				if (gv_Start_Time == "" || gv_End_Time == "") {
					MessageBox.show("Lütfen tarih aralığı veya ağ planı numarası girin!");
					return;
				}
				else
					dateFilter = 1;
			} else {

				if ((gv_Start_Time != "" && gv_End_Time == "") || (gv_Start_Time == "" && gv_End_Time != "")) {
					MessageBox.show("Lütfen tarih aralığı girin!");
					return;
				}
				else if (gv_Start_Time != "" && gv_End_Time != "")
					dateFilter = 1;

				if (dateFilter == 1)

					filterNetwork = "and [HIST_NETWORK].NETWORK='" + gv_NETWORK + "'";
				else
					filterNetwork = " [HIST_NETWORK].NETWORK='" + gv_NETWORK + "'";

				if (gv_Operation != "")
					filterNetwork = filterNetwork + "and [HIST_NETWORK].OPERATION='" + gv_Operation + "'";

			}

			if (gv_Shift < 0 || gv_Shift == "") gv_Shift = 1;

			let sPath = "MII/REPORT/INS_NETWORK/T_HIST_NETWORK_LIST";
			TransactionCaller.async(
				sPath,
				{
					I_START_TIME: gv_Start_Time,
					I_END_TIME: gv_End_Time,
					I_SHIFT: 0,
					I_NETWORK_OPERATION: filterNetwork,
					I_DATE_FILTER: dateFilter
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
			iv_scope.getView().byId("OperationListTable").setModel(omodel);




		},
		getNetwork: function (gv_GUID) {


			var gv_GUID = "c63c837c-8dda-4a01-8a40-86052106646a";

			var sPath = "MII/REPORT/T_HIST_NETWORK";
			var response = TransactionCaller.sync(
				sPath,
				{
					I_GUID: gv_GUID
				},
				"O_JSON"
			);

			if (!Array.isArray(response[0].Rowsets?.Rowset?.Row)) {
				arrayListNetwork.push(response[0].Rowsets?.Rowset?.Row);
			} else {
				arrayListNetwork = response[0].Rowsets?.Rowset?.Row
			}


			var omodel = new JSONModel(arrayListNetwork);
			this.getView().byId("OperationListTable").setModel(omodel);


		},
		onAddNetwork: function(params) {


			if (!this.oActiviteAddFragment) {
				this.oActiviteAddFragment = sap.ui.xmlfragment("fragmentNetworkAdd", "REPORT.view.fragments.ActiviteAdd", this);
				this.getView().addDependent(this.oActiviteAddFragment)

			}
			this.oActiviteAddFragment.open()

			this.getSubCategoryList();
			var oModel = new JSONModel(subCatResponse);
			sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL3").setModel(oModel);


		},
		onCancelNetworkButton: function () {

			if (this.oActiviteAddFragment)
				this.oActiviteAddFragment.close();

		},
		addNetwork: function name(params) {

			var AL1 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL1").getValue(),
				AL2 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL2").getValue(),
				AL3 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL3").getSelectedKey(),
				AL4 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL4").getValue(),
				AL5 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL5").getValue(),
				AL6 = sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL6").getValue()
			var gv_GUID = this.createGUID();
			AL2 = AL2.substring(0, (AL2.indexOf("-")));
			AL3 = AL3.substring(0, (AL3.indexOf("-")));

			console.log("🚀 ~ file: ActiviteAdd.controller.js:99 ~ name ~ AL6:", AL6)
			console.log(AL1, AL2, AL3, AL4, AL5, AL6);

			let sPath = "MII/REPORT/INS_NETWORK/T_INS_NETWORK";
			var array = [];
			var response = TransactionCaller.sync(
				sPath,
				{
					I_NETWORK: AL1,
					I_OPERATION: AL2,
					I_SUB_CATEGORY: AL3,
					I_OPER_ID: AL4,
					I_START_TIME: AL5,
					I_END_TIME: AL6,
					I_GUID: gv_GUID


				},
				"O_JSON"
			);

			this.oActiviteAddFragment.close();

		},
		onAddStopage: function(params) {

			var aIndices = this.byId("OperationListTable").getSelectedIndices();
			var oModelOpr = this.getView().byId("OperationListTable").getModel().oData;
			var oGUID = oModelOpr[aIndices[0]].GUID;

			if (!this.oStopageAddFragment) {
				this.oStopageAddFragment = sap.ui.xmlfragment("fragmentStopageAdd", "REPORT.view.fragments.StopageAdd", this);
				this.getView().addDependent(this.oStopageAddFragment)

			}
			this.oStopageAddFragment.open()
			this.getDowntimeReason();
		},
		onCancelStopageButton: function () {

			if (this.oStopageAddFragment)
				this.oStopageAddFragment.close();
		},
		AddStopage: function name(params) {

			var AL1 = sap.ui.core.Fragment.byId("fragmentStopageAdd", "InptStpStartDate").getValue(),
				AL2 = sap.ui.core.Fragment.byId("fragmentStopageAdd", "InptStpEndDate").getValue(),
				AL3 = sap.ui.core.Fragment.byId("fragmentStopageAdd", "idComboDownReason").getSelectedKey(),

				aIndices = this.byId("OperationListTable").getSelectedIndices(),
				oModelOpr = this.getView().byId("OperationListTable").getModel().oData,
				oGUID = oModelOpr[aIndices[0]].GUID;

			console.log(AL1, AL2, AL3, oGUID);

			let sPath = "MII/REPORT/INS_NETWORK/T_INSERT_DOWNTIME";
			var array = [];

			var response = TransactionCaller.sync(
				sPath,
				{
					I_START_TIME: AL1,
					I_END_TIME: AL2,
					I_REASON_CODE: AL3,
					I_GUID: oGUID

				},
				"O_JSON"
			);

			this.getDowntimeList(oGUID);
			this.oStopageAddFragment.close();

			//kaydetme işlemi
		},
		al2LiveChange: function (oEvent) {
			var value = oEvent.getSource().getValue().toUpperCase()
			value = value.substring((value.indexOf("-") + 1), value.length);
			oEvent.getSource().setValue(value)
			var filtered = subCatResponse.filter(item => { return item.WORK_CENTER == value })
			var model = new JSONModel(filtered)
			sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL3").setModel(model);
		},
		AL1LiveChange: function (oEvent) {
			let sPath = "MII/REPORT/INS_NETWORK/T_GET_PRODUCT_OPERATION_LIST";
			var array = [];
			var sProduct = this.getView().byId("productInput").getValue();
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


			var modelOparation = new JSONModel(array);
			sap.ui.core.Fragment.byId("fragmentNetworkAdd", "AL2").setModel(modelOparation);
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
		onSelectionChangeNetwork: function (oEvent) {

			var aIndices = this.byId("OperationListTable").getSelectedIndices();
			var oModelOpr = this.getView().byId("OperationListTable").getModel().oData;
			var oGUID = oModelOpr[aIndices[0]].GUID;

			this.getDowntimeList(oGUID);

		},
		getDowntimeReason: function () {
			let sPath = "MII/REPORT/INS_NETWORK/T_DOWNTIME_REASON_LIST";
			var response = TransactionCaller.sync(sPath, {}, "O_JSON");
			var oModel = new JSONModel(response[0].Rowsets.Rowset?.Row);
			sap.ui.core.Fragment.byId("fragmentStopageAdd", "idComboDownReason").setModel(oModel);

		},
		getDowntimeList: function (oGUID) {
			let sPath = "MII/REPORT/INS_NETWORK/T_HIST_DOWNTIME_LIST";
			var response = TransactionCaller.sync(sPath, {

				I_GUID: oGUID
			}, "O_JSON");

			var array = [];
			if (!Array.isArray(response[0].Rowsets.Rowset?.Row)) {
				array.push(response[0].Rowsets.Rowset?.Row);
			} else {
				array = response[0].Rowsets.Rowset?.Row
			}

			var oModel = new JSONModel(array);
			this.getView().byId("DetailListTable").setModel(oModel);


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
		productInputChange: function () {
			let sPath = "MII/REPORT/INS_NETWORK/T_GET_PRODUCT_OPERATION_LIST";
			var array = [];
			var sProduct = this.getView().byId("productInput").getValue();

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


			var modelOparation = new JSONModel(array);
			this.getView().byId("operationInput").setModel(modelOparation)
			


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