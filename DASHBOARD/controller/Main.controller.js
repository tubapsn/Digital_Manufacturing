

sap.ui.define(
	[
	  "sap/ui/core/mvc/Controller",
	  "sap/ui/model/json/JSONModel",
	  "sap/m/MessageToast",
	  "sap/m/MessageBox",
	  "sap/ui/core/Fragment",
	  "DASHBOARD/model/formatter",
	  "common/transactionCaller",
	  "sap/ui/core/Core",
	  
  
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
  
	) {
	  "use strict";
	  let tempData = [];
	  let index = 0;
	  return Controller.extend("DASHBOARD.controller.Main", {
		onInit: function () {



			var model = new JSONModel();

				var data = [

					{COMPANY: "AKH" ,TEXT:"Ak Pres Hendek"},
					{COMPANY: "TOB",TEXT:"Toksan Bursa"},
					{COMPANY: "AKB",TEXT:"Ak Pres Bursa"},
					{COMPANY: "TOG",TEXT:"Toksan Gebze"},
					{COMPANY: "AKS",TEXT:"Ak Automotive Slovenya"},
					{COMPANY: "AKT",TEXT:"Ak Teknik Kalıp"},

				];
             model.setData(data)
			 this.getView().setModel(model,"CGrp");
			 //this.getView().getModel("CGrp");

			 this.getdata(gvLocation);

			 var smodel = new JSONModel();
			 smodel.setData({SELECTEDCOMPANY: gvLocation, TEXT:gvLocationText})
			 this.getView().setModel(smodel,"selectedGrp");



		},
		getdata: function (oLocation) {
			let sPath = "MII/DASHBOARD/T_DASHBOARD_LIST_QRY";
			TransactionCaller.async(
			  sPath,
			  {
			   I_LOCATION: oLocation,
			  },
			  "O_JSON",
			  this.getTableCB,
			  this,
			  "GET"
			);
		},
		getTableCB: function(iv_data, iv_scope){
			if (iv_data[1] == "E") {
				MessageBox.show(iv_data[0]);
				return;
			}

			iv_scope.getView().setModel(new JSONModel(iv_data[0].Rowsets.Rowset.Row),"modelData");
			var main=0;
			for (let i = 0; i < iv_data[0].Rowsets.Rowset.Row.length; i++) {
				
				var tile=new sap.m.GenericTile({


					header:iv_data[0].Rowsets.Rowset.Row[i].HEADER,
					//subheader:iv_data[0].Rowsets.Rowset.Row[i].MODULE, 
					press:function(oEvent){
						
						var oModel=oEvent.getSource().oParent.oParent.oParent.getModel("modelData").oData;
						var filterModel=oModel.filter(x=>x.HEADER==oEvent.getSource().getProperty("header"));

						window.open(filterModel[0].URL,"_blank");
					}, 
					
				});

				var tcont =new sap.m.TileContent( 

					{
						tooltip:iv_data[0].Rowsets.Rowset.Row[i].TOOLTIP,
						footer:iv_data[0].Rowsets.Rowset.Row[i].MODULE
					}
				)


				var iCont=new sap.m.ImageContent({

					src:iv_data[0].Rowsets.Rowset.Row[i].LOGO
	
					})

					//tcont.addAggregation(iCont);


				tcont.setContent(iCont)
				tile.addTileContent(tcont)

				if (i % 7 == 0 ) main++;
				iv_scope.getView().byId("mainBox"+String(main)).addItem(tile);
						
				
				
					
				
				
			}



			

		},
		onShowPress: function (evt) {
			window.open("http://192.168.3.21:50000/XMII/CM/MII/MAKINA/MII.irpt","_blank");
		},
		handleSelectionChange: function (oEvent){
			var path = oEvent.getSource().getBindingContext("CGrp").sPath.split('/')[1];
			gvLocation=oEvent.getSource().getBindingContext("CGrp").oModel.oData[path].COMPANY;
			gvLocationText=oEvent.getSource().getBindingContext("CGrp").oModel.oData[path].TEXT;
			//MessageBox.show(gvLocation);
			this.getView().byId("mainBox1").removeAllItems();
			this.getView().byId("mainBox2").removeAllItems();
			this.getView().byId("mainBox3").removeAllItems();
			this.getdata(gvLocation);
			var smodel = new JSONModel();
			smodel.setData({SELECTEDCOMPANY: gvLocation,
				TEXT:gvLocationText})
			this.getView().setModel(smodel,"selectedGrp");


		}
	  });
	}
  );

  